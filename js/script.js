/* =========================================================
   PASCOM · Paróquia de São João Baptista
   Interações do site
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {

  /* ---------- Ano no rodapé ---------- */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Slideshow do topo (fotos das igrejas) ---------- */
  const heroSlides = document.querySelectorAll('.hero-slide');
  if (heroSlides.length > 1) {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!reduceMotion) {
      let heroSlideIndex = 0;
      let heroTimer = setInterval(avancarHeroSlide, 6500);

      function avancarHeroSlide() {
        heroSlides[heroSlideIndex].classList.remove('active');
        heroSlideIndex = (heroSlideIndex + 1) % heroSlides.length;
        heroSlides[heroSlideIndex].classList.add('active');
      }

      document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
          clearInterval(heroTimer);
        } else {
          heroTimer = setInterval(avancarHeroSlide, 6500);
        }
      });
    }
  }

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

  /* ---------- Evangelho / Santo do dia: conteúdo automático ----------
     Lido de data/liturgia-hoje.json, gerado todos os dias por um GitHub
     Action (.github/workflows/liturgia-diaria.yml) a partir do feed da
     Evangelizo. Se o ficheiro não existir ou o pedido falhar, mantém-se
     a mensagem placeholder que já está no HTML. */
  fetch('data/liturgia-hoje.json', { cache: 'no-store' })
    .then(res => (res.ok ? res.json() : Promise.reject(new Error('liturgia indisponível'))))
    .then(liturgia => {
      const liturgicalTimeEl = document.getElementById('gospelLiturgicalTime');
      const citationEl = document.getElementById('gospelCitation');
      const textEl = document.getElementById('gospelText');
      const saintNameEl = document.getElementById('saintName');

      if (liturgicalTimeEl && liturgia.tempoLiturgico) {
        liturgicalTimeEl.textContent = liturgia.tempoLiturgico;
      }
      if (citationEl && liturgia.evangelho && liturgia.evangelho.titulo) {
        citationEl.textContent = liturgia.evangelho.titulo;
      }
      if (textEl && liturgia.evangelho && liturgia.evangelho.texto) {
        textEl.innerHTML = '';
        liturgia.evangelho.texto.split('\n').forEach(paragrafo => {
          if (!paragrafo.trim()) return;
          const p = document.createElement('p');
          p.textContent = paragrafo.trim();
          textEl.appendChild(p);
        });
      }
      if (saintNameEl && liturgia.santo) {
        saintNameEl.textContent = liturgia.santo;
      }
    })
    .catch(() => {
      /* Mantém o texto placeholder já presente no HTML. */
    });

  /* ---------- Galeria de imagens (grid tipo Instagram + lightbox) ----------
     Os posts vêm de js/galeria.js (PASCOM_GALERIA), gerado todos os dias
     por um GitHub Action (.github/workflows/galeria.yml) a partir da
     Google Sheet "índice" da galeria. Se ainda não houver posts, mostra-se
     uma mensagem a explicar que a galeria está por configurar. */
  const galleryGrid = document.getElementById('galleryGrid');
  const posts = (typeof PASCOM_GALERIA !== 'undefined') ? PASCOM_GALERIA : [];

  if (posts.length === 0) {
    galleryGrid.innerHTML = '<p class="gallery-empty">Ainda não há fotografias publicadas na galeria. Volte em breve! <i class="fa-regular fa-images"></i></p>';
  } else {
    posts.forEach((post, index) => {
      const tile = document.createElement('button');
      tile.className = 'gallery-tile';
      tile.dataset.index = index;
      tile.setAttribute('aria-label', post.legenda || 'Ver fotografia');
      const temVariasFotos = post.imagens.length > 1;
      tile.innerHTML = `
        <img src="${post.imagens[0]}" alt="${(post.legenda || '').replace(/"/g, '&quot;')}" loading="lazy">
        ${temVariasFotos ? '<span class="gallery-tile-badge" title="Várias fotografias"><i class="fa-regular fa-images"></i></span>' : ''}
      `;
      galleryGrid.appendChild(tile);
    });
  }

  const lightbox = document.getElementById('lightbox');
  const lightboxContent = document.getElementById('lightboxContent');
  let currentPostIndex = 0;
  let currentImageIndex = 0;

  function openLightbox(postIndex) {
    currentPostIndex = postIndex;
    currentImageIndex = 0;
    renderLightbox();
    lightbox.classList.add('open');
    lightbox.setAttribute('aria-hidden', 'false');
  }

  function renderLightbox() {
    const post = posts[currentPostIndex];
    const imagens = post.imagens;
    const temVarias = imagens.length > 1;

    let dotsHTML = '';
    if (temVarias) {
      dotsHTML = '<div class="lightbox-dots">' +
        imagens.map((_, i) => `<span class="lightbox-dot${i === currentImageIndex ? ' active' : ''}"></span>`).join('') +
        '</div>';
    }

    lightboxContent.innerHTML = `
      <img src="${imagens[currentImageIndex]}" alt="${(post.legenda || '').replace(/"/g, '&quot;')}">
      ${dotsHTML}
      ${post.legenda ? `<p class="lightbox-caption">${post.legenda}</p>` : ''}
    `;

    document.getElementById('lightboxPrev').style.display = (posts.length > 1 || temVarias) ? 'flex' : 'none';
    document.getElementById('lightboxNext').style.display = (posts.length > 1 || temVarias) ? 'flex' : 'none';
  }

  function closeLightbox() {
    lightbox.classList.remove('open');
    lightbox.setAttribute('aria-hidden', 'true');
  }

  function irParaImagemAnterior() {
    const imagens = posts[currentPostIndex].imagens;
    if (imagens.length > 1) {
      currentImageIndex = (currentImageIndex - 1 + imagens.length) % imagens.length;
    } else {
      currentPostIndex = (currentPostIndex - 1 + posts.length) % posts.length;
      currentImageIndex = 0;
    }
    renderLightbox();
  }

  function irParaImagemSeguinte() {
    const imagens = posts[currentPostIndex].imagens;
    if (currentImageIndex < imagens.length - 1) {
      currentImageIndex += 1;
    } else {
      currentPostIndex = (currentPostIndex + 1) % posts.length;
      currentImageIndex = 0;
    }
    renderLightbox();
  }

  if (posts.length > 0) {
    galleryGrid.addEventListener('click', (e) => {
      const tile = e.target.closest('.gallery-tile');
      if (tile) openLightbox(Number(tile.dataset.index));
    });

    document.getElementById('lightboxClose').addEventListener('click', closeLightbox);
    document.getElementById('lightboxPrev').addEventListener('click', irParaImagemAnterior);
    document.getElementById('lightboxNext').addEventListener('click', irParaImagemSeguinte);
    lightbox.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });
    document.addEventListener('keydown', (e) => {
      if (!lightbox.classList.contains('open')) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowRight') irParaImagemSeguinte();
      if (e.key === 'ArrowLeft') irParaImagemAnterior();
    });
  }

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

  /* ---------- Formulário de contacto (envio via Formspree) ---------- */
  const contactForm = document.getElementById('contactForm');
  const contactStatus = document.getElementById('contactFormStatus');
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();

    if (contactForm.action.includes('SEU_FORM_ID')) {
      contactStatus.textContent = 'Formulário ainda não está ligado a um email — falta configurar o Formspree (ver README.md).';
      contactStatus.classList.add('form-status-error');
      return;
    }

    const submitBtn = contactForm.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    contactStatus.classList.remove('form-status-error', 'form-status-success');
    contactStatus.textContent = 'A enviar...';

    fetch(contactForm.action, {
      method: 'POST',
      body: new FormData(contactForm),
      headers: { Accept: 'application/json' },
    })
      .then((res) => {
        if (res.ok) {
          contactStatus.textContent = 'Mensagem enviada! Obrigado pelo contacto — responderemos assim que possível.';
          contactStatus.classList.add('form-status-success');
          contactForm.reset();
        } else {
          throw new Error('Falha no envio');
        }
      })
      .catch(() => {
        contactStatus.textContent = 'Não foi possível enviar a mensagem. Tente novamente ou contacte-nos diretamente por email.';
        contactStatus.classList.add('form-status-error');
      })
      .finally(() => {
        submitBtn.disabled = false;
      });
  });

});
