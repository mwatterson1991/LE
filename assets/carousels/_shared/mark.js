/* The Leland mark, animated: // bars paint down, sweep into the curves, dots, cube.
   Lifted unchanged from the chat interface guidelines (brand/chat-guidelines.html); only `render` is exposed as well. */
const LM_SVG="<svg class=\"lmi\" viewBox=\"107 58 650 650\" aria-label=\"Leland mark\">\n  <defs>\n    <g id=\"shapes__S\">\n      <path d=\"M351 134.2 Q355 125 365 125 L430 125 Q440 125 436 134.2 L336.6 360 A314 314 0 0 1 646.9 430.1 Q653.5 436.5 646.4 443.6 L594.8 495.2 A231 231 0 0 0 269.2 495.2 L222.8 448.8 Q215.7 441.7 219.7 432.6 Z\"/>\n      <path d=\"M461 134.2 Q465 125 475 125 L540 125 Q550 125 546 134.2 L462.7 323.5 A337 337 0 0 0 376.6 326 Z\"/>\n      <path d=\"M288.25 514.25 A204 204 0 0 1 575.75 514.25 L524.2 565.8 Q517.1 572.9 509.8 566.3 A121 121 0 0 0 354.3 566.3 Q346.9 572.9 339.8 565.8 Z\"/>\n    </g>\n    <clipPath id=\"logo__S\" clipPathUnits=\"userSpaceOnUse\">\n      <path d=\"M351 134.2 Q355 125 365 125 L430 125 Q440 125 436 134.2 L336.6 360 A314 314 0 0 1 646.9 430.1 Q653.5 436.5 646.4 443.6 L594.8 495.2 A231 231 0 0 0 269.2 495.2 L222.8 448.8 Q215.7 441.7 219.7 432.6 Z\"/>\n      <path d=\"M461 134.2 Q465 125 475 125 L540 125 Q550 125 546 134.2 L462.7 323.5 A337 337 0 0 0 376.6 326 Z\"/>\n      <path d=\"M288.25 514.25 A204 204 0 0 1 575.75 514.25 L524.2 565.8 Q517.1 572.9 509.8 566.3 A121 121 0 0 0 354.3 566.3 Q346.9 572.9 339.8 565.8 Z\"/>\n    </clipPath>\n    <!-- painted area: straight horizontal fronts on the slanted strokes, radial fronts on the curves -->\n    <mask id=\"paint__S\" maskUnits=\"userSpaceOnUse\" x=\"0\" y=\"0\" width=\"900\" height=\"800\">\n      <rect x=\"0\" y=\"0\" width=\"900\" height=\"800\" fill=\"#000\"/>\n      <path id=\"m-bar__S\"  fill=\"#fff\"/>\n      <path id=\"m-stem__S\" fill=\"#fff\"/>\n      <g id=\"arcs__S\">\n        <path id=\"p-b1__S\" stroke-width=\"83\" d=\"M640.7 483.8 A272.5 272.5 0 0 0 223.3 483.8\"/>\n        <path id=\"p-b2__S\" stroke-width=\"83\" d=\"M307.5 554.5 A162.5 162.5 0 0 1 556.5 554.5\"/>\n      </g>\n    </mask>\n    <!-- the two parallel bars of the // (inner one runs straight down to the lower curve's corner) -->\n    <path id=\"barL__S\" d=\"M351 134.2 Q355 125 365 125 L430 125 Q440 125 436 134.2 L274.7 500.7 L222.8 448.8 Q215.7 441.7 219.7 432.6 Z\"/>\n    <path id=\"barR__S\" d=\"M461 134.2 Q465 125 475 125 L540 125 Q550 125 546 134.2 L354.3 569.6 Q351 577 345.4 571.4 L292 518 Z\"/>\n    <clipPath id=\"frontClip__S\" clipPathUnits=\"userSpaceOnUse\"><rect id=\"front__S\" x=\"0\" y=\"0\" width=\"900\" height=\"0\"/></clipPath>\n    <mask id=\"sweepM__S\" maskUnits=\"userSpaceOnUse\" x=\"0\" y=\"0\" width=\"900\" height=\"800\">\n      <path id=\"wedgeA__S\" fill=\"#fff\"/>\n    </mask>\n    <mask id=\"barsM__S\" maskUnits=\"userSpaceOnUse\" x=\"0\" y=\"0\" width=\"900\" height=\"800\">\n      <rect x=\"0\" y=\"0\" width=\"900\" height=\"800\" fill=\"#fff\"/>\n      <path id=\"wedgeB__S\" fill=\"#000\"/>\n    </mask>\n  </defs>\n\n  <filter id=\"soft__S\" x=\"-30%\" y=\"-30%\" width=\"160%\" height=\"160%\"><feGaussianBlur stdDeviation=\"22\"/></filter>\n  <g id=\"shadow__S\" opacity=\"0\" filter=\"url(#soft__S)\" transform=\"translate(0 26)\"><use href=\"#shapes__S\" fill=\"#000\"/></g>\n  <g id=\"drawIn__S\" class=\"ink\">\n    <g mask=\"url(#sweepM__S)\"><use href=\"#shapes__S\"/></g>\n    <g mask=\"url(#barsM__S)\"><g clip-path=\"url(#frontClip__S)\"><use href=\"#barL__S\"/><use href=\"#barR__S\"/></g></g>\n  </g>\n  <g class=\"ink\" mask=\"url(#paint__S)\"><use href=\"#shapes__S\"/></g>\n  <g class=\"ink\" clip-path=\"url(#logo__S)\" id=\"lines__S\"><rect/><rect/><rect/></g>\n  <g class=\"ink\" id=\"balls__S\"><rect/><rect/><rect/></g>\n  <g id=\"orb__S\"></g>\n</svg>";
function LelandIntro(root,suffix,opts){opts=opts||{};const $i=id=>document.getElementById(id+suffix);

  const TAU = Math.PI * 2, DEG = 180 / Math.PI;
  const O = { x: 432, y: 383 }, C = { x: 432, y: 659 };
  const VB = { x: 107, y: 58, s: 650 };
  const SHAPES = [...root.querySelectorAll('[id^="shapes"] path')].map(p => p.getAttribute('d'));

  // ---- everything you can tune ----
  const DEFAULTS = {
    downTime: 0.8,    downIn: 0.5,  downOut: 0.75, slashPause: 0.25,
    arcTime: 0.75,    arcIn: 0.45,  arcOut: 0.75,  holdTime: 1.4,
    rubikTime: 2.4,   trickSpeed: 1.0,
    paintTime: 0.55,  paintIn: 0.45, paintOut: 0.7, squashTime: 0.16,
    sweepTime: 0.85,  sweepIn: 0.55, sweepOut: 0.85,
    ballSize: 40,     spinSpeed: 1.2, spinTime: 1.8,
    // unused here, kept so shared code runs
    lightTime: 3.4, cornerPause: 0, edgeWidth: 13, metal: 1, iridescence: 1, flow: 1, shadow: 0,
    orbSize: 170, orbMorph: 1, orbThink: 0,
  };
  const SLIDERS = [
    ['Draw in'],
    ['downTime', 'Lines down (s)', 0.2, 3, 0.05],
    ['downIn', 'Lines ease in', 0, 1, 0.01],
    ['downOut', 'Lines ease out', 0, 1, 0.01],
    ['slashPause', 'Hold on // (s)', 0, 1.5, 0.01],
    ['arcTime', 'Sweep into curves (s)', 0.2, 3, 0.05],
    ['arcIn', 'Sweep ease in', 0, 1, 0.01],
    ['arcOut', 'Sweep ease out', 0, 1, 0.01],
    ['holdTime', 'Hold on logo (s)', 0.2, 5, 0.05],
    ['Into dots'],
    ['paintTime', 'Retract time (s)', 0.15, 2.5, 0.01],
    ['paintIn', 'Retract ease in', 0, 1, 0.01],
    ['paintOut', 'Retract ease out', 0, 1, 0.01],
    ['squashTime', 'Round-up time (s)', 0.02, 0.6, 0.01],
    ['sweepTime', 'Sweep to spin (s)', 0.15, 2, 0.01],
    ['sweepIn', 'Sweep ease in', 0, 1, 0.01],
    ['sweepOut', 'Sweep ease out', 0, 1, 0.01],
    ['Dots'],
    ['ballSize', 'Dot size', 10, 60, 1],
    ['spinSpeed', 'Spin speed (turns/s)', 0.2, 3, 0.05],
    ['spinTime', 'Spin before restart (s)', 0.3, 5, 0.05],
    ['Cube'],
    ['orbSize', 'Cube size', 80, 260, 1],
    ['orbMorph', 'Split / merge speed', 0.4, 2.5, 0.01],
    ['rubikTime', 'Rubik turns (s)', 0, 6, 0.1],
    ['trickSpeed', 'Tricks speed', 0.4, 2.5, 0.01],
  ];
  let CFG = { ...DEFAULTS };
  

  // cubic-bezier easing: ease in / ease out amounts map to the two control handles
  function bezier(x1, y1, x2, y2) {
    const cx = 3*x1, bx = 3*(x2-x1)-cx, ax = 1-cx-bx, cy = 3*y1, by = 3*(y2-y1)-cy, ay = 1-cy-by;
    const X = t => ((ax*t + bx)*t + cx)*t, Y = t => ((ay*t + by)*t + cy)*t, dX = t => (3*ax*t + 2*bx)*t + cx;
    return x => {
      if (x <= 0) return 0; if (x >= 1) return 1;
      let t = x;
      for (let i = 0; i < 6; i++) { const d = dX(t); if (Math.abs(d) < 1e-6) break; t -= (X(t) - x) / d; }
      if (t < 0 || t > 1 || Math.abs(X(t) - x) > 1e-4) { let lo = 0, hi = 1; t = x;
        for (let i = 0; i < 30; i++) { if (X(t) < x) lo = t; else hi = t; t = (lo + hi) / 2; } }
      return Y(t);
    };
  }
  const easeIO = (i, o) => bezier(i, 0, 1 - o, 1);

  const TAU_ = Math.PI * 2;
  let W, RS = 72, R, SQ, TP, SPIN_END, OUT, LIGHT, PAUSE;
  let sweepE, sweepAng, paintE, squashE, downE, arcE;
  function applyCfg() {
    W = TAU_ * CFG.spinSpeed; R = CFG.ballSize; RS = Math.max(40, R * 1.8);
    SQ = CFG.squashTime; TP = CFG.paintTime; SPIN_END = CFG.spinTime; OUT = CFG.sweepTime;
    LIGHT = CFG.lightTime; PAUSE = CFG.cornerPause;
    sweepE = easeIO(CFG.sweepIn, CFG.sweepOut);
    sweepAng = easeIO(CFG.sweepIn * 0.35, CFG.sweepOut);   // keeps turning with the spin at release
    paintE = easeIO(CFG.paintIn, CFG.paintOut);
    downE = easeIO(CFG.downIn, CFG.downOut); arcE = easeIO(CFG.arcIn, CFG.arcOut);
    squashE = easeIO(0.3, 0.8);
  }
  applyCfg();
  // finalised in solveFlights()
  let PHI0 = 0, LAND = 1.2, P0 = 1.3, PAINT_END = 1.9, GLOW = [1.8, 6.2], UNP = [6.2, 6.95], RET0 = 7.0, RET1 = 7.3, L = 7.9;

  const cl = v => Math.max(0, Math.min(1, v));
  const prog = (t, a, b) => cl((t - a) / (b - a));
  const lerp = (a, b, p) => a + (b - a) * p;
  const inOut = p => p < .5 ? 2*p*p : 1 - Math.pow(-2*p + 2, 2) / 2;

  // ---- limb geometry: where the flat line sits after travelling distance d ----
  const arc = id => { const el = $i(id); return { el, len: el.getTotalLength() }; };
  const B1 = arc('p-b1'), B2 = arc('p-b2');
  const ptOn = (a, s) => a.el.getPointAtLength(Math.max(0, Math.min(a.len, s)));
  const radial = p => Math.atan2(p.y - C.y, p.x - C.x) * DEG;
  const xc = (y, base) => base - 0.44 * (y - 125);            // centre line of a slanted stroke
  const gap = y => 452.5 - 0.44 * (y - 125);                   // middle of the gap between stem and bar

  const BAR  = { y0: 127, y1: 325 };
  const STEM = { y0: 470, y1: 127 };
  const B1S  = { s0: 25.8, s1: 449.8 };
  const B2S  = { s0: 16.2, s1: 267.4 };
  const PIV  = 30;
  const DB1  = B1S.s1 - B1S.s0, DST = (STEM.y0 - STEM.y1) / 0.915;
  const DIST = [(BAR.y1 - BAR.y0) / 0.915, DB1 + PIV + DST, B2S.s1 - B2S.s0];

  function line(i, d) {
    if (i === 0) { const y = BAR.y0 + d * 0.915; return { x: xc(y, 507.5), y, ang: 0, len: 100 }; }
    if (i === 2) { const p = ptOn(B2, B2S.s0 + d); return { x: p.x, y: p.y, ang: radial(p), len: 90 }; }
    if (d <= DB1) { const p = ptOn(B1, B1S.s0 + d); return { x: p.x, y: p.y, ang: radial(p), len: 90 }; }
    const A = ptOn(B1, B1S.s1), aA = radial(A);
    const sx = xc(STEM.y0, 397.5);
    if (d <= DB1 + PIV) {
      const q = inOut((d - DB1) / PIV);
      return { x: lerp(A.x, sx, q), y: lerp(A.y, STEM.y0, q), ang: lerp(aA + 180, 0, q), len: lerp(90, 100, q) };
    }
    const y = STEM.y0 - (d - DB1 - PIV) * 0.915;
    return { x: xc(y, 397.5), y, ang: 0, len: 100 };
  }

  // slide progress: friction slows it to a stop; on the way back it accelerates away
  function slide(t, i) {
    if (t < P0 || t > UNP[1]) return 0;
    if (t <= UNP[0]) return paintE(prog(t, P0, PAINT_END));
    return 1 - paintE(prog(t, UNP[0], UNP[1]));
  }

  // spin, continuous across loops
  const phi = t => PHI0 + W * t;   // one continuous spin; the loop length is a whole number of turns
  const orbit = (t, i) => { const a = phi(t) + i * TAU / 3; return { x: O.x + Math.cos(a) * RS, y: O.y + Math.sin(a) * RS }; };

  // all three leave the spin at the same instant and sweep out on clean curves,
  // continuing the direction of the spin, then land together.
  const TA = [0,0,0], RA = [0,0,0], LANDS = [0,0,0];
  const quint = p => p < .5 ? 16*p*p*p*p*p : 1 - Math.pow(-2*p + 2, 5) / 2;
  const outExpo = p => p >= 1 ? 1 : 1 - Math.pow(2, -10 * p);
  const polar = q => ({ r: Math.hypot(q.x - O.x, q.y - O.y), a: Math.atan2(q.y - O.y, q.x - O.x) });
  const fwd = (from, to, min) => { while (to < from + min) to += TAU; while (to >= from + min + TAU) to -= TAU; return to; };
  // ---- intro timeline: draw in → hold → retract into 3 dots → spin → fade, then again ----
  let DRAW0 = 0.35, DOWN1 = 1.1, CRN0 = 1.3, CRN1 = 1.65, ARC0 = 1.7, DRAW1 = 2.4, FADE = [0, 0];
  const crnE = p => p * p * (1.6 * p - 0.6) / 1.0;   // gathers speed into the corner
  function solveFlights() {
    DRAW0 = 0.35; DOWN1 = DRAW0 + CFG.downTime;
    ARC0 = DOWN1 + CFG.slashPause; DRAW1 = ARC0 + CFG.arcTime;
    LAND = 0; LANDS[0] = LANDS[1] = LANDS[2] = 0; P0 = 0; PAINT_END = 0.001;
    UNP = [DRAW1 + CFG.holdTime, DRAW1 + CFG.holdTime + TP];
    GLOW = [1e9, 1e9];
    RET0 = UNP[1] + SQ; RET1 = RET0 + OUT;
    // ---- 3 dots → cube: Rubik turns, then its tricks → 3 dots ----
    const m = CFG.orbMorph, ts = 1 / CFG.trickSpeed;
    ORB.set = 0.6 * m; ORB.spl = 0.45 * m; ORB.pop = 0.25 * m;
    ORB.in0 = RET1 + 0.45; ORB.s0 = ORB.in0 + ORB.set; ORB.c0 = ORB.s0 + ORB.spl * 0.75;
    ORB.t0 = ORB.c0 + ORB.pop + 0.3;
    ORB.tR = ORB.t0 + CFG.rubikTime;                                        // Rubik turns end
    const sp0 = ORB.tR + 0.15, sp1 = sp0 + 1.6 * ts;                        // turn around the centre
    const f0 = sp1 + 0.15, f1 = f0 + 0.6 * ts, f2 = f1 + 0.5 * ts, f3 = f2 + 0.6 * ts;   // flatten face-on and back
    const w0 = f3 + 0.15, w1 = w0 + 2.4 * ts;                               // tumble: dots weave through each other
    ORB.show = { spin: [sp0, sp1], flat: [f0, f1, f2, f3], weave: [w0, w1] };
    ORB.t1 = w1 + 0.25;
    ORB.m0 = ORB.t1 + 0.3; ORB.m1 = ORB.m0 + ORB.pop * 0.8; ORB.u0 = ORB.m1 + ORB.spl; ORB.end = ORB.u0 + ORB.set;
    FADE = [ORB.end + CFG.spinTime, ORB.end + CFG.spinTime + 0.45];
    L = FADE[1] + 0.25;
    // the spin phase that makes the three sweeps into the spin as even as possible
    for (let i = 0; i < 3; i++) TA[i] = polar(line(i, 0)).a;
    let best = 1e9;
    for (let k = 0; k < 720; k++) {
      const ph = k / 720 * TAU, sw = [];
      for (let i = 0; i < 3; i++) { const e = ph + W * RET1 + i * TAU / 3; sw.push(fwd(TA[i], e, 0.5) - TA[i]); }
      const spread = Math.max(...sw) - Math.min(...sw) + Math.max(...sw) * 0.3;
      if (spread < best) { best = spread; PHI0 = ph; }
    }
    for (let i = 0; i < 3; i++) RA[i] = polar(line(i, 0)).r;
    buildOrb();
  }

  // ---- draw in (as in the One Conversation video):
  //  1) both bars paint down with one level front to full length → //
  //  2) a sweep from left to right turns the bars into the curves, cutting the white gap ----
  const SW0 = 196, SW1 = 344;                    // sweep angles (degrees, around the curves' centre)
  function wedge(deg) {
    if (deg <= SW0) return 'M0 0Z';
    let d = `M${C.x} ${C.y}`;
    for (let k = 0; k <= 24; k++) { const a = (SW0 - 6 + (deg - SW0 + 6) * k / 24) * Math.PI / 180;
      d += ` L${(C.x + Math.cos(a) * 1400).toFixed(1)} ${(C.y + Math.sin(a) * 1400).toFixed(1)}`; }
    return d + 'Z';
  }
  function drawState(t) {
    const p = downE(prog(t, DRAW0, DOWN1));
    const front = t < DRAW0 ? 0 : 118 + p * (582 - 118);
    const q = t < ARC0 ? 0 : arcE(prog(t, ARC0, DRAW1));
    const deg = q >= 1 ? 400 : SW0 + q * (SW1 - SW0);
    return { front, wedgeA: wedge(deg > SW0 ? deg + 0.8 : deg), wedgeB: wedge(deg) };   // slight overlap: no seam
  }

  /* ---------- thinking orb: the same 3×3×3 corner cube as the chat interface ---------- */
  const ORB = {};
  const ISO_X = Math.atan(1 / Math.SQRT2), ISO_Y = Math.PI / 4, OTH = [[1,2],[2,0],[0,1]];
  const CORN = []; for (const x of [-1,1]) for (const y of [-1,1]) for (const z of [-1,1]) CORN.push([x,y,z]);
  const SKY = [128,172,237], INK = opts.white?[255,255,255]:[11,11,11];
  const rotSl = (p, a, ang) => { const b = OTH[a][0], c = OTH[a][1], q = p.slice(), cs = Math.cos(ang), sn = Math.sin(ang);
    q[b] = p[b]*cs - p[c]*sn; q[c] = p[b]*sn + p[c]*cs; return q; };
  function proj(v, ys) {
    const ry = ISO_Y + ys, cx = Math.cos(ISO_X), sx = Math.sin(ISO_X), cy = Math.cos(ry), sy = Math.sin(ry);
    const x1 = v[0]*cy + v[2]*sy, z1 = -v[0]*sy + v[2]*cy;
    return [x1, v[1]*cx - z1*sx, v[1]*sx + z1*cx];
  }
  function faceVis(ys) {
    return [[1,0,0],[-1,0,0],[0,1,0],[0,-1,0],[0,0,1],[0,0,-1]].map(n => {
      const v = (proj(n, ys)[2] + .02) / .2; return v < 0 ? 0 : v > 1 ? 1 : v*v*(3 - 2*v); });
  }
  const scr = (r, sc) => ({ x: O.x + r[0] * sc, y: O.y - r[1] * sc, z: r[2] });
  const angOf = q => Math.atan2(q.y - O.y, q.x - O.x);
  function seeded(a) { return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

  function buildOrb() {
    const ringR = CFG.orbSize, sc = ringR / 1.633;
    ORB.r = ringR * 0.161; ORB.sc = sc;
    ORB.rest = CORN.map(c => scr(proj(c, 0), sc));
    const ring = [], ctr = [];
    ORB.rest.forEach((q, i) => (Math.hypot(q.x - O.x, q.y - O.y) > ringR * 0.5 ? ring : ctr).push(i));
    ring.sort((a, b) => angOf(ORB.rest[a]) - angOf(ORB.rest[b]));
    ctr.sort((a, b) => ORB.rest[b].z - ORB.rest[a].z);           // front one first
    ORB.PAR = [ring[0], ring[2], ring[4]]; ORB.CLN = [ring[1], ring[3], ring[5]]; ORB.CTR = ctr;
    const pa = ORB.PAR.map(i => angOf(ORB.rest[i]));
    // into the orb: each spinning dot glides forward to every other hexagon point
    const a0 = phi(ORB.in0); let bestK = 0, bestD = 1e9;
    for (let k = 0; k < 3; k++) { const d = fwd(a0, pa[k], 1.0) - a0; if (d < bestD) { bestD = d; bestK = k; } }
    ORB.inMap = [0,1,2].map(i => (bestK + i) % 3);
    ORB.inTo  = [0,1,2].map(i => { const ai = a0 + i * TAU / 3; return fwd(ai, pa[ORB.inMap[i]], 1.0); });
    // out of the orb: pick the hexagon point each dot leaves from so it spins up smoothly
    const e0 = phi(ORB.end); let bk = 0, bd = 1e9;
    for (let k = 0; k < 3; k++) { let d = e0 - pa[k]; while (d < 0.8) d += TAU; while (d >= 0.8 + TAU) d -= TAU; if (Math.abs(d - 1.5) < bd) { bd = Math.abs(d - 1.5); bk = k; } }
    ORB.outMap  = [0,1,2].map(i => (bk + i) % 3);
    ORB.outFrom = [0,1,2].map(i => { const ei = e0 + i * TAU / 3; let a = pa[ORB.outMap[i]]; while (ei - a < 0.8) a -= TAU; while (ei - a >= 0.8 + TAU) a += TAU; return a; });
    // where each dot ends up after the turns, so it keeps its own identity (and colour) afterwards
    const finalPos = () => { let ps = CORN.map(c => c.slice());
      for (const mv of ORB.moves) ps = ps.map(p => p[mv.a] === mv.l ? rotSl(p, mv.a, mv.dir * Math.PI / 2).map(Math.round) : p);
      return ps; };
    // a fixed, repeatable set of slice turns while it thinks
    const rnd = seeded(7); ORB.moves = []; let tt = ORB.t0 + 0.15, last = null;
    while (tt + 0.36 <= (ORB.tR != null ? ORB.tR : ORB.t1) - 0.05) {
      let a, l, n = 0; do { a = Math.floor(rnd() * 3); l = rnd() < .5 ? -1 : 1; n++; } while (last && last.a === a && last.l === l && n < 10);
      const mv = { a, l, dir: rnd() < .5 ? 1 : -1, t0: tt, t1: tt + 0.36 }; ORB.moves.push(mv); last = mv; tt += 0.44;
    }
    // make sure every dot gets turned at least once, and note when each one first locks in
    { let ps = CORN.map(c => c.slice()); const lock = new Array(8).fill(null);
      ORB.moves.forEach((mv, n) => {
        if (n === ORB.moves.length - 1 && lock.some((v, i) => v === null && !(ps[i][mv.a] === mv.l))) {
          // last turn: pick the slice that catches the dots that haven't moved yet
          let best = null;
          for (let a = 0; a < 3; a++) for (const l of [-1, 1]) {
            const c = ps.filter((p, i) => lock[i] === null && p[a] === l).length;
            if (!best || c > best.c) best = { a, l, c };
          }
          mv.a = best.a; mv.l = best.l;
        }
        ps.forEach((p, i) => { if (p[mv.a] === mv.l && lock[i] === null) lock[i] = mv.t0; });
        ps = ps.map(p => p[mv.a] === mv.l ? rotSl(p, mv.a, mv.dir * Math.PI / 2).map(Math.round) : p);
      });
      ORB.lock = lock;
    }
    const fp = finalPos();
    ORB.slotOf = fp.map(p => CORN.findIndex(c => c[0] === p[0] && c[1] === p[1] && c[2] === p[2]));
  }

  const easeIn3 = p => p*p*p, easeOut3 = p => 1 - Math.pow(1 - p, 3), eio = p => p < .5 ? 4*p*p*p : 1 - Math.pow(-2*p + 2, 3) / 2;
  const backOut = p => { const c1 = 1.4, c3 = c1 + 1; return 1 + c3*Math.pow(p - 1, 3) + c1*Math.pow(p - 1, 2); };
  const lockBlue = (i, t) => {
    const l = ORB.lock && ORB.lock[i]; if (l == null || t < l) return 0;
    return eio(prog(t, l, l + 0.36)) * (1 - eio(prog(t, ORB.t1 - 0.2, ORB.t1 + 0.35)));
  };
  // returns the 8 orb dots for time t (x, y, radius, opacity, blue amount, depth)
  function orbDots(t) {
    const out = CORN.map(() => ({ x: O.x, y: O.y, r: 0, op: 1, blue: 0, z: 0 }));
    const r = ORB.r, ringR = CFG.orbSize, at = a => ({ x: O.x + Math.cos(a) * ringR, y: O.y + Math.sin(a) * ringR });
    const restAt = i => ({ ...ORB.rest[i] });
    if (t < ORB.t0 || t >= ORB.t1) {
      const inSide = t < ORB.t0;
      for (let k = 0; k < 3; k++) {
        const P_ = ORB.PAR[k], C_ = ORB.CLN[k], pa = angOf(ORB.rest[P_]);
        // parent
        let pos, pr;
        if (inSide && t < ORB.s0) {
          const i = ORB.inMap.indexOf(k), u = prog(t, ORB.in0, ORB.s0), ai = phi(ORB.in0) + i * TAU / 3;
          const a = ai + (ORB.inTo[i] - ai) * easeOut3(u), rr = RS + (ringR - RS) * eio(u);
          pos = { x: O.x + Math.cos(a) * rr, y: O.y + Math.sin(a) * rr }; pr = R;
        } else if (!inSide && t >= ORB.u0) {
          const i = ORB.outMap.indexOf(k), u = prog(t, ORB.u0, ORB.end), ei = phi(ORB.end) + i * TAU / 3;
          const a = ORB.outFrom[i] + (ei - ORB.outFrom[i]) * easeIn3(u), rr = ringR + (RS - ringR) * eio(u);
          pos = { x: O.x + Math.cos(a) * rr, y: O.y + Math.sin(a) * rr }; pr = R;
        } else {
          const u = inSide ? eio(prog(t, ORB.s0, ORB.s0 + ORB.spl)) : 1 - eio(prog(t, ORB.m1, ORB.u0));
          pos = restAt(P_); pr = lerp(R, r, u);
        }
        out[P_] = { ...pos, r: pr, op: 1, blue: 0, z: 1 };
        // the copy that splits off and slides to the next hexagon point
        const su = inSide ? eio(prog(t, ORB.s0, ORB.s0 + ORB.spl)) : 1 - eio(prog(t, ORB.m1, ORB.u0));
        const visible = inSide ? t >= ORB.s0 : t < ORB.u0;
        const ca = angOf(ORB.rest[C_]); let d = ca - pa; while (d < 0) d += TAU;
        out[C_] = visible ? { ...at(pa + d * su), r: lerp(pr, r, su) * (su > 0 ? 1 : 0), op: 1, blue: 0, z: 0.5 } : { x: O.x, y: O.y, r: 0, op: 0, blue: 0, z: 0 };
      }
      // centre dot arrives last, leaves first
      const cu = inSide ? backOut(prog(t, ORB.c0, ORB.c0 + ORB.pop)) * (t >= ORB.c0 ? 1 : 0) : 1 - eio(prog(t, ORB.m0, ORB.m1));
      out[ORB.CTR[0]] = { ...restAt(ORB.CTR[0]), r: r * Math.max(0, cu), op: 1, blue: 0, z: 2 };
      out[ORB.CTR[1]] = { ...restAt(ORB.CTR[1]), r: 0, op: 0, blue: 0, z: -2 };
      if (inSide) return out;
      return ORB.slotOf.map((j, i) => ({ ...out[j], blue: lockBlue(i, t) }));
    }
    // thinking: Rubik turns, then the tricks (turn around the centre, flatten, tumble)
    const ys = 0, SH = ORB.show;
    let ax = 0, ay = 0, rxv = ISO_X, ryv = ISO_Y, dz = 0;
    if (SH) {
      const us = prog(t, SH.spin[0], SH.spin[1]); ay += TAU * eio(us);
      const fl = eio(prog(t, SH.flat[0], SH.flat[1])) - eio(prog(t, SH.flat[2], SH.flat[3]));
      rxv = lerp(ISO_X, 0, fl); ryv = lerp(ISO_Y, 0, fl);
      const uw = prog(t, SH.weave[0], SH.weave[1]), ew = eio(uw);
      ax += TAU * ew; ay += 2 * TAU * ew;
      dz = Math.max(Math.sin(Math.PI * us), Math.sin(Math.PI * uw));   // depth only while it's moving in 3D
    }
    const nz = faceVis(ys);
    let pos = CORN.map(c => c.slice()), cur = null, k = 0;
    for (const mv of ORB.moves) {
      if (t >= mv.t1) pos = pos.map(p => p[mv.a] === mv.l ? rotSl(p, mv.a, mv.dir * Math.PI / 2).map(Math.round) : p);
      else if (t >= mv.t0) { cur = mv; k = eio(prog(t, mv.t0, mv.t1)); }
    }
    pos.forEach((p, i) => {
      const moving = cur && p[cur.a] === cur.l;
      const v = moving ? rotSl(p, cur.a, cur.dir * Math.PI / 2 * k) : p;
      let vis = 0; for (let a = 0; a < 3; a++) { if (v[a] > .6) vis = Math.max(vis, nz[a*2]); if (v[a] < -.6) vis = Math.max(vis, nz[a*2+1]); }
      let w = v;
      if (ax) w = [w[0], w[1]*Math.cos(ax) - w[2]*Math.sin(ax), w[1]*Math.sin(ax) + w[2]*Math.cos(ax)];
      const cy_ = Math.cos(ryv + ay), sy_ = Math.sin(ryv + ay), cx_ = Math.cos(rxv), sx_ = Math.sin(rxv);
      const x1 = w[0]*cy_ + w[2]*sy_, z1 = -w[0]*sy_ + w[2]*cy_;
      const pr = [x1, w[1]*cx_ - z1*sx_, w[1]*sx_ + z1*cx_];
      const q = scr(pr, ORB.sc);
      out[i] = { ...q, r: r * (1 + 0.22 * dz * pr[2] / 1.732), op: 1, blue: lockBlue(i, t) };
    });
    return out;
  }
  function sweep(i, u, back) {
    // u: 0→1 along the sweep. Radius eases in and out hard; angle keeps turning with the spin.
    const off = i * TAU / 3;
    if (!back) {
      const a0 = phi(SPIN_END) + off, a = a0 + (TA[i] - a0) * sweepAng(u);
      const r = RS + (RA[i] - RS) * sweepE(u);
      return { x: O.x + Math.cos(a) * r, y: O.y + Math.sin(a) * r };
    }
    const a1 = fwd(TA[i], phi(RET1) + off, 0.5), a = TA[i] + (a1 - TA[i]) * (1 - sweepAng(1 - u));
    const r = RA[i] + (RS - RA[i]) * (1 - sweepE(1 - u));
    return { x: O.x + Math.cos(a) * r, y: O.y + Math.sin(a) * r };
  }
  function brush(t, i) {
    const start = line(i, 0);
    if (t < SPIN_END || t >= RET1) { const o = orbit(t, i); return { ball: true, ...o }; }
    if (t < LAND) return { ball: true, ...sweep(i, prog(t, SPIN_END, LAND), false) };
    if (t >= RET0) return { ball: true, ...sweep(i, prog(t, RET0, RET1), true) };
    const k = t < UNP[1] ? squashE(prog(t, LAND, LAND + SQ)) : 1 - squashE(prog(t, UNP[1], UNP[1] + SQ));
    const ln = line(i, DIST[i] * slide(t, i));
    return { ball: false, k, ...ln };
  }

  function reveals(t) {
    const out = { bar: null, stem: null, b1: 0, b2: 0 };
    if (t < P0 || t > UNP[1]) return out;
    const p0 = slide(t, 0), p1 = slide(t, 1), p2 = slide(t, 2);
    if (t >= LANDS[0]) {
      const yb = p0 > 0.999 ? 345 : line(0, DIST[0] * p0).y + 2;
      out.bar = `M${gap(90)} 90 L640 90 L640 ${yb} L${gap(yb)} ${yb} Z`;
    }
    if (t >= LANDS[1]) {
      const dL = DIST[1] * p1;
      out.b1 = B1S.s0 + Math.min(dL, DB1) + 1.5 + (dL >= DB1 ? 30 : 0);
      if (dL > DB1 + PIV * 0.5) {
        const ys = p1 > 0.999 ? 90 : Math.min(STEM.y0, line(1, dL).y - 2);
        out.stem = `M150 ${ys} L${gap(ys)} ${ys} L${gap(480)} 480 L150 480 Z`;
      }
    }
    if (t >= LANDS[2]) out.b2 = B2S.s0 + DIST[2] * p2 + 1.5 + (p2 > 0.999 ? 30 : 0);
    return out;
  }

  solveFlights();
  const lines = [...root.querySelectorAll('[id^="lines"] rect')];
  const balls = [...root.querySelectorAll('[id^="balls"] rect')];
  const shadowEl = $i('shadow');
  const drawInG = $i('drawIn'), frontEl = $i('front');
  const wedgeA = $i('wedgeA'), wedgeB = $i('wedgeB');
  const orbG = $i('orb');
  const orbEls = CORN.map(() => { const c = document.createElementNS('http://www.w3.org/2000/svg', 'circle'); orbG.appendChild(c); return c; });
  const mBar = $i('m-bar'), mStem = $i('m-stem');

  function setRect(el, cx, cy, ang, w, h, rx) {
    el.setAttribute('x', -w / 2); el.setAttribute('y', -h / 2);
    el.setAttribute('width', w); el.setAttribute('height', h); el.setAttribute('rx', rx);
    el.setAttribute('transform', `translate(${cx} ${cy}) rotate(${ang})`);
  }

  /* ---------- liquid-metal outline (GPU shader) ---------- */
  const canvas = $i('metal');
  const gl = null;   // no metal glow in this version
  let U = null;
  if (gl) {
    const N = 1024, k = N / VB.s;
    const c2 = document.createElement('canvas'); c2.width = c2.height = N;
    const x2 = c2.getContext('2d');
    x2.setTransform(k, 0, 0, k, -VB.x * k, -VB.y * k);
    x2.fillStyle = '#fff'; SHAPES.forEach(d => x2.fill(new Path2D(d)));
    const cov = x2.getImageData(0, 0, N, N).data;
    const D = new Float32Array(N * N), R2 = Math.SQRT2;
    for (let i = 0; i < N * N; i++) D[i] = cov[i * 4 + 3] > 127 ? 1e6 : 0;
    for (let y = 1; y < N; y++) for (let x = 1; x < N - 1; x++) { const i = y*N + x; if (!D[i]) continue;
      D[i] = Math.min(D[i], D[i-1]+1, D[i-N]+1, D[i-N-1]+R2, D[i-N+1]+R2); }
    for (let y = N - 2; y >= 0; y--) for (let x = N - 2; x > 0; x--) { const i = y*N + x; if (!D[i]) continue;
      D[i] = Math.min(D[i], D[i+1]+1, D[i+N]+1, D[i+N+1]+R2, D[i+N-1]+R2); }
    const tex = new Uint8Array(N * N * 4);
    for (let i = 0; i < N * N; i++) { tex[i*4] = Math.min(255, D[i] * 4); tex[i*4+1] = cov[i*4+3]; tex[i*4+3] = 255; }

    const vs = `attribute vec2 p; void main(){ gl_Position = vec4(p,0.,1.); }`;
    const fs = `
precision highp float;
uniform sampler2D uD; uniform vec2 uRes; uniform float uT, uAmt, uPx, uAmb, uRW, uBright, uIri; uniform vec2 uL;
float h(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453); }
float n2(vec2 p){ vec2 i=floor(p), f=fract(p); f=f*f*(3.-2.*f);
  return mix(mix(h(i),h(i+vec2(1,0)),f.x), mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x), f.y); }
float fbm(vec2 p){ float v=0., a=.5; for(int i=0;i<5;i++){ v+=a*n2(p); p=p*2.03+vec2(1.7,9.2); a*=.5; } return v; }
vec3 b3(vec3 x, vec3 y){ return clamp(1.-x*x-y, 0., 1.); }
vec3 spectral(float x){
  return b3(vec3(3.54585104,2.93225262,2.41593945)*(x-vec3(0.69549072,0.49228336,0.27699880)), vec3(0.02312639,0.15225084,0.52607955))
       + b3(vec3(3.90307140,3.21182957,3.96587128)*(x-vec3(0.11748627,0.86755042,0.66077860)), vec3(0.84897130,0.88445281,0.73949448));
}
void main(){
  vec2 uv = gl_FragCoord.xy / uRes; uv.y = 1. - uv.y;
  vec4 s = texture2D(uD, uv);
  float cov = s.g;
  if (cov < .01 || uAmt < .001) { gl_FragColor = vec4(0.); return; }
  float d = s.r * 64. / uPx;
  float RW = uRW;
  if (d > RW) { gl_FragColor = vec4(0.); return; }
  float f0 = d / RW;
  float lip  = exp(-pow((f0 - .12) / .1, 2.));         // crisp polished lip just inside the edge
  float grad = max(lip, pow(1. - f0, 1.8) * .9);        // then a soft fade inward into the black

  // which way the edge faces, from the distance field
  vec2 e = vec2(2. / 1024., 0.);
  vec2 gr = vec2(texture2D(uD, uv + e.xy).r - texture2D(uD, uv - e.xy).r,
                 texture2D(uD, uv + e.yx).r - texture2D(uD, uv - e.yx).r);
  vec2 nOut = length(gr) > 1e-5 ? -normalize(gr) : vec2(0., -1.);
  float th = f0 * 1.5708;
  vec3 n3 = normalize(vec3(nOut * cos(th), sin(th) + .2));

  // liquid metal: flowing silver reflections with spectral flecks where the highlights break
  float t = uT;
  vec2 p = uv * 2.6;
  vec2 q = vec2(fbm(p + vec2(0., t*.16)), fbm(p + vec2(5.2,1.3) - t*.12));
  float v = fbm(p + 2.6*q + vec2(t*.09, -t*.07));

  vec2 P = vec2(107., 58.) + uv * 650.;
  vec3 Ld = normalize(vec3(uL - P, 170.));
  float face = pow(max(dot(n3, Ld), 0.), 3.);
  float near = exp(-length(P - uL) / 230.);
  float light = clamp(face * near * 1.6, 0., 1.);
  float vv = v + light * .18;                          // the light pushes the metal through its colours

  vec3 metal = mix(vec3(.45,.46,.49), vec3(1.), smoothstep(.30, .58, vv));
  metal += vec3(.6) * smoothstep(.025, 0., abs(vv - .58));
  float fl = smoothstep(.08, 0., abs(vv - .70));
  metal = mix(metal, spectral(clamp((vv - .64) / .12, 0., 1.)) * 1.6, clamp(fl * uIri, 0., 1.));
  metal *= uBright;

  metal *= mix(.6, 1., smoothstep(0., .06, f0));        // keep the silhouette crisp against the white
  float lit = clamp(uAmb + light, 0., 1.);
  float a = grad * lit * uAmt * sqrt(cov);
  gl_FragColor = vec4(min(metal, vec3(1.)) * a, a);
}`;
    const sh = (type, src) => { const o = gl.createShader(type); gl.shaderSource(o, src); gl.compileShader(o);
      if (!gl.getShaderParameter(o, gl.COMPILE_STATUS)) console.error(gl.getShaderInfoLog(o)); return o; };
    const pr = gl.createProgram();
    gl.attachShader(pr, sh(gl.VERTEX_SHADER, vs)); gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, fs));
    gl.linkProgram(pr); gl.useProgram(pr);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(pr, 'p'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    gl.bindTexture(gl.TEXTURE_2D, gl.createTexture());
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, N, N, 0, gl.RGBA, gl.UNSIGNED_BYTE, tex);
    [gl.TEXTURE_MIN_FILTER, gl.TEXTURE_MAG_FILTER].forEach(p => gl.texParameteri(gl.TEXTURE_2D, p, gl.LINEAR));
    [gl.TEXTURE_WRAP_S, gl.TEXTURE_WRAP_T].forEach(p => gl.texParameteri(gl.TEXTURE_2D, p, gl.CLAMP_TO_EDGE));
    const u = n => gl.getUniformLocation(pr, n);
    gl.uniform1f(u('uPx'), k);
    U = { res: u('uRes'), t: u('uT'), amt: u('uAmt'), amb: u('uAmb'), L: u('uL'), rw: u('uRW'), br: u('uBright'), iri: u('uIri') };
  }
  function resize() {
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const w = Math.round(canvas.clientWidth * dpr), h = Math.round(canvas.clientHeight * dpr);
    if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; gl.viewport(0, 0, w, h); }
    gl.uniform2f(U.res, w, h);
  }

  let flowT = 0, lastG = 0;
  function render(g) {
    const t = ((g % L) + L) % L;
    const inOrb = t >= ORB.in0 && t < ORB.end;
    const before = t < UNP[0];
    const fade = 1 - prog(t, FADE[0], FADE[1]);
    $i('balls').style.opacity = fade.toFixed(3);
    balls.forEach(el => el.style.display = inOrb ? 'none' : '');
    orbG.style.display = inOrb ? '' : 'none';
    if (inOrb) {
      const ds = orbDots(t);
      ds.map((d, i) => [d, i]).sort((a, b) => a[0].z - b[0].z).forEach(([d, i]) => {
        const el = orbEls[i]; orbG.appendChild(el);
        el.setAttribute('cx', d.x); el.setAttribute('cy', d.y); el.setAttribute('r', Math.max(0, d.r));
        const c = INK.map((v, j) => Math.round(lerp(v, SKY[j], d.blue)));
        el.setAttribute('fill', `rgb(${c})`); el.setAttribute('opacity', cl(d.op).toFixed(3));
      });
    }
    for (let i = 0; i < 3 && !before; i++) {
      const b = brush(t, i);
      if (b.ball) {
        setRect(balls[i], b.x, b.y, 0, 2*R, 2*R, R);
        setRect(lines[i], 0, 0, 0, 0, 0, 0);
      } else {
        // ball flattens into a thin, flat line the width of the stroke
        const w = lerp(2*R, b.len, b.k), h = lerp(2*R, 3, b.k), rx = (h / 2) * (1 - b.k);
        if (b.k < 1) { setRect(balls[i], b.x, b.y, b.ang, w, h, rx); setRect(lines[i], 0, 0, 0, 0, 0, 0); }
        else         { setRect(lines[i], b.x, b.y, b.ang, w, h, 0);  setRect(balls[i], 0, 0, 0, 0, 0, 0); }
      }
    }
    if (before) {
      lines.forEach(el => setRect(el, 0, 0, 0, 0, 0, 0));
      balls.forEach(el => setRect(el, 0, 0, 0, 0, 0, 0));
      drawInG.style.display = '';
      const ds = drawState(t);
      frontEl.setAttribute('height', ds.front);
      wedgeA.setAttribute('d', ds.wedgeA); wedgeB.setAttribute('d', ds.wedgeB);
      mBar.setAttribute('d', 'M0 0Z'); mStem.setAttribute('d', 'M0 0Z');
      B1.el.setAttribute('stroke-dasharray', `0 ${B1.len + 400}`);
      B2.el.setAttribute('stroke-dasharray', `0 ${B2.len + 400}`);
    } else {
      drawInG.style.display = 'none';
      const rv = reveals(t);
      mBar.setAttribute('d', rv.bar || 'M0 0Z');
      mStem.setAttribute('d', rv.stem || 'M0 0Z');
      B1.el.setAttribute('stroke-dasharray', `${rv.b1} ${B1.len + 400}`);
      B2.el.setAttribute('stroke-dasharray', `${rv.b2} ${B2.len + 400}`);
    }

    const sh = inOut(prog(t, GLOW[0] - 0.1, GLOW[0] + 0.9)) * (1 - inOut(prog(t, UNP[0] - 0.6, UNP[0])));
    shadowEl.setAttribute('opacity', (sh * CFG.shadow * 0.6).toFixed(3));
    if (gl) {
      const amt = (t < GLOW[0] ? 0 : 1) * (1 - inOut(prog(t, GLOW[1] - 0.5, GLOW[1])));
      // the light glides above the mark in an S: in from the top, swings left, crosses, swings right, out the bottom
      const u = inOut(prog(t, GLOW[0], GLOW[0] + LIGHT));
      const lx = 432 - 270 * Math.sin(TAU * u), ly = lerp(-40, 800, u);
      const amb = 1.0 * inOut(prog(t, GLOW[0] + 0.2, GLOW[0] + LIGHT * 0.6));
      resize();
      gl.uniform1f(U.rw, CFG.edgeWidth); gl.uniform1f(U.br, CFG.metal); gl.uniform1f(U.iri, CFG.iridescence);
      flowT += (g - lastG) * CFG.flow; lastG = g;
      gl.uniform1f(U.t, flowT); gl.uniform1f(U.amt, amt); gl.uniform1f(U.amb, amb); gl.uniform2f(U.L, lx, ly);
      gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }
  }

  // window: loop only part of the timeline (named phases), or the whole thing
  const T={draw:[0,DRAW1+0.5],hold:[DRAW1-0.1,UNP[0]],retract:[UNP[0]-0.2,RET1+0.6],spin:[RET1,ORB.in0+0.2],form:[ORB.in0-0.1,ORB.t0+0.2],rubik:[ORB.t0,ORB.tR],turn:[ORB.show.spin[0]-0.1,ORB.show.spin[1]+0.1],flat:[ORB.show.flat[0]-0.1,ORB.show.flat[3]+0.1],tumble:[ORB.show.weave[0]-0.1,ORB.show.weave[1]+0.1],back:[ORB.t1-0.1,ORB.end+0.6],all:[0,L]};
  const w=T[opts.phase||'all'];const span=w[1]-w[0],pad=opts.phase&&opts.phase!=='all'?0.5:0;
  let st=null;
  return {T,L,render,start(){const f=now=>{if(!root.isConnected)return;if(st===null)st=now;if(root.__vis!==false){const e=((now-st)/1000)%(span+pad);render(w[0]+Math.min(span,e))}requestAnimationFrame(f)};requestAnimationFrame(f)}};
}
