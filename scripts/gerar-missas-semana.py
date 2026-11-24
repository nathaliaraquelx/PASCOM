#!/usr/bin/env python3
"""
Gera js/missas-semana.js a partir de uma Google Sheet "índice" (publicada
como CSV) em que cada linha é um cartaz — um Google Doc com a imagem dos
horários das missas de um dia da semana.

Ao contrário da Galeria/Notícias, não há histórico: cada dia da semana
tem sempre UM cartaz atual, substituído quando a linha correspondente
na Sheet é atualizada com um novo link.

Uso: python3 gerar-missas-semana.py <URL_CSV_DA_SHEET>

Ver README.md, secção "Missas da Semana (cartazes por dia)", para o
formato esperado da Sheet e como publicar os Docs.
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

from bs4 import BeautifulSoup

REPO_ROOT = sys.path[0] + "/.."
MISSAS_JS_PATH = f"{REPO_ROOT}/js/missas-semana.js"
IMG_DIR = f"{REPO_ROOT}/assets/img/missas-semana"

NAO_PUBLICAR = {"nao", "não", "no", "false", "0"}

REQUEST_HEADERS = {
    "User-Agent": "Mozilla/5.0 (compatible; PASCOM-site-bot/1.0; +https://github.com/nathaliaraquelx/PASCOM)"
}

EXTENSAO_POR_TIPO = {
    "image/jpeg": "jpg", "image/png": "png", "image/gif": "gif", "image/webp": "webp",
}

ORDEM_DIAS = ["segunda", "terca", "quarta", "quinta", "sexta", "sabado", "domingo"]

LEGENDA_DIAS = {
    "segunda": "Segunda-feira",
    "terca": "Terça-feira",
    "quarta": "Quarta-feira",
    "quinta": "Quinta-feira",
    "sexta": "Sexta-feira",
    "sabado": "Sábado",
    "domingo": "Domingo",
}

ALIAS_DIAS = {
    "segunda": "segunda", "segunda-feira": "segunda", "seg": "segunda", "2": "segunda", "2a": "segunda", "2ª": "segunda",
    "terca": "terca", "terça": "terca", "terca-feira": "terca", "terça-feira": "terca", "ter": "terca", "3": "terca", "3a": "terca", "3ª": "terca",
    "quarta": "quarta", "quarta-feira": "quarta", "qua": "quarta", "4": "quarta", "4a": "quarta", "4ª": "quarta",
    "quinta": "quinta", "quinta-feira": "quinta", "qui": "quinta", "5": "quinta", "5a": "quinta", "5ª": "quinta",
    "sexta": "sexta", "sexta-feira": "sexta", "sex": "sexta", "6": "sexta", "6a": "sexta", "6ª": "sexta",
    "sabado": "sabado", "sábado": "sabado", "sab": "sabado",
    "domingo": "domingo", "dom": "domingo",
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


def extrair_imagens_do_doc(html_bruto):
    """Devolve a lista ordenada de 'src' de todas as imagens dentro do
    corpo real do Doc (ignora o aviso "Published using Google Docs" dos
    Docs publicados na Web, tal como o gerador da galeria/notícias)."""
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
    return f"assets/img/missas-semana/{nome}"


def normalizar_dia(texto):
    texto = unicodedata.normalize("NFKD", texto).encode("ascii", "ignore").decode("ascii")
    texto = texto.lower().strip()
    return ALIAS_DIAS.get(texto)


def ler_sheet(csv_url):
    conteudo = buscar_url(csv_url)
    leitor = csv.DictReader(io.StringIO(conteudo))
    return [{(k or "").strip().lower(): (v or "").strip() for k, v in linha.items()} for linha in leitor]


def main():
    if len(sys.argv) < 2:
        print("Uso: gerar-missas-semana.py <URL_CSV_DA_SHEET>", file=sys.stderr)
        sys.exit(1)

    csv_url = sys.argv[1]

    if not csv_url or "SEU_CSV_URL_AQUI" in csv_url:
        print("A Google Sheet de Missas da Semana ainda não está configurada (ver README.md) — nada a fazer.", file=sys.stderr)
        sys.exit(0)

    try:
        linhas = ler_sheet(csv_url)
    except Exception as e:
        print(f"Não foi possível ler a Google Sheet: {e}", file=sys.stderr)
        sys.exit(1)

    cartazes_por_dia = {}
    for linha in linhas:
        dia_bruto = linha.get("dia_semana", "")
        link_doc = linha.get("link_doc", "")
        publicar = linha.get("publicar", "").strip().lower()

        if not dia_bruto or not link_doc:
            continue
        if publicar in NAO_PUBLICAR:
            continue

        dia = normalizar_dia(dia_bruto)
        if not dia:
            print(f"A ignorar linha: '{dia_bruto}' não é um dia da semana reconhecido.", file=sys.stderr)
            continue

        try:
            html_doc = buscar_url(normalizar_link_doc(link_doc))
            origens = extrair_imagens_do_doc(html_doc)
        except Exception as e:
            print(f"A ignorar '{dia}': não foi possível ler o Google Doc ({e}).", file=sys.stderr)
            continue

        if not origens:
            print(f"A ignorar '{dia}': o Google Doc não tem nenhuma imagem.", file=sys.stderr)
            continue

        imagens = []
        for i, origem in enumerate(origens, start=1):
            try:
                imagens.append(gravar_imagem(origem, dia, i))
            except Exception as e:
                print(f"Aviso: falhou gravar uma imagem de '{dia}' ({e}) — a saltar essa imagem.", file=sys.stderr)

        if not imagens:
            print(f"A ignorar '{dia}': nenhuma imagem foi gravada com sucesso.", file=sys.stderr)
            continue

        cartazes_por_dia[dia] = imagens

    if not cartazes_por_dia:
        print("Nenhum cartaz válido encontrado na Sheet — nada a gerar desta vez.", file=sys.stderr)
        sys.exit(0)

    cartazes = [
        {"dia": dia, "label": LEGENDA_DIAS[dia], "imagens": cartazes_por_dia[dia]}
        for dia in ORDEM_DIAS
        if dia in cartazes_por_dia
    ]

    conteudo_js = (
        "/* =========================================================\n"
        "   PASCOM · Missas da Semana — cartazes por dia\n"
        "   -----------------------------------------------------------\n"
        "   GERADO AUTOMATICAMENTE por .github/workflows/missas-semana.yml\n"
        "   a partir da Google Sheet \"índice\" (ver README.md, secção\n"
        "   \"Missas da Semana (cartazes por dia)\") — NÃO EDITE ESTE\n"
        "   FICHEIRO À MÃO: as alterações são substituídas no próximo\n"
        "   sincronismo.\n"
        "   ========================================================= */\n\n"
        f"const PASCOM_MISSAS_SEMANA = {json.dumps(cartazes, ensure_ascii=False, indent=2)};\n"
    )
    with open(MISSAS_JS_PATH, "w", encoding="utf-8") as f:
        f.write(conteudo_js)

    print(f"Gerados {len(cartazes)} cartaz(es) de {len(ORDEM_DIAS)} dias da semana.")


if __name__ == "__main__":
    main()
