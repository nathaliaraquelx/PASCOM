#!/usr/bin/env python3
"""
Gera a página de cada artigo em noticias/ a partir de uma Google Sheet
"índice" (publicada como CSV) e dos respetivos Google Docs (publicados
na Web), e atualiza os cartões da secção Notícias em index.html.

Uso: python3 gerar-noticias.py <URL_CSV_DA_SHEET>

Ver README.md, secção "Notícias (artigos completos)", para o formato
esperado da Sheet e como publicar os Docs.
"""

import base64
import csv
import html
import io
import os
import re
import sys
import unicodedata
import urllib.request
from datetime import datetime

from bs4 import BeautifulSoup, NavigableString, Tag

REPO_ROOT = sys.path[0] + "/.."
TEMPLATE_PATH = f"{REPO_ROOT}/scripts/templates/artigo.html"
INDEX_HTML_PATH = f"{REPO_ROOT}/index.html"
NOTICIAS_DIR = f"{REPO_ROOT}/noticias"
SITEMAP_PATH = f"{REPO_ROOT}/sitemap.xml"
SITE_URL = "https://paroquiasaojoaobaptista.pt"

MARCADOR_INICIO = "<!-- NOTICIAS:AUTO:INICIO -->"
MARCADOR_FIM = "<!-- NOTICIAS:AUTO:FIM -->"

MAX_CARTOES = 9

MESES_PT = [
    "janeiro", "fevereiro", "março", "abril", "maio", "junho",
    "julho", "agosto", "setembro", "outubro", "novembro", "dezembro",
]

NAO_PUBLICAR = {"nao", "não", "no", "false", "0"}

REQUEST_HEADERS = {
    "User-Agent": "Mozilla/5.0 (compatible; PASCOM-site-bot/1.0; +https://github.com/nathaliaraquelx/PASCOM)"
}


def buscar_url(url):
    req = urllib.request.Request(url, headers=REQUEST_HEADERS)
    with urllib.request.urlopen(req, timeout=20) as resp:
        return resp.read().decode("utf-8", errors="replace")


def normalizar_link_doc(url):
    """Aceita qualquer link de um Google Doc — de partilha normal
    (/edit, /view) ou já publicado na Web (/document/d/e/.../pub) — e
    devolve sempre um URL que podemos descarregar diretamente, sem
    sessão/login. Um link de partilha normal só funciona se o Doc
    estiver partilhado como "Qualquer pessoa com o link" (ver)."""
    m = re.search(r"/document/d/e/[^/]+/pub", url)
    if m:
        return url
    m = re.search(r"/document/d/([a-zA-Z0-9_-]+)", url)
    if not m:
        raise ValueError("não parece um link do Google Docs")
    doc_id = m.group(1)
    return f"https://docs.google.com/document/d/{doc_id}/export?format=html"


def formatar_data_pt(data_iso):
    dt = datetime.strptime(data_iso, "%Y-%m-%d")
    return f"{dt.day} de {MESES_PT[dt.month - 1]} de {dt.year}"


def slugificar(texto):
    texto = unicodedata.normalize("NFKD", texto).encode("ascii", "ignore").decode("ascii")
    texto = texto.lower().strip()
    texto = re.sub(r"[^a-z0-9]+", "-", texto)
    return texto.strip("-") or "artigo"


def resolver_link_google(href):
    """Google Docs publicados envolvem links externos num redirecionamento
    'https://www.google.com/url?q=...' — extrai o URL real."""
    if href and "google.com/url" in href:
        m = re.search(r"[?&]q=([^&]+)", href)
        if m:
            from urllib.parse import unquote
            return unquote(m.group(1))
    return href


TAGS_PERMITIDAS = {
    "p", "h1", "h2", "h3", "h4", "h5", "h6", "strong", "b", "em", "i", "u",
    "ul", "ol", "li", "a", "img", "br", "blockquote",
}


