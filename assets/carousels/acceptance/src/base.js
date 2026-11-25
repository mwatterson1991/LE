/* Shared helpers for the acceptance-rate carousel. Every number on a slide comes from window.ACCEPT, which data.js carries:
   build.py writes data.js as a straight copy of data/lists/ipeds-acceptance.json so the slides also open from disk (file://), where fetch is blocked. */
const LOGO_DIR = 'logos/';   /* trimmed copies written by prep_logos.py from assets/orgs/uni/ */
const D = window.ACCEPT, S = D.schools, KEYS = Object.keys(S);
const YA = 2014, Y1 = 2023, NY = Y1 - YA;

/* ---- one green scale for every figure. Here the extreme value is the LOWEST rate, so deeper green = lower. ---- */
const hex = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
const mix = (a, b, p) => 'rgb(' + a.map((v, i) => Math.round(v + (b[i] - v) * p)).join(',') + ')';
function ramp(stops, t) { t = Math.max(0, Math.min(1, t)); const n = stops.length - 1, i = Math.min(n - 1, Math.floor(t * n)); return mix(hex(stops[i]), hex(stops[i + 1]), t * n - i); }
const greenText = t => ramp(['#5E9B7E', '#306E54', '#1E4937'], t);
const INK_BAR = '#0F0F10', GREY_BAR = '#C9CACD';
const RATE_LO = 3, RATE_HI = 9;                       /* acceptance rates share one domain on every slide: 3% deepest, 9% and above lightest */
const rateT = v => 1 - (v - RATE_LO) / (RATE_HI - RATE_LO);
const scaleT = vals => { const lo = Math.min(...vals), hi = Math.max(...vals); return v => hi === lo ? 1 : (v - lo) / (hi - lo); };
const pc = v => v.toFixed(2) + '%';                    /* rates are shown to two decimals, as the file gives them */
const commas = v => Math.round(v).toLocaleString('en-US');
const R = (k, y) => S[k].years[y];
/* the source line, from the file's own source and universe notes */
const SRC_LINE = 'Source: NCES IPEDS Admissions, first-time undergraduate applicants. Schools with at least 10,000 applicants and an entering class of at least 1,000.';
/* schools ordered by acceptance rate in a fall, lowest first. The order uses admitted / applied itself, so two rates that round alike still have an order. */
function ranking(y) { return KEYS.slice().sort((a, b) => R(a, y).admitted / R(a, y).applied - R(b, y).admitted / R(b, y).applied); }
/* Marks are used on a slide only when every school on it has one; otherwise every school there is named in type (never a mix). */
const HAVE = new Set(window.LOGOS_PRESENT || []);
const marksOk = keys => keys.every(k => HAVE.has(k));
function markEl(k, useLogos, cls) { if (useLogos) return logoEl(k, cls); const e = el('span', 'nm ' + (cls || ''), S[k].short); e.dataset.slug = k; return e; }

/* school logomark, or a neutral circle while the file does not exist */
function logoEl(slug, cls) {
  if (!HAVE.has(slug)) { const d = document.createElement('span'); d.className = 'ph ' + (cls || ''); d.dataset.missing = slug; d.dataset.slug = slug; return d; }
  const im = new Image(); im.className = 'logo ' + (cls || ''); im.alt = ''; im.dataset.slug = slug;
  im.onerror = () => { const d = document.createElement('span'); d.className = 'ph ' + (cls || ''); d.dataset.missing = slug; im.replaceWith(d); };
  im.src = LOGO_DIR + slug + '.png'; return im;
}
function lelandMark() { const im = new Image(); im.className = 'lmark'; im.alt = 'Leland'; im.src = 'vendor/mark.svg'; document.body.appendChild(im); }
const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
/* cubic-bezier(.2,.8,.2,1), the house curve, solved for seekable animation */
function bezier(x1, y1, x2, y2) {
  const cx = 3 * x1, bx = 3 * (x2 - x1) - cx, ax = 1 - cx - bx, cy = 3 * y1, by = 3 * (y2 - y1) - cy, ay = 1 - cy - by;
  const X = t => ((ax * t + bx) * t + cx) * t, Y = t => ((ay * t + by) * t + cy) * t;
  return x => { if (x <= 0) return 0; if (x >= 1) return 1; let lo = 0, hi = 1, t = x; for (let i = 0; i < 40; i++) { if (X(t) < x) lo = t; else hi = t; t = (lo + hi) / 2; } return Y(t); };
}
const EASE = bezier(.2, .8, .2, 1);
const ready = async () => { await Promise.all(['500 40px Season','400 20px Macan','500 20px Macan','600 20px Macan','400 20px Num','400 20px Helv','700 20px Helv'].map(f => document.fonts.load(f, 'A1$').catch(() => 0))); await document.fonts.ready; await Promise.all([...document.images].map(i => i.complete ? 0 : new Promise(r => { i.addEventListener('load', r); i.addEventListener('error', r); }))); window.READY = true; post({ type: 'ready' }); };

