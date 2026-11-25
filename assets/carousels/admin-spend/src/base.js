/* Shared helpers for the admin-spend carousel. Every number on a slide comes from DATA (data/lists/ipeds-admin-spend.json). */
const ROOT = '../../../../';
const DATA_URL = ROOT + 'data/lists/ipeds-admin-spend.json';
const LOGO_DIR = 'logos/';   /* trimmed copies written by prep_logos.py from assets/orgs/uni/ */
const Y0 = 2011, Y1 = 2024;

/* ---- one green scale for every slide ----
   t = 0 (lowest) .. 1 (highest). Text stays readable on white (light end #5E9B7E); bars may go lighter (#CCEADE). */
const hex = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
const mix = (a, b, p) => 'rgb(' + a.map((v, i) => Math.round(v + (b[i] - v) * p)).join(',') + ')';
function ramp(stops, t) { t = Math.max(0, Math.min(1, t)); const n = stops.length - 1, i = Math.min(n - 1, Math.floor(t * n)); return mix(hex(stops[i]), hex(stops[i + 1]), t * n - i); }
const greenText = t => ramp(['#5E9B7E', '#306E54', '#1E4937'], t);
/* green is for money figures only: bars and lines are ink, or grey for the comparison series */
const INK_BAR = '#0F0F10', GREY_BAR = '#C9CACD';
/* per-student dollars share one domain on slides 1, 3, 4 and 5 */
const PS_LO = 15000, PS_HI = 50000;
const psT = v => (v - PS_LO) / (PS_HI - PS_LO);

const usd = v => '$' + Math.round(v).toLocaleString('en-US');
const pct = (v, d) => (v * 100).toFixed(d || 0) + '%';

async function loadData() { const d = await (await fetch(DATA_URL)).json(); return d.schools; }
/* rank of every school in a fiscal year, by per_student, highest first */
function ranking(S, y) { return Object.keys(S).filter(k => S[k].years[y] && S[k].years[y].per_student != null).sort((a, b) => S[b].years[y].per_student - S[a].years[y].per_student); }

/* school logomark, or a neutral circle while the file does not exist */
function logoEl(slug, cls) {
  const im = new Image(); im.className = 'logo ' + (cls || ''); im.alt = ''; im.dataset.slug = slug;
  im.onerror = () => { const d = document.createElement('span'); d.className = 'ph ' + (cls || ''); d.dataset.missing = slug; im.replaceWith(d); };
  im.src = LOGO_DIR + slug + '.png'; return im;
}
function lelandMark() { const im = new Image(); im.className = 'lmark'; im.alt = 'Leland'; im.src = ROOT + 'assets/brand/mark.svg'; document.body.appendChild(im); }
const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
/* cubic-bezier(.2,.8,.2,1), the house curve, solved for seekable animation */
function bezier(x1, y1, x2, y2) {
  const cx = 3 * x1, bx = 3 * (x2 - x1) - cx, ax = 1 - cx - bx, cy = 3 * y1, by = 3 * (y2 - y1) - cy, ay = 1 - cy - by;
  const X = t => ((ax * t + bx) * t + cx) * t, Y = t => ((ay * t + by) * t + cy) * t;
  return x => { if (x <= 0) return 0; if (x >= 1) return 1; let lo = 0, hi = 1, t = x; for (let i = 0; i < 40; i++) { if (X(t) < x) lo = t; else hi = t; t = (lo + hi) / 2; } return Y(t); };
}
const EASE = bezier(.2, .8, .2, 1);
const ready = async () => { await Promise.all(['500 40px Season','400 20px Macan','500 20px Macan','600 20px Macan','400 20px Num','400 20px Helv','700 20px Helv'].map(f => document.fonts.load(f, 'A1$').catch(() => 0))); await document.fonts.ready; await Promise.all([...document.images].map(i => i.complete ? 0 : new Promise(r => { i.addEventListener('load', r); i.addEventListener('error', r); }))); window.READY = true; };
