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
"""
import json
import re
import sys
from datetime import date, datetime, timedelta

import icalendar
import recurring_ical_events

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
        descricao = str(ev.get("DESCRIPTION", "")).strip()

        eventos.append({
            "id": idx,
            "titulo": titulo,
            "data": data_iso,
            "horaInicio": hora_inicio,
            "horaFim": hora_fim,
            "categoria": categoria,
            "local": local,
            "descricao": descricao,
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
