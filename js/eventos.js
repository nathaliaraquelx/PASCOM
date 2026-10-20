/* =========================================================
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

const PASCOM_EVENTOS = [
  {
    "id": 1,
    "titulo": "JMJ 2027 - Reunião de esclarecimentos",
    "data": "2026-10-20",
    "horaInicio": "21:00",
    "horaFim": "22:00",
    "categoria": "comunidade",
    "local": "Paróquia de São João Baptista",
    "descricao": "<a href=\"https://us04web.zoom.us/j/75389003587?pwd=foeLhFnbgOTsaIIoNjx7nBl4azBd4y.1\">https://us04web.zoom.us/j/75389003587?pwd=foeLhFnbgOTsaIIoNjx7nBl4azBd4y.1</a><br><br>ID da reunião: 753 8900 3587 | Senha: 0FDXfc"
  },
  {
    "id": 2,
    "titulo": "Festa de Acolhimento - Dia de Cristo Rei",
    "data": "2026-11-21",
    "horaInicio": "Todo o dia",
    "horaFim": "",
    "categoria": "catequese",
    "local": "Paróquia de São João Baptista",
    "descricao": "S. Tiago"
  },
  {
    "id": 3,
    "titulo": "Festa de Acolhimento - Dia de Cristo Rei",
    "data": "2026-11-22",
    "horaInicio": "Todo o dia",
    "horaFim": "",
    "categoria": "catequese",
    "local": "Paróquia de São João Baptista",
    "descricao": "Santos Mártires e Sé"
  },
  {
    "id": 4,
    "titulo": "Festa de Natal",
    "data": "2026-12-08",
    "horaInicio": "16:00",
    "horaFim": "20:00",
    "categoria": "catequese",
    "local": "Paróquia de São João Baptista",
    "descricao": "Salão Esc. Emídio Garcia"
  },
  {
    "id": 5,
    "titulo": "Festa da Palavra - Domingo da Palavra",
    "data": "2027-01-23",
    "horaInicio": "Todo o dia",
    "horaFim": "",
    "categoria": "catequese",
    "local": "Paróquia de São João Baptista",
    "descricao": "S. Tiago"
  },
  {
    "id": 6,
    "titulo": "Festa da Palavra - Domingo da Palavra",
    "data": "2027-01-24",
    "horaInicio": "Todo o dia",
    "horaFim": "",
    "categoria": "catequese",
    "local": "Paróquia de São João Baptista",
    "descricao": "Stos Mártires e Sé"
  },
  {
    "id": 7,
    "titulo": "24 h para o Senhor",
    "data": "2027-03-05",
    "horaInicio": "Todo o dia",
    "horaFim": "",
    "categoria": "comunidade",
    "local": "Paróquia de São João Baptista",
    "descricao": ""
  },
  {
    "id": 8,
    "titulo": "Via Sacra",
    "data": "2027-03-12",
    "horaInicio": "20:30",
    "horaFim": "21:30",
    "categoria": "catequese",
    "local": "Paróquia de São João Baptista",
    "descricao": ""
  },
  {
    "id": 9,
    "titulo": "Festa da Fé - Dia do Bom Pastor",
    "data": "2027-04-17",
    "horaInicio": "Todo o dia",
    "horaFim": "",
    "categoria": "catequese",
    "local": "Paróquia de São João Baptista",
    "descricao": "S. Tiago"
  },
  {
    "id": 10,
    "titulo": "Festa da Fé - Dia do Bom Pastor",
    "data": "2027-04-18",
    "horaInicio": "Todo o dia",
    "horaFim": "",
    "categoria": "catequese",
    "local": "Paróquia de São João Baptista",
    "descricao": "Atos Mártires e Sé"
  },
  {
    "id": 11,
    "titulo": "Festa da Avé Maria",
    "data": "2027-05-01",
    "horaInicio": "Todo o dia",
    "horaFim": "",
    "categoria": "catequese",
    "local": "Paróquia de São João Baptista",
    "descricao": "S. Tiago"
  },
  {
    "id": 12,
    "titulo": "Festa da Avé Maria",
    "data": "2027-05-02",
    "horaInicio": "Todo o dia",
    "horaFim": "",
    "categoria": "catequese",
    "local": "Paróquia de São João Baptista",
    "descricao": "Santos Mártires e Sé"
  },
  {
    "id": 13,
    "titulo": "Festa do Perdão",
    "data": "2027-05-14",
    "horaInicio": "Todo o dia",
    "horaFim": "",
    "categoria": "catequese",
    "local": "Paróquia de São João Baptista",
    "descricao": "S. Tiago"
  },
  {
    "id": 14,
    "titulo": "Festa da Eucaristia (Primeira Comunhão)",
    "data": "2027-05-16",
    "horaInicio": "Todo o dia",
    "horaFim": "",
    "categoria": "catequese",
    "local": "Paróquia de São João Baptista",
    "descricao": "S. Tiago"
  },
  {
    "id": 15,
    "titulo": "Festa do Perdão",
    "data": "2027-05-21",
    "horaInicio": "Todo o dia",
    "horaFim": "",
    "categoria": "catequese",
    "local": "Paróquia de São João Baptista",
    "descricao": "Sé"
  },
  {
    "id": 16,
    "titulo": "Festa da Eucaristia (Primeira Comunhão)",
    "data": "2027-05-23",
    "horaInicio": "Todo o dia",
    "horaFim": "",
    "categoria": "catequese",
    "local": "Paróquia de São João Baptista",
    "descricao": "Sé"
  },
  {
    "id": 17,
    "titulo": "Festa do Perdão",
    "data": "2027-05-25",
    "horaInicio": "Todo o dia",
    "horaFim": "",
    "categoria": "catequese",
    "local": "Paróquia de São João Baptista",
    "descricao": "Santos Mártires"
  },
  {
    "id": 18,
    "titulo": "Festa da Eucaristia (Primeira Comunhão)",
    "data": "2027-05-27",
    "horaInicio": "Todo o dia",
    "horaFim": "",
    "categoria": "catequese",
    "local": "Paróquia de São João Baptista",
    "descricao": "Santos Mártires"
  },
  {
    "id": 19,
    "titulo": "Missa e Procissão do Corpo de Deus",
    "data": "2027-05-27",
    "horaInicio": "Todo o dia",
    "horaFim": "",
    "categoria": "comunidade",
    "local": "Paróquia de São João Baptista",
    "descricao": ""
  },
  {
    "id": 20,
    "titulo": "Procissão 3 pastorinhos",
    "data": "2027-05-31",
    "horaInicio": "21:00",
    "horaFim": "22:00",
    "categoria": "comunidade",
    "local": "Paróquia de São João Baptista",
    "descricao": ""
  },
  {
    "id": 21,
    "titulo": "Dia de S. João Baptista",
    "data": "2027-06-24",
    "horaInicio": "Todo o dia",
    "horaFim": "",
    "categoria": "comunidade",
    "local": "Paróquia de São João Baptista",
    "descricao": ""
  },
  {
    "id": 22,
    "titulo": "Festa de Encerramento",
    "data": "2027-06-24",
    "horaInicio": "16:30",
    "horaFim": "20:00",
    "categoria": "catequese",
    "local": "Paróquia de São João Baptista",
    "descricao": ""
  }
];
