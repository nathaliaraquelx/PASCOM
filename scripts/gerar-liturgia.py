#!/usr/bin/env python3
"""
PASCOM - Gera data/liturgia-hoje.json a partir do feed XML da Evangelizo.

Uso: python3 scripts/gerar-liturgia.py <caminho-para-o-xml-descarregado>

Este script é executado automaticamente todos os dias por um GitHub Action
(.github/workflows/liturgia-diaria.yml). Não altere o formato do JSON de
saída sem também atualizar js/script.js, que espera estes campos.
"""
import json
import sys
import xml.etree.ElementTree as ET
from datetime import datetime, timezone


def texto(root, tag):
    el = root.find(tag)
    return (el.text or "").strip() if el is not None and el.text else ""


def main():
    if len(sys.argv) != 2:
        print("Uso: gerar-liturgia.py <ficheiro.xml>", file=sys.stderr)
        sys.exit(2)

    tree = ET.parse(sys.argv[1])
    root = tree.find("evangelizo")
    if root is None:
        print("Estrutura XML inesperada: elemento <evangelizo> não encontrado.", file=sys.stderr)
        sys.exit(1)

    data_raw = texto(root, "date")
    try:
        data_iso = datetime.strptime(data_raw, "%Y%m%d").strftime("%Y-%m-%d")
    except ValueError:
        data_iso = ""

    resultado = {
        "data": data_iso,
        "tempoLiturgico": texto(root, "litugic_t"),
        "santo": texto(root, "saint"),
        "evangelho": {
            "citacao": texto(root, "reading_gospel_st").rstrip("."),
            "titulo": texto(root, "reading_gospel_lt").rstrip("."),
            "texto": texto(root, "reading_gospel"),
        },
        "atualizadoEm": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
    }

    # Nunca escrever ficheiro vazio/parcial por cima de um bom - falha e mantém o anterior.
    if not resultado["data"] or not resultado["evangelho"]["texto"] or not resultado["santo"]:
        print("Dados incompletos recebidos da fonte; a manter o ficheiro anterior.", file=sys.stderr)
        sys.exit(1)

    with open("data/liturgia-hoje.json", "w", encoding="utf-8") as f:
        json.dump(resultado, f, ensure_ascii=False, indent=2)
        f.write("\n")

    print(f"Liturgia atualizada: {resultado['data']} — {resultado['santo']}")


if __name__ == "__main__":
    main()
