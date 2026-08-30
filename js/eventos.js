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
   ========================================================= */

const PASCOM_EVENTOS = [
  {
    id: 1,
    titulo: "Missa Dominical",
    data: "2026-09-06",
    horaInicio: "10:00",
    horaFim: "11:00",
    categoria: "liturgico",
    local: "Igreja Paroquial",
    descricao: "Celebração eucarística dominical."
  },
  {
    id: 2,
    titulo: "Catequese — 1º ao 4º ano",
    data: "2026-09-12",
    horaInicio: "14:00",
    horaFim: "15:00",
    categoria: "catequese",
    local: "Salão Paroquial",
    descricao: "Encontro semanal de iniciação cristã."
  },
  {
    id: 3,
    titulo: "Adoração ao Santíssimo",
    data: "2026-09-17",
    horaInicio: "18:00",
    horaFim: "19:00",
    categoria: "liturgico",
    local: "Igreja Paroquial",
    descricao: "Hora de adoração semanal."
  },
  {
    id: 4,
    titulo: "Reunião do Grupo de Jovens",
    data: "2026-09-19",
    horaInicio: "21:00",
    horaFim: "22:30",
    categoria: "comunidade",
    local: "Salão Paroquial",
    descricao: "Encontro mensal do grupo de jovens."
  },
  {
    id: 5,
    titulo: "Festa de São Carlo Acutis",
    data: "2026-10-12",
    horaInicio: "18:30",
    horaFim: "20:00",
    categoria: "festa",
    local: "Igreja Paroquial",
    descricao: "Celebração dedicada ao patrono da PASCOM."
  }
];