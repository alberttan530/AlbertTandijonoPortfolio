(function () {
  'use strict';
  window.__ready = true;

  var root = document.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasGSAP = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (hasGSAP) gsap.registerPlugin(ScrollTrigger);

  /* ---------- split section titles into words ---------- */
  function splitWords(el) {
    var nodes = Array.prototype.slice.call(el.childNodes);
    el.innerHTML = '';
    nodes.forEach(function (n) {
      if (n.nodeType === 3) {
        n.textContent.split(/(\s+)/).forEach(function (part) {
          if (!part) return;
          if (/^\s+$/.test(part)) { el.appendChild(document.createTextNode(' ')); return; }
          var w = document.createElement('span'); w.className = 'w';
          var i = document.createElement('span'); i.textContent = part;
          w.appendChild(i); el.appendChild(w);
        });
      } else {
        var w2 = document.createElement('span'); w2.className = 'w';
        var i2 = document.createElement('span'); i2.appendChild(n);
        w2.appendChild(i2); el.appendChild(w2);
      }
    });
  }
  if (!reduce && hasGSAP) document.querySelectorAll('.split').forEach(splitWords);

  /* ---------- hero entrance ---------- */
  function heroIn() {
    if (reduce || !hasGSAP) return;
    var lines = document.querySelectorAll('.hero__title .line');
    lines.forEach(function (l) { l.innerHTML = '<span>' + l.innerHTML + '</span>'; });
    var tl = gsap.timeline({ defaults: { ease: 'expo.out' } });
    tl.from('.hero__hi', { y: 20, opacity: 0, duration: 0.8 })
      .from('.hero__title .line > span', { yPercent: 110, duration: 1.1, stagger: 0.12 }, '-=0.5')
      .from('.hero__lines, .hero__cta', { y: 24, opacity: 0, duration: 0.9, stagger: 0.1 }, '-=0.7')
      .from('.hero__blob', { scale: 0.6, opacity: 0, rotate: -8, duration: 1.2, ease: 'back.out(1.6)' }, '-=1.1')
      .from('.sticker', { scale: 0, opacity: 0, duration: 0.6, stagger: 0.12, ease: 'back.out(2.4)' }, '-=0.6')
      .from('.scribble', { opacity: 0, x: 20, duration: 0.6 }, '-=0.3');
  }

  heroIn();

  /* ---------- scroll reveal (IntersectionObserver, CSS transition) ---------- */
  var reveals = document.querySelectorAll('.reveal');
  if (reduce || !('IntersectionObserver' in window)) {
    reveals.forEach(function (el) { el.classList.add('in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -10% 0px' });
    reveals.forEach(function (el, i) { el.style.transitionDelay = ((i % 3) * 80) + 'ms'; io.observe(el); });
  }

  /* ---------- count-up (once) ---------- */
  function fmt(el, v) {
    var d = parseInt(el.dataset.decimals || '0', 10);
    return (el.dataset.prefix || '') + (d ? v.toFixed(d) : Math.round(v).toLocaleString('en-US')) + (el.dataset.suffix || '');
  }
  var counters = document.querySelectorAll('[data-count]');
  if (!reduce && 'IntersectionObserver' in window) {
    counters.forEach(function (el) { el.textContent = fmt(el, 0); });
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        cio.unobserve(e.target);
        var el = e.target, end = parseFloat(el.dataset.count), t0 = null;
        (function step(t) {
          if (t0 === null) t0 = t;
          var p = Math.min((t - t0) / 1400, 1);
          el.textContent = fmt(el, end * (p === 1 ? 1 : 1 - Math.pow(2, -10 * p)));
          if (p < 1) requestAnimationFrame(step);
        })(performance.now());
      });
    }, { threshold: 0.6 });
    counters.forEach(function (el) { cio.observe(el); });
  }

  document.querySelectorAll('.card').forEach(function (c, i) { c.style.setProperty('--i', i); });

  /* ---------- GSAP scroll effects ---------- */
  if (hasGSAP && !reduce) {
    // section titles: words slide up
    document.querySelectorAll('.split').forEach(function (t) {
      gsap.from(t.querySelectorAll('.w > span'), { yPercent: 110, rotate: 4, duration: 1, ease: 'expo.out', stagger: 0.06,
        scrollTrigger: { trigger: t, start: 'top 85%' } });
    });
    // doodle parallax
    document.querySelectorAll('[data-speed]').forEach(function (d) {
      gsap.to(d, { y: parseFloat(d.dataset.speed), rotate: '+=18', ease: 'none',
        scrollTrigger: { trigger: d.parentElement, start: 'top bottom', end: 'bottom top', scrub: true } });
    });
    // timeline line draws with scroll
    var line = document.querySelector('.timeline__line span');
    if (line) gsap.fromTo(line, { scaleY: 0 }, { scaleY: 1, ease: 'none',
      scrollTrigger: { trigger: '.timeline', start: 'top 70%', end: 'bottom 60%', scrub: 0.6 } });
    document.querySelectorAll('.tl__dot').forEach(function (d) {
      gsap.from(d, { scale: 0, rotate: -90, duration: 0.7, ease: 'back.out(2)', scrollTrigger: { trigger: d, start: 'top 80%' } });
    });
    // polaroid fans spread in
    document.querySelectorAll('.fan, .phones, .pages').forEach(function (group) {
      gsap.from(group.children, { y: 60, opacity: 0, duration: 1, ease: 'back.out(1.4)', stagger: 0.12, clearProps: 'transform,opacity',
        scrollTrigger: { trigger: group, start: 'top 85%' } });
    });
    // band speeds up slightly with scroll direction
    gsap.to('.band', { xPercent: -3, ease: 'none', scrollTrigger: { trigger: '.band', start: 'top bottom', end: 'bottom top', scrub: true } });
    // Contact Me card pops
    gsap.from('.cta-card', { scale: 0.85, rotate: -2, duration: 1.2, ease: 'elastic.out(1, 0.6)', scrollTrigger: { trigger: '.cta-card', start: 'top 90%' } });

    // stacked project cards: previous card shrinks as the next arrives
    var cards = gsap.utils.toArray('.card');
  }

  /* ---------- active nav ---------- */
  var links = document.querySelectorAll('.nav__links a[data-nav]');
  function setActive(key) {
    links.forEach(function (a) {
      var on = a.dataset.nav === key;
      a.classList.toggle('is-active', on);
      if (on) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
    });
  }
  if ('IntersectionObserver' in window) {
    var nio = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) setActive(e.target.dataset.nav || ''); });
    }, { rootMargin: '-45% 0px -50% 0px' });
    document.querySelectorAll('section[data-nav], .hero').forEach(function (s) { nio.observe(s); });
  }

  /* ---------- mobile menu ---------- */
  var nav = document.querySelector('.nav');
  var toggle = document.querySelector('.nav__toggle');
  function closeMenu() { nav.classList.remove('open'); toggle.setAttribute('aria-expanded', 'false'); }
  toggle.addEventListener('click', function () {
    var open = nav.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(open));
  });
  links.forEach(function (a) { a.addEventListener('click', closeMenu); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && nav.classList.contains('open')) { closeMenu(); toggle.focus(); } });

  /* ---------- magnetic buttons ---------- */
  if (finePointer && !reduce) {
    document.querySelectorAll('.magnetic').forEach(function (el) {
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        var x = (e.clientX - r.left - r.width / 2) * 0.25, y = (e.clientY - r.top - r.height / 2) * 0.35;
        el.style.transform = 'translate(' + x + 'px,' + y + 'px)';
      });
      el.addEventListener('pointerleave', function () { el.style.transform = ''; });
    });
    var cta = document.querySelector('.magnetic-soft');
    if (cta) {
      cta.addEventListener('pointermove', function (e) {
        var r = cta.getBoundingClientRect();
        var rx = ((e.clientY - r.top) / r.height - 0.5) * -6, ry = ((e.clientX - r.left) / r.width - 0.5) * 8;
        cta.style.transform = 'perspective(900px) rotateX(' + rx + 'deg) rotateY(' + ry + 'deg)';
      });
      cta.addEventListener('pointerleave', function () { cta.style.transform = ''; });
    }
  }

  /* ---------- film strip: drag to scroll + sprocket width ---------- */
  document.querySelectorAll('.film').forEach(function (film) {
    var setW = function () { film.style.setProperty('--film-w', film.scrollWidth + 'px'); };
    setW(); window.addEventListener('resize', setW);
    film.querySelectorAll('img').forEach(function (i) { i.addEventListener('load', setW); });
    var down = false, sx = 0, sl = 0, moved = false;
    film.addEventListener('pointerdown', function (e) { if (e.pointerType !== 'mouse') return; down = true; moved = false; sx = e.clientX; sl = film.scrollLeft; film.classList.add('dragging'); });
    window.addEventListener('pointerup', function () { if (!down) return; down = false; film.classList.remove('dragging'); });
    film.addEventListener('pointermove', function (e) { if (!down) return; var dx = e.clientX - sx; if (Math.abs(dx) > 3) moved = true; film.scrollLeft = sl - dx; });
    film.addEventListener('click', function (e) { if (moved) e.preventDefault(); }, true);
  });

  /* ---------- "Live project" links not set yet ---------- */
  var toast = document.getElementById('toast'), toastT;
  function showToast(msg) {
    toast.textContent = msg; toast.classList.add('show');
    clearTimeout(toastT); toastT = setTimeout(function () { toast.classList.remove('show'); }, 2200);
  }
  document.querySelectorAll('[data-live]').forEach(function (a) {
    if (a.getAttribute('href') && a.getAttribute('href') !== '#') { a.target = '_blank'; a.rel = 'noopener'; return; }
    a.addEventListener('click', function (e) { e.preventDefault(); showToast('Project link coming soon'); });
  });

  /* ---------- certificate lightbox ---------- */
  var dlg = document.getElementById('lightbox');
  var lbImg = document.getElementById('lb-img');
  var lbTitle = document.getElementById('lb-title');
  document.querySelectorAll('.cert, [data-cert-open]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      lbTitle.textContent = btn.dataset.title || '';
      lbImg.src = btn.dataset.src; lbImg.alt = btn.dataset.alt || btn.dataset.title || '';
      if (btn.dataset.w) { lbImg.width = btn.dataset.w; lbImg.height = btn.dataset.h; }
      if (typeof dlg.showModal === 'function') { dlg.showModal(); document.body.style.overflow = 'hidden'; }
    });
  });
  dlg.querySelector('.lb__close').addEventListener('click', function () { dlg.close(); });
  dlg.addEventListener('click', function (e) { if (e.target === dlg) dlg.close(); });
  dlg.addEventListener('close', function () { if (!document.querySelector('dialog.cs[open]')) document.body.style.overflow = ''; });

  /* ---------- project role filter + case-study dialogs ---------- */
  document.querySelectorAll('.chip').forEach(function (chip) {
    chip.addEventListener('click', function () {
      var f = chip.dataset.filter;
      document.querySelectorAll('.chip').forEach(function (c) { c.classList.toggle('is-on', c === chip); });
      var shown = 0;
      document.querySelectorAll('.stack .card').forEach(function (card) {
        var ok = f === 'all' || (card.dataset.roles || '').split(' ').indexOf(f) > -1;
        card.hidden = !ok;
        if (ok) { shown++; card.querySelector('.card__n').textContent = ('0' + shown).slice(-2); }
      });
      if (hasGSAP) ScrollTrigger.refresh();
    });
  });
  document.querySelectorAll('[data-cs]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var d = document.getElementById(btn.dataset.cs);
      if (d && typeof d.showModal === 'function') { d.showModal(); document.body.style.overflow = 'hidden'; d.querySelector('.cs__scroll').scrollTop = 0; }
    });
  });
  document.querySelectorAll('dialog.cs').forEach(function (d) {
    d.querySelector('.cs__close').addEventListener('click', function () { d.close(); });
    d.addEventListener('click', function (e) { if (e.target === d) d.close(); });
    d.addEventListener('close', function () { if (!document.querySelector('dialog[open]')) document.body.style.overflow = ''; });
  });
  lbImg.addEventListener('click', function () { lbImg.classList.toggle('zoom'); });
  dlg.addEventListener('close', function () { lbImg.classList.remove('zoom'); if (document.querySelector('dialog.cs[open]')) document.body.style.overflow = 'hidden'; });

  /* refresh triggers once images settle */
  if (hasGSAP) window.addEventListener('load', function () { ScrollTrigger.refresh(); });
})();
