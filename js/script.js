/* =========================================================
   PASCOM · Paróquia de São João Baptista
   Interações do site
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {

  /* ---------- Ano no rodapé ---------- */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Menu mobile ---------- */
  const navToggle = document.getElementById('navToggle');
  const mainNav = document.getElementById('mainNav');

  navToggle.addEventListener('click', () => {
    const isOpen = mainNav.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', isOpen);
    navToggle.classList.toggle('open', isOpen);
  });

  // Dropdowns funcionam como acordeões em ecrãs pequenos
  document.querySelectorAll('.has-dropdown > .nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
      if (window.innerWidth <= 780) {
        e.preventDefault();
        link.parentElement.classList.toggle('open');
      }
    });
  });

  // Fechar o menu mobile ao escolher uma ligação final
  document.querySelectorAll('.main-nav a').forEach(link => {
    link.addEventListener('click', () => {
      if (window.innerWidth <= 780 && !link.parentElement.classList.contains('has-dropdown')) {
        mainNav.classList.remove('open');
        navToggle.setAttribute('aria-expanded', false);
      }
    });
  });

  /* ---------- Realce do link ativo ao rolar (scrollspy) ---------- */
  const sections = document.querySelectorAll('main section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  const spyObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navLinks.forEach(link => {
          link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
        });
      }
    });
  }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });

  sections.forEach(sec => spyObserver.observe(sec));

  /* ---------- Botão "Voltar ao topo" ---------- */
  const backToTop = document.getElementById('backToTop');
  window.addEventListener('scroll', () => {
    backToTop.classList.toggle('show', window.scrollY > 500);
  });
  backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  /* ---------- Tabs (Horário das Missas) ---------- */
  document.querySelectorAll('[data-tabs]').forEach(tabGroup => {
    const buttons = tabGroup.querySelectorAll('.tab-btn');
    const panels = tabGroup.querySelectorAll('.tab-panel');
    buttons.forEach(btn => {
      btn.addEventListener('click', () => {
        buttons.forEach(b => b.classList.remove('active'));
        panels.forEach(p => p.classList.remove('active'));
        btn.classList.add('active');
        tabGroup.querySelector(`[data-panel="${btn.dataset.tab}"]`).classList.add('active');
      });
    });
  });

  /* ---------- Acordeão (Catequese) ---------- */
  document.querySelectorAll('.accordion-header').forEach(header => {
    header.addEventListener('click', () => {
      const item = header.parentElement;
      const wasOpen = item.classList.contains('open');
      item.parentElement.querySelectorAll('.accordion-item').forEach(i => i.classList.remove('open'));
      if (!wasOpen) item.classList.add('open');
    });
  });

  /* ---------- Evangelho / Santo do dia: data de hoje ---------- */
  const today = new Date();
  const formatted = today.toLocaleDateString('pt-PT', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const gospelDate = document.getElementById('gospelDate');
  const saintDate = document.getElementById('saintDate');
  if (gospelDate) gospelDate.textContent = formatted;
  if (saintDate) saintDate.textContent = formatted;

  /* ---------- Galeria de imagens (placeholders + lightbox) ---------- */
  const galleryGrid = document.getElementById('galleryGrid');
  const galleryData = [
    { icon: 'fa-church', label: 'Igreja Paroquial' },
    { icon: 'fa-child', label: 'Catequese' },
    { icon: 'fa-hands-praying', label: 'Adoração' },
    { icon: 'fa-people-group', label: 'Grupos Paroquiais' },
    { icon: 'fa-music', label: 'Coro' },
    { icon: 'fa-cross', label: 'Celebrações' },
    { icon: 'fa-dove', label: 'Festa do Padroeiro' },
    { icon: 'fa-heart', label: 'Vida Comunitária' },
  ];

  galleryData.forEach((item, index) => {
    const tile = document.createElement('button');
    tile.className = 'gallery-tile';
    tile.dataset.index = index;
    tile.innerHTML = `<i class="fa-solid ${item.icon}"></i><span>${item.label}</span>`;
    galleryGrid.appendChild(tile);
  });

  const lightbox = document.getElementById('lightbox');
  const lightboxContent = document.getElementById('lightboxContent');
  let currentIndex = 0;

  function openLightbox(index) {
    currentIndex = index;
    renderLightbox();
    lightbox.classList.add('open');
    lightbox.setAttribute('aria-hidden', 'false');
  }
  function renderLightbox() {
    const item = galleryData[currentIndex];
    lightboxContent.innerHTML = `<i class="fa-solid ${item.icon}"></i>`;
  }
  function closeLightbox() {
    lightbox.classList.remove('open');
    lightbox.setAttribute('aria-hidden', 'true');
  }

  galleryGrid.addEventListener('click', (e) => {
    const tile = e.target.closest('.gallery-tile');
    if (tile) openLightbox(Number(tile.dataset.index));
  });

  document.getElementById('lightboxClose').addEventListener('click', closeLightbox);
  document.getElementById('lightboxPrev').addEventListener('click', () => {
    currentIndex = (currentIndex - 1 + galleryData.length) % galleryData.length;
    renderLightbox();
  });
  document.getElementById('lightboxNext').addEventListener('click', () => {
    currentIndex = (currentIndex + 1) % galleryData.length;
    renderLightbox();
  });
  lightbox.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });
  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('open')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowRight') document.getElementById('lightboxNext').click();
    if (e.key === 'ArrowLeft') document.getElementById('lightboxPrev').click();
  });

  /* ---------- Velas Virtuais ---------- */
  const candleForm = document.getElementById('candleForm');
  const candlesGrid = document.getElementById('candlesGrid');
  const CANDLES_KEY = 'pascom_velas';

  function loadCandles() {
    try {
      return JSON.parse(localStorage.getItem(CANDLES_KEY)) || [];
    } catch {
      return [];
    }
  }

  function saveCandles(candles) {
    localStorage.setItem(CANDLES_KEY, JSON.stringify(candles));
  }

  function escapeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function renderCandles() {
    const candles = loadCandles();
    candlesGrid.innerHTML = '';
    if (candles.length === 0) {
      candlesGrid.innerHTML = '<p class="candles-empty">Ainda não há velas acesas. Seja a primeira pessoa a acender uma. 🕯️</p>';
      return;
    }
    candles.slice().reverse().forEach(candle => {
      const el = document.createElement('div');
      el.className = 'candle-item';
      el.innerHTML = `
        <div class="candle-flame"><i class="fa-solid fa-fire"></i></div>
        <div class="candle-name">${escapeHTML(candle.name)}</div>
        <p class="candle-intention">${escapeHTML(candle.intention)}</p>
      `;
      candlesGrid.appendChild(el);
    });
  }

  candleForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const nameInput = document.getElementById('candleName');
    const intentionInput = document.getElementById('candleIntention');
    const name = nameInput.value.trim() || 'Anónimo';
    const intention = intentionInput.value.trim();
    if (!intention) return;

    const candles = loadCandles();
    candles.push({ name, intention, date: new Date().toISOString() });
    saveCandles(candles);
    renderCandles();
    candleForm.reset();
  });

  renderCandles();

  /* ---------- Formulário de contacto (demonstração) ---------- */
  const contactForm = document.getElementById('contactForm');
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    alert('Obrigado pela sua mensagem! Este formulário é uma demonstração — ligue-o a um serviço de envio de email para ativar o envio real.');
    contactForm.reset();
  });

});