def limpar_no(no, nivel_titulo_offset=1):
    """Converte recursivamente um nó da árvore do BeautifulSoup do HTML
    publicado do Google Docs num nó limpo, só com as tags permitidas."""
    if isinstance(no, NavigableString):
        texto = str(no)
        return [NavigableString(texto)] if texto.strip() else []

    if not isinstance(no, Tag):
        return []

    nome = no.name

    # Google Docs marca negrito/itálico/sublinhado com <span style="...">
    # em vez de <strong>/<em>/<u> — deteta isso antes de descartar o span.
    if nome == "span":
        estilo = no.get("style", "")
        filhos = []
        for filho in no.children:
            filhos.extend(limpar_no(filho, nivel_titulo_offset))
        if "font-weight:700" in estilo or "font-weight:bold" in estilo:
            novo = Tag(name="strong")
            for f in filhos:
                novo.append(f)
            filhos = [novo]
        if "font-style:italic" in estilo:
            novo = Tag(name="em")
            for f in filhos:
                novo.append(f)
            filhos = [novo]
        if "text-decoration:underline" in estilo:
            novo = Tag(name="u")
            for f in filhos:
                novo.append(f)
            filhos = [novo]
        return filhos

    if nome in ("script", "style"):
        return []

    # Google Docs pode gerar h1 dentro do corpo — desce um nível para não
    # colidir com o <h1> do próprio template do artigo.
    nome_final = nome
    if nome in ("h1", "h2", "h3", "h4", "h5") and nivel_titulo_offset:
        numero = min(int(nome[1]) + nivel_titulo_offset, 6)
        nome_final = f"h{numero}"

    if nome_final not in TAGS_PERMITIDAS and nome not in ("div", "body", "html", "head"):
        # Tag desconhecida (ex.: <sup>, <font>) — mantém só o texto interno.
        filhos = []
        for filho in no.children:
            filhos.extend(limpar_no(filho, nivel_titulo_offset))
        return filhos

    if nome_final not in TAGS_PERMITIDAS:
        # div/body/html/head — "unwrap", passa só os filhos.
        filhos = []
        for filho in no.children:
            filhos.extend(limpar_no(filho, nivel_titulo_offset))
        return filhos

    novo = Tag(name=nome_final, can_be_empty_element=(nome_final in ("img", "br")))
    if nome_final == "a":
        href = resolver_link_google(no.get("href", ""))
        if href:
            novo["href"] = href
            novo["target"] = "_blank"
            novo["rel"] = "noopener"
    if nome_final == "img":
        src = no.get("src", "")
        if not src:
            return []
        novo["src"] = src
        novo["alt"] = no.get("alt", "")
        novo["loading"] = "lazy"
        return [novo]

    for filho in no.children:
        novo.extend(limpar_no(filho, nivel_titulo_offset))

    # Remove parágrafos vazios (comuns em Google Docs para linhas em branco).
    if nome_final in ("p", "li") and not novo.get_text(strip=True) and not novo.find("img"):
        return []

    return [novo]


def limpar_corpo_google_doc(html_bruto):
    soup = BeautifulSoup(html_bruto, "html.parser")
    # Docs publicados ("Publicar na Web") envolvem o conteúdo real num
    # <div id="contents">, ao lado de um <div id="banners"> com o aviso
    # "Published using Google Docs / Report abuse" — não faz parte do
    # artigo. O /export?format=html não tem essa divisão, por isso o
    # corpo inteiro é usado nesse caso.
    corpo = soup.find("div", id="contents") or soup.find("body") or soup

    raiz = Tag(name="div")
    for filho in corpo.children:
        raiz.extend(limpar_no(filho))

    return "".join(str(x) for x in raiz.contents).strip()


IMG_DATA_RE = re.compile(r'src="data:image/([a-zA-Z0-9.+-]+);base64,([^"]+)"')


def extrair_e_gravar_imagens(corpo_html, slug):
    """Google Docs embute imagens como data: URIs base64 no HTML — isso
    tornaria cada página (e o próprio index.html, via miniatura do
    cartão) enormes. Grava cada imagem como ficheiro real em
    noticias/img/ e substitui pelo caminho relativo correspondente."""
    pasta = f"{NOTICIAS_DIR}/img"
    os.makedirs(pasta, exist_ok=True)
    contador = {"n": 0}

    def substituir(m):
        contador["n"] += 1
        subtipo, dados_b64 = m.group(1), m.group(2)
        ext = "jpg" if subtipo.lower() == "jpeg" else re.sub(r"[^a-z0-9]", "", subtipo.lower())
        ext = ext or "png"
        nome = f"{slug}-{contador['n']}.{ext}"
        with open(f"{pasta}/{nome}", "wb") as f:
            f.write(base64.b64decode(dados_b64))
        return f'src="img/{nome}"'

    return IMG_DATA_RE.sub(substituir, corpo_html)


def extrair_primeira_imagem(corpo_html):
    m = re.search(r'<img[^>]+src="([^"]+)"', corpo_html)
    return m.group(1) if m else None



def gerar_pagina_artigo(template, item):
    capa_html = ""
    if item["imagem"]:
        capa_html = f'<img class="article-cover" src="{html.escape(item["imagem"])}" alt="{html.escape(item["titulo"])}" loading="lazy">'

    pagina = template
    pagina = pagina.replace("{{TITULO}}", html.escape(item["titulo"]))
    pagina = pagina.replace("{{RESUMO}}", html.escape(item["resumo"]))
    pagina = pagina.replace("{{DATA_ISO}}", item["data"])
    pagina = pagina.replace("{{DATA_FORMATADA}}", formatar_data_pt(item["data"]))
    pagina = pagina.replace("{{CAPA_HTML}}", capa_html)
    pagina = pagina.replace("{{CORPO}}", item["corpo_html"])
    return pagina


def gerar_cartao(item):
    if item["imagem"]:
        # Caminhos locais (gravados por extrair_e_gravar_imagens) são
        # relativos a noticias/ — a partir de index.html, na raiz do
        # site, precisam do prefixo "noticias/".
        src = item["imagem"]
        if "://" not in src:
            src = f"noticias/{src}"
        thumb = f'<img src="{html.escape(src)}" alt="" loading="lazy">'
    else:
        thumb = '<i class="fa-solid fa-image"></i>'
    return f'''      <article class="news-card">
        <div class="news-thumb">{thumb}</div>
        <div class="news-body">
          <span class="news-date">{formatar_data_pt(item["data"])}</span>
          <h3>{html.escape(item["titulo"])}</h3>
          <p>{html.escape(item["resumo"])}</p>
          <a href="noticias/{item["slug"]}.html" class="news-link">Ler mais <i class="fa-solid fa-arrow-right"></i></a>
        </div>
      </article>'''


