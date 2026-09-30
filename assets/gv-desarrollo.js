/* =====================================================================
   Grupo Velas · Interacciones de las páginas individuales de desarrollo
   Las páginas se generan con tools/generar-desarrollos.js a partir de las
   plantillas de cada categoría (pvivienda/, residencial/, residencialp/).
   Cada página define window.DEV antes de cargar este archivo:
     name, whatsapp, waMsg, msgs{}, mapsEmbed, protos[], video{}, tour, calc{}
   Todo es opcional: si una sección no existe en la página, se omite.
   ===================================================================== */
(() => {
  const D = window.DEV || {};
  const $ = (s, c = document) => c.querySelector(s), $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fmt = n => '$' + Math.round(n).toLocaleString('es-MX');
  const MSG = D.msgs || {};
  const waURL = t => `https://api.whatsapp.com/send/?phone=${D.whatsapp}&text=${encodeURIComponent(t)}`;
  const track = (event, extra) => window.dataLayer && dataLayer.push(Object.assign({event, desarrollo: D.name}, extra));
  const yr = $('#yr'); if (yr) yr.textContent = new Date().getFullYear();
  $$('[data-wa]').forEach(a => { a.href = waURL(MSG[a.dataset.msg] || D.waMsg); a.target = '_blank'; a.rel = 'noopener'; });

  /* ---------- Intro + carrusel del hero ---------- */
  const heroImg = $('#heroImg');
  const start = () => document.body.classList.add('loaded');
  if (heroImg && !heroImg.complete){ heroImg.addEventListener('load', start); setTimeout(start, 1600); } else setTimeout(start, 80);
  heroImg && heroImg.addEventListener('error', start);
  const slides = $$('#slides img'), dots = $$('#sdots button');
  if (slides.length > 1 && dots.length){
    let si = 0, timer;
    const go = i => { slides[si].classList.remove('on'); dots[si].classList.remove('on'); si = (i + slides.length) % slides.length; slides[si].classList.add('on'); void dots[si].offsetWidth; dots[si].classList.add('on'); clearTimeout(timer); timer = setTimeout(() => go(si + 1), 6000); };
    dots.forEach((d, i) => d.addEventListener('click', () => go(i)));
    if (!reduce) timer = setTimeout(() => go(1), 6000);
  }

  /* ---------- Pregunta de crédito (Primera Vivienda) ---------- */
  const qopts = $('#qopts');
  if (qopts){
    const T = D.qText || {};
    $$('button', qopts).forEach(b => b.addEventListener('click', () => {
      $$('button', qopts).forEach(x => x.classList.toggle('on', x === b));
      $('#qtext').textContent = T[b.dataset.a] || '';
      $('#qwa').href = waURL(MSG[b.dataset.a] || D.waMsg);
      $('#qans').classList.add('show');
      const fc = $('#fc'); if (fc) fc.selectedIndex = ['si', 'nose', 'no'].indexOf(b.dataset.a);
      track('hero_credito', {respuesta: b.dataset.a});
    }));
  }

  /* ---------- Títulos, reveal y contadores ---------- */
  $$('[data-split]').forEach(el => { el.innerHTML = el.textContent.trim().split(/\s+/).map((w, i) => `<span class="w"><span style="--i:${i}">${w}</span></span>`).join(' '); });
  function countUp(el){
    if (el.dataset.done) return; el.dataset.done = 1;
    const end = +el.dataset.count, dec = +(el.dataset.dec || 0), t0 = performance.now(), dur = 1500;
    const f = v => v.toLocaleString('es-MX', {minimumFractionDigits: dec, maximumFractionDigits: dec});
    if (reduce) return el.textContent = f(end);
    const s = t => { const p = Math.min((t - t0) / dur, 1); el.textContent = f(end * (1 - Math.pow(1 - p, 4))); if (p < 1) requestAnimationFrame(s); };
    requestAnimationFrame(s);
  }
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    e.target.classList.add('is-in');
    if (e.target.matches('[data-count]')) countUp(e.target);
    e.target.querySelectorAll('[data-count]').forEach(countUp);
    if (e.target.id === 'tlsteps') e.target.style.setProperty('--w', '100%');
    io.unobserve(e.target);
  }), {threshold: .15, rootMargin: '0px 0px -6% 0px'});
  setTimeout(() => $$('.hero-stats [data-count], .price-card [data-count]').forEach(countUp), 1000);

  /* ---------- Scroll: header, progreso, parallax, video, flotantes ---------- */
  const header = $('#top'), prog = $('#progress'), para = $$('[data-parallax]');
  const wa = $('#wa'), mbar = $('#mbar'), vframe = $('#vframe'), contacto = $('#contacto');
  const heroMedia = $('.hero-media img');
  let ticking = false;
  const onScroll = () => {
    const y = scrollY, h = document.documentElement.scrollHeight - innerHeight, vh = innerHeight;
    if (prog) prog.style.transform = `scaleX(${h > 0 ? y / h : 0})`;
    if (header){
      header.classList.toggle('scrolled', y > 60);
      header.inert = y <= 60 && !document.body.classList.contains('nav-open'); // oculto arriba: lo reemplaza el navbar corporativo
    }
    const showF = y > vh * .7, cr = contacto ? contacto.getBoundingClientRect() : {top: 1e9, bottom: -1};
    wa && wa.classList.toggle('show', showF);
    mbar && mbar.classList.toggle('show', showF && !(cr.top < vh * .8 && cr.bottom > 0));
    if (!reduce){
      if (heroMedia && y < vh * 1.1) heroMedia.style.transform = `scale(1.03) translateY(${y * .18}px)`;
      para.forEach(el => {
        const r = el.parentElement.getBoundingClientRect();
        if (r.bottom < 0 || r.top > vh) return;
        el.style.transform = `translateY(${(r.top + r.height / 2 - vh / 2) * -(+el.dataset.parallax)}px)`;
      });
      if (vframe && !vframe.dataset.static && innerWidth > 900){
        const r = vframe.getBoundingClientRect(), p = Math.min(Math.max((vh - r.top) / (vh * .9), 0), 1);
        vframe.style.setProperty('--vs', (.84 + .16 * p).toFixed(4));
        vframe.style.setProperty('--vr', (28 - 16 * p).toFixed(1) + 'px');
      }
    }
    ticking = false;
  };
  addEventListener('scroll', () => { if (!ticking){ requestAnimationFrame(onScroll); ticking = true; } }, {passive: true});
  addEventListener('resize', onScroll);
  onScroll();

  /* Scrollspy y menú móvil del navbar del desarrollo */
  const links = $$('.menu a');
  const spy = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) links.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + e.target.id)); }), {rootMargin: '-45% 0px -50% 0px'});
  links.forEach(a => { const s = $(a.getAttribute('href')); s && spy.observe(s); });
  const burger = $('#burger');
  burger && burger.addEventListener('click', () => document.body.classList.toggle('nav-open'));
  links.forEach(a => a.addEventListener('click', () => document.body.classList.remove('nav-open')));

  /* Pill deslizante genérica */
  function pillGroup(wrap, onPick){
    if (!wrap) return;
    const pill = $('.pill', wrap), btns = $$('button', wrap);
    const move = b => { if (!b || !pill) return; pill.style.width = b.offsetWidth + 'px'; pill.style.transform = `translateX(${b.offsetLeft}px)`; };
    btns.forEach(b => b.addEventListener('click', () => { btns.forEach(x => x.classList.toggle('on', x === b)); move(b); onPick(b); }));
    const init = () => move($('button.on', wrap));
    addEventListener('load', init); addEventListener('resize', init); document.fonts && document.fonts.ready.then(init); setTimeout(init, 300);
  }

  /* ---------- Lightbox ---------- */
  const lb = $('#lb'), lbImg = $('#lbImg');
  let list = [], idx = 0;
  const show = (i, dir = 1) => {
    idx = (i + list.length) % list.length; const it = list[idx];
    lbImg.style.setProperty('--dir', dir); lbImg.classList.add('leaving');
    setTimeout(() => {
      lbImg.src = it.src; lbImg.alt = it.cap;
      lbImg.classList.remove('leaving'); lbImg.classList.add('entering');
      requestAnimationFrame(() => requestAnimationFrame(() => lbImg.classList.remove('entering')));
      $('#lbCap').textContent = it.cap; $('#lbCount').textContent = `${idx + 1} / ${list.length}`;
    }, lb.open ? 220 : 0);
  };
  const openLb = (items, i, planMode) => { list = items; lb.classList.toggle('plan-mode', !!planMode); show(i); lb.showModal(); };
  if (lb){
    $('#lbP').addEventListener('click', () => show(idx - 1, -1));
    $('#lbN').addEventListener('click', () => show(idx + 1, 1));
    $('#lbX').addEventListener('click', () => lb.close());
    lb.addEventListener('click', e => { if (e.target === lb) lb.close(); });
    lb.addEventListener('keydown', e => { if (e.key === 'ArrowRight') show(idx + 1, 1); if (e.key === 'ArrowLeft') show(idx - 1, -1); });
    let tx = 0;
    lb.addEventListener('touchstart', e => tx = e.touches[0].clientX, {passive: true});
    lb.addEventListener('touchend', e => { const d = e.changedTouches[0].clientX - tx; if (Math.abs(d) > 50) show(idx + (d < 0 ? 1 : -1), d < 0 ? 1 : -1); });
  }

  /* ---------- Prototipos ---------- */
  const P = D.protos || [], card = $('#protoCard'), plan = $('#plan');
  let cur = 0;
  function renderProto(i, first){
    const p = P[i]; cur = i;
    $('#pName').textContent = p.name;
    $('#pType').textContent = p.tag || '';
    const img = $('#planImg'); img.src = p.img; img.alt = (p.isPlan ? 'Planta ' : '') + p.name;
    plan.classList.toggle('photo', !p.isPlan);
    $('#pM2wrap').hidden = !p.m2;
    $('#pCap').textContent = p.cap || '';
    $('#pCta').dataset.unit = p.unit || p.name;
    const fp = $('#fproto'); if (fp) fp.value = p.unit || p.name;
    $('#flist').innerHTML = (p.feats || []).map((f, j) => `<li style="--i:${j}" class="${f.endsWith('*') ? 'hl' : ''}">${f.replace('*', '')}</li>`).join('');
    if (p.m2){
      const el = $('#pM2'), from = first ? 0 : parseFloat(el.textContent.replace(/,/g, '')) || 0, dec = p.m2 % 1 ? 2 : 0, t0 = performance.now();
      const s = t => { const q = Math.min((t - t0) / 900, 1); el.textContent = (from + (p.m2 - from) * (1 - Math.pow(1 - q, 3))).toFixed(dec); if (q < 1) requestAnimationFrame(s); };
      requestAnimationFrame(s);
    }
  }
  if (card && P.length){
    const tabs = $('#tabs');
    if (tabs){
      $$('button', tabs).forEach((b, i) => b.addEventListener('click', () => {
        if (b.classList.contains('on')) return;
        $$('button', tabs).forEach(x => x.classList.toggle('on', x === b));
        $('.ind', tabs).style.transform = `translateX(${i * 100}%)`;
        card.classList.add('swapping');
        setTimeout(() => { renderProto(i); card.classList.remove('swapping'); plan.classList.remove('scanning'); void plan.offsetWidth; plan.classList.add('scanning'); }, 420);
      }));
    }
    new IntersectionObserver((es, o) => { if (es[0].isIntersecting){ renderProto(cur, true); o.disconnect(); } }, {threshold: .25}).observe(card);
    const openPlan = () => {
      const p = P[cur], photos = p.photos && p.photos.length ? p.photos : [p.img];
      openLb(photos.map((src, j) => ({src, cap: p.name + (photos.length > 1 ? ` · ${j + 1}` : '')})), 0, p.isPlan);
    };
    plan.addEventListener('click', openPlan);
    plan.addEventListener('keydown', e => { if (e.key === 'Enter') openPlan(); });
  }

  /* ---------- Video (YouTube o Google Drive) ---------- */
  const playBtn = $('#playBtn');
  if (playBtn && D.video){
    playBtn.addEventListener('click', () => {
      vframe.classList.add('playing');
      const f = document.createElement('iframe');
      f.src = D.video.youtube ? `https://www.youtube-nocookie.com/embed/${D.video.youtube}?autoplay=1&rel=0&modestbranding=1&playsinline=1` : D.video.src;
      f.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen'; f.allowFullscreen = true; f.title = 'Video ' + D.name;
      f.style.opacity = 0; f.style.transition = 'opacity .8s';
      vframe.appendChild(f); setTimeout(() => f.style.opacity = 1, 250);
      track('video_play');
    });
  }

  /* ---------- Tour virtual ---------- */
  const viewer = $('#viewer');
  if (viewer && D.tour){
    const startTour = () => {
      if (viewer.classList.contains('live')) return;
      const f = document.createElement('iframe');
      f.src = D.tour; f.allow = 'fullscreen; xr-spatial-tracking; gyroscope; accelerometer'; f.allowFullscreen = true; f.title = 'Tour virtual ' + D.name;
      viewer.appendChild(f);
      f.addEventListener('load', () => viewer.classList.add('live'));
      setTimeout(() => viewer.classList.add('live'), 2500);
      track('tour_virtual');
    };
    const tb = $('#tourBtn'); tb && tb.addEventListener('click', () => { viewer.scrollIntoView({behavior: 'smooth', block: 'center'}); startTour(); });
    viewer.addEventListener('click', e => { if (!e.target.closest('.vtools')) startTour(); });
    const fs = $('#fsBtn'); fs && fs.addEventListener('click', () => (viewer.requestFullscreen || viewer.webkitRequestFullscreen).call(viewer));
  }

  /* ---------- Galería: filtros con FLIP + lightbox ---------- */
  const items = $$('#gal .g');
  pillGroup($('#gfilters'), b => {
    const f = b.dataset.f, first = new Map(items.map(el => [el, el.getBoundingClientRect()]));
    items.forEach(el => el.classList.toggle('out', f !== 'all' && el.dataset.c !== f));
    items.forEach(el => {
      if (el.classList.contains('out')) return;
      const a = first.get(el), z = el.getBoundingClientRect();
      if (!a.width) return el.animate([{opacity: 0, transform: 'scale(.9)'}, {opacity: 1, transform: 'none'}], {duration: 500, easing: 'cubic-bezier(.16,1,.3,1)'});
      el.animate([{transform: `translate(${a.left - z.left}px,${a.top - z.top}px) scale(${a.width / z.width},${a.height / z.height})`, transformOrigin: '0 0'}, {transform: 'none', transformOrigin: '0 0'}], {duration: 650, easing: 'cubic-bezier(.16,1,.3,1)'});
    });
  });
  items.forEach(el => el.addEventListener('click', () => {
    const vis = items.filter(x => !x.classList.contains('out'));
    openLb(vis.map(x => { const im = $('img', x); return {src: im.dataset.full || im.src, cap: $('figcaption', x).textContent}; }), vis.indexOf(el));
  }));
  /* Si una foto no carga, se quita de la galería */
  $$('#gal img').forEach(img => img.addEventListener('error', () => img.closest('.g').remove(), {once: true}));

  /* ---------- Ubicación: radar de distancias + Google Maps ---------- */
  $$('#pts .ln').forEach(l => l.style.setProperty('--len', Math.hypot(l.x2.baseVal.value - l.x1.baseVal.value, l.y2.baseVal.value - l.y1.baseVal.value)));
  const hot = i => { $$('#pts .p').forEach(x => x.classList.toggle('hot', x.dataset.p == i)); $$('#places li').forEach(x => x.classList.toggle('hot', x.dataset.p == i)); };
  $$('#places li[data-p], #pts .p').forEach(el => { el.addEventListener('mouseenter', () => hot(el.dataset.p)); el.addEventListener('mouseleave', () => hot(-1)); });
  const mapbox = $('#mapbox');
  const loadMap = () => { const g = $('#gmap'); if (g && D.mapsEmbed && !$('iframe', g)) g.innerHTML = `<iframe src="${D.mapsEmbed}" loading="lazy" title="Mapa ${D.name}" referrerpolicy="no-referrer-when-downgrade"></iframe>`; };
  pillGroup($('#mtoggle'), b => { const gm = b.dataset.m === 'gmap'; if (gm) loadMap(); mapbox.classList.toggle('gm', gm); });
  if (mapbox && mapbox.classList.contains('gm')) new IntersectionObserver((es, o) => { if (es[0].isIntersecting){ loadMap(); o.disconnect(); } }, {rootMargin: '300px'}).observe(mapbox);

  /* ---------- Simulador ---------- */
  const C = D.calc;
  if (C && $('.calc-card')){
    const tween = (el, to) => { const from = +(el.dataset.v || 0), t0 = performance.now(); el.dataset.v = to; const s = t => { const q = Math.min((t - t0) / 500, 1); el.textContent = fmt(from + (to - from) * (1 - Math.pow(1 - q, 3))); if (q < 1) requestAnimationFrame(s); }; requestAnimationFrame(s); };
    const setP = i => i.style.setProperty('--p', ((i.value - i.min) / (i.max - i.min) * 100) + '%');
    const ins = $$('.calc-card input[type=range]');
    let mode = 'banco', calc;
    if (C.type === 'pv'){
      /* Infonavit: crédito + ahorro contra el precio de lista */
      const cr = $('#cr'), ah = $('#ah');
      calc = () => {
        const price = C.price, c = +cr.value, a = +ah.value, cub = Math.min(price, c + a), fal = Math.max(0, price - c - a), ok = fal === 0;
        ins.forEach(setP);
        $('#crV').textContent = fmt(c); $('#ahV').textContent = fmt(a);
        tween($('#oCub'), cub); tween($('#oFal'), ok ? c + a - price : fal);
        $('#oLbl').textContent = ok ? 'Te sobra' : 'Te falta';
        $('#oFal').classList.toggle('ok', ok); $('#cmsg').classList.toggle('ok', ok);
        $('#cmsg').textContent = ok ? '¡Tu crédito y tu ahorro cubren el precio de la casa! Agenda tu visita.' : `Cubres el ${Math.round(cub / price * 100)}% del precio. Un asesor te ayuda a completar la diferencia.`;
      };
    } else {
      /* Residencial: crédito bancario / plan directo / contado. Plus: plan directo. */
      const pr = $('#pr'), eng = $('#eng'), yr = $('#yrs'), plz = $('#plz'), rate = $('#rate');
      calc = () => {
        const price = +pr.value * 1e6, e = +eng.value;
        ins.forEach(setP);
        $('#prV').textContent = fmt(price); $('#engV').textContent = e + '%';
        if (plz) $('#plzV').textContent = plz.value + ' meses';
        if (yr) $('#yrV').textContent = yr.value + ' años';
        $$('.calc-card .f[data-for]').forEach(f => f.classList.toggle('hide', !f.dataset.for.split(' ').includes(mode)));
        if (C.type === 'rp' || mode === 'directo'){
          $('#o1L').textContent = 'Enganche'; $('#o2L').textContent = C.type === 'rp' ? 'Mensualidad estimada' : 'Mensualidad sin intereses';
          tween($('#o1'), price * e / 100); tween($('#o2'), price * (1 - e / 100) / +plz.value);
        } else if (mode === 'banco'){
          const Pv = price * (1 - e / 100), r = (+rate.value / 100) / 12, n = +yr.value * 12, m = r ? Pv * r / (1 - Math.pow(1 + r, -n)) : Pv / n;
          $('#o1L').textContent = 'Enganche'; $('#o2L').textContent = 'Mensualidad estimada'; tween($('#o1'), price * e / 100); tween($('#o2'), m);
        } else {
          $('#o1L').textContent = 'Pago total'; $('#o2L').textContent = 'Pregunta por'; tween($('#o1'), price); $('#o2').dataset.v = 0; $('#o2').textContent = 'Beneficios de contado';
        }
        const disc = $('#cdisc');
        if (disc && C.type === 're') disc.textContent = mode === 'banco' ? 'Estimación ilustrativa con tasa de referencia editable; no constituye una oferta. Tasa, plazo y condiciones las define cada banco. Precios sujetos a cambio.' : mode === 'directo' ? 'Plan directo ilustrativo sin intereses; plazos y enganches vigentes los confirma tu asesor. Precios sujetos a cambio.' : 'Consulta con tu asesor las condiciones y beneficios vigentes por pago de contado. Precios sujetos a cambio.';
      };
      rate && rate.addEventListener('input', () => calc());
      pillGroup($('#pmodes'), b => { mode = b.dataset.m; calc(); });
    }
    ins.forEach(i => i.addEventListener('input', () => calc()));
    calc();
  }

  /* ---------- Formulario ---------- */
  const sel = $('#fu');
  document.addEventListener('click', e => {
    const a = e.target.closest('[data-unit]'); if (!a) return;
    const v = a.dataset.unit;
    if (sel){ if (![...sel.options].some(o => o.text === v)) sel.add(new Option(v)); sel.value = v; }
    const fp = $('#fproto'); if (fp) fp.value = v;
    setTimeout(() => { const n = $('#fn'); n && n.focus({preventScroll: true}); }, 900);
  });
  const qs = new URLSearchParams(location.search);
  ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'gclid', 'fbclid'].forEach(k => { const f = $(`#form [name="${k}"]`); if (f && qs.get(k)) f.value = qs.get(k); });
  const form = $('#form');
  form && form.addEventListener('submit', e => {
    e.preventDefault();
    const f = e.currentTarget; let bad = false;
    [$('#fn'), $('#fp')].forEach(i => { const ok = i.value.trim().length > 2; i.style.borderColor = ok ? '' : '#c0392b'; if (!ok) bad = true; });
    if (bad) return f.animate([{transform: 'translateX(0)'}, {transform: 'translateX(-8px)'}, {transform: 'translateX(8px)'}, {transform: 'translateX(0)'}], {duration: 350});
    const data = Object.fromEntries(new FormData(f));
    console.log('Lead ' + D.name + ':', data); // TODO: enviar al CRM (desarrollo, categoría, plaza, interés, UTMs)
    track('lead_desarrollo', {categoria: data.categoria, plaza: data.plaza, interes: data.interes});
    f.classList.add('sent');
  });

  $$('[data-reveal],[data-split],.eyebrow:not(.is-in),.mapbox,#tlsteps').forEach(el => io.observe(el));
})();
