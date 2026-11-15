#!/usr/bin/env python3
"""
PASCOM - Gera js/eventos.js a partir do Google Calendar público da paróquia.

Uso: python3 scripts/gerar-eventos.py <ficheiro.ics>

Este script é executado automaticamente todos os dias por um GitHub Action
(.github/workflows/agenda-google-calendar.yml). js/eventos.js passa a ser um
ficheiro GERADO — edite os eventos no Google Calendar da paróquia, não aqui.

Categoria do evento: defina começando o título do evento no Google Calendar
com uma destas etiquetas entre parênteses retos (não sensível a maiúsculas):
  [Liturgico]   -> Vida Litúrgica
  [Catequese]   -> Catequese
  [Comunidade]  -> Comunidade
  [Festa]       -> Festas
Sem etiqueta (ou etiqueta não reconhecida), o evento entra em "Comunidade".
A etiqueta é removida do título antes de aparecer no site.

Cartaz do evento (opcional): numa linha própria da descrição do evento,
escreva "[Cartaz] <link do Google Doc>" com um Google Doc só com a imagem
do cartaz lá dentro (ver README.md, secção "Agenda Paroquial"). Essa linha
é removida da descrição mostrada no site.
"""
import base64
import json
import os
import re
import sys
import urllib.request
from datetime import date, datetime, timedelta

import icalendar
import recurring_ical_events
from bs4 import BeautifulSoup

REQUEST_HEADERS = {
    "User-Agent": "Mozilla/5.0 (compatible; PASCOM-site-bot/1.0; +https://github.com/nathaliaraquelx/PASCOM)"
}

EXTENSAO_POR_TIPO = {
    "image/jpeg": "jpg", "image/png": "png", "image/gif": "gif", "image/webp": "webp",
}

