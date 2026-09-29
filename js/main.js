/* SPRINTER — interactions & motion (GSAP + ScrollTrigger + Lenis) */
(() => {
  'use strict';
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover:hover) and (pointer:fine)').matches;
  const hasGsap = typeof window.gsap !== 'undefined';

  /* ---------- shared data ---------- */
  const CITIES = [
    ['Los Angeles', 34.05, -118.24, 'LA'], ['San Francisco', 37.77, -122.42, 'SF'], ['San Diego', 32.72, -117.16, 'SD'],
    ['Las Vegas', 36.17, -115.14, 'LV'], ['Phoenix', 33.45, -112.07, 'PHX'], ['Sacramento', 38.58, -121.49, 'SAC'],
    ['Seattle', 47.61, -122.33, 'SEA'], ['Portland', 45.52, -122.68, 'PDX'], ['Salt Lake City', 40.76, -111.89, 'SLC'],
    ['Denver', 39.74, -104.99, 'DEN'], ['Dallas', 32.78, -96.8, 'DAL'], ['Houston', 29.76, -95.37, 'HOU'],
    ['Austin', 30.27, -97.74, 'AUS'], ['San Antonio', 29.42, -98.49, 'SAT'], ['Chicago', 41.88, -87.63, 'CHI'],
    ['Minneapolis', 44.98, -93.27, 'MSP'], ['Nashville', 36.16, -86.78, 'BNA'], ['Atlanta', 33.75, -84.39, 'ATL'],
    ['Miami', 25.76, -80.19, 'MIA'], ['Orlando', 28.54, -81.38, 'ORL'], ['Washington DC', 38.9, -77.04, 'DC'],
    ['Philadelphia', 39.95, -75.17, 'PHL'], ['New York', 40.71, -74.0, 'NYC'], ['Boston', 42.36, -71.06, 'BOS']
  ];
  const roadMiles = (a, b) => {
    const R = 3958.8, r = Math.PI / 180;
    const dLat = (b[1] - a[1]) * r, dLon = (b[2] - a[2]) * r;
    const h = Math.sin(dLat / 2) ** 2 + Math.cos(a[1] * r) * Math.cos(b[1] * r) * Math.sin(dLon / 2) ** 2;
    return Math.round(2 * R * Math.asin(Math.sqrt(h)) * 1.1);
  };

  /* ---------- split text ---------- */
  function split(el) {
    if (el.dataset.done) return $$('.c', el);
    el.setAttribute('aria-label', el.textContent.trim().replace(/\s+/g, ' '));
    const walk = node => {
      [...node.childNodes].forEach(n => {
        if (n.nodeType === 3) {
          const frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach(part => {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(' ')); return; }
            const w = document.createElement('span'); w.className = 'w'; w.setAttribute('aria-hidden', 'true');
            [...part].forEach(ch => { const c = document.createElement('span'); c.className = 'c'; c.textContent = ch; w.appendChild(c); });
            frag.appendChild(w);
          });
          n.replaceWith(frag);
        } else if (n.nodeType === 1 && n.tagName !== 'BR') walk(n);
      });
    };
    walk(el); el.dataset.done = 1;
    return $$('.c', el);
  }

  /* ---------- quote widget ---------- */
  (function quote() {
    const from = $('#qFrom'), to = $('#qTo'), out = $('#qOut');
    if (!from) return;
    CITIES.forEach((c, i) => { from.add(new Option(c[0], i)); to.add(new Option(c[0], i)); });
    from.value = 0; to.value = 1;
    let svc = 'same';
    $$('.seg button').forEach(b => b.addEventListener('click', () => {
      svc = b.dataset.svc; $$('.seg button').forEach(x => x.setAttribute('aria-pressed', x === b));
    }));
    let timers = [];
    $('#book').addEventListener('submit', e => {
      e.preventDefault();
      timers.forEach(clearTimeout); timers = [];
      const a = CITIES[from.value], b = CITIES[to.value];
      const lines = [];
      if (a === b) lines.push(['warn', '! Pick two different cities.']);
      else {
        const mi = roadMiles(a, b);
        lines.push(['', `› Route ${a[3]} → ${b[3]} · about ${mi} mi by road`]);
        if (svc === 'same' && mi > 500) {
          lines.push(['warn', '! Over 500 mi, beyond the same-day range.']);
          lines.push(['ok', '✓ Next-day delivery is available on this route.']);
          lines.push(['big', 'From $99']);
        } else {
          lines.push(['ok', svc === 'same' ? '✓ Inside same-day range (under 500 mi)' : '✓ Eligible for next-day delivery']);
          lines.push(['', '› Vetted drivers on this corridor are matched at booking']);
          lines.push(['big', 'From $99']);
        }
      }
      out.innerHTML = '';
      lines.forEach(([cls, txt], i) => timers.push(setTimeout(() => {
        const s = document.createElement('span'); if (cls) s.className = cls; s.textContent = txt; out.appendChild(s);
        if (hasGsap) gsap.from(s, { y: 8, opacity: 0, duration: .4, ease: 'power2.out' });
      }, i * 380)));
    });
  })();

  /* ---------- earnings calculator ---------- */
  (function calc() {
    const pk = $('#pk'); if (!pk) return;
    let fare = 99; const out = $('#earn'), val = $('#pkVal'); const state = { v: 0 };
    const fmt = n => '$' + Math.round(n).toLocaleString('en-US');
    const run = (instant) => {
      const n = +pk.value; val.textContent = n;
      pk.style.setProperty('--p', ((n - 1) / 119 * 100) + '%');
      const target = n * fare * 0.7;
      if (hasGsap && !instant) gsap.to(state, { v: target, duration: .6, ease: 'power3.out', onUpdate: () => out.textContent = fmt(state.v) });
      else { state.v = target; out.textContent = fmt(target); }
    };
    pk.addEventListener('input', () => run());
    $$('#fares button').forEach(b => b.addEventListener('click', () => {
      fare = +b.dataset.fare; $$('#fares button').forEach(x => x.setAttribute('aria-pressed', x === b)); run();
    }));
    run(true);
  })();

  /* ---------- audiences ---------- */
  const AUD = [
    ['Businesses', 'Contracts, documents, replacement parts, samples.', ['Contracts', 'Documents', 'Replacement parts', 'Samples'], 'hands-crop.webp'],
    ['Legal professionals', 'Urgent documents and time-sensitive materials.', ['Urgent documents', 'Time-sensitive materials'], 'smartbox.webp'],
    ['Healthcare & laboratories', 'Time-sensitive deliveries where permitted.', ['Time-sensitive', 'Where permitted', 'Tracked handoffs'], 'network-crop.webp'],
    ['Retailers', 'Customer orders and inventory transfers.', ['Customer orders', 'Inventory transfers'], 'van-detail.webp'],
    ['Manufacturers', 'Critical components and production materials.', ['Critical components', 'Production materials'], 'truck-map.webp'],
    ['Individuals', 'Important packages that need to reach another city today.', ['Important packages', 'Same day', 'City to city'], 'van.webp']
  ];
  AUD.forEach(a => { const i = new Image(); i.src = 'assets/img/' + a[3]; });
  (function audience() {
    const tabs = $('#audTabs'); if (!tabs) return;
    let idx = 0, timerTween;
    AUD.forEach((a, i) => {
      const b = document.createElement('button'); b.className = 'aud__tab'; b.setAttribute('role', 'tab'); b.type = 'button';
      b.innerHTML = `<span>${a[0]}</span><svg viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6"/></svg>`;
      b.addEventListener('click', () => show(i, true)); tabs.appendChild(b);
    });
    function show(i, user) {
      idx = i; const a = AUD[i];
      $$('.aud__tab', tabs).forEach((t, j) => t.setAttribute('aria-selected', j === i));
      const set = () => {
        $('#audTitle').textContent = a[0]; $('#audText').textContent = a[1];
        $('#audImg').src = 'assets/img/' + a[3]; $('#audEyebrow').textContent = `Customer · ${i + 1} of ${AUD.length}`;
        $('#audChips').innerHTML = a[2].map(c => `<span class="chip">${c}</span>`).join('');
      };
      if (hasGsap && !reduce) {
        gsap.timeline().to(['#audTitle', '#audText', '#audChips'], { y: -16, opacity: 0, duration: .22, stagger: .04, ease: 'power2.in' })
          .add(set).fromTo(['#audTitle', '#audText', '#audChips'], { y: 22, opacity: 0 }, { y: 0, opacity: 1, duration: .5, stagger: .06, ease: 'power3.out' })
          .fromTo('#audImg', { scale: 1.18, opacity: .2 }, { scale: 1, opacity: 1, duration: 1.2, ease: 'expo.out' }, '<');
        timerTween && timerTween.kill();
        timerTween = gsap.fromTo('#audTimer', { width: '0%' }, { width: '100%', duration: user ? 9 : 5, ease: 'none', onComplete: () => show((idx + 1) % AUD.length) });
      } else set();
    }
    show(0);
  })();

  /* ---------- accordion ---------- */
  $$('.acc__item').forEach(item => {
    const btn = $('.acc__btn', item), panel = $('.acc__panel', item);
    btn.addEventListener('click', () => {
      const open = !item.classList.contains('open');
      $$('.acc__item.open').forEach(o => { if (o !== item) { o.classList.remove('open'); $('.acc__btn', o).setAttribute('aria-expanded', false); hasGsap ? gsap.to($('.acc__panel', o), { height: 0, duration: .5, ease: 'power3.inOut' }) : ($('.acc__panel', o).style.height = 0); } });
      item.classList.toggle('open', open); btn.setAttribute('aria-expanded', open);
      if (hasGsap) gsap.to(panel, { height: open ? 'auto' : 0, duration: .55, ease: 'power3.inOut', onComplete: () => window.ScrollTrigger && ScrollTrigger.refresh() });
      else panel.style.height = open ? 'auto' : 0;
    });
  });

  /* ---------- contact form ---------- */
  const cf = $('#contactForm');
  cf && cf.addEventListener('submit', e => {
    e.preventDefault();
    $('#formMsg').textContent = `Thanks, ${$('#cName').value.split(' ')[0] || 'there'}. This preview doesn't send yet. Connect the form to your email or CRM before launch.`;
  });

  /* ---------- mobile menu ---------- */
  const burger = $('#burger');
  burger && burger.addEventListener('click', () => {
    const open = !document.body.classList.contains('menu-open');
    document.body.classList.toggle('menu-open', open); burger.setAttribute('aria-expanded', open);
    if (open && hasGsap) gsap.from('#mobileMenu nav a', { yPercent: 100, opacity: 0, stagger: .05, duration: .7, ease: 'power4.out', delay: .15 });
  });
  $$('#mobileMenu a').forEach(a => a.addEventListener('click', () => { document.body.classList.remove('menu-open'); burger.setAttribute('aria-expanded', false); }));

  /* ---------- canvas: speed streaks (hero + van) ---------- */
  function Streaks(canvas, opts) {
    const ctx = canvas.getContext('2d'); let W, H, dpr, items = [], mouseY = 0, running = false;
    const o = Object.assign({ count: 110, dir: 1, speed: 1, alpha: 1, colors: [['224,18,122', .6], ['255,107,26', .2], ['47,107,255', .2]] }, opts);
    const pick = () => { let r = Math.random(); for (const [c, w] of o.colors) { if ((r -= w) <= 0) return c; } return o.colors[0][0]; };
    const make = (init) => ({
      x: init ? Math.random() * W : (o.dir > 0 ? -Math.random() * 300 : W + Math.random() * 300),
      y: Math.random() * H, len: 60 + Math.random() * 260, sp: (2 + Math.random() * 9) * o.speed,
      w: Math.random() < .12 ? 2.2 : 1, c: pick(),
      a: (.12 + Math.random() * .5) * o.alpha, z: .3 + Math.random() * .7
    });
    function size() {
      dpr = Math.min(devicePixelRatio || 1, 2); W = canvas.clientWidth; H = canvas.clientHeight;
      canvas.width = W * dpr; canvas.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      items = Array.from({ length: Math.round(o.count * Math.min(1, W / 1200) + 20) }, () => make(true));
    }
    function draw() {
      ctx.clearRect(0, 0, W, H);
      for (const s of items) {
        s.x += s.sp * o.dir;
        const y = s.y + mouseY * 30 * s.z;
        const tail = s.x - s.len * o.dir;
        const g = ctx.createLinearGradient(tail, 0, s.x, 0);
        g.addColorStop(0, `rgba(${s.c},0)`); g.addColorStop(1, `rgba(${s.c},${s.a})`);
        ctx.strokeStyle = g; ctx.lineWidth = s.w; ctx.beginPath(); ctx.moveTo(tail, y); ctx.lineTo(s.x, y); ctx.stroke();
        if ((o.dir > 0 && tail > W) || (o.dir < 0 && tail < 0)) Object.assign(s, make(false));
      }
    }
    size(); addEventListener('resize', size);
    if (fine) addEventListener('mousemove', e => { mouseY = e.clientY / innerHeight - .5; });
    const tick = () => draw();
    return {
      start() { if (running || !hasGsap) return; running = true; gsap.ticker.add(tick); },
      stop() { running = false; hasGsap && gsap.ticker.remove(tick); },
      once() { draw(); }
    };
  }

  /* ---------- canvas: US network map ---------- */
  function USMap(canvas) {
    const ctx = canvas.getContext('2d');
    const POLY = [[-124.7,48.4],[-122.8,49],[-95.2,49],[-94.6,48.7],[-91.5,48.1],[-89.5,48],[-88,48.3],[-84.6,46.5],[-83.5,46],[-82.5,45.3],[-82.1,43],[-83,42],[-79.8,42.5],[-79,43.3],[-76.5,43.6],[-75,44.9],[-71.5,45],[-70,46.7],[-67.8,47.1],[-67,44.8],[-70.2,43.6],[-70.8,42.5],[-70,41.7],[-71.9,41.3],[-73.9,40.6],[-74,39.5],[-75.5,38.5],[-76,37],[-75.7,35.5],[-76.5,34.7],[-78.5,33.8],[-80.8,32],[-81.4,30.5],[-80.1,26.8],[-80.4,25.2],[-81.2,25.3],[-82.7,27.5],[-82.9,29.2],[-84.2,30],[-86.4,30.4],[-88.5,30.3],[-89.6,30],[-89.4,29],[-91.3,29.3],[-93.8,29.7],[-95,29.2],[-97.2,27.6],[-97.4,25.9],[-99.1,26.5],[-100.3,28],[-101.4,29.8],[-103.1,29],[-104.5,29.6],[-106.5,31.8],[-108.2,31.3],[-111.1,31.3],[-114.8,32.5],[-117.1,32.5],[-118.5,34],[-120.6,34.6],[-121.9,36.6],[-122.5,37.8],[-123.8,39.5],[-124.2,41],[-124.5,42.8],[-124,46.2]];
    const inside = (x, y) => { let c = false; for (let i = 0, j = POLY.length - 1; i < POLY.length; j = i++) { const [xi, yi] = POLY[i], [xj, yj] = POLY[j]; if (((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)) c = !c; } return c; };
    const k = Math.cos(37 * Math.PI / 180);
    const ROUTES = [['LA','SF'],['LA','SD'],['LA','LV'],['LA','PHX'],['SF','SAC'],['SEA','PDX'],['DAL','HOU'],['DAL','AUS'],['AUS','SAT'],['HOU','SAT'],['CHI','MSP'],['NYC','BOS'],['NYC','DC'],['NYC','PHL'],['ATL','BNA'],['MIA','ORL'],['DEN','SLC'],['ATL','ORL'],['CHI','BNA'],['LV','SLC']];
    const CORR = new Set(['LA', 'SF', 'SD', 'LV']);
    let W, H, dpr, s, cx, cy, dots = [], progress = 0, t = 0, running = false;
    const proj = (lon, lat) => [cx + (lon + 95.5) * k * s, cy - (lat - 37.2) * s];
    function size() {
      dpr = Math.min(devicePixelRatio || 1, 2); W = canvas.clientWidth; H = canvas.clientHeight;
      canvas.width = W * dpr; canvas.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      s = Math.min((W * .9) / (59 * k), (H * .82) / 26); cx = W / 2; cy = H / 2 - H * .02;
      dots = []; const step = Math.max(6, W / 78);
      for (let y = 0; y < H; y += step) for (let x = 0; x < W; x += step) {
        const lon = (x - cx) / (k * s) - 95.5, lat = 37.2 - (y - cy) / s;
        if (inside(lon, lat)) dots.push({ x, y, th: Math.random(), r: step * .2 });
      }
      draw();
    }
    const city = code => CITIES.find(c => c[3] === code);
    function draw() {
      ctx.clearRect(0, 0, W, H);
      for (const d of dots) {
        const lit = d.th < progress;
        ctx.fillStyle = lit ? `rgba(224,18,122,${.45 + .55 * Math.sin(t * 2 + d.th * 20) ** 2})` : 'rgba(22,17,42,.12)';
        ctx.beginPath(); ctx.arc(d.x, d.y, lit ? d.r * 1.25 : d.r, 0, 7); ctx.fill();
      }
      const shown = Math.floor(ROUTES.length * Math.min(1, progress * 1.25));
      ROUTES.slice(0, shown).forEach(([a, b], i) => {
        const A = city(a), B = city(b); const [x1, y1] = proj(A[2], A[1]), [x2, y2] = proj(B[2], B[1]);
        const mx = (x1 + x2) / 2, my = (y1 + y2) / 2 - Math.hypot(x2 - x1, y2 - y1) * .35;
        const corr = CORR.has(a) && CORR.has(b);
        ctx.strokeStyle = corr ? 'rgba(255,107,26,.9)' : 'rgba(224,18,122,.4)'; ctx.lineWidth = corr ? 1.8 : 1.1;
        ctx.beginPath(); ctx.moveTo(x1, y1); ctx.quadraticCurveTo(mx, my, x2, y2); ctx.stroke();
        const p = (t * .35 + i * .17) % 1, q = 1 - p;
        const px = q * q * x1 + 2 * q * p * mx + p * p * x2, py = q * q * y1 + 2 * q * p * my + p * p * y2;
        ctx.fillStyle = corr ? '#FF6B1A' : '#16112A'; ctx.beginPath(); ctx.arc(px, py, corr ? 3.2 : 2.2, 0, 7); ctx.fill();
      });
      CITIES.forEach(c => {
        const [x, y] = proj(c[2], c[1]); const corr = CORR.has(c[3]);
        if (!corr && progress < .3) return;
        ctx.fillStyle = corr ? 'rgba(255,107,26,.22)' : 'rgba(224,18,122,.16)';
        ctx.beginPath(); ctx.arc(x, y, 9 + 3 * Math.sin(t * 3 + x), 0, 7); ctx.fill();
        ctx.fillStyle = corr ? '#FF6B1A' : '#E0127A'; ctx.beginPath(); ctx.arc(x, y, 3.4, 0, 7); ctx.fill();
        if (corr && W > 420) { ctx.fillStyle = '#16112A'; ctx.font = '500 10px "JetBrains Mono", monospace'; ctx.fillText(c[3], x + 8, y - 6); }
      });
    }
    const tick = () => { t += 1 / 60; draw(); };
    size(); addEventListener('resize', size);
    return {
      set(p) { progress = p; if (!running) draw(); },
      start() { if (running || !hasGsap) return; running = true; gsap.ticker.add(tick); },
      stop() { running = false; hasGsap && gsap.ticker.remove(tick); }
    };
  }

  const heroStreaks = $('#streaks') ? Streaks($('#streaks'), { count: 90, alpha: .75 }) : null;
  const vanLines = $('#speedlines') ? Streaks($('#speedlines'), { count: 70, dir: -1, speed: 1.6, alpha: .9, colors: [['255,255,255', .6], ['255,61,154', .3], ['255,107,26', .1]] }) : null;
  const map = $('#usmap') ? USMap($('#usmap')) : null;

  /* clock ticks */
  (function ticks() {
    const g = $('#ticks'); if (!g) return;
    for (let i = 0; i < 12; i++) {
      const a = i * 30 * Math.PI / 180, r1 = i % 3 ? 84 : 78;
      const l = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      l.setAttribute('x1', 100 + Math.sin(a) * r1); l.setAttribute('y1', 100 - Math.cos(a) * r1);
      l.setAttribute('x2', 100 + Math.sin(a) * 90); l.setAttribute('y2', 100 - Math.cos(a) * 90);
      l.setAttribute('class', 'tick'); g.appendChild(l);
    }
  })();
  const clockState = { h: 9 };
  function setClock(hours) {
    const hh = $('#handH'), mm = $('#handM'); if (!hh) return;
    const hr = hours % 12, min = (hours % 1) * 60;
    hh.setAttribute('transform', `rotate(${hr * 30 + min * .5} 100 100)`);
    mm.setAttribute('transform', `rotate(${min * 6} 100 100)`);
    const day = hours >= 24 ? 2 : 1, h24 = Math.floor(hours % 24), m = Math.floor(min);
    const ampm = h24 >= 12 ? 'PM' : 'AM', h12 = ((h24 + 11) % 12) + 1;
    $('#clockTxt').textContent = `Day ${day} · ${h12}:${String(m).padStart(2, '0')} ${ampm}`;
  }
  setClock(9);

  /* ---------- no GSAP / reduced motion: static, complete page ---------- */
  if (!hasGsap || reduce) {
    const l = $('.loader'); l && l.remove();
    $$('.better .word').forEach(w => w.style.opacity = 1);
    $$('#better').forEach(b => b.style.opacity = 1);
    const d = $('#donut'); d && d.setAttribute('stroke-dashoffset', 351.86 * .3);
    $('#count') && ($('#count').textContent = '3,000');
    map && map.set(1); heroStreaks && heroStreaks.once();
    const cp = $('#carPkg'); cp && cp.setAttribute('opacity', 1); const pk = $('#pkg'); pk && pk.setAttribute('opacity', 0);
    const car = $('#car'); car && car.setAttribute('transform', 'translate(700 318)');
    initNav(null); initAnchors(null);
    return;
  }

  /* ================= GSAP ================= */
  gsap.registerPlugin(ScrollTrigger);
  let lenis = null;
  if (window.Lenis) {
    lenis = new Lenis({ duration: 1.15, easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)), smoothWheel: true });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(t => lenis.raf(t * 1000)); gsap.ticker.lagSmoothing(0);
  }
  initNav(lenis); initAnchors(lenis);

  /* cursor + magnetic */
  if (fine) {
    const cur = $('.cursor'), dot = $('.cursor-dot'), lbl = $('.cursor span');
    const cx = gsap.quickTo(cur, 'x', { duration: .45, ease: 'power3' }), cy = gsap.quickTo(cur, 'y', { duration: .45, ease: 'power3' });
    const dx = gsap.quickTo(dot, 'x', { duration: .1 }), dy = gsap.quickTo(dot, 'y', { duration: .1 });
    addEventListener('mousemove', e => { cx(e.clientX); cy(e.clientY); dx(e.clientX); dy(e.clientY); });
    $$('[data-cursor]').forEach(el => {
      el.addEventListener('mouseenter', () => { lbl.textContent = el.dataset.cursor || 'View'; cur.classList.add('is-hover'); });
      el.addEventListener('mouseleave', () => cur.classList.remove('is-hover'));
    });
    $$('.magnetic').forEach(el => {
      const xt = gsap.quickTo(el, 'x', { duration: .6, ease: 'elastic.out(1,.4)' }), yt = gsap.quickTo(el, 'y', { duration: .6, ease: 'elastic.out(1,.4)' });
      el.addEventListener('mousemove', e => { const r = el.getBoundingClientRect(); xt((e.clientX - r.left - r.width / 2) * .3); yt((e.clientY - r.top - r.height / 2) * .4); });
      el.addEventListener('mouseleave', () => { xt(0); yt(0); });
    });
    $$('.tilt').forEach(el => {
      const rx = gsap.quickTo(el, 'rotationX', { duration: .6, ease: 'power3' }), ry = gsap.quickTo(el, 'rotationY', { duration: .6, ease: 'power3' });
      gsap.set(el, { transformPerspective: 1100 });
      el.addEventListener('mousemove', e => {
        const r = el.getBoundingClientRect(), px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
        ry((px - .5) * 10); rx((.5 - py) * 8);
        el.style.setProperty('--mx', px * 100 + '%'); el.style.setProperty('--my', py * 100 + '%');
      });
      el.addEventListener('mouseleave', () => { rx(0); ry(0); });
    });
  }

  /* preloader → hero intro */
  const heroChars = split($('.hero__title'));
  gsap.set(heroChars, { yPercent: 115 });
  const counter = { v: 0 };
  const intro = gsap.timeline({ defaults: { ease: 'power4.out' } });
  intro
    .from('.loader__mark', { x: -80, opacity: 0, duration: .8, ease: 'expo.out' })
    .to('.loader__bar i', { scaleX: 1, duration: 1.3, ease: 'power2.inOut' }, '<.1')
    .to(counter, { v: 100, duration: 1.3, ease: 'power2.inOut', onUpdate: () => $('.loader__num').textContent = String(Math.round(counter.v)).padStart(3, '0') }, '<')
    .to('.loader__mark', { x: 120, opacity: 0, duration: .5, ease: 'power3.in' })
    .to('.loader', { clipPath: 'inset(0 0 100% 0)', duration: .9, ease: 'expo.inOut' }, '-=.15')
    .set('.loader', { display: 'none' })
    .to(heroChars, { yPercent: 0, duration: 1.1, stagger: .022 }, '-=.45')
    .from('[data-hero]', { y: 40, opacity: 0, duration: 1, stagger: .09 }, '-=.9')
    .from('.nav', { yPercent: -100, duration: .9 }, '<')
    .from('.hero__photo', { clipPath: 'inset(100% 0 0 0 round 32px)', duration: 1.4, ease: 'expo.inOut' }, '<-.5')
    .from('.hero__photo img', { scale: 1.5, duration: 1.8, ease: 'expo.out' }, '<')
    .from('.hero__visual .float, .badge', { y: 30, opacity: 0, scale: .9, stagger: .12, duration: .8, ease: 'back.out(1.6)' }, '-=.9');
  gsap.to('.float--live', { y: -8, duration: 2.4, yoyo: true, repeat: -1, ease: 'sine.inOut' });
  gsap.to('.float--track', { y: 10, duration: 3, yoyo: true, repeat: -1, ease: 'sine.inOut', delay: .5 });
  gsap.fromTo('.mini-line i', { width: '8%' }, { width: '92%', duration: 6, repeat: -1, ease: 'none' });
  heroStreaks && heroStreaks.start();
  ScrollTrigger.create({ trigger: '#hero', start: 'top bottom', end: 'bottom top', onToggle: s => s.isActive ? heroStreaks.start() : heroStreaks.stop() });
  gsap.to('.hero__photo img', { yPercent: 10, ease: 'none', scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: true } });

  /* image parallax + services reveal */
  $$('[data-parallax] img').forEach(img => gsap.fromTo(img, { yPercent: -8 }, { yPercent: 4, ease: 'none', scrollTrigger: { trigger: img.closest('[data-parallax]'), start: 'top bottom', end: 'bottom top', scrub: true } }));
  $$('.svc').forEach(el => gsap.from(el, { clipPath: 'inset(18% 8% 0% 8% round 28px)', y: 60, opacity: 0, duration: 1.3, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 90%' } }));
  gsap.from('.svc--f__art img', { yPercent: 30, duration: 1.4, ease: 'expo.out', scrollTrigger: { trigger: '.svc--f', start: 'top 80%' } });

  /* generic split headings on scroll */
  $$('[data-split]').forEach(el => {
    if (el.classList.contains('hero__title')) return;
    const chars = split(el);
    gsap.from(chars, { yPercent: 115, rotate: 6, duration: 1, stagger: .014, ease: 'power4.out', scrollTrigger: { trigger: el, start: 'top 86%' } });
  });
  $$('.reveal').forEach(el => gsap.from(el, { y: 50, opacity: 0, duration: 1.1, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 88%' } }));

  /* marquee — direction follows scroll velocity */
  const mq = gsap.to('.marquee__track', { xPercent: -50, duration: 24, ease: 'none', repeat: -1 });
  ScrollTrigger.create({ onUpdate: self => {
    const v = self.getVelocity() / 300;
    gsap.to(mq, { timeScale: self.direction * Math.max(1, Math.min(Math.abs(v), 5)), duration: .4, overwrite: true });
  } });
  gsap.to('#apps', { xPercent: -50, duration: 30, ease: 'none', repeat: -1 });

  const mm = gsap.matchMedia();

  /* ---- PROBLEM ---- */
  mm.add('(min-width: 901px)', () => {
    const tl = gsap.timeline({ scrollTrigger: { trigger: '.problem__pin', start: 'top top', end: '+=160%', pin: true, scrub: 1 } });
    tl.from('.pl', { x: -40, opacity: 0, stagger: .5, duration: 1 })
      .to(clockState, { h: 34.5, duration: 3, ease: 'none', onUpdate: () => setClock(clockState.h) }, 0)
      .from('.bar--them .bar__fill', { scaleX: 0, duration: 1.2, ease: 'power2.out' }, .8)
      .from('.bar--us .bar__fill', { scaleX: 0, duration: 1, ease: 'power2.out' }, 1.8);
  });
  mm.add('(max-width: 900px)', () => {
    gsap.to(clockState, { h: 34.5, ease: 'none', onUpdate: () => setClock(clockState.h), scrollTrigger: { trigger: '.clock-card', start: 'top 85%', end: 'bottom 30%', scrub: 1 } });
    gsap.from('.pl', { x: -30, opacity: 0, stagger: .15, duration: .8, scrollTrigger: { trigger: '.problem__list', start: 'top 85%' } });
    gsap.from('.bar__fill', { scaleX: 0, stagger: .3, duration: 1.2, scrollTrigger: { trigger: '.bars', start: 'top 85%' } });
  });

  /* ---- BETTER WAY ---- */
  (function () {
    const el = $('#better'); const label = el.textContent.trim().replace(/\s+/g, ' ');
    const walk = node => [...node.childNodes].forEach(n => {
      if (n.nodeType === 3) { const f = document.createDocumentFragment(); n.textContent.split(/(\s+)/).forEach(p => { if (!p) return; if (/^\s+$/.test(p)) f.appendChild(document.createTextNode(' ')); else { const s = document.createElement('span'); s.className = 'word'; s.textContent = p; f.appendChild(s); } }); n.replaceWith(f); }
      else if (n.nodeType === 1) walk(n);
    });
    walk(el); el.setAttribute('aria-label', label);
    gsap.to('.better .word', { opacity: 1, stagger: .3, ease: 'none', scrollTrigger: { trigger: '.better', start: 'top 75%', end: 'bottom 55%', scrub: true } });
  })();

  /* ---- ROAD / SOLUTION ---- */
  gsap.to('#laneDash', { attr: { 'stroke-dashoffset': -760 }, duration: 3, ease: 'none', repeat: -1 });
  gsap.to('#car .wheel', { rotation: 360, svgOrigin: '0 0', transformOrigin: '50% 50%', duration: .5, ease: 'none', repeat: -1 });
  gsap.to('.pulse', { attr: { r: 34 }, opacity: 0, duration: 1.6, repeat: -1, ease: 'power1.out' });
  function roadTimeline() {
    const car = { x: -260 }; const mile = $('#mile'), st = $('#pkgState');
    const renderCar = () => {
      $('#car').setAttribute('transform', `translate(${car.x} 318)`);
      const m = Math.max(0, Math.min(381, (car.x - 230) / (1180 - 230) * 381));
      mile.textContent = String(Math.round(m)).padStart(3, '0');
    };
    const tl = gsap.timeline({ defaults: { ease: 'none' } });
    tl.to(car, { x: 230, duration: 1, ease: 'power2.out', onUpdate: renderCar })
      .to('#pkg', { attr: { transform: 'translate(322 200)' }, duration: .25, ease: 'power2.out' })
      .to('#pkg', { attr: { transform: 'translate(322 330)' }, opacity: 0, duration: .25, ease: 'power2.in' })
      .to('#carPkg', { attr: { opacity: 1 }, duration: .1 })
      .to('.road-lines .l1', { opacity: 0, y: -30, duration: .3 }, '+=.1')
      .from('.road-lines .l2', { opacity: 0, y: 30, duration: .3 })
      .to(car, { x: 1180, duration: 3, ease: 'power1.inOut', onUpdate: () => { renderCar(); st.textContent = car.x > 1170 ? 'delivered' : (car.x > 240 ? 'riding along' : 'waiting at pickup'); } }, '<-.2');
    return tl;
  }
  mm.add('(min-width: 901px)', () => {
    const tl = roadTimeline();
    ScrollTrigger.create({ trigger: '#roadStage', start: 'top top', end: '+=220%', pin: true, scrub: 1, animation: tl });
  });
  mm.add('(max-width: 900px)', () => {
    const tl = roadTimeline();
    ScrollTrigger.create({ trigger: '#roadStage', start: 'top 75%', end: 'bottom 25%', scrub: 1, animation: tl });
  });

  /* ---- MODELS ---- */
  gsap.from('.model', { y: 80, opacity: 0, duration: 1.2, stagger: .15, ease: 'power3.out', scrollTrigger: { trigger: '.models__grid', start: 'top 82%' } });
  gsap.from('.model__art img', { scale: 1.4, duration: 1.8, ease: 'expo.out', scrollTrigger: { trigger: '.models__grid', start: 'top 80%' } });
  gsap.fromTo('.rm-merge', { strokeDasharray: 140, strokeDashoffset: 140 }, { strokeDashoffset: 0, duration: 1.2, repeat: -1, repeatDelay: 1.5, ease: 'power2.inOut' });

  /* ---- HOW IT WORKS ---- */
  const steps = $$('.step'); const times = ['09:02 AM', '09:06 AM', '09:41 AM', '11:58 AM', '01:52 PM', '03:40 PM'];
  const drivers = ['Matching…', 'Vetted · assigned', 'Vetted · on route', 'Vetted · on route', 'Vetted · on route', 'Handoff confirmed'];
  function setStep(p) {
    const i = Math.min(steps.length - 1, Math.floor(p * steps.length * .999));
    steps.forEach((s, j) => s.classList.toggle('is-active', j === i));
    $('#tcStatus').textContent = steps[i].dataset.status; $('#tcTime').textContent = times[i]; $('#tcDriver').textContent = drivers[i];
    $('#tcFill').style.width = (p * 100) + '%'; $('#tcDot').style.left = (p * 100) + '%';
  }
  mm.add('(min-width: 901px)', () => {
    const track = $('#howTrack');
    const dist = () => track.scrollWidth - innerWidth;
    gsap.to(track, { x: () => -dist(), ease: 'none', scrollTrigger: {
      trigger: '#how', start: 'top top', end: () => '+=' + dist(), pin: true, scrub: 1, invalidateOnRefresh: true,
      onUpdate: self => { setStep(self.progress); gsap.set('#howBar', { scaleX: self.progress }); }
    } });
  });
  mm.add('(max-width: 900px)', () => {
    ScrollTrigger.create({ trigger: '#howTrack', start: 'top 60%', end: 'bottom 60%', onUpdate: self => setStep(self.progress) });
    gsap.from('.step', { y: 40, opacity: 0, stagger: .1, duration: .8, scrollTrigger: { trigger: '#howTrack', start: 'top 80%' } });
  });
  setStep(0);

  /* ---- SMART BOX ---- */
  gsap.to('#boxImg img:not(.label)', { y: -14, duration: 3, yoyo: true, repeat: -1, ease: 'sine.inOut' });
  gsap.to('#boxImg .label', { y: -14, duration: 3, yoyo: true, repeat: -1, ease: 'sine.inOut' });
  gsap.to('.box__scan', { top: '80%', duration: 2.4, yoyo: true, repeat: -1, ease: 'sine.inOut' });
  gsap.to('.box__ring', { rotation: 360, duration: 40, repeat: -1, ease: 'none' });
  gsap.from('#boxImg', { scale: .7, rotation: -8, opacity: 0, duration: 1.4, ease: 'expo.out', scrollTrigger: { trigger: '.box__stage', start: 'top 75%' } });
  gsap.from('.fl', { x: -60, opacity: 0, stagger: .12, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: '.box__stage', start: 'top 70%' } });
  gsap.from('.fr', { x: 60, opacity: 0, stagger: .12, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: '.box__stage', start: 'top 70%' } });
  gsap.set('.shackle.open', { y: -6, rotation: 25, svgOrigin: '52 36' });
  const lockTl = gsap.timeline({ scrollTrigger: { trigger: '.custody', start: 'top 80%' } });
  lockTl.from('.custody__step', { y: 40, opacity: 0, stagger: .2, duration: .9, ease: 'power3.out' })
    .fromTo('.custody__step:first-child .shackle', { y: -8 }, { y: 0, duration: .5, ease: 'bounce.out' }, .4);

  /* ---- NETWORK ---- */
  const cnt = { v: 0 };
  gsap.to(cnt, { v: 3000, duration: 2.4, ease: 'power3.out', onUpdate: () => $('#count').textContent = Math.round(cnt.v).toLocaleString('en-US'),
    scrollTrigger: { trigger: '.counter', start: 'top 85%' } });
  if (map) {
    ScrollTrigger.create({ trigger: '.map-wrap', start: 'top 85%', end: 'bottom 30%', scrub: true, onUpdate: s => map.set(.08 + s.progress * .92) });
    ScrollTrigger.create({ trigger: '.map-wrap', start: 'top bottom', end: 'bottom top', onToggle: s => s.isActive ? map.start() : map.stop() });
    map.set(.08);
  }
  gsap.from('.flow__line', { scaleX: 0, duration: 1.6, ease: 'power3.inOut', scrollTrigger: { trigger: '.flow', start: 'top 85%' } });
  gsap.from('.flow__item', { y: 60, opacity: 0, clipPath: 'inset(30% 0 0 0 round 22px)', stagger: .12, duration: 1.1, ease: 'expo.out', scrollTrigger: { trigger: '.flow', start: 'top 85%' } });
  gsap.from('.problem__photo', { clipPath: 'inset(0 0 100% 0 round 28px)', duration: 1.4, ease: 'expo.inOut', scrollTrigger: { trigger: '.problem__visual', start: 'top 80%' } });
  gsap.from('.road-band', { clipPath: 'inset(0 6% 0 6% round 40px)', ease: 'none', scrollTrigger: { trigger: '.road-band', start: 'top bottom', end: 'top 20%', scrub: true } });

  /* ---- DAYLIGHT ---- */
  gsap.from('.diff__row', { y: 50, opacity: 0, stagger: .1, duration: .9, ease: 'power3.out', scrollTrigger: { trigger: '.diff__list', start: 'top 82%' } });
  gsap.from('.aud__tab', { x: -30, opacity: 0, stagger: .06, duration: .7, ease: 'power3.out', scrollTrigger: { trigger: '.aud', start: 'top 80%' } });

  /* ---- DRIVERS ---- */
  gsap.fromTo('#van', { scale: 1.35, xPercent: -10 }, { scale: 1.02, xPercent: 0, ease: 'none', scrollTrigger: { trigger: '.van-stage', start: 'top bottom', end: 'bottom 40%', scrub: 1 } });
  gsap.from('.van-stage', { clipPath: 'inset(0 12% 0 12% round 32px)', ease: 'none', scrollTrigger: { trigger: '.van-stage', start: 'top bottom', end: 'top 35%', scrub: 1 } });
  gsap.from('.float--earn', { x: 40, opacity: 0, duration: 1, ease: 'back.out(1.6)', scrollTrigger: { trigger: '.van-stage', start: 'top 60%' } });
  if (vanLines) ScrollTrigger.create({ trigger: '.van-stage', start: 'top bottom', end: 'bottom top', onToggle: s => s.isActive ? vanLines.start() : vanLines.stop() });
  gsap.to('#donut', { attr: { 'stroke-dashoffset': 351.86 * .3 }, duration: 1.8, ease: 'power3.inOut', scrollTrigger: { trigger: '.split', start: 'top 85%' } });

  /* ---- TECH ---- */
  gsap.fromTo('#dash', { rotationX: 22, y: 60, transformPerspective: 1400 }, { rotationX: 0, y: 0, ease: 'none', scrollTrigger: { trigger: '#dash', start: 'top bottom', end: 'center 60%', scrub: 1 } });
  gsap.from('.module', { y: 20, opacity: 0, stagger: .04, duration: .6, ease: 'power2.out', scrollTrigger: { trigger: '.modules', start: 'top 85%' } });
  gsap.from('.ship', { x: -20, opacity: 0, stagger: .08, duration: .6, scrollTrigger: { trigger: '#dash', start: 'top 70%' } });
  gsap.fromTo('#dashProg', { attr: { 'stroke-dashoffset': 300 } }, { attr: { 'stroke-dashoffset': 0 }, duration: 7, ease: 'none', repeat: -1 });

  /* ---- ROBOTICS ---- */
  gsap.to('#bot .bw', { rotation: 360, transformOrigin: '50% 50%', duration: .8, repeat: -1, ease: 'none' });
  gsap.timeline({ repeat: -1, repeatDelay: 2.6 }).to('#bot .eye', { attr: { r: .8 }, duration: .1 }).to('#bot .eye', { attr: { r: 6 }, duration: .12 });
  gsap.fromTo('#bot', { x: 0 }, { x: () => $('#roboLane').clientWidth - $('#bot').clientWidth, ease: 'none', scrollTrigger: { trigger: '#roboLane', start: 'top 85%', end: 'bottom 25%', scrub: 1, invalidateOnRefresh: true } });

  /* ---- ECOSYSTEM ORBIT ---- */
  (function orbit() {
    const stage = $('#eco'); if (!stage) return;
    const nodes = $$('.eco__node', stage), lines = $('#ecoLines'); const NS = 'http://www.w3.org/2000/svg';
    const ls = nodes.map(() => { const l = document.createElementNS(NS, 'line'); l.setAttribute('x1', 800); l.setAttribute('y1', 500); lines.appendChild(l); return l; });
    let a0 = 0, on = false;
    const tick = () => {
      if (innerWidth <= 700) return;
      a0 += .0016; const W = stage.clientWidth, H = stage.clientHeight;
      nodes.forEach((n, i) => {
        const a = a0 + i / nodes.length * Math.PI * 2, rx = i % 2 ? .4 : .3, ry = i % 2 ? .36 : .25;
        const x = .5 + Math.cos(a) * rx, y = .5 + Math.sin(a) * ry;
        n.style.transform = `translate(${x * W}px, ${y * H}px) translate(-50%,-50%)`;
        ls[i].setAttribute('x2', x * 1600); ls[i].setAttribute('y2', y * 1000);
      });
    };
    ScrollTrigger.create({ trigger: stage, start: 'top bottom', end: 'bottom top', onToggle: s => { if (s.isActive && !on) { on = true; gsap.ticker.add(tick); } else if (!s.isActive && on) { on = false; gsap.ticker.remove(tick); } } });
    tick();
    gsap.from('.eco__core', { scale: 0, duration: 1.2, ease: 'back.out(1.6)', scrollTrigger: { trigger: stage, start: 'top 75%' } });
    gsap.from(nodes, { opacity: 0, scale: .6, stagger: .08, duration: .7, scrollTrigger: { trigger: stage, start: 'top 70%' } });
  })();

  /* ---- FINAL ---- */
  gsap.from('.final__big', { yPercent: 40, scaleY: 1.4, opacity: 0, duration: 1.4, ease: 'expo.out', scrollTrigger: { trigger: '.final__big', start: 'top 90%' } });
  gsap.fromTo('.courier img', { y: 80 }, { y: 0, ease: 'none', scrollTrigger: { trigger: '.final__grid', start: 'top bottom', end: 'bottom bottom', scrub: 1 } });
  gsap.from('.courier', { scale: .85, opacity: 0, duration: 1.2, ease: 'power3.out', scrollTrigger: { trigger: '.final__grid', start: 'top 80%' } });
  gsap.from('.contact', { y: 60, opacity: 0, duration: 1.1, ease: 'power3.out', scrollTrigger: { trigger: '.final__grid', start: 'top 80%' } });

  /* scrollspy for header menu */
  $$('.nav__links a[data-spy]').forEach(a => {
    const sec = document.getElementById(a.dataset.spy); if (!sec) return;
    ScrollTrigger.create({ trigger: sec, start: 'top 45%', end: 'bottom 45%', onToggle: s => a.classList.toggle('is-active', s.isActive) });
  });

  addEventListener('load', () => ScrollTrigger.refresh());
  document.fonts && document.fonts.ready.then(() => ScrollTrigger.refresh());

  /* ---------- helpers ---------- */
  function initNav(l) {
    const nav = $('#nav'); let last = 0;
    const onScroll = y => {
      nav.classList.toggle('is-scrolled', y > 40);
      last = y;
    };
    l ? l.on('scroll', e => onScroll(e.scroll)) : addEventListener('scroll', () => onScroll(scrollY), { passive: true });
  }
  function initAnchors(l) {
    $$('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
      const id = a.getAttribute('href'); const t = id === '#top' ? document.body : $(id);
      if (!t) return; e.preventDefault();
      if (id === '#book') setTimeout(() => $('#qFrom').focus({ preventScroll: true }), 1400);
      l ? l.scrollTo(t, { offset: id === '#book' ? -140 : -20, duration: 1.6 }) : t.scrollIntoView({ behavior: 'smooth' });
      return;
      l ? l.scrollTo(t, { offset: -20, duration: 1.6 }) : t.scrollIntoView({ behavior: 'smooth' });
    }));
  }
})();
