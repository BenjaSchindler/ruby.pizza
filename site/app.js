/* ══════════════════════════════════════════════════════════════
   ruby.pizza — interacciones
   ══════════════════════════════════════════════════════════════ */
(() => {
  'use strict';

  const $  = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── año del pie ─────────────────────────────────────────── */
  const year = $('#year');
  if (year) year.textContent = new Date().getFullYear();

  /* ── nav: fondo sólido al bajar + botón flotante ─────────── */
  const nav = $('#nav');
  const fab = $('#fab');

  const onScroll = () => {
    const y = scrollY;
    nav.classList.toggle('is-stuck', y > 40);
    fab.classList.toggle('is-on', y > innerHeight * 0.75);
  };
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ── menú móvil ──────────────────────────────────────────── */
  const burger = $('#burger');
  const drawer = $('#drawer');

  const setDrawer = (open) => {
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
    document.body.style.overflow = open ? 'hidden' : '';

    if (open) {
      drawer.hidden = false;
      requestAnimationFrame(() => drawer.classList.add('is-open'));
    } else {
      drawer.classList.remove('is-open');
      const hide = () => { drawer.hidden = true; };
      reduced ? hide() : setTimeout(hide, 300);
    }
  };

  burger.addEventListener('click', () => {
    setDrawer(burger.getAttribute('aria-expanded') !== 'true');
  });

  drawer.addEventListener('click', (e) => {
    if (e.target.closest('a')) setDrawer(false);
  });

  addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && burger.getAttribute('aria-expanded') === 'true') {
      setDrawer(false);
      burger.focus();
    }
  });

  /* ── video del hero ──────────────────────────────────────── */
  const heroVideo = $('#heroVideo');

  if (heroVideo) {
    const saveData = navigator.connection?.saveData === true;

    // Con movimiento reducido o ahorro de datos ni siquiera se descarga:
    // la foto del hero ya está puesta y alcanza.
    if (!reduced && !saveData) {
      heroVideo.src = matchMedia('(max-width: 699px)').matches
        ? '/assets/video/hero-mobile.mp4'
        : '/assets/video/hero.mp4';

      heroVideo.addEventListener('canplay', () => {
        heroVideo.classList.add('is-on');
      }, { once: true });

      // Si el navegador bloquea el autoplay, .play() rechaza y queda la foto.
      const play = () => heroVideo.play().catch(() => {});
      play();

      // No gastar CPU ni batería mientras el hero está fuera de pantalla.
      if ('IntersectionObserver' in window) {
        new IntersectionObserver((entries) => {
          entries.forEach((e) => (e.isIntersecting ? play() : heroVideo.pause()));
        }, { threshold: 0.01 }).observe(heroVideo);
      }
    }
  }

  /* ── entrada por scroll ──────────────────────────────────── */
  const reveals = $$('.reveal');

  if (reduced || !('IntersectionObserver' in window)) {
    reveals.forEach((el) => el.classList.add('is-in'));
  } else {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-in');
        io.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.08 });

    reveals.forEach((el) => io.observe(el));

    // el hero entra de inmediato, sin esperar al scroll
    $$('.hero .reveal').forEach((el) => {
      el.classList.add('is-in');
      io.unobserve(el);
    });
  }

  /* ── lightbox de la galería ──────────────────────────────── */
  const lb     = $('#lightbox');
  const lbImg  = $('#lbImg');
  const items  = $$('.gal');
  let index    = 0;

  const show = (i) => {
    index = (i + items.length) % items.length;
    const btn = items[index];
    const img = $('img', btn);
    lbImg.src = btn.dataset.full;
    lbImg.alt = img ? img.alt : '';
  };

  items.forEach((btn, i) => {
    btn.addEventListener('click', () => {
      show(i);
      lb.showModal();
      document.body.style.overflow = 'hidden';
    });
  });

  const close = () => {
    lb.close();
    document.body.style.overflow = '';
    items[index]?.focus();
  };

  $('#lbClose').addEventListener('click', close);
  $('#lbPrev').addEventListener('click', () => show(index - 1));
  $('#lbNext').addEventListener('click', () => show(index + 1));

  // clic fuera de la imagen y de los controles
  lb.addEventListener('click', (e) => {
    if (e.target === lb) close();
  });

  lb.addEventListener('cancel', () => {
    document.body.style.overflow = '';
  });

  lb.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft')  { e.preventDefault(); show(index - 1); }
    if (e.key === 'ArrowRight') { e.preventDefault(); show(index + 1); }
  });

  /* ── deslizar en el lightbox (móvil) ─────────────────────── */
  let touchX = null;
  lb.addEventListener('touchstart', (e) => { touchX = e.changedTouches[0].clientX; }, { passive: true });
  lb.addEventListener('touchend', (e) => {
    if (touchX === null) return;
    const dx = e.changedTouches[0].clientX - touchX;
    if (Math.abs(dx) > 55) show(index + (dx < 0 ? 1 : -1));
    touchX = null;
  }, { passive: true });

})();
