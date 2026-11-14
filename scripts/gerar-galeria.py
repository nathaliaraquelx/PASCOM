#!/usr/bin/env python3
"""
Gera js/galeria.js a partir de uma Google Sheet "índice" (publicada
como CSV) em que cada linha é um "post" — um Google Doc com uma ou
várias fotos dentro (várias = carrossel, como no Instagram).

Uso: python3 gerar-galeria.py <URL_CSV_DA_SHEET>

Ver README.md, secção "Galeria de Imagens", para o formato esperado
da Sheet e como publicar os Docs.
"""

import base64
import csv
import io
import json
import os
import re
import sys
import unicodedata
import urllib.request
from datetime import datetime

from bs4 import BeautifulSoup

REPO_ROOT = sys.path[0] + "/.."
GALERIA_JS_PATH = f"{REPO_ROOT}/js/galeria.js"
IMG_DIR = f"{REPO_ROOT}/assets/img/galeria"

MAX_POSTS = 60

NAO_PUBLICAR = {"nao", "não", "no", "false", "0"}

REQUEST_HEADERS = {
    "User-Agent": "Mozilla/5.0 (compatible; PASCOM-site-bot/1.0; +https://github.com/nathaliaraquelx/PASCOM)"
}

EXTENSAO_POR_TIPO = {
    "image/jpeg": "jpg", "image/png": "png", "image/gif": "gif", "image/webp": "webp",
}


def buscar_url(url):
    req = urllib.request.Request(url, headers=REQUEST_HEADERS)
    with urllib.request.urlopen(req, timeout=20) as resp:
        return resp.read().decode("utf-8", errors="replace")


def buscar_bytes(url):
    req = urllib.request.Request(url, headers=REQUEST_HEADERS)
    with urllib.request.urlopen(req, timeout=20) as resp:
        return resp.read(), resp.headers.get("Content-Type", "")


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


def slugificar(texto):
    texto = unicodedata.normalize("NFKD", texto).encode("ascii", "ignore").decode("ascii")
    texto = texto.lower().strip()
    texto = re.sub(r"[^a-z0-9]+", "-", texto)
    return texto.strip("-") or "post"


def extrair_imagens_do_doc(html_bruto):
    """Devolve a lista ordenada de 'src' de todas as imagens dentro do
    corpo real do Doc (ignora o aviso "Published using Google Docs" dos
    Docs publicados na Web, tal como o gerador de notícias)."""
    soup = BeautifulSoup(html_bruto, "html.parser")
    corpo = soup.find("div", id="contents") or soup.find("body") or soup
    srcs = []
    for img in corpo.find_all("img"):
        src = img.get("src", "")
        if src:
            srcs.append(src)
    return srcs


def gravar_imagem(origem, slug, indice):
    os.makedirs(IMG_DIR, exist_ok=True)
    if origem.startswith("data:"):
        cabecalho, dados_b64 = origem.split(",", 1)
        subtipo = cabecalho.split("/")[1].split(";")[0]
        ext = "jpg" if subtipo.lower() == "jpeg" else (re.sub(r"[^a-z0-9]", "", subtipo.lower()) or "jpg")
        conteudo = base64.b64decode(dados_b64)
    else:
        conteudo, tipo = buscar_bytes(origem)
        ext = EXTENSAO_POR_TIPO.get(tipo.split(";")[0].strip().lower(), "jpg")

    nome = f"{slug}-{indice}.{ext}"
    with open(f"{IMG_DIR}/{nome}", "wb") as f:
        f.write(conteudo)
    return f"assets/img/galeria/{nome}"


def ler_sheet(csv_url):
    conteudo = buscar_url(csv_url)
    leitor = csv.DictReader(io.StringIO(conteudo))
    return [{(k or "").strip().lower(): (v or "").strip() for k, v in linha.items()} for linha in leitor]


def main():
    if len(sys.argv) < 2:
        print("Uso: gerar-galeria.py <URL_CSV_DA_SHEET>", file=sys.stderr)
        sys.exit(1)

    csv_url = sys.argv[1]

    if not csv_url or "SEU_CSV_URL_AQUI" in csv_url:
        print("A Google Sheet da galeria ainda não está configurada (ver README.md) — nada a fazer.", file=sys.stderr)
        sys.exit(0)

    try:
        linhas = ler_sheet(csv_url)
    except Exception as e:
        print(f"Não foi possível ler a Google Sheet: {e}", file=sys.stderr)
        sys.exit(1)

    posts = []
    for linha in linhas:
        data = linha.get("data", "")
        legenda = linha.get("legenda", "")
        link_doc = linha.get("link_doc", "")
        publicar = linha.get("publicar", "").strip().lower()

        if not data or not link_doc:
            continue
        if publicar in NAO_PUBLICAR:
            continue
        try:
            datetime.strptime(data, "%Y-%m-%d")
        except ValueError:
            print(f"A ignorar post de '{data}': data inválida (esperado AAAA-MM-DD).", file=sys.stderr)
            continue

        slug = f"{data}-{slugificar(legenda or 'post')}"

        try:
            html_doc = buscar_url(normalizar_link_doc(link_doc))
            origens = extrair_imagens_do_doc(html_doc)
        except Exception as e:
            print(f"A ignorar post '{slug}': não foi possível ler o Google Doc ({e}).", file=sys.stderr)
            continue

        if not origens:
            print(f"A ignorar post '{slug}': o Google Doc não tem nenhuma imagem.", file=sys.stderr)
            continue

        imagens = []
        for i, origem in enumerate(origens, start=1):
            try:
                imagens.append(gravar_imagem(origem, slug, i))
            except Exception as e:
                print(f"Aviso: falhou gravar uma imagem do post '{slug}' ({e}) — a saltar essa imagem.", file=sys.stderr)

        if not imagens:
            print(f"A ignorar post '{slug}': nenhuma imagem foi gravada com sucesso.", file=sys.stderr)
            continue

        posts.append({"data": data, "legenda": legenda, "imagens": imagens})

    if not posts:
        print("Nenhum post válido encontrado na Sheet — nada a gerar desta vez.", file=sys.stderr)
        sys.exit(0)

    posts.sort(key=lambda p: p["data"], reverse=True)
    posts = posts[:MAX_POSTS]
    for i, post in enumerate(posts, start=1):
        post["id"] = i

    conteudo_js = (
        "/* =========================================================\n"
        "   PASCOM · Galeria de Imagens — dados dos posts\n"
        "   -----------------------------------------------------------\n"
        "   GERADO AUTOMATICAMENTE por .github/workflows/galeria.yml a\n"
        "   partir da Google Sheet \"índice\" da galeria (ver README.md,\n"
        "   secção \"Galeria de Imagens\") — NÃO EDITE ESTE FICHEIRO À\n"
        "   MÃO: as alterações são substituídas no próximo sincronismo.\n"
        "   ========================================================= */\n\n"
        f"const PASCOM_GALERIA = {json.dumps(posts, ensure_ascii=False, indent=2)};\n"
    )
    with open(GALERIA_JS_PATH, "w", encoding="utf-8") as f:
        f.write(conteudo_js)

    total_imagens = sum(len(p["imagens"]) for p in posts)
    print(f"Gerados {len(posts)} post(s) ({total_imagens} imagem(ns) no total).")


if __name__ == "__main__":
    main()
