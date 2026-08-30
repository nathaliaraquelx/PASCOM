/* =========================================================
   PASCOM · Agenda Paroquial — calendário público (só leitura)
   Depende de js/eventos.js (variável PASCOM_EVENTOS) estar
   carregado ANTES deste ficheiro.
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {

  const raiz = document.getElementById('calendarioPascom');
  if (!raiz || typeof PASCOM_EVENTOS === 'undefined') return;

  const CATEGORIAS = {
    liturgico: { nome: 'Vida Litúrgica', cor: '#6d4aa8' },
    catequese: { nome: 'Catequese', cor: '#3f8f5f' },
    comunidade: { nome: 'Comunidade', cor: '#2f6fb0' },
    festa: { nome: 'Festas', cor: '#c9962c' },
  };

  const DIAS_SEMANA = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
  const MESES = ['janeiro','fevereiro','março','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro'];

  let dataAtual = new Date();
  let diaSelecionado = formatarISO(new Date());
  const categoriasAtivas = new Set(Object.keys(CATEGORIAS));

  function formatarISO(d) {
    // Usa os componentes LOCAIS da data (ano/mês/dia), nunca toISOString(),
    // que converte para UTC e pode "recuar" um dia em fusos como o de Portugal.
    const ano = d.getFullYear();
    const mes = String(d.getMonth() + 1).padStart(2, '0');
    const dia = String(d.getDate()).padStart(2, '0');
    return `${ano}-${mes}-${dia}`;
  }

  function eventosDoDia(iso) {
    return PASCOM_EVENTOS
      .filter(ev => ev.data === iso && categoriasAtivas.has(ev.categoria))
      .sort((a, b) => a.horaInicio.localeCompare(b.horaInicio));
  }

  function eventosVisiveis() {
    return PASCOM_EVENTOS.filter(ev => categoriasAtivas.has(ev.categoria));
  }

  raiz.innerHTML = `
    <div class="cal-wrap">
      <aside class="cal-side">
        <div class="cal-card">
          <div class="cal-mini-header">
            <strong id="calMiniLabel"></strong>
            <div class="cal-mini-nav">
              <button type="button" id="calMiniPrev" aria-label="Mês anterior"><i class="fa-solid fa-chevron-left"></i></button>
              <button type="button" id="calMiniNext" aria-label="Mês seguinte"><i class="fa-solid fa-chevron-right"></i></button>
            </div>
          </div>
          <div class="cal-mini-grid" id="calMiniGrid"></div>
        </div>
        <div class="cal-card">
          <h3>Categorias</h3>
          <div id="calLegenda"></div>
        </div>
      </aside>

      <div class="cal-main">
        <div class="cal-main-header">
          <div class="cal-main-nav">
            <button type="button" id="calPrev" aria-label="Mês anterior"><i class="fa-solid fa-chevron-left"></i></button>
            <button type="button" id="calNext" aria-label="Mês seguinte"><i class="fa-solid fa-chevron-right"></i></button>
          </div>
          <h3 id="calLabel"></h3>
          <button type="button" class="cal-hoje-btn" id="calHoje">Hoje</button>
        </div>
        <div class="cal-grid" id="calGrid"></div>
        <div class="cal-lista">
          <h4 id="calListaTitulo"></h4>
          <div id="calListaEventos"></div>
        </div>
      </div>
    </div>
  `;

  const els = {
    miniLabel: document.getElementById('calMiniLabel'),
    miniGrid: document.getElementById('calMiniGrid'),
    label: document.getElementById('calLabel'),
    grid: document.getElementById('calGrid'),
    legenda: document.getElementById('calLegenda'),
    listaTitulo: document.getElementById('calListaTitulo'),
    listaEventos: document.getElementById('calListaEventos'),
  };

  function construirGrelhaMes(ano, mes) {
    const primeiroDia = new Date(ano, mes, 1);
    const offset = (primeiroDia.getDay() + 6) % 7;
    const inicio = new Date(ano, mes, 1 - offset);
    const dias = [];
    for (let i = 0; i < 42; i++) {
      const d = new Date(inicio);
      d.setDate(inicio.getDate() + i);
      dias.push(d);
    }
    return dias;
  }

  function renderLegenda() {
    els.legenda.innerHTML = Object.entries(CATEGORIAS).map(([key, cat]) => `
      <label class="cal-legenda-item" data-cat="${key}">
        <input type="checkbox" checked>
        <span class="cal-legenda-dot" style="background:${cat.cor}"></span>
        ${cat.nome}
      </label>
    `).join('');

    els.legenda.querySelectorAll('.cal-legenda-item').forEach(item => {
      const cat = item.dataset.cat;
      const checkbox = item.querySelector('input');
      item.addEventListener('click', (e) => {
        if (e.target !== checkbox) checkbox.checked = !checkbox.checked;
        if (checkbox.checked) categoriasAtivas.add(cat);
        else categoriasAtivas.delete(cat);
        item.classList.toggle('cal-off', !checkbox.checked);
        renderTudo();
      });
    });
  }

  function renderMiniCalendario() {
    const ano = dataAtual.getFullYear();
    const mes = dataAtual.getMonth();
    els.miniLabel.textContent = `${MESES[mes]} ${ano}`;

    const dias = construirGrelhaMes(ano, mes);
    const hojeISO = formatarISO(new Date());

    els.miniGrid.innerHTML =
      DIAS_SEMANA.map(d => `<div class="cal-dow">${d}</div>`).join('') +
      dias.map(d => {
        const iso = formatarISO(d);
        const foraDoMes = d.getMonth() !== mes;
        const evs = eventosDoDia(iso);
        const dotCor = evs[0] ? CATEGORIAS[evs[0].categoria].cor : null;
        const classes = ['cal-dia-mini'];
        if (foraDoMes) classes.push('cal-outro-mes');
        if (iso === hojeISO) classes.push('cal-hoje');
        if (iso === diaSelecionado) classes.push('cal-selecionado');
        return `<button type="button" class="${classes.join(' ')}" data-iso="${iso}">
          ${d.getDate()}
          ${dotCor ? `<span class="cal-mini-dot" style="background:${dotCor}"></span>` : ''}
        </button>`;
      }).join('');

    els.miniGrid.querySelectorAll('button[data-iso]').forEach(btn => {
      btn.addEventListener('click', () => {
        diaSelecionado = btn.dataset.iso;
        dataAtual = new Date(diaSelecionado + 'T00:00:00');
        renderTudo();
      });
    });
  }

  function renderGrelhaPrincipal() {
    const ano = dataAtual.getFullYear();
    const mes = dataAtual.getMonth();
    els.label.textContent = `${MESES[mes]} ${ano}`;

    const dias = construirGrelhaMes(ano, mes);
    const hojeISO = formatarISO(new Date());

    els.grid.innerHTML =
      DIAS_SEMANA.map(d => `<div class="cal-dow">${d}</div>`).join('') +
      dias.map(d => {
        const iso = formatarISO(d);
        const foraDoMes = d.getMonth() !== mes;
        const evs = eventosDoDia(iso);
        const classes = ['cal-dia'];
        if (foraDoMes) classes.push('cal-outro-mes');
        if (iso === hojeISO) classes.push('cal-hoje');
        if (iso === diaSelecionado) classes.push('cal-selecionado');
        if (evs.length) classes.push('cal-tem-eventos');

        const maxVisiveis = 2;
        const tags = evs.slice(0, maxVisiveis).map(ev => `
          <span class="cal-dia-evento" style="background:${CATEGORIAS[ev.categoria].cor}">${ev.titulo}</span>
        `).join('');
        const resto = evs.length > maxVisiveis ? `<span class="cal-dia-mais">+${evs.length - maxVisiveis}</span>` : '';

        return `<div class="${classes.join(' ')}" data-iso="${iso}">
          <span class="cal-dia-num">${d.getDate()}</span>
          ${tags}${resto}
        </div>`;
      }).join('');

    els.grid.querySelectorAll('.cal-dia').forEach(cel => {
      cel.addEventListener('click', () => {
        diaSelecionado = cel.dataset.iso;
        renderTudo();
      });
    });
  }

  function renderListaDia() {
    const d = new Date(diaSelecionado + 'T00:00:00');
    els.listaTitulo.textContent = d.toLocaleDateString('pt-PT', { weekday: 'long', day: 'numeric', month: 'long' });

    const evs = eventosDoDia(diaSelecionado);
    if (!evs.length) {
      els.listaEventos.innerHTML = `<p class="cal-vazio">Sem eventos agendados para este dia.</p>`;
      return;
    }
    els.listaEventos.innerHTML = evs.map(ev => `
      <div class="cal-evento-item" style="border-left-color:${CATEGORIAS[ev.categoria].cor}">
        <div class="cal-evento-hora">${ev.horaInicio}${ev.horaFim ? '–' + ev.horaFim : ''}</div>
        <div class="cal-evento-corpo">
          <h5>${ev.titulo}</h5>
          <p>${ev.local ? ev.local + ' · ' : ''}${ev.descricao || ''}</p>
        </div>
      </div>
    `).join('');
  }

  function renderTudo() {
    renderMiniCalendario();
    renderGrelhaPrincipal();
    renderListaDia();
  }

  document.getElementById('calPrev').addEventListener('click', () => { dataAtual.setMonth(dataAtual.getMonth() - 1); renderTudo(); });
  document.getElementById('calNext').addEventListener('click', () => { dataAtual.setMonth(dataAtual.getMonth() + 1); renderTudo(); });
  document.getElementById('calMiniPrev').addEventListener('click', () => { dataAtual.setMonth(dataAtual.getMonth() - 1); renderTudo(); });
  document.getElementById('calMiniNext').addEventListener('click', () => { dataAtual.setMonth(dataAtual.getMonth() + 1); renderTudo(); });
  document.getElementById('calHoje').addEventListener('click', () => {
    dataAtual = new Date();
    diaSelecionado = formatarISO(new Date());
    renderTudo();
  });

  renderLegenda();
  renderTudo();
});