def gerar_sitemap(itens):
    urls = [f"  <url>\n    <loc>{SITE_URL}/</loc>\n  </url>"]
    for item in itens:
        urls.append(
            f"  <url>\n"
            f"    <loc>{SITE_URL}/noticias/{item['slug']}.html</loc>\n"
            f"    <lastmod>{item['data']}</lastmod>\n"
            f"  </url>"
        )
    conteudo = (
        '<?xml version="1.0" encoding="UTF-8"?>\n'
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
        + "\n".join(urls) + "\n"
        "</urlset>\n"
    )
    with open(SITEMAP_PATH, "w", encoding="utf-8") as f:
        f.write(conteudo)


def ler_sheet(csv_url):
    conteudo = buscar_url(csv_url)
    leitor = csv.DictReader(io.StringIO(conteudo))
    linhas = []
    for linha in leitor:
        linha = {(k or "").strip().lower(): (v or "").strip() for k, v in linha.items()}
        linhas.append(linha)
    return linhas


def main():
    if len(sys.argv) < 2:
        print("Uso: gerar-noticias.py <URL_CSV_DA_SHEET>", file=sys.stderr)
        sys.exit(1)

    csv_url = sys.argv[1]

    if not csv_url or "SEU_CSV_URL_AQUI" in csv_url:
        print("A Google Sheet de notícias ainda não está configurada (ver README.md) — nada a fazer.", file=sys.stderr)
        sys.exit(0)

    try:
        linhas = ler_sheet(csv_url)
    except Exception as e:
        print(f"Não foi possível ler a Google Sheet: {e}", file=sys.stderr)
        sys.exit(1)

    itens = []
    for linha in linhas:
        titulo = linha.get("titulo", "")
        data = linha.get("data", "")
        link_doc = linha.get("link_doc", "")
        publicar = linha.get("publicar", "").strip().lower()

        if not titulo or not data or not link_doc:
            continue
        if publicar in NAO_PUBLICAR:
            continue
        try:
            datetime.strptime(data, "%Y-%m-%d")
        except ValueError:
            print(f"A ignorar '{titulo}': data '{data}' inválida (esperado AAAA-MM-DD).", file=sys.stderr)
            continue

        slug = f"{data}-{slugificar(titulo)}"

        try:
            html_doc = buscar_url(normalizar_link_doc(link_doc))
            corpo_html = limpar_corpo_google_doc(html_doc)
        except Exception as e:
            print(f"A ignorar '{titulo}': não foi possível ler o Google Doc ({e}).", file=sys.stderr)
            continue

        if not corpo_html.strip():
            print(f"A ignorar '{titulo}': o Google Doc parece estar vazio.", file=sys.stderr)
            continue

        corpo_html = extrair_e_gravar_imagens(corpo_html, slug)
        imagem = linha.get("imagem", "") or extrair_primeira_imagem(corpo_html) or ""

        itens.append({
            "titulo": titulo,
            "data": data,
            "resumo": linha.get("resumo", "") or "",
            "imagem": imagem,
            "corpo_html": corpo_html,
            "slug": slug,
        })

    if not itens:
        print("Nenhum artigo válido encontrado na Sheet — nada a gerar desta vez.", file=sys.stderr)
        sys.exit(0)

    itens.sort(key=lambda i: i["data"], reverse=True)

    with open(TEMPLATE_PATH, encoding="utf-8") as f:
        template = f.read()

    os.makedirs(NOTICIAS_DIR, exist_ok=True)

    for item in itens:
        pagina = gerar_pagina_artigo(template, item)
        with open(f"{NOTICIAS_DIR}/{item['slug']}.html", "w", encoding="utf-8") as f:
            f.write(pagina)

    gerar_sitemap(itens)

    cartoes_html = "\n".join(gerar_cartao(item) for item in itens[:MAX_CARTOES])

    with open(INDEX_HTML_PATH, encoding="utf-8") as f:
        index_html = f.read()

    padrao = re.compile(
        re.escape(MARCADOR_INICIO) + r".*?" + re.escape(MARCADOR_FIM), re.DOTALL
    )
    novo_bloco = f"{MARCADOR_INICIO}\n{cartoes_html}\n      {MARCADOR_FIM}"
    if not padrao.search(index_html):
        print("Não encontrei os marcadores NOTICIAS:AUTO em index.html — abortei sem alterar nada.", file=sys.stderr)
        sys.exit(1)

    index_html = padrao.sub(novo_bloco, index_html)
    with open(INDEX_HTML_PATH, "w", encoding="utf-8") as f:
        f.write(index_html)

    print(f"Gerados {len(itens)} artigo(s); {min(len(itens), MAX_CARTOES)} no grelha de Notícias.")


if __name__ == "__main__":
    main()