# O Google Calendar converte automaticamente um link colado na descrição em
# HTML (ex.: [Cartaz] (<u><a href="URL" target="_blank">URL</a></u>)), por
# isso procuramos o primeiro URL depois da etiqueta em vez de exigir uma
# linha só com a etiqueta e o link em texto simples.
CARTAZ_RE = re.compile(r"\[Cartaz\][^\n]*?(https?://[^\s\"'<>]+)", re.IGNORECASE)
CARTAZ_LINHA_RE = re.compile(r"\[Cartaz\][^\n]*", re.IGNORECASE)


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
    devolve sempre um URL que podemos descarregar diretamente."""
    m = re.search(r"/document/d/e/[^/]+/pub", url)
    if m:
        return url
    m = re.search(r"/document/d/([a-zA-Z0-9_-]+)", url)
    if not m:
        raise ValueError("não parece um link do Google Docs")
    doc_id = m.group(1)
    return f"https://docs.google.com/document/d/{doc_id}/export?format=html"


def extrair_e_gravar_cartaz(link_doc, evento_id):
    """Vai buscar o Google Doc do cartaz, grava a primeira imagem como
    ficheiro local e devolve o caminho relativo (ou None em caso de
    erro, para uma falha pontual não impedir a atualização dos eventos)."""
    try:
        html_doc = buscar_url(normalizar_link_doc(link_doc))
        soup = BeautifulSoup(html_doc, "html.parser")
        corpo = soup.find("div", id="contents") or soup.find("body") or soup
        img = corpo.find("img")
        if not img or not img.get("src"):
            print(f"Aviso: cartaz do evento {evento_id} não tem nenhuma imagem.", file=sys.stderr)
            return None

        origem = img["src"]
        os.makedirs("assets/img/agenda", exist_ok=True)
        if origem.startswith("data:"):
            cabecalho, dados_b64 = origem.split(",", 1)
            subtipo = cabecalho.split("/")[1].split(";")[0]
            ext = "jpg" if subtipo.lower() == "jpeg" else (re.sub(r"[^a-z0-9]", "", subtipo.lower()) or "jpg")
            conteudo = base64.b64decode(dados_b64)
        else:
            conteudo, tipo = buscar_bytes(origem)
            ext = EXTENSAO_POR_TIPO.get(tipo.split(";")[0].strip().lower(), "jpg")

        nome = f"evento-{evento_id}.{ext}"
        with open(f"assets/img/agenda/{nome}", "wb") as f:
            f.write(conteudo)
        return f"assets/img/agenda/{nome}"
    except Exception as e:
        print(f"Aviso: não foi possível obter o cartaz do evento {evento_id} ({e}).", file=sys.stderr)
        return None

CATEGORIA_TAGS = {
    "liturgico": "liturgico",
    "litúrgico": "liturgico",
    "catequese": "catequese",
    "comunidade": "comunidade",
    "festa": "festa",
    "festas": "festa",
}
CATEGORIA_OMISSA = "comunidade"

TAG_RE = re.compile(r"^\s*\[([^\]]+)\]\s*(.*)$")

# Janela de eventos a incluir: recua um pouco (histórico recente) e olha
# bastante para a frente, para apanhar bem eventos recorrentes.
DIAS_PARA_TRAS = 7
DIAS_PARA_A_FRENTE = 366


def extrair_categoria(titulo_bruto):
    m = TAG_RE.match(titulo_bruto)
    if not m:
        return CATEGORIA_OMISSA, titulo_bruto.strip()
    tag = m.group(1).strip().lower()
    resto = m.group(2).strip()
    categoria = CATEGORIA_TAGS.get(tag, CATEGORIA_OMISSA)
    # Remove sempre a etiqueta do título mostrado, reconhecida ou não —
    # uma etiqueta mal escrita não deve aparecer literalmente no site.
    return categoria, resto or titulo_bruto.strip()


def formatar_ocorrencia(ev):
    dtstart = ev.get("DTSTART").dt
    dtend = ev.get("DTEND").dt if ev.get("DTEND") else None

    todo_dia = not isinstance(dtstart, datetime)
    if todo_dia:
        data_iso = dtstart.isoformat()
        hora_inicio = "Todo o dia"
        hora_fim = ""
    else:
        data_iso = dtstart.date().isoformat()
        hora_inicio = dtstart.strftime("%H:%M")
        hora_fim = dtend.strftime("%H:%M") if isinstance(dtend, datetime) else ""

    return data_iso, hora_inicio, hora_fim


def main():
    if len(sys.argv) != 2:
        print("Uso: gerar-eventos.py <ficheiro.ics>", file=sys.stderr)
        sys.exit(2)

    with open(sys.argv[1], "rb") as f:
        cal = icalendar.Calendar.from_ical(f.read())

    inicio = date.today() - timedelta(days=DIAS_PARA_TRAS)
    fim = date.today() + timedelta(days=DIAS_PARA_A_FRENTE)

    ocorrencias = recurring_ical_events.of(cal).between(inicio, fim)
    ocorrencias.sort(key=lambda ev: str(ev.get("DTSTART").dt))

    eventos = []
    for idx, ev in enumerate(ocorrencias, start=1):
        titulo_bruto = str(ev.get("SUMMARY", "")).strip()
        if not titulo_bruto:
            continue

        categoria, titulo = extrair_categoria(titulo_bruto)
        data_iso, hora_inicio, hora_fim = formatar_ocorrencia(ev)
        local = str(ev.get("LOCATION", "")).strip() or "Paróquia de São João Baptista"
        descricao_bruta = str(ev.get("DESCRIPTION", "")).strip()

        cartaz_match = CARTAZ_RE.search(descricao_bruta)
        descricao = CARTAZ_LINHA_RE.sub("", descricao_bruta).strip()
        cartaz = extrair_e_gravar_cartaz(cartaz_match.group(1), idx) if cartaz_match else None

        eventos.append({
            "id": idx,
            "titulo": titulo,
            "data": data_iso,
            "horaInicio": hora_inicio,
            "horaFim": hora_fim,
            "categoria": categoria,
            "local": local,
            "descricao": descricao,
            "cartaz": cartaz,
        })

    cabecalho = """/* =========================================================
   PASCOM · Agenda Paroquial — dados dos eventos
   -----------------------------------------------------------
   GERADO AUTOMATICAMENTE a partir do Google Calendar público da
   paróquia por .github/workflows/agenda-google-calendar.yml —
   NÃO EDITE ESTE FICHEIRO À MÃO: as alterações são substituídas no
   próximo sincronismo (todos os dias).

   Para adicionar, editar ou remover eventos, use o Google Calendar
   da paróquia. A categoria do evento é definida começando o título
   com uma etiqueta entre parênteses retos:
     [Liturgico]   -> Vida Litúrgica
     [Catequese]   -> Catequese
     [Comunidade]  -> Comunidade
     [Festa]       -> Festas
   Sem etiqueta, o evento entra em "Comunidade". A etiqueta não
   aparece no título mostrado no site.

   (AgendaAdmin.html continua disponível para testes locais rápidos,
   mas qualquer código colado à mão aqui é substituído no próximo
   sincronismo automático.)
   ========================================================= */

"""

    conteudo = cabecalho + "const PASCOM_EVENTOS = " + json.dumps(eventos, ensure_ascii=False, indent=2) + ";\n"

    with open("js/eventos.js", "w", encoding="utf-8") as f:
        f.write(conteudo)

    print(f"Gerados {len(eventos)} eventos a partir do Google Calendar ({inicio} a {fim}).")


if __name__ == "__main__":
    main()
