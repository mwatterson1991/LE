/* The Leland end slide, shared by every carousel post.
   A post's last slide is a few lines: set window.END_LINE (square brackets mark the one accent phrase), then load
   mark.js, logo.js, the post's own base.js (optional) and this file. Opened on its own, end-slide.html takes the line from ?line=...
   The animation is the real one: the mark draws on (js/mark.js), holds a beat, the wordmark types in while the lockup re-centres,
   then the line arrives word by word. Timings from data/motion-ref.json (logo.leo, text.words, hold.end_card). */
(() => {
  const LINE = window.END_LINE || new URLSearchParams(location.search).get('line') || '';
  const T_IN = 0.3, DRAW = 0.55, BEAT = 0.25, TYPE = 0.6, GAP = 0.3, WORD = 0.25, STAG = 0.1, HOLD = 2.2;
  /* helpers come from the post's base.js when it is loaded; otherwise the same ones are made here */
  const bez = (x1, y1, x2, y2) => { const cx = 3 * x1, bx = 3 * (x2 - x1) - cx, ax = 1 - cx - bx, cy = 3 * y1, by = 3 * (y2 - y1) - cy, ay = 1 - cy - by, X = t => ((ax * t + bx) * t + cx) * t, Y = t => ((ay * t + by) * t + cy) * t;
    return x => { if (x <= 0) return 0; if (x >= 1) return 1; let lo = 0, hi = 1, t = x; for (let i = 0; i < 40; i++) { if (X(t) < x) lo = t; else hi = t; t = (lo + hi) / 2; } return Y(t); }; };
  const ease = typeof EASE !== 'undefined' ? EASE : bez(.2, .8, .2, 1);
  const reduced = typeof REDUCED !== 'undefined' ? REDUCED : matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.body.insertAdjacentHTML('afterbegin', '<div class="stage"><div class="lock"><div class="lmw" id="mark"></div><div class="wm" id="wm"></div></div><p class="line" id="line"></p></div>');
  const host = document.getElementById('mark'); host.innerHTML = LM_SVG.replace(/__S/g, '_end'); const api = LelandIntro(host, '_end', { phase: 'draw', white: true });
  /* the wordmark split into letters so it can type in (same method as js/le.js wordmark()) */
  const d = [...window.LELAND_LOGO_SVG.matchAll(/<path d="([^"]+)"/g)].map(m => m[1]);
  const NS = 'http://www.w3.org/2000/svg', s = document.createElementNS(NS, 'svg'); s.style.cssText = 'position:absolute;width:0;height:0;visibility:hidden'; document.body.appendChild(s);
  const bb = d[3].split(/(?=M)/).filter(Boolean).map(p => { const e = document.createElementNS(NS, 'path'); e.setAttribute('d', p); s.appendChild(e); const b = e.getBBox(); return { p, x0: b.x, x1: b.x + b.width }; }).sort((a, b) => a.x0 - b.x0); s.remove();
  const L = []; bb.forEach(b => { const c = L[L.length - 1]; if (c && b.x0 < c.x1 - .3) { c.p += b.p; c.x1 = Math.max(c.x1, b.x1); } else L.push({ ...b }); });
  const X0 = L[0].x0, X1 = L[L.length - 1].x1, wm = document.getElementById('wm');
  wm.innerHTML = `<svg viewBox="${X0} 0 ${X1 - X0} 24">${L.map(l => `<path d="${l.p}"/>`).join('')}</svg>`;
  const paths = [...wm.querySelectorAll('path')], u = 115.8 / 24, line = document.getElementById('line');
  const esc = t => t.replace(/&/g, '&amp;').replace(/</g, '&lt;');
  line.innerHTML = LINE.split(' ').map(w => { const m = w.match(/^\[(.+)\](.*)$/); return `<span class="mw">${m ? `<em>${esc(m[1])}</em>${esc(m[2])}` : esc(w)}</span>`; }).join(' ');
  const words = [...line.children];
  const tType = T_IN + DRAW + BEAT, tLine = tType + TYPE + GAP, tEnd = tLine + (words.length - 1) * STAG + WORD;
  window.DURATION = +(tEnd + HOLD).toFixed(2); window.FINAL = tEnd + 1;
  const d1 = api.T.draw[1] - .5, per = TYPE / L.length;
  window.seek = t => {
    const m = t - T_IN; api.render(m <= 0 ? 0 : m < DRAW ? d1 * m / DRAW : d1 + .2);
    /* letters appear one at a time; the window's width eases to each letter's right edge over .12s, so the lockup re-centres as it types */
    const q = (t - tType) / per; let w = 0;
    paths.forEach((p, i) => { p.style.opacity = q >= i ? 1 : 0; if (q >= i) { const prev = i ? (L[i - 1].x1 - X0) * u : 0, cur = (L[i].x1 - X0) * u; w = prev + (cur - prev) * ease(((t - tType) - i * per) / .12); } });
    wm.style.width = w.toFixed(2) + 'px';
    words.forEach((e, i) => { const p = Math.max(0, Math.min(1, (t - tLine - i * STAG) / WORD)), k = ease(p); e.style.opacity = p; e.style.transform = `translateY(${(.3 * (1 - k)).toFixed(4)}em)`; e.style.filter = p < 1 ? `blur(${(6 * (1 - p)).toFixed(2)}px)` : 'none'; });
  };
  const q = new URLSearchParams(location.search);
  window.seek(q.has('final') || reduced ? window.FINAL : 0);
  const done = async () => { if (typeof ready !== 'undefined') return ready(); await document.fonts.load('500 60px Season', 'A').catch(() => 0); await document.fonts.ready; window.READY = true; };
  done().then(() => { if (q.has('play')) { if (typeof Player !== 'undefined') Player.play(); else { const t0 = performance.now(); (function f(n) { window.seek(((n - t0) / 1000) % window.DURATION); requestAnimationFrame(f); })(t0); } } });
})();
