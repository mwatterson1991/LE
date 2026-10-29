/* LE present mode: #present/<deckId> shows a deck full screen, one slide at a time.
   The slide is the canvas render; library illustrations (assets/illustrations/*.svg) are overlaid as inline SVG with a slow
   breathe, a slight sway and one or two small floating pieces, and the timeline and layers diagrams build in once.
   deckId is the deck type id (the deck open in the editor when it matches, else that type's sample) or a saved project id. */
(function () {
  'use strict';
  var P = { on: false, slides: [], i: 0, raf: 0, seq: 0, svgCache: {}, from: '' };
  var root, stage, canvas, overlay, counter;

  function el() {
    if (root) return;
    root = document.createElement('div'); root.id = 'present';
    root.innerHTML = '<div class="pstage"><canvas></canvas><div class="pov"></div></div><div class="pcount"></div>';
    document.body.appendChild(root);
    stage = root.firstChild; canvas = stage.firstChild; overlay = stage.lastChild; counter = root.lastChild;
    var st = document.createElement('style');
    st.textContent = [
      '#present{position:fixed;inset:0;background:#010101;z-index:200;display:none;align-items:center;justify-content:center;cursor:default;user-select:none}',
      '#present.on{display:flex}',
      '#present .pstage{position:relative;background:#fff;overflow:hidden}',
      '#present canvas{display:block;width:100%;height:100%}',
      '#present .pov{position:absolute;inset:0;pointer-events:none}',
      '#present .ill{position:absolute;animation:pbreathe 4s ease-in-out infinite;transform-origin:50% 50%}',
      '#present .ill>.sway{width:100%;height:100%;animation:psway 7.3s ease-in-out infinite;transform-origin:50% 60%}',
      '#present .ill svg{width:100%;height:100%;display:block;overflow:visible}',
      '#present .ill .pfloat{animation:pfloat 5.1s ease-in-out infinite;transform-box:fill-box;transform-origin:center}',
      '#present .ill .pfloat.b{animation-duration:6.4s;animation-delay:-2.1s}',
      '#present .pcount{position:absolute;right:24px;bottom:16px;font:500 13px Macan,sans-serif;color:rgba(255,255,255,.5)}',
      '@keyframes pbreathe{0%,100%{transform:scale(1)}50%{transform:scale(1.015)}}',
      '@keyframes psway{0%,100%{transform:rotate(-1deg)}50%{transform:rotate(1deg)}}',
      '@keyframes pfloat{0%,100%{transform:translateY(calc(var(--amp) * -1))}50%{transform:translateY(var(--amp))}}'
    ].join('\n');
    document.head.appendChild(st);
    root.addEventListener('click', function (e) { if (e.clientX < window.innerWidth * .2) prev(); else next(); });
  }
  function size() {
    var W = window.innerWidth, H = window.innerHeight, w = W, h = W * 9 / 16;
    if (h > H) { h = H; w = H * 16 / 9; }
    stage.style.width = Math.round(w) + 'px'; stage.style.height = Math.round(h) + 'px';
    var dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
    P.scale = w / DECK.W;
  }
  async function svgText(src) {
    if (P.svgCache[src]) return P.svgCache[src];
    try { var t = await (await fetch(src)).text(); P.svgCache[src] = t; return t; } catch (e) { return ''; }
  }
  /* inject the SVG at its rect and give one or two small pieces a float */
  async function placeIllus(list, seq) {
    overlay.innerHTML = '';
    for (var i = 0; i < list.length; i++) {
      var r = list[i], txt = await svgText(r.src);
      if (seq !== P.seq) return;
      if (!txt) continue;
      var box = document.createElement('div'); box.className = 'ill';
      box.style.left = (r.x * P.scale) + 'px'; box.style.top = (r.y * P.scale) + 'px';
      box.style.width = (r.w * P.scale) + 'px'; box.style.height = (r.h * P.scale) + 'px';
      var sway = document.createElement('div'); sway.className = 'sway'; sway.innerHTML = txt; box.appendChild(sway);
      overlay.appendChild(box);
      var svg = sway.querySelector('svg'); if (!svg) continue;
      svg.removeAttribute('width'); svg.removeAttribute('height');
      var vb = (svg.getAttribute('viewBox') || '0 0 100 100').split(/\s+/).map(Number), vbW = vb[2] || 100, vbH = vb[3] || 100;
      /* small separable pieces: top-level shapes (or the children of a lone group) between .3% and 6% of the drawing */
      var kids = [].slice.call(svg.children).filter(function (k) { return /^(path|g|circle|ellipse|rect|polygon|polyline)$/.test(k.tagName); });
      if (kids.length === 1 && kids[0].tagName === 'g') kids = [].slice.call(kids[0].children);
      var area = vbW * vbH, picks = [];
      kids.forEach(function (k) { try { var b = k.getBBox(); var a = b.width * b.height / area; if (a > .003 && a < .06) picks.push({ k: k, a: a }); } catch (e) { } });
      picks.sort(function (a, b) { return a.a - b.a; });
      var amp = 6 * vbW / (r.w * P.scale);                                    /* 6 screen px in user units */
      picks.slice(0, 2).forEach(function (p, j) { p.k.classList.add('pfloat'); if (j) p.k.classList.add('b'); p.k.style.setProperty('--amp', amp.toFixed(3) + 'px'); });
    }
  }
  /* render off screen, then blit: the renderer clears and awaits images, which would flash on a live canvas */
  var buf = null;
  async function draw(t, seq, drift) {
    var s = P.slides[P.i];
    if (!buf) buf = document.createElement('canvas');
    if (buf.width !== canvas.width || buf.height !== canvas.height) { buf.width = canvas.width; buf.height = canvas.height; }
    var r = await DECK.render(buf.getContext('2d'), buf.width, buf.height, Object.assign({}, s, { index: P.i, total: P.slides.length, t: t, noIllus: true, drift: drift || 0 }), helpers());
    if (seq === P.seq) { var x = canvas.getContext('2d'); x.setTransform(1, 0, 0, 1, 0, 0); x.drawImage(buf, 0, 0); }
    return r;
  }
  /* a product mock's back card drifts 4px on a slow sine while the slide is up */
  function drift(seq) {
    var t0 = performance.now(), busy = false;
    var step = async function (now) {
      if (seq !== P.seq) return;
      if (!busy) { busy = true; await draw(1, seq, 4 * Math.sin((now - t0) / 2600)); busy = false; }
      if (seq === P.seq) P.raf = requestAnimationFrame(step);
    };
    P.raf = requestAnimationFrame(step);
  }
  async function show() {
    var seq = ++P.seq; cancelAnimationFrame(P.raf);
    counter.textContent = (P.i + 1) + ' / ' + P.slides.length;
    overlay.innerHTML = '';
    await fontsReady();
    var r = await draw(0, seq); if (seq !== P.seq) return;
    if (r && r.build) {
      var t0 = performance.now(), D = 600;
      var step = async function (now) {
        if (seq !== P.seq) return;
        var t = Math.min(1, (now - t0) / D);
        await draw(t, seq);
        if (t < 1) P.raf = requestAnimationFrame(step);
      };
      P.raf = requestAnimationFrame(step);
    } else await draw(1, seq);
    if (seq !== P.seq) return;
    placeIllus(r && r.illus || [], seq);
    if (r && r.mock) drift(seq);
  }
  function next() { if (P.i < P.slides.length - 1) { P.i++; show(); } }
  function prev() { if (P.i > 0) { P.i--; show(); } }
  function keys(e) {
    if (!P.on) return;
    if (e.key === 'Escape') { e.preventDefault(); exit(); }
    else if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown' || e.key === 'Enter') { e.preventDefault(); next(); }
    else if (e.key === 'ArrowLeft' || e.key === 'PageUp' || e.key === 'Backspace') { e.preventDefault(); prev(); }
    else if (e.key === 'Home') { P.i = 0; show(); } else if (e.key === 'End') { P.i = P.slides.length - 1; show(); }
  }
  function exit() { if (P.from && P.from !== location.hash) history.back(); else location.hash = 'editor'; }

  /* which deck: the one in the editor when its type matches, else a saved project, else the type's sample */
  async function slidesFor(id) {
    if (window.ED && ED.type && ED.slides && ED.slides.length && (!id || ED.type.id === id)) return ED.slides;
    var list = []; try { if (Array.isArray(projects)) list = projects; } catch (e) { }   /* le.js's saved projects (a lexical global; window.projects is the section) */
    var pr = list.filter(function (p) { return p.id === id && p.deck; })[0];
    if (pr) return DECK.parse(pr.deck.text, pr.deck.type);
    var txt = await DECK.ready(id || 'proposal');
    return DECK.parse(txt, id);
  }
  window.openPresent = async function (id) {
    el();
    P.slides = await slidesFor(id);
    if (!P.slides || !P.slides.length) { location.replace('#make'); return; }
    P.i = Math.min(P.i, P.slides.length - 1); if (window.ED && ED.slides === P.slides) P.i = ED.i || 0;
    P.on = true; root.classList.add('on'); size(); show();
  };
  window.closePresent = function () { if (!P.on) return; P.on = false; P.seq++; cancelAnimationFrame(P.raf); root.classList.remove('on'); overlay.innerHTML = ''; };
  window.presentCurrent = function () { P.from = location.hash; location.hash = 'present/' + (window.ED && ED.type ? ED.type.id : 'proposal'); };
  window.PRESENT = P;
  window.addEventListener('keydown', keys);
  window.addEventListener('resize', function () { if (P.on) { size(); show(); } });
})();