/* ---------- when a slide sits inside the swipeable viewer (../index.html) ---------- */
const EMBED = window.parent !== window, SLIDE_N = +(location.pathname.match(/slide-(\d)/) || [0, 0])[1];
const post = m => { if (EMBED) parent.postMessage(Object.assign({ from: 'slide', n: SLIDE_N }, m), '*'); };
const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;
/* plays window.seek(t) in real time; the viewer starts it when the slide comes into view */
const Player = { on: false, raf: 0,
  play() { this.stop(); if (!window.seek) return; if (REDUCED) { window.seek(window.FINAL); return; } this.on = true; const s = performance.now(); const f = n => { if (!this.on) return; window.seek(((n - s) / 1000) % window.DURATION); this.raf = requestAnimationFrame(f); }; this.raf = requestAnimationFrame(f); },
  stop() { this.on = false; cancelAnimationFrame(this.raf); } };
addEventListener('message', e => { const m = e.data || {}; if (m.cmd === 'play') Player.play(); else if (m.cmd === 'stop') Player.stop(); else if (m.cmd === 'final') { Player.stop(); if (window.seek) window.seek(window.FINAL); } else if (m.cmd === 'clear' && window.clearIso) window.clearIso(); });
/* hover or tap one item to isolate it: the others fade back. `on(el|null)` lets a slide restyle its chart to match. */
function isolate(items, on) {
  let cur = null; const set = x => { cur = x; items.forEach(i => { i.style.transition = 'opacity .2s'; i.style.opacity = !x || i === x || (x.dataset.school && i.dataset.school === x.dataset.school) ? 1 : .22; }); if (on) on(x); };
  items.forEach(i => { i.dataset.iso = '1'; i.style.cursor = 'pointer';
    i.addEventListener('pointerenter', e => { if (e.pointerType === 'mouse') set(i); });
    i.addEventListener('pointerleave', e => { if (e.pointerType === 'mouse') set(null); });
    i.addEventListener('click', e => { if (e.detail !== -1 && matchMedia('(hover: none)').matches) set(cur === i ? null : i); }); });
  window.clearIso = () => set(null); window.setIso = set;
}
if (EMBED) {
  /* the viewer cannot see pointer events inside this frame, so drags, taps, wheel and keys are passed up to it.
     Elements marked data-own keep the gesture for themselves (the chart scrub on slide 1). */
  document.documentElement.style.touchAction = 'none'; document.documentElement.style.userSelect = 'none'; document.documentElement.style.webkitUserSelect = 'none';
  let g = null;
  addEventListener('pointerdown', e => { if (e.target.closest('[data-own]')) return; g = { x: e.screenX, y: e.screenY, t: performance.now(), item: !!e.target.closest('[data-iso],[data-tap]'), fx: e.clientX / 1080 }; post({ type: 'dragstart' }); });
  addEventListener('pointermove', e => { if (g) post({ type: 'drag', dx: e.screenX - g.x, dy: e.screenY - g.y }); });
  const end = e => { if (!g) return; const dx = e.screenX - g.x, dy = e.screenY - g.y; post({ type: 'dragend', dx, dy, ms: performance.now() - g.t, tap: Math.hypot(dx, dy) < 8, item: g.item, fx: g.fx }); g = null; };
  addEventListener('pointerup', end); addEventListener('pointercancel', end);
  addEventListener('wheel', e => post({ type: 'wheel', dx: e.deltaX, dy: e.deltaY }), { passive: true });
  addEventListener('keydown', e => post({ type: 'key', key: e.key }));
  addEventListener('dragstart', e => e.preventDefault());
}
