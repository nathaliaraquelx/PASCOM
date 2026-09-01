/* =========================================================
   PASCOM · Agenda Paroquial — dados dos eventos
   -----------------------------------------------------------
   Como adicionar / editar eventos:
   1. Abra a página agenda-admin.html (não está ligada no menu,
      é só para a equipa da PASCOM).
   2. Adicione, edite ou remova eventos no formulário.
   3. Clique em "Gerar código" e copie o resultado.
   4. Substitua o array PASCOM_EVENTOS abaixo por esse código.
   5. Faça commit e push no GitHub — o site atualiza para todos
      os visitantes assim que o GitHub Pages fizer o deploy.

   Categorias disponíveis: "liturgico", "catequese", "comunidade", "festa"

   Nota: os eventos abaixo vêm da Programação Pastoral 2025 (Plano
   Pastoral "Peregrinos da Esperança"). O documento não indica horas
   exatas para estes eventos, por isso usam "Todo o dia" em vez de
   uma hora inventada. Ao preparar a programação de 2026 (ou
   seguinte), atualize as datas — sobretudo as que dependem da
   Páscoa (Quaresma, Semana Santa, Corpo de Deus), que mudam todos
   os anos — através da página agenda-admin.html.
   ========================================================= */

const PASCOM_EVENTOS = [
  { id: 1, titulo: "Reinício da catequese de infância e adolescência", data: "2025-01-08", horaInicio: "Todo o dia", horaFim: "", categoria: "catequese", local: "Paróquia de São João Baptista", descricao: "Início do ano de catequese nas comunidades da paróquia." },
  { id: 2, titulo: "Reunião da Equipa Pastoral Paroquial", data: "2025-01-14", horaInicio: "Todo o dia", horaFim: "", categoria: "comunidade", local: "Paróquia de São João Baptista", descricao: "" },
  { id: 3, titulo: "Cantar os Reis nas comunidades da paróquia", data: "2025-01-18", horaInicio: "Todo o dia", horaFim: "", categoria: "festa", local: "Comunidades da paróquia", descricao: "" },
  { id: 4, titulo: "Formação para catequistas: o Batismo e o Itinerário", data: "2025-01-21", horaInicio: "Todo o dia", horaFim: "", categoria: "catequese", local: "Paróquia de São João Baptista", descricao: "" },
  { id: 5, titulo: "Encontro dos Leitores — Festa da Palavra", data: "2025-01-25", horaInicio: "Todo o dia", horaFim: "", categoria: "festa", local: "Paróquia de São João Baptista", descricao: "Jubileu da Comunicação Social." },

  { id: 6, titulo: "Reunião da Equipa Pastoral Paroquial", data: "2025-02-04", horaInicio: "Todo o dia", horaFim: "", categoria: "comunidade", local: "Paróquia de São João Baptista", descricao: "" },
  { id: 7, titulo: "Jubileu das Forças Armadas, Polícia e Proteção Civil", data: "2025-02-09", horaInicio: "Todo o dia", horaFim: "", categoria: "liturgico", local: "Catedral", descricao: "" },
  { id: 8, titulo: "Celebração do Jubileu dos Artistas", data: "2025-02-16", horaInicio: "Todo o dia", horaFim: "", categoria: "liturgico", local: "Catedral", descricao: "" },
  { id: 9, titulo: "Formação para catequistas: Eucaristia e Reconciliação", data: "2025-02-18", horaInicio: "Todo o dia", horaFim: "", categoria: "catequese", local: "Paróquia de São João Baptista", descricao: "Iniciação à vida cristã." },
  { id: 10, titulo: "Retiro para o catecumenado", data: "2025-02-22", horaInicio: "Todo o dia", horaFim: "", categoria: "catequese", local: "Paróquia de São João Baptista", descricao: "" },

  { id: 11, titulo: "Quarta-feira de Cinzas", data: "2025-03-05", horaInicio: "Todo o dia", horaFim: "", categoria: "liturgico", local: "Catedral", descricao: "Imposição das cinzas." },
  { id: 12, titulo: "Via Sacra Jovem", data: "2025-03-07", horaInicio: "Todo o dia", horaFim: "", categoria: "liturgico", local: "Paróquia de São João Baptista", descricao: "" },
  { id: 13, titulo: "Celebração do Jubileu do mundo do Voluntariado", data: "2025-03-09", horaInicio: "Todo o dia", horaFim: "", categoria: "liturgico", local: "Catedral", descricao: "" },
  { id: 14, titulo: "Encontro de catequistas", data: "2025-03-18", horaInicio: "Todo o dia", horaFim: "", categoria: "catequese", local: "Paróquia de São João Baptista", descricao: "" },
  { id: 15, titulo: "24 Horas para o Senhor", data: "2025-03-28", horaInicio: "Todo o dia", horaFim: "", categoria: "liturgico", local: "Paróquia de São João Baptista", descricao: "" },

  { id: 16, titulo: "Domingo de Ramos", data: "2025-04-13", horaInicio: "Todo o dia", horaFim: "", categoria: "liturgico", local: "Catedral", descricao: "Missa na Catedral." },
  { id: 17, titulo: "Quinta-feira Santa — Missa Crismal", data: "2025-04-17", horaInicio: "Todo o dia", horaFim: "", categoria: "liturgico", local: "Catedral", descricao: "Encontro Diocesano de Acólitos." },
  { id: 18, titulo: "Sexta-feira Santa", data: "2025-04-18", horaInicio: "Todo o dia", horaFim: "", categoria: "liturgico", local: "Catedral", descricao: "Adoração da Santa Cruz." },
  { id: 19, titulo: "Sábado Santo — Vigília Pascal", data: "2025-04-19", horaInicio: "Todo o dia", horaFim: "", categoria: "liturgico", local: "Catedral", descricao: "Celebração dos Sacramentos de Iniciação Cristã." },

  { id: 20, titulo: "Peregrinação Nacional de Acólitos a Fátima", data: "2025-05-01", horaInicio: "Todo o dia", horaFim: "", categoria: "comunidade", local: "Fátima", descricao: "" },
  { id: 21, titulo: "Festa da Fé — Domingo do Bom Pastor", data: "2025-05-10", horaInicio: "Todo o dia", horaFim: "", categoria: "festa", local: "Paróquia de São João Baptista", descricao: "" },
  { id: 22, titulo: "Festa do Perdão", data: "2025-05-30", horaInicio: "Todo o dia", horaFim: "", categoria: "festa", local: "Santos Mártires", descricao: "" },
  { id: 23, titulo: "Procissão dos 3 Pastorinhos", data: "2025-05-31", horaInicio: "Todo o dia", horaFim: "", categoria: "festa", local: "Igreja de S. Tiago até à Catedral", descricao: "" },

  { id: 24, titulo: "Procissão do Corpo de Deus", data: "2025-06-19", horaInicio: "Todo o dia", horaFim: "", categoria: "liturgico", local: "Paróquia de São João Baptista", descricao: "" },
  { id: 25, titulo: "Festa de São João Baptista", data: "2025-06-24", horaInicio: "Todo o dia", horaFim: "", categoria: "festa", local: "Paróquia de São João Baptista", descricao: "Solenidade do Padroeiro da paróquia." },

  { id: 26, titulo: "Festa dos Santos Mártires", data: "2025-07-20", horaInicio: "Todo o dia", horaFim: "", categoria: "festa", local: "Comunidade Santos Mártires", descricao: "" },
  { id: 27, titulo: "Festa de S. Tiago", data: "2025-07-27", horaInicio: "Todo o dia", horaFim: "", categoria: "festa", local: "Comunidade S. Tiago", descricao: "" },

  { id: 28, titulo: "Festa de S. Lourenço", data: "2025-08-10", horaInicio: "Todo o dia", horaFim: "", categoria: "festa", local: "Igreja das Cantarias", descricao: "" },
  { id: 29, titulo: "Senhora Rainha — Padroeira da Catedral", data: "2025-08-22", horaInicio: "Todo o dia", horaFim: "", categoria: "festa", local: "Catedral", descricao: "" },

  { id: 30, titulo: "Festa da Exaltação da Santa Cruz", data: "2025-09-14", horaInicio: "Todo o dia", horaFim: "", categoria: "festa", local: "Capela Senhor dos Aflitos", descricao: "" },
  { id: 31, titulo: "Festa da Senhora das Dores", data: "2025-09-15", horaInicio: "Todo o dia", horaFim: "", categoria: "festa", local: "Capela Senhor dos Aflitos", descricao: "" },

  { id: 32, titulo: "Aniversário da Dedicação da Catedral", data: "2025-10-07", horaInicio: "Todo o dia", horaFim: "", categoria: "comunidade", local: "Catedral", descricao: "XXIV aniversário." },
  { id: 33, titulo: "Festa de São Carlo Acutis", data: "2025-10-12", horaInicio: "Todo o dia", horaFim: "", categoria: "festa", local: "Paróquia de São João Baptista", descricao: "Celebração dedicada ao patrono da PASCOM." },
  { id: 34, titulo: "Dia Mundial das Missões", data: "2025-10-19", horaInicio: "Todo o dia", horaFim: "", categoria: "liturgico", local: "Paróquia de São João Baptista", descricao: "" },

  { id: 35, titulo: "Aniversário da Dedicação da Igreja dos Santos Mártires", data: "2025-11-19", horaInicio: "Todo o dia", horaFim: "", categoria: "comunidade", local: "Santos Mártires", descricao: "XIX aniversário." },

  { id: 36, titulo: "Festa de Natal da Catequese", data: "2025-12-08", horaInicio: "Todo o dia", horaFim: "", categoria: "festa", local: "Paróquia de São João Baptista", descricao: "" },
  { id: 37, titulo: "Encerramento do Ano Santo", data: "2025-12-28", horaInicio: "Todo o dia", horaFim: "", categoria: "liturgico", local: "Catedral", descricao: "Encerramento nas Igrejas particulares." }
];
