/* LE deck engine. Plain script: defines window.DECK.
   Slides are 1920x1080 canvases that follow the Leonardo 3.0 rules (BRAND-BRIEF.md): white is the default field,
   the headline stands alone (no eyebrow above it, no subcopy under it), one large visual per slide (an illustration
   from assets/illus/ when the file exists, else a diagram drawn here), at most three short lines, the lockup on
   every slide. Season for headlines, Macan for everything else. Loads after js/templates.js and reuses
   window.TPL_HELPERS (logo, mark, cover, PAL). */
(function () {
  'use strict';

  var TH = window.TPL_HELPERS || {};
  var PAL = TH.PAL || { yellow: '#FFD96F', blue: '#80ACED', slate: '#869AA6', beige: '#F3F1E6', tan: '#EBD4B5', paper: '#F9F8F3', ink: '#010101', neutral: '#222222', white: '#ffffff' };
  var BLUE = '#80ACED';                      /* the brand blue; the only accent in assets */
  var DARK = { blue: 1, slate: 1, ink: 1, neutral: 1 };
  var W0 = 1920, H0 = 1080;

  function fieldHex(name, pal) { if (name === 'white') return '#ffffff'; return (pal && pal[name]) || PAL[name] || name || '#ffffff'; }
  function isDark(name) { return !!DARK[name]; }
  function inkFor(name) { return isDark(name) ? PAL.white : PAL.ink; }
  function dimFor(name) { return isDark(name) ? 'rgba(255,255,255,.72)' : 'rgba(1,1,1,.58)'; }
  /* the one coloured phrase: brand blue #80ACED on every field (never the UI blue) */
  function accentFor(name) { return BLUE; }

  /* ---------- type ---------- */
  var DISPLAY = '"Season Mix", "Season", Georgia, serif', TEXT = 'Macan, sans-serif';
  function font(x, kind, px) {
    px = Math.round(px);
    if (kind === 'display') { x.font = '500 ' + px + 'px ' + DISPLAY; x.letterSpacing = (-.022 * px).toFixed(2) + 'px'; }
    else { x.font = (kind === 'text600' ? 600 : kind === 'text500' ? 500 : 400) + ' ' + px + 'px ' + TEXT; x.letterSpacing = (kind === 'text600' ? -.01 * px : 0).toFixed(2) + 'px'; }
    return px;
  }
  function plain(s) { return String(s || '').replace(/[\[\]]/g, ''); }
  function mw(x, s) { return x.measureText(plain(s)).width; }
  function wrap(x, text, maxW) {
    var out = [];
    String(text || '').split(/\n/).forEach(function (para) {
      var words = para.trim().split(/\s+/).filter(Boolean), line = '';
      words.forEach(function (w) {
        var t = line ? line + ' ' + w : w;
        if (line && mw(x, t) > maxW) { out.push(line); line = w; } else line = t;
      });
      if (line) out.push(line);
    });
    if (out.length > 1) {
      var last = out[out.length - 1], prev = out[out.length - 2].split(' ');
      if (last.split(' ').length === 1 && prev.length > 2 && plain(last).length < 12) {
        var moved = prev.pop(); if (mw(x, moved + ' ' + last) <= maxW) { out[out.length - 1] = moved + ' ' + last; out[out.length - 2] = prev.join(' '); }
        else prev.push(moved);
      }
    }
    return out;
  }
  function rag(x, lines) {
    var ws = lines.map(function (l) { return mw(x, l); }), m = Math.max.apply(null, ws);
    return ws.reduce(function (a, w) { return a + (m - w) * (m - w); }, 0);
  }
  function balance(x, text, maxW, lines) {
    var n = lines.length; if (n < 2) return lines;
    var best = lines, bestRag = rag(x, lines);
    for (var w = maxW * .97; w >= maxW * .45; w -= maxW * .02) {
      var l = wrap(x, text, w); if (l.length !== n) { if (l.length > n) break; continue; }
      var r = rag(x, l); if (r < bestRag) { bestRag = r; best = l; }
    }
    return best;
  }
  function capOf(x) { var m = x.measureText('H'); return m.actualBoundingBoxAscent || 0; }
  /* largest size (start -> min) whose wrapped block fits maxW x maxH and maxLines */
  function fit(x, text, kind, maxW, maxH, start, min, lh, maxLines, bal) {
    var px = start, r, extra = 0; if (bal == null) bal = kind === 'display';
    if (kind === 'display') { var nw = plain(text).split(/\s+/).filter(Boolean).length; maxLines = Math.min(maxLines || 99, Math.max(2, Math.ceil(nw / 2))); }
    for (; ;) {
      font(x, kind, px);
      var lines = wrap(x, text, maxW), cap = capOf(x), line = px * lh;
      if (bal) lines = balance(x, text, maxW, lines);
      var h = (lines.length - 1) * line + cap, wide = lines.some(function (l) { return mw(x, l) > maxW; });
      r = { px: px, lines: lines, lineH: line, cap: cap, h: h, w: Math.max.apply(null, lines.map(function (l) { return mw(x, l); })) };
      var ok = h <= maxH && !wide && (!maxLines || lines.length <= maxLines);
      if (ok && bal && kind === 'display' && lines.length >= 3 && extra < 3) { var ws = lines.map(function (l) { return mw(x, l); }), mx = Math.max.apply(null, ws); if (Math.min.apply(null, ws) < mx * .55) { extra++; ok = false; } }
      if (ok || px <= min) break;
      px = Math.max(min, Math.round(px * .94));
    }
    return r;
  }
  function rich(x, line, X, Y, align, ink, accent) {
    var parts = String(line).split(/(\[[^\]]+\])/).filter(Boolean);
    var widths = parts.map(function (p) { return x.measureText(plain(p)).width; });
    var tw = widths.reduce(function (a, b) { return a + b; }, 0);
    var cx = align === 'center' ? X - tw / 2 : align === 'right' ? X - tw : X;
    x.textAlign = 'left'; x.textBaseline = 'alphabetic';
    parts.forEach(function (p, i) { x.fillStyle = p.charAt(0) === '[' ? (accent || BLUE) : ink; x.fillText(plain(p), cx, Y); cx += widths[i]; });
  }
  /* a [blue phrase] may wrap: close the bracket at the end of a line and reopen it on the next */
  function bracketLines(lines) {
    var open = false;
    return lines.map(function (l) {
      var s = open ? '[' + l : l, o = open;
      for (var i = 0; i < l.length; i++) { if (l[i] === '[') o = true; else if (l[i] === ']') o = false; }
      if (o) s += ']';
      open = o; return s;
    });
  }
  function block(x, r, X, Y, align, ink, accent) {
    var y = Y + r.cap;
    bracketLines(r.lines).forEach(function (l) { rich(x, l, X, y, align, ink, accent); y += r.lineH; });
    return Y + r.h;
  }

  /* ---------- helpers ---------- */
  function fill(x, W, H, hex) { x.fillStyle = hex; x.fillRect(0, 0, W, H); }
  function grain(x, W, H, a) {
    var step = 2, n = Math.floor(W * H / (step * step) * .08);
    x.save(); x.globalAlpha = a; x.fillStyle = '#000';
    for (var i = 0; i < n; i++) { x.fillRect((Math.random() * W) | 0, (Math.random() * H) | 0, step, step); }
    x.restore();
  }
  function contain(x, img, X, Y, w, h) {
    var iw = img.naturalWidth || img.width, ih = img.naturalHeight || img.height;
    var s = Math.min(w / iw, h / ih), dw = iw * s, dh = ih * s, dx = X + (w - dw) / 2, dy = Y + (h - dh) / 2;
    x.drawImage(img, dx, dy, dw, dh); return { x: dx, y: dy, w: dw, h: dh };
  }
  function roundRectP(x, X, Y, w, h, r) {
    r = Math.min(r, w / 2, h / 2);
    x.beginPath(); x.moveTo(X + r, Y); x.arcTo(X + w, Y, X + w, Y + h, r); x.arcTo(X + w, Y + h, X, Y + h, r);
    x.arcTo(X, Y + h, X, Y, r); x.arcTo(X, Y, X + w, Y, r); x.closePath();
  }
  function H_(h) {
    /* the helpers object templates get, with TPL_HELPERS as the fallback */
    return {
      A: h && h.A || function () { return null; },
      byGroup: h && h.byGroup || function () { return []; },
      loadImg: h && h.loadImg || function (src) { return new Promise(function (res, rej) { var i = new Image(); i.onload = function () { res(i); }; i.onerror = rej; i.src = src; }); },
      PAL: h && h.PAL || PAL,
      logo: h && h.logo || TH.logo, mark: h && h.mark || TH.mark, cover: h && h.cover || TH.cover,
      roundRect: h && h.roundRect || roundRectP
    };
  }
  async function loadAsset(h, id, fallbackGroup) {
    var a = id && h.A(id);
    if (!a && fallbackGroup) a = h.byGroup(fallbackGroup)[0];
    if (!a) return null;
    try { return await h.loadImg(a.src); } catch (e) { return null; }
  }
  /* an illustration generated outside (assets/illus/<file>); null when the file is not there yet */
  var illusCache = {};
  async function loadIllus(h, file) {
    file = String(file || '').trim(); if (!file) return null;
    if (illusCache[file] !== undefined) return illusCache[file];
    var img = null;
    try { img = await h.loadImg('assets/illus/' + file); } catch (e) { img = null; }
    illusCache[file] = img; return img;
  }
  function get(d, k, def) { var v = d && d[k]; if (v == null) return def; v = String(v).trim(); return v === '' ? def : v; }
  function norm(s) { return String(s || '').toLowerCase().replace(/\(.*?\)/g, '').replace(/[^a-z0-9]+/g, ' ').trim(); }
  /* find an org asset by id, title or a loose name ("Meta", "HBS", "Stanford GSB") */
  function findOrg(h, name) {
    var orgs = h.byGroup('org'), q = norm(name); if (!q) return null;
    var byId = h.A(name); if (byId && byId.group === 'org') return byId;
    var ALIAS = { hbs: 'harvard business school', gsb: 'stanford university graduate school of business', 'stanford gsb': 'stanford university graduate school of business', meta: 'meta', facebook: 'meta', goldman: 'goldman sachs', bcg: 'boston consulting group', aws: 'amazon aws', wharton: 'the wharton school', a16z: 'andreessen horowitz', block: 'square block', square: 'square block' };
    if (ALIAS[q]) q = ALIAS[q];
    var exact = null, starts = null, contains = null;
    orgs.forEach(function (a) {
      var t = norm(a.title), full = norm(String(a.title)), tags = (a.tags || []).map(norm);
      if (!exact && (t === q || full === q || tags.indexOf(q) >= 0)) exact = a;
      else if (!starts && t.indexOf(q) === 0) starts = a;
      else if (!contains && (t.indexOf(q) >= 0 || tags.some(function (g) { return g === q; }))) contains = a;
    });
    return exact || starts || contains;
  }

  /* ---------- layout constants (1920x1080) ---------- */
  var PAD = Math.round(.08 * W0);           /* 154: the 8% margin */
  var PADY = Math.round(.08 * H0) + 18;     /* 104 */
  var CW = W0 - 2 * PAD;                    /* 1612 */
  var LOCK = 44;                             /* lockup height on content slides */
  var PAGE_PX = 24;                          /* page number, Macan 500 */
  var BODY_MIN = 28;                         /* body text never below 28px at 1920 */
  var FOOT_Y = H0 - PADY - LOCK;             /* top of the foot row */
  var HEAD_PX = 88;                          /* Season headline */
  var BODY = 34, SMALL = 24, SUB = 40;       /* Macan body, Macan small labels, Season sub-titles */
  var VISUAL = { area: 0 };                  /* the last slide's visual share, read by the render harness */

  /* lockup bottom-left, page number bottom-right; returns the y content must stay above */
  function foot(x, h, color, page, opts) {
    opts = opts || {};
    if (opts.mark) h.mark(x, PAD, FOOT_Y, LOCK, isDark(color) ? 'white' : 'ink');
    else h.logo(x, PAD, FOOT_Y, LOCK, isDark(color) ? 'white' : 'ink');
    if (page) {
      font(x, 'text500', PAGE_PX); x.fillStyle = isDark(color) ? 'rgba(255,255,255,.72)' : 'rgba(1,1,1,.55)';
      x.textAlign = 'right'; x.textBaseline = 'alphabetic';
      x.fillText(String(page), W0 - PAD, FOOT_Y + LOCK - 8);
      x.textAlign = 'left';
    }
    return FOOT_Y - 64;
  }
  function pageOf(slide) { return slide && slide.page ? slide.page : (slide && slide.index ? slide.index + 1 : 0); }
  function pad2(n) { return (n < 10 ? '0' : '') + n; }
  function splitLines(s) { return String(s || '').split(/\n/).map(function (l) { return l.trim(); }).filter(Boolean); }
  function bodyFor(c) { return isDark(c) ? 'rgba(255,255,255,.86)' : PAL.neutral; }
  function hairFor(c) { return isDark(c) ? 'rgba(255,255,255,.32)' : 'rgba(1,1,1,.16)'; }
  function lineFor(c) { return isDark(c) ? 'rgba(255,255,255,.7)' : 'rgba(1,1,1,.6)'; }
  function hair(x, c, X, Y, w) { x.fillStyle = hairFor(c); x.fillRect(X, Y, w, 2); }
  /* a small label in Macan 500 at SMALL; Y is the baseline */
  function label(x, s, X, Y, c, align, color) {
    font(x, 'text500', SMALL); x.fillStyle = color || dimFor(c); x.textAlign = align || 'left'; x.textBaseline = 'alphabetic';
    x.fillText(String(s), X, Y); var w = x.measureText(String(s)).width; x.textAlign = 'left'; return w;
  }
  /* the headline alone at the top of a content slide (no eyebrow, no subcopy); returns where the content starts and must end */
  function head(x, d, c, h, slide, o) {
    o = o || {};
    var ink = inkFor(c), acc = accentFor(c), title = get(d, 'title', '');
    var bottom = foot(x, h, c, pageOf(slide)), y = PADY;
    var maxW = o.maxW || CW * .94, px = o.px || HEAD_PX;
    var hr = fit(x, title, 'display', maxW, o.maxH || 230, px, Math.min(px, o.oneMin || 72), 1.0, 1);
    if (hr.lines.length > 1 || hr.w > maxW) hr = fit(x, title, 'display', maxW, o.maxH || 230, px, 56, 1.0, o.lines || 2);
    font(x, 'display', hr.px); y = block(x, hr, PAD, y, 'left', ink, acc);
    y += (o.gap == null ? 80 : o.gap);
    VISUAL.content = { x: PAD, y: y, w: CW, h: bottom - y };
    return { y: y, bottom: bottom, hr: hr };
  }
  /* "**Lead.** rest of the line": bold lead in ink, the rest in the body colour, wrapped as one paragraph */
  function segs(s) {
    var out = [];
    String(s || '').split(/(\*\*[^*]+\*\*)/).forEach(function (p) { if (!p) return; out.push(/^\*\*/.test(p) ? { t: p.slice(2, -2), b: true } : { t: p, b: false }); });
    return out;
  }
  function mixedLines(x, s, px, maxW) {
    var words = [];
    segs(s).forEach(function (sg) { sg.t.split(/\s+/).filter(Boolean).forEach(function (w) { if (/^[.,;:!?]+$/.test(w) && words.length) words[words.length - 1].w += w; else words.push({ w: w, b: sg.b }); }); });
    font(x, 'text400', px); var sp = x.measureText(' ').width, lines = [], line = [], lw = 0;
    words.forEach(function (t) {
      font(x, t.b ? 'text600' : 'text400', px); var w = x.measureText(t.w).width;
      if (line.length && lw + sp + w > maxW) { lines.push(line); line = []; lw = 0; }
      line.push(t); lw += (line.length > 1 ? sp : 0) + w;
    });
    if (line.length) lines.push(line);
    return lines;
  }
  function mixedH(x, s, px, maxW, lh) { var n = mixedLines(x, s, px, maxW).length; font(x, 'text400', px); return (n - 1) * px * (lh || 1.35) + capOf(x); }
  function mixed(x, s, X, Y, px, maxW, lh, ink, body) {
    lh = lh || 1.35;
    var lines = mixedLines(x, s, px, maxW); font(x, 'text400', px); var cap = capOf(x), sp = x.measureText(' ').width, y = Y + cap;
    x.textAlign = 'left'; x.textBaseline = 'alphabetic';
    lines.forEach(function (line) {
      var cx = X;
      line.forEach(function (t) { font(x, t.b ? 'text600' : 'text400', px); x.fillStyle = t.b ? ink : body; x.fillText(t.w, cx, y); cx += x.measureText(t.w).width + sp; });
      y += px * lh;
    });
    return Y + (lines.length - 1) * px * lh + cap;
  }
  /* up to three lines, a hairline between them, one body size; returns the bottom */
  function linesDraw(x, items, X, Y, w, c, px) {
    px = px || BODY; var y = Y, ink = inkFor(c), body = bodyFor(c);
    items.forEach(function (s, i) { if (i) { hair(x, c, X, y - 26, w); } y = mixed(x, s, X, y, px, w, 1.35, ink, body) + 54; });
    return y - 54;
  }
  function linesH(x, items, w, px) { px = px || BODY; return items.reduce(function (a, s, i) { return a + mixedH(x, s, px, w) + (i ? 54 : 0); }, 0); }
  function tightRect(x, X, Y, w, h, c, dashed) {
    x.save(); x.strokeStyle = lineFor(c); x.lineWidth = 2; if (dashed) x.setLineDash([12, 10]);
    x.strokeRect(X + 1, Y + 1, w - 2, h - 2); x.restore();
  }
  function visual(r) { var cA = VISUAL.content ? VISUAL.content.w * VISUAL.content.h : W0 * H0; VISUAL.area = r ? Math.min(1, (r.w * r.h) / cA) : 0; VISUAL.rect = r; }

  /* ---------- drawn placeholders for an illustration that is not generated yet ----------
     Flat, two colours (ink lines, brand blue fills), no text. Each takes the box it must fill. */
  var PH = {};
  /* stacked layers: n bars, the bottom one filled blue */
  PH.layers = function (x, r, c, n) {
    n = n || 5; var gap = Math.round(r.h * .04), bh = (r.h - gap * (n - 1)) / n, step = r.w * .09;
    for (var i = 0; i < n; i++) {
      var k = n - 1 - i, w = r.w - step * k, X = r.x + (r.w - w) / 2, Y = r.y + i * (bh + gap);
      if (i === n - 1) { x.fillStyle = BLUE; x.fillRect(X, Y, w, bh); } else tightRect(x, X, Y, w, bh, c);
    }
  };
  /* a 3x2 grid of hairline circles, one filled blue */
  PH.grid = function (x, r, c) {
    var cols = 3, rows = 2, d = Math.min((r.w - 48 * (cols - 1)) / cols, (r.h - 48 * (rows - 1)) / rows), gx = (r.w - d * cols) / (cols - 1), gy = (r.h - d * rows) / (rows - 1);
    for (var i = 0; i < cols * rows; i++) {
      var cx = r.x + (i % cols) * (d + gx) + d / 2, cy = r.y + Math.floor(i / cols) * (d + gy) + d / 2;
      x.beginPath(); x.arc(cx, cy, d / 2 - 1, 0, Math.PI * 2);
      if (i === 4) { x.fillStyle = BLUE; x.fill(); } else { x.strokeStyle = lineFor(c); x.lineWidth = 2; x.stroke(); }
    }
  };
  /* ascending bars, the last one blue */
  PH.rise = function (x, r, c, n) {
    n = n || 5; var gap = r.w * .06, bw = (r.w - gap * (n - 1)) / n;
    for (var i = 0; i < n; i++) { var bh = r.h * (.3 + .7 * i / (n - 1)), X = r.x + i * (bw + gap), Y = r.y + r.h - bh; if (i === n - 1) { x.fillStyle = BLUE; x.fillRect(X, Y, bw, bh); } else tightRect(x, X, Y, bw, bh, c); }
  };
  /* concentric rings, the centre blue */
  PH.rings = function (x, r, c) {
    var cx = r.x + r.w / 2, cy = r.y + r.h / 2, R = Math.min(r.w, r.h) / 2, n = 4;
    for (var i = n; i >= 1; i--) { x.beginPath(); x.arc(cx, cy, R * i / n, 0, Math.PI * 2); if (i === 1) { x.fillStyle = BLUE; x.fill(); } else { x.strokeStyle = lineFor(c); x.lineWidth = 2; x.stroke(); } }
  };
  /* an arrow rising out of a baseline: the sprint */
  PH.launch = function (x, r, c) {
    var bx = r.x + r.w * .12, by = r.y + r.h * .9, tx = r.x + r.w * .82, ty = r.y + r.h * .12;
    x.save(); x.strokeStyle = lineFor(c); x.lineWidth = 3;
    x.beginPath(); x.moveTo(r.x, by); x.lineTo(r.x + r.w, by); x.stroke();
    for (var i = 0; i < 3; i++) { x.beginPath(); x.moveTo(bx + i * r.w * .14, by); x.lineTo(bx + i * r.w * .14, by - r.h * (.18 + i * .12)); x.stroke(); }
    x.fillStyle = BLUE; x.beginPath(); x.moveTo(bx + r.w * .42, by); x.lineTo(tx, ty); x.lineTo(tx, ty + r.h * .22); x.lineTo(tx - r.w * .16, ty); x.closePath(); x.fill();
    x.restore();
  };
  /* two bars, one clearing a band */
  PH.bars = function (x, r, c) { PH.rise(x, r, c, 3); };
  /* draw an illustration (assets/illus/<file>), else a library illustration (asset id), else a placeholder; returns the drawn rect */
  async function drawVisual(x, h, d, c, box, phName, phArg) {
    var img = await loadIllus(h, get(d, 'illus', ''));
    if (!img && get(d, 'ill', '')) img = await loadAsset(h, get(d, 'ill', ''));
    if (img) return contain(x, img, box.x, box.y, box.w, box.h);
    (PH[phName] || PH.layers)(x, box, c, phArg); return box;
  }

  /* ---------- slide kinds ---------- */
  var K = {};
  var FIELDS = ['white', 'beige', 'paper'];
  var ILLUS = { key: 'illus', label: 'Illustration file (assets/illus/)', type: 'text', max: 60, optional: true };
  var ILL = { key: 'ill', label: 'Library illustration', type: 'asset', groups: ['illustration'], optional: true };

  K.cover = {
    name: 'Cover',
    fields: [
      { key: 'title', label: 'Title', type: 'text', max: 70 },
      { key: 'meta', label: 'Date or audience', type: 'text', max: 60, optional: true },
      ILLUS, ILL,
      { key: 'photo', label: 'Photo (instead of a field)', type: 'asset', groups: ['background', 'photo'], optional: true },
      { key: 'color', label: 'Field', type: 'color', options: ['ink', 'white', 'blue', 'beige'] }
    ],
    defaults: { title: 'The AI Builder Program', meta: '', illus: '', ill: '', photo: '', color: 'ink' },
    render: async function (x, d, h, slide) {
      var c = get(d, 'color', 'ink'), ink = inkFor(c), acc = accentFor(c), dim = dimFor(c);
      var img = get(d, 'photo', '') ? await loadAsset(h, get(d, 'photo', '')) : null;
      fill(x, W0, H0, fieldHex(c, h.PAL));
      if (img) {
        h.cover(x, img, 0, 0, W0, H0, .5, .5);
        x.fillStyle = 'rgba(0,0,0,.22)'; x.fillRect(0, 0, W0, H0);
        ink = PAL.white; dim = 'rgba(255,255,255,.82)'; c = 'ink';
      }
      var title = get(d, 'title', ''), meta = get(d, 'meta', '');
      var lockH = 64, top = PADY, bottom = H0 - PADY - lockH - 72;
      var art = img ? null : await loadIllus(h, get(d, 'illus', ''));
      if (!art && !img && get(d, 'ill', '')) art = await loadAsset(h, get(d, 'ill', ''));
      var textW = art ? CW * .5 : CW * .82;
      var hr = fit(x, title, 'display', textW, (bottom - top) * .9, art ? 132 : 168, 72, .98, 3);
      var y = top + Math.max(0, (bottom - top - hr.h)) * .5;
      font(x, 'display', hr.px); block(x, hr, PAD, y, 'left', ink, acc);
      if (art) { var box = { x: PAD + textW + 72, y: PADY, w: W0 - PAD - (PAD + textW + 72), h: H0 - 2 * PADY }; visual(contain(x, art, box.x, box.y, box.w, box.h)); } else visual(null);
      h.logo(x, PAD, H0 - PADY - lockH, lockH, isDark(c) ? 'white' : 'ink');
      if (meta) { font(x, 'text500', 28); x.fillStyle = dim; x.textAlign = 'right'; x.textBaseline = 'alphabetic'; x.fillText(meta, W0 - PAD, H0 - PADY - 14); x.textAlign = 'left'; }
    }
  };

  K.section = {
    name: 'Section',
    fields: [
      { key: 'title', label: 'Title', type: 'text', max: 70 },
      { key: 'num', label: 'Number', type: 'text', max: 4, optional: true },
      { key: 'color', label: 'Field', type: 'color', options: ['white', 'beige', 'blue', 'slate', 'ink'] }
    ],
    defaults: { title: 'How the program works', num: '', color: 'white' },
    render: async function (x, d, h, slide) {
      var c = get(d, 'color', 'white'), ink = inkFor(c), acc = accentFor(c);
      fill(x, W0, H0, fieldHex(c, h.PAL));
      var title = get(d, 'title', ''), num = get(d, 'num', '');
      var top = PADY, bottom = foot(x, h, c, pageOf(slide));
      var numH = num ? 60 : 0;
      var hr = fit(x, title, 'display', CW * .8, (bottom - top - numH) * .85, 150, 64, .98, 3);
      var y = top + (bottom - top - numH - hr.h) / 2;
      if (num) { font(x, 'text500', 30); x.fillStyle = dimFor(c); x.textBaseline = 'alphabetic'; x.fillText(num, PAD, y + 26); y += numH; }
      font(x, 'display', hr.px); block(x, hr, PAD, y, 'left', ink, acc);
      visual(null);
    }
  };

  K.bullets = {
    name: 'Bullets',
    fields: [
      { key: 'title', label: 'Title', type: 'text', max: 70 },
      { key: 'b1', label: 'Point 1', type: 'text', max: 140 },
      { key: 'b2', label: 'Point 2', type: 'text', max: 140, optional: true },
      { key: 'b3', label: 'Point 3', type: 'text', max: 140, optional: true },
      { key: 'color', label: 'Field', type: 'color', options: FIELDS }
    ],
    defaults: { title: 'What you will build', b1: '', b2: '', b3: '', color: 'white' },
    render: async function (x, d, h, slide) {
      var c = get(d, 'color', 'white'), ink = inkFor(c), acc = accentFor(c);
      fill(x, W0, H0, fieldHex(c, h.PAL));
      var title = get(d, 'title', ''), items = [1, 2, 3, 4, 5].map(function (i) { return get(d, 'b' + i, ''); }).filter(Boolean).slice(0, 3);
      var top = PADY, bottom = foot(x, h, c, pageOf(slide));
      var colW = Math.round(CW * .4), listX = PAD + colW + 72, listW = W0 - PAD - listX;
      var hr = fit(x, title, 'display', colW, bottom - top, HEAD_PX, 48, 1.0, 4);
      font(x, 'display', hr.px); block(x, hr, PAD, top, 'left', ink, acc);
      var px = items.length <= 2 ? 60 : 52, rs, gapB, listH, dot, indent, y;
      for (; ;) {
        font(x, 'text400', px); gapB = Math.round(px * .75); dot = Math.round(px * .28); indent = Math.round(px * 1.1);
        rs = items.map(function (t) { return fit(x, t, 'text400', listW - indent, 9999, px, px, 1.3, 0, true); });
        listH = rs.reduce(function (a, r) { return a + r.h; }, 0) + gapB * (items.length - 1);
        y = top + Math.max(0, hr.cap - (rs[0] ? rs[0].cap : 0));
        if (listH <= bottom - y || px <= BODY_MIN) break;
        px -= 2;
      }
      rs.forEach(function (r) {
        font(x, 'text400', r.px);
        x.fillStyle = ink;
        x.beginPath(); x.arc(listX + dot / 2, y + r.cap / 2 + 1, dot / 2, 0, Math.PI * 2); x.fill();
        y = block(x, r, listX + indent, y, 'left', ink, acc) + gapB;
      });
      visual(null);
    }
  };

  K.stat = {
    name: 'Stat',
    fields: [
      { key: 'number', label: 'Number', type: 'text', max: 10 },
      { key: 'label', label: 'What it means', type: 'text', max: 110 },
      { key: 'source', label: 'Source', type: 'text', max: 70, optional: true },
      { key: 'color', label: 'Field', type: 'color', options: ['white', 'blue', 'ink', 'slate'] }
    ],
    defaults: { number: '33', label: 'people on the ASU+GSV Summit team went through the AI Builder Program.', source: '', color: 'white' },
    render: async function (x, d, h, slide) {
      var c = get(d, 'color', 'white'), ink = inkFor(c), dim = dimFor(c);
      fill(x, W0, H0, fieldHex(c, h.PAL));
      var num = get(d, 'number', ''), lab = get(d, 'label', ''), src = get(d, 'source', '');
      var top = PADY, bottom = foot(x, h, c, pageOf(slide)) - (src ? 48 : 0);
      var nr = fit(x, num, 'display', CW * .6, bottom - top, 520, 160, .9, 1);
      var labelX = PAD + Math.max(nr.w, CW * .3) + 80, labelW = W0 - PAD - labelX;
      var lr = fit(x, lab, 'text500', labelW, bottom - top, 56, BODY_MIN, 1.22, 5, true);
      var ny = top + (bottom - top - nr.h) / 2;
      font(x, 'display', nr.px); block(x, nr, PAD - nr.px * .02, ny, 'left', ink);
      font(x, 'text500', lr.px); block(x, lr, labelX, ny + nr.cap - lr.cap - (lr.h - lr.cap), 'left', ink);
      if (src) { font(x, 'text400', SMALL); x.fillStyle = dim; x.textBaseline = 'alphabetic'; x.fillText(src, PAD, FOOT_Y - 36); }
      visual({ x: PAD, y: ny, w: nr.w, h: nr.h });
    }
  };

  K.quote = {
    name: 'Quote',
    fields: [
      { key: 'quote', label: 'Quote', type: 'text', max: 200 },
      { key: 'who', label: 'Who', type: 'text', max: 90, optional: true },
      { key: 'expert', label: 'Headshot', type: 'asset', groups: ['expert'], optional: true },
      { key: 'color', label: 'Field', type: 'color', options: FIELDS }
    ],
    defaults: { quote: 'It put everyone in a builder mindset.', who: 'Lucy Baldwin, VP Product, ASU+GSV Summit', expert: '', color: 'white' },
    render: async function (x, d, h, slide) {
      var c = get(d, 'color', 'white'), ink = inkFor(c), dim = dimFor(c), acc = accentFor(c);
      fill(x, W0, H0, fieldHex(c, h.PAL));
      var quote = get(d, 'quote', ''), who = get(d, 'who', '');
      quote = quote.replace(/^[“"']+|[”"']+$/g, '');
      var img = get(d, 'expert', '') ? await loadAsset(h, get(d, 'expert', '')) : null;
      var top = PADY, bottom = foot(x, h, c, pageOf(slide));
      var markPx = 360; font(x, 'display', markPx); var markH = capOf(x);
      var qx = PAD, qw = CW * .88;
      var qr = fit(x, quote, 'display', qw, bottom - top - markH * .55 - (who ? 150 : 0), 124, 48, 1.04, 4);
      var wr = who ? fit(x, who, 'text400', qw, 120, BODY, BODY_MIN, 1.3, 2) : null;
      var total = markH * .55 + qr.h + (who ? 56 + Math.max(wr.h, img ? 84 : 0) : 0);
      var y = top + Math.max(0, (bottom - top - total) / 2) * .8;
      font(x, 'display', markPx); x.fillStyle = acc; x.textBaseline = 'alphabetic'; x.fillText('“', qx - markPx * .05, y + markH);
      y += markH * .55;
      font(x, 'display', qr.px); y = block(x, qr, qx, y, 'left', ink);
      if (wr || img) {
        y += 56; var wx = qx;
        if (img) { var ph = 84; x.save(); x.beginPath(); x.arc(qx + ph / 2, y + ph / 2, ph / 2, 0, Math.PI * 2); x.clip(); h.cover(x, img, qx, y, ph, ph, .5, .3); x.restore(); wx = qx + ph + 28; }
        if (wr) { font(x, 'text400', wr.px); block(x, wr, wx, y + (img ? (84 - wr.h) / 2 : 0), 'left', dim); }
      }
      visual(null);
    }
  };

  K.two = {
    name: 'Two columns',
    fields: [
      { key: 'title', label: 'Title', type: 'text', max: 70 },
      { key: 'lhead', label: 'Left heading', type: 'text', max: 40 },
      { key: 'lbody', label: 'Left text', type: 'text', max: 200 },
      { key: 'rhead', label: 'Right heading', type: 'text', max: 40 },
      { key: 'rbody', label: 'Right text', type: 'text', max: 200 },
      { key: 'color', label: 'Field', type: 'color', options: FIELDS }
    ],
    defaults: { title: 'Before and after', lhead: 'Before', lbody: '', rhead: 'After', rbody: '', color: 'white' },
    render: async function (x, d, h, slide) {
      var c = get(d, 'color', 'white'), ink = inkFor(c), acc = accentFor(c);
      fill(x, W0, H0, fieldHex(c, h.PAL));
      var H = head(x, d, c, h, slide), y = H.y, bottom = H.bottom;
      var gap = 96, colW = (CW - gap) / 2, avail = bottom - y;
      var cols = [['lhead', 'lbody'], ['rhead', 'rbody']].map(function (k) { return { head: get(d, k[0], ''), body: get(d, k[1], '') }; });
      var px = 48, done = false, rs;
      while (!done) {
        rs = cols.map(function (col) { return { hr: col.head ? fit(x, col.head, 'display', colW, 160, SUB, 32, 1.1, 2, false) : null, br: col.body ? fit(x, col.body, 'text400', colW, 9999, px, px, 1.35, 0, false) : null }; });
        var tallest = Math.max.apply(null, rs.map(function (r) { return (r.hr ? r.hr.h + 28 : 0) + (r.br ? r.br.h : 0); }));
        done = tallest <= avail - 40 || px <= BODY_MIN; if (!done) px -= 2;
      }
      cols.forEach(function (col, i) {
        var cx = PAD + i * (colW + gap), cy = y + 40, r = rs[i];
        hair(x, c, cx, y, colW);
        if (r.hr) { font(x, 'display', r.hr.px); cy = block(x, r.hr, cx, cy, 'left', i ? BLUE : ink) + 28; }
        if (r.br) { font(x, 'text400', r.br.px); block(x, r.br, cx, cy, 'left', ink, acc); }
      });
      visual({ x: PAD, y: y, w: CW, h: bottom - y });
    }
  };

  K.photo = {
    name: 'Photo',
    fields: [
      { key: 'photo', label: 'Photo', type: 'asset', groups: ['photo', 'background', 'hero'] },
      { key: 'title', label: 'Title', type: 'text', max: 70, optional: true }
    ],
    defaults: { photo: 'photo-businesswoman-outdoors-city-skyscrapers', title: '' },
    render: async function (x, d, h, slide) {
      var img = await loadAsset(h, get(d, 'photo', ''), 'photo');
      fill(x, W0, H0, PAL.neutral);
      if (img) h.cover(x, img, 0, 0, W0, H0, .5, .35);
      x.fillStyle = 'rgba(0,0,0,.28)'; x.fillRect(0, 0, W0, H0);
      var title = get(d, 'title', '');
      var hr = title ? fit(x, title, 'display', CW * .7, H0 * .4, 120, 56, 1.0, 3) : null;
      var y = H0 - PADY - (hr ? hr.h : 0);
      grain(x, W0, H0, .05);
      h.logo(x, PAD, PADY, 56, 'white');
      if (hr) { font(x, 'display', hr.px); block(x, hr, PAD, y, 'left', PAL.white, PAL.white); }
      var p = pageOf(slide);
      if (p) { font(x, 'text500', PAGE_PX); x.fillStyle = 'rgba(255,255,255,.8)'; x.textAlign = 'right'; x.textBaseline = 'alphabetic'; x.fillText(String(p), W0 - PAD, FOOT_Y + LOCK - 8); x.textAlign = 'left'; }
      visual({ x: 0, y: 0, w: W0, h: H0 });
    }
  };

  K.logos = {
    name: 'Logos',
    fields: [
      { key: 'title', label: 'Title', type: 'text', max: 70 },
      { key: 'logos', label: 'Organizations (comma separated)', type: 'text', max: 300 },
      { key: 'color', label: 'Field', type: 'color', options: FIELDS }
    ],
    defaults: { title: 'Experts from the places you want to go', logos: 'Google, Meta, Goldman Sachs, Boston Consulting Group, Harvard Business School, Stanford GSB, The Wharton School, Anthropic', color: 'white' },
    render: async function (x, d, h, slide) {
      var c = get(d, 'color', 'white'), ink = inkFor(c);
      fill(x, W0, H0, fieldHex(c, h.PAL));
      var names = get(d, 'logos', '').split(/[,\n;]/).map(function (s) { return s.trim(); }).filter(Boolean).slice(0, 8);
      var H = head(x, d, c, h, slide, { gap: 64 }), y = H.y, bottom = H.bottom;
      var orgs = names.map(function (n) { return { name: n, a: findOrg(h, n) }; });
      var imgs = await Promise.all(orgs.map(function (o) { return o.a ? h.loadImg(o.a.mono && o.a.mono.black || o.a.src).catch(function () { return null; }) : Promise.resolve(null); }));
      var n = orgs.length, cols = n <= 4 ? n : 4, rows = Math.ceil(n / cols), gap = 40, capPx = SMALL, capGap = 28;
      var cellW = (CW - gap * (cols - 1)) / cols;
      var labels = orgs.map(function (o) {
        var l = o.a ? String(o.a.title).replace(/\s*\(.*?\)\s*/g, ' ').trim() : o.name;
        if (/Stanford University Graduate School of Business/i.test(l)) l = 'Stanford GSB';
        return l;
      });
      var crs = labels.map(function (l) { return fit(x, l, 'text500', cellW, 90, capPx, capPx, 1.25, 2, false); });
      var capH = Math.max.apply(null, crs.map(function (r) { return r.h; }));
      var avail = bottom - y - gap * (rows - 1), cellH = Math.min(320, avail / rows);
      var markH = Math.max(96, Math.min(176, cellH - capGap - capH));
      cellH = markH + capGap + capH;
      var gridH = rows * cellH + gap * (rows - 1), gy = y + Math.max(0, (bottom - y - gridH) / 2);
      orgs.forEach(function (o, i) {
        var cx = PAD + (i % cols) * (cellW + gap), cy = gy + Math.floor(i / cols) * (cellH + gap);
        var img = imgs[i], ty = cy + markH + capGap;
        if (img) contain(x, img, cx + (cellW - markH) / 2, cy, markH, markH);
        else { var fr = fit(x, labels[i], 'display', cellW, markH, 64, 32, 1, 2); font(x, 'display', fr.px); block(x, fr, cx + cellW / 2, cy + (markH - fr.h) / 2, 'center', ink); }
        font(x, 'text500', crs[i].px); block(x, crs[i], cx + cellW / 2, ty, 'center', dimFor(c));
      });
      visual({ x: PAD, y: gy, w: CW, h: gridH });
    }
  };

  K.close = {
    name: 'Close',
    fields: [
      { key: 'title', label: 'Title', type: 'text', max: 60 },
      { key: 'contact', label: 'Contact line', type: 'text', max: 90, optional: true },
      { key: 'color', label: 'Field', type: 'color', options: ['white', 'beige', 'blue', 'ink'] }
    ],
    defaults: { title: 'Let’s talk.', contact: 'joinleland.com', color: 'white' },
    render: async function (x, d, h, slide) {
      var c = get(d, 'color', 'white'), ink = inkFor(c), acc = accentFor(c);
      fill(x, W0, H0, fieldHex(c, h.PAL));
      var title = get(d, 'title', ''), contact = get(d, 'contact', '');
      var lockH = 132, lockW = 112 / 24 * lockH;
      var hr = title ? fit(x, title, 'display', CW * .8, 260, 110, 56, 1.0, 2) : null;
      var cr = contact ? fit(x, contact, 'text400', CW * .8, 120, BODY, BODY_MIN, 1.3, 2) : null;
      var total = lockH + (hr ? 72 + hr.h : 0) + (cr ? 28 + cr.h : 0);
      var y = (H0 - total) / 2 - 10;
      h.logo(x, (W0 - lockW) / 2, y, lockH, isDark(c) ? 'white' : 'ink'); y += lockH;
      if (hr) { font(x, 'display', hr.px); y = block(x, hr, W0 / 2, y + 72, 'center', ink, acc); }
      if (cr) { font(x, 'text400', cr.px); block(x, cr, W0 / 2, y + 28, 'center', dimFor(c)); }
      visual(null);
    }
  };

  /* ---------- proposal kinds (sales decks) ---------- */

  /* numbered rows with hairline rules, "Title" per line (a trailing "| note" is kept but not drawn) */
  K.agenda = {
    name: 'Agenda',
    fields: [
      { key: 'title', label: 'Title', type: 'text', max: 70 },
      { key: 'items', label: 'Rows (one per line, up to three)', type: 'text', max: 400 },
      { key: 'numbers', label: 'Numbers', type: 'choice', options: ['yes', 'no'] },
      { key: 'color', label: 'Field', type: 'color', options: FIELDS }
    ],
    defaults: { title: 'Agenda.', items: 'What we heard\nOur solution\nCommercial details', numbers: 'yes', color: 'white' },
    render: async function (x, d, h, slide) {
      var c = get(d, 'color', 'white'), ink = inkFor(c);
      fill(x, W0, H0, fieldHex(c, h.PAL));
      var H = head(x, d, c, h, slide, { gap: 56 });
      var rows = splitLines(get(d, 'items', '')).slice(0, 5).map(function (l) { return l.split('|')[0].trim(); });
      if (!rows.length) return;
      var numbered = get(d, 'numbers', 'yes') !== 'no', numW = numbered ? 120 : 0;
      var avail = H.bottom - H.y, n = rows.length, rowH = Math.min(220, Math.floor(avail / n)), tpx = Math.min(72, Math.round(rowH * .4));
      var y = H.y + (avail - rowH * n) / 2;
      rows.forEach(function (t, i) {
        hair(x, c, PAD, y, CW);
        var tr = fit(x, t, 'display', CW - numW, rowH, tpx, 36, 1.05, 1, false), ty = y + (rowH - tr.h) / 2;
        if (numbered) label(x, pad2(i + 1), PAD, ty + tr.cap, c);
        font(x, 'display', tr.px); block(x, tr, PAD + numW, ty, 'left', ink);
        y += rowH;
      });
      hair(x, c, PAD, y, CW);
      visual(null);
    }
  };

  /* three challenges on the left, three outcomes on the right, an arrow between each pair */
  K.pair = {
    name: 'Challenges to outcomes',
    fields: [
      { key: 'title', label: 'Title', type: 'text', max: 80 },
      { key: 'left', label: 'Left (one per line, up to three)', type: 'text', max: 300 },
      { key: 'right', label: 'Right (one per line, up to three)', type: 'text', max: 300 },
      { key: 'color', label: 'Field', type: 'color', options: FIELDS }
    ],
    defaults: { title: 'What we heard.', left: '', right: '', color: 'white' },
    render: async function (x, d, h, slide) {
      var c = get(d, 'color', 'white'), ink = inkFor(c);
      fill(x, W0, H0, fieldHex(c, h.PAL));
      var H = head(x, d, c, h, slide, { gap: 64 }), y = H.y, bottom = H.bottom;
      var L = splitLines(get(d, 'left', '')).slice(0, 3), R = splitLines(get(d, 'right', '')).slice(0, 3), n = Math.max(L.length, R.length);
      if (!n) return;
      var labH = 0;
      var arrowW = 200, colW = (CW - arrowW) / 2, gap = 28, top = y + labH, cellH = Math.min(240, Math.floor((bottom - top - gap * (n - 1)) / n));
      var total = cellH * n + gap * (n - 1), cy0 = top + (bottom - top - total) / 2;
      var px = 40;
      for (var i = 0; i < n; i++) {
        var cy = cy0 + i * (cellH + gap), mid = cy + cellH / 2, lx = PAD, rx = PAD + colW + arrowW;
        if (L[i]) {
          tightRect(x, lx, cy, colW, cellH, c);
          var lr = fit(x, L[i], 'text400', colW - 80, cellH - 40, px, BODY_MIN, 1.3, 3, false); font(x, 'text400', lr.px); block(x, lr, lx + 40, mid - lr.h / 2, 'left', ink);
        }
        if (R[i]) {
          x.fillStyle = BLUE; x.fillRect(rx, cy, colW, cellH);
          var rr = fit(x, R[i], 'text500', colW - 80, cellH - 40, px, BODY_MIN, 1.3, 3, false); font(x, 'text500', rr.px); block(x, rr, rx + 40, mid - rr.h / 2, 'left', PAL.white);
        }
        if (L[i] && R[i]) {
          x.save(); x.strokeStyle = lineFor(c); x.fillStyle = lineFor(c); x.lineWidth = 2;
          var ax0 = lx + colW + 36, ax1 = rx - 36;
          x.beginPath(); x.moveTo(ax0, mid); x.lineTo(ax1 - 14, mid); x.stroke();
          x.beginPath(); x.moveTo(ax1, mid); x.lineTo(ax1 - 18, mid - 10); x.lineTo(ax1 - 18, mid + 10); x.closePath(); x.fill();
          x.restore();
        }
      }
      visual({ x: PAD, y: cy0, w: CW, h: total });
    }
  };

  /* who we are: three big figures and a logo row */
  K.stats = {
    name: 'Figures',
    fields: [
      { key: 'title', label: 'Title', type: 'text', max: 70 },
      { key: 'stats', label: 'Figures (number | what it means, one per line, up to three)', type: 'text', max: 300 },
      { key: 'logos', label: 'Organizations (comma separated; =Name sets the name in type)', type: 'text', max: 300, optional: true },
      { key: 'color', label: 'Field', type: 'color', options: FIELDS }
    ],
    defaults: { title: 'An end-to-end AI enablement partner.', stats: '3,500+ | industry experts, 150+ pathways\n4.99 | average rating\n7.5M+ | people building careers on Leland', logos: '', color: 'white' },
    render: async function (x, d, h, slide) {
      var c = get(d, 'color', 'white'), ink = inkFor(c), dim = dimFor(c);
      fill(x, W0, H0, fieldHex(c, h.PAL));
      var H = head(x, d, c, h, slide, { gap: 72 }), y = H.y, bottom = H.bottom;
      var names = get(d, 'logos', '').split(/[,\n;]/).map(function (s) { return s.trim(); }).filter(Boolean).slice(0, 8);
      var rowH = names.length ? 64 : 0;
      if (names.length) {
        var orgs = names.map(function (n) { var text = n.charAt(0) === '='; n = n.replace(/^=/, ''); return { name: n, a: text ? null : findOrg(h, n) }; });
        var imgs = await Promise.all(orgs.map(function (o) { return o.a ? h.loadImg(o.a.mono && (isDark(c) ? o.a.mono.white : o.a.mono.black) || o.a.src).catch(function () { return null; }) : Promise.resolve(null); }));
        var ly = bottom - rowH, lx = PAD, markH = 52;
        font(x, 'text600', 28);
        var ws = orgs.map(function (o, i) { var im = imgs[i]; if (!im) return mw(x, o.name); var s = Math.min(markH / (im.naturalHeight || im.height), 190 / (im.naturalWidth || im.width)); return (im.naturalWidth || im.width) * s; });
        var tot = ws.reduce(function (a, b) { return a + b; }, 0), space = Math.max(40, (W0 - PAD - lx - tot) / Math.max(1, orgs.length - 1)), cx = lx;
        orgs.forEach(function (o, i) {
          if (imgs[i]) contain(x, imgs[i], cx, ly + (rowH - markH) / 2, ws[i], markH);
          else { font(x, 'text600', 28); x.fillStyle = ink; x.textBaseline = 'middle'; x.fillText(o.name, cx, ly + rowH / 2); x.textBaseline = 'alphabetic'; }
          cx += ws[i] + space;
        });
        bottom = ly - 72;
      }
      var stats = splitLines(get(d, 'stats', '')).slice(0, 3).map(function (l) { var p = l.split('|'); return { n: p[0].trim(), l: (p[1] || '').trim() }; });
      if (!stats.length) return;
      var colGap = 72, colW = (CW - colGap * (stats.length - 1)) / stats.length, avail = bottom - y;
      var numPx = Math.min(260, Math.round(avail - 40 - BODY * 1.35 * 2 - 24));
      var rs = stats.map(function (s) { return { nr: fit(x, s.n, 'display', colW, 400, numPx, 72, 1, 1), lr: fit(x, s.l, 'text400', colW, 200, BODY, BODY_MIN, 1.3, 2, false) }; });
      var blockH = Math.max.apply(null, rs.map(function (r) { return 36 + r.nr.h + 24 + r.lr.h; })), sy = y + (avail - blockH) / 2;
      stats.forEach(function (s, i) {
        var cx = PAD + i * (colW + colGap), cy = sy;
        hair(x, c, cx, cy, colW); cy += 36;
        font(x, 'display', rs[i].nr.px); cy = block(x, rs[i].nr, cx - rs[i].nr.px * .03, cy, 'left', ink) + 24;
        font(x, 'text400', rs[i].lr.px); block(x, rs[i].lr, cx, cy, 'left', dim);
      });
      visual({ x: PAD, y: sy, w: CW, h: (names.length ? H.bottom : bottom) - sy });
    }
  };

  /* one headline, one large visual, up to three lines */
  K.illus = {
    name: 'Illustration',
    fields: [
      { key: 'title', label: 'Title', type: 'text', max: 80 },
      { key: 'lines', label: 'Lines (**Lead.** text, one per line, up to three)', type: 'text', max: 400, optional: true },
      ILLUS, ILL,
      { key: 'ph', label: 'Placeholder', type: 'choice', options: ['layers', 'grid', 'rise', 'rings', 'launch'] },
      { key: 'color', label: 'Field', type: 'color', options: FIELDS }
    ],
    defaults: { title: 'Squads walk into AKO with working agents to demo.', lines: '', illus: '', ill: '', ph: 'rise', color: 'white' },
    render: async function (x, d, h, slide) {
      var c = get(d, 'color', 'white');
      fill(x, W0, H0, fieldHex(c, h.PAL));
      /* headline and lines in the left half, the visual full height on the right */
      var textW = Math.round(CW * .46);
      var H = head(x, d, c, h, slide, { gap: 72, maxW: textW, lines: 3, maxH: 330, oneMin: 88 }), y = H.y, bottom = H.bottom;
      var lines = splitLines(get(d, 'lines', '')).slice(0, 3);
      var box = { x: PAD + textW + 96, y: PADY, w: W0 - PAD - (PAD + textW + 96), h: FOOT_Y - 48 - PADY };
      VISUAL.content = { x: PAD, y: PADY, w: CW, h: FOOT_Y - 48 - PADY };
      var r = await drawVisual(x, h, d, c, box, get(d, 'ph', 'rise'));
      if (lines.length) { var th = linesH(x, lines, textW), ty = y + Math.max(0, (bottom - y - th) / 2); linesDraw(x, lines, PAD, ty, textW, c); }
      visual(r);
    }
  };

  /* the layers of support: stacked bars with a label in each (or the illustration and the labels as a list) */
  K.layers = {
    name: 'Layers',
    fields: [
      { key: 'title', label: 'Title', type: 'text', max: 80 },
      { key: 'layers', label: 'Layers (one per line, top to bottom, up to five)', type: 'text', max: 300 },
      ILLUS, ILL,
      { key: 'color', label: 'Field', type: 'color', options: FIELDS }
    ],
    defaults: { title: 'End-to-end layered support for AI acceleration.', layers: 'Workshops and the AI Innovation Sprint\nAI engineering and AI services\n1:1 support in your function\nAI Builder Program\nAI Builder Foundations', illus: '', ill: '', color: 'white' },
    render: async function (x, d, h, slide) {
      var c = get(d, 'color', 'white'), ink = inkFor(c);
      fill(x, W0, H0, fieldHex(c, h.PAL));
      var H = head(x, d, c, h, slide, { gap: 72 }), y = H.y, bottom = H.bottom;
      var layers = splitLines(get(d, 'layers', '')).slice(0, 5), n = layers.length;
      var img = await loadIllus(h, get(d, 'illus', ''));
      if (!img && get(d, 'ill', '')) img = await loadAsset(h, get(d, 'ill', ''));
      if (img) {
        /* the illustration on the right, the layer names as a plain list on the left */
        var textW = Math.round(CW * .36), box = { x: PAD + textW + 96, y: y, w: W0 - PAD - (PAD + textW + 96), h: bottom - y };
        var r = contain(x, img, box.x, box.y, box.w, box.h);
        var rowH = Math.min(96, Math.floor((bottom - y) / Math.max(1, n))), ly = y + (bottom - y - rowH * n) / 2;
        layers.forEach(function (t, i) { hair(x, c, PAD, ly + i * rowH, textW); var tr = fit(x, t, 'text400', textW, rowH, BODY, BODY_MIN, 1.3, 2, false); font(x, 'text400', tr.px); block(x, tr, PAD, ly + i * rowH + (rowH - tr.h) / 2, 'left', ink); });
        hair(x, c, PAD, ly + n * rowH, textW);
        visual(r); return;
      }
      /* drawn: a stack of bars, widest at the bottom, the bottom bar blue with white type */
      var gap = 16, bh = Math.min(150, Math.floor((bottom - y - gap * (n - 1)) / Math.max(1, n))), total = bh * n + gap * (n - 1), top = y + (bottom - y - total) / 2, step = CW * .08;
      layers.forEach(function (t, i) {
        var k = n - 1 - i, w = CW - step * k, X = PAD + (CW - w) / 2, Y = top + i * (bh + gap), last = i === n - 1;
        if (last) { x.fillStyle = BLUE; x.fillRect(X, Y, w, bh); } else tightRect(x, X, Y, w, bh, c);
        var tr = fit(x, t, last ? 'text500' : 'text400', w - 80, bh - 24, BODY, BODY_MIN, 1.2, 2, false); font(x, last ? 'text500' : 'text400', tr.px);
        block(x, tr, X + w / 2, Y + (bh - tr.h) / 2, 'center', last ? PAL.white : ink);
      });
      visual({ x: PAD, y: top, w: CW, h: total });
    }
  };

  /* a roadmap: month axis, one bar (or several) per row, an optional shaded band; nothing under the chart */
  K.timeline = {
    name: 'Timeline',
    fields: [
      { key: 'title', label: 'Title', type: 'text', max: 70 },
      { key: 'months', label: 'Axis labels (comma separated)', type: 'text', max: 120 },
      { key: 'rows', label: 'Rows (Label | sublabel | start-end style text ; ...), up to five', type: 'text', max: 1200 },
      { key: 'band', label: 'Shaded band (start | end | label)', type: 'text', max: 40, optional: true },
      { key: 'size', label: 'Bars', type: 'choice', options: ['regular', 'big'] },
      { key: 'color', label: 'Field', type: 'color', options: FIELDS }
    ],
    defaults: { title: 'Roadmap.', months: 'Oct, Nov, Dec, Jan, Feb', rows: 'Foundations | Everyone | 0-2 solid All employees', band: '', size: 'regular', color: 'white' },
    render: async function (x, d, h, slide) {
      var c = get(d, 'color', 'white'), ink = inkFor(c), dim = dimFor(c);
      fill(x, W0, H0, fieldHex(c, h.PAL));
      var H = head(x, d, c, h, slide, { gap: 64, lines: 1, maxH: 120 }), y = H.y, bottom = H.bottom;
      var months = get(d, 'months', '').split(',').map(function (s) { return s.trim(); }).filter(Boolean), N = Math.max(1, months.length);
      var rows = splitLines(get(d, 'rows', '')).slice(0, 5).map(function (l) {
        var p = l.split('|').map(function (s) { return s.trim(); });
        var sg = (p[2] || '').split(';').map(function (s) { var m = s.trim().match(/^([\d.]+)\s*-\s*([\d.]+)\s+(solid|light|dashed|blue)\s*(.*)$/); return m ? { a: +m[1], b: +m[2], st: m[3], t: m[4] } : null; }).filter(Boolean);
        return { label: p[0] || '', sub: p[1] || '', segs: sg };
      });
      var big = get(d, 'size', 'regular') === 'big';
      var band = get(d, 'band', '').split('|').map(function (s) { return s.trim(); }), hasBand = band.length >= 2 && !isNaN(+band[0]) && !isNaN(+band[1]);
      var labelW = 400, axisX = PAD + labelW + 56, axisW = W0 - PAD - axisX;
      function mx(m) { return axisX + (m / N) * axisW; }
      var axisY = y + SMALL, rowsTop = axisY + 32, bandLabelH = hasBand && band[2] ? SMALL + 20 : 0;
      var rowH = Math.min(big ? 220 : 128, Math.floor((bottom - rowsTop - bandLabelH) / Math.max(1, rows.length))), barH = Math.min(big ? 96 : 56, Math.round(rowH * .55));
      var chartH = rowH * rows.length;
      if (hasBand) {
        var bx0 = mx(+band[0]), bx1 = mx(+band[1]);
        x.save(); x.beginPath(); x.rect(bx0, rowsTop, bx1 - bx0, chartH); x.clip();
        x.fillStyle = isDark(c) ? 'rgba(255,255,255,.05)' : 'rgba(1,1,1,.035)'; x.fillRect(bx0, rowsTop, bx1 - bx0, chartH);
        x.strokeStyle = isDark(c) ? 'rgba(255,255,255,.12)' : 'rgba(1,1,1,.08)'; x.lineWidth = 2;
        for (var k = -chartH; k < bx1 - bx0 + chartH; k += 18) { x.beginPath(); x.moveTo(bx0 + k, rowsTop); x.lineTo(bx0 + k + chartH, rowsTop + chartH); x.stroke(); }
        x.restore();
        if (band[2]) label(x, band[2], (bx0 + bx1) / 2, rowsTop + chartH + 20 + SMALL * .78, c, 'center');
      }
      months.forEach(function (m, i) { label(x, m, mx(i), axisY, c); });
      hair(x, c, axisX, axisY + 16, axisW);
      x.save(); x.strokeStyle = hairFor(c); x.lineWidth = 1; x.globalAlpha = .6;
      for (var i = 1; i < N; i++) { x.beginPath(); x.moveTo(mx(i), rowsTop); x.lineTo(mx(i), rowsTop + chartH); x.stroke(); }
      x.restore();
      rows.forEach(function (r, i) {
        var ry = rowsTop + i * rowH, mid = ry + rowH / 2;
        if (i) { x.fillStyle = hairFor(c); x.globalAlpha = .5; x.fillRect(PAD, ry, CW, 1); x.globalAlpha = 1; }
        var LPX = big ? BODY : 30, SPX = SMALL;
        var lr = fit(x, r.label, 'text500', labelW, 80, LPX, 24, 1.15, 2, false);
        var subH = r.sub ? SPX * .78 : 0, lh = lr.h + (subH ? subH + 8 : 0), ly = mid - lh / 2;
        font(x, 'text500', lr.px); block(x, lr, PAD + labelW, ly, 'right', ink);
        if (r.sub) { font(x, 'text400', SPX); x.fillStyle = dim; x.textAlign = 'right'; x.textBaseline = 'alphabetic'; x.fillText(r.sub, PAD + labelW, ly + lr.h + 8 + SPX * .78); }
        x.textAlign = 'left';
        r.segs.forEach(function (s) {
          var x0 = mx(s.a), x1 = mx(s.b), w = Math.max(barH, x1 - x0), by = mid - barH / 2;
          if (s.st === 'solid') { x.fillStyle = ink; x.fillRect(x0, by, w, barH); }
          else if (s.st === 'blue') { x.fillStyle = BLUE; x.fillRect(x0, by, w, barH); }
          else if (s.st === 'light') { x.fillStyle = isDark(c) ? 'rgba(255,255,255,.18)' : 'rgba(1,1,1,.1)'; x.fillRect(x0, by, w, barH); }
          else tightRect(x, x0, by, w, barH, c, true);
          if (s.t) {
            font(x, 'text500', SMALL); var tw = mw(x, s.t), inside = tw + 32 <= w;
            x.fillStyle = (s.st === 'solid' || s.st === 'blue') ? (isDark(c) && s.st === 'solid' ? PAL.ink : PAL.white) : ink; x.textBaseline = 'middle';
            if (inside) x.fillText(s.t, x0 + 18, mid + 1);
            else if (x1 + 16 + tw <= W0 - PAD) { x.fillStyle = ink; x.fillText(s.t, x1 + 16, mid + 1); }
            else { x.fillStyle = ink; x.textAlign = 'right'; x.fillText(s.t, x0 - 16, mid + 1); x.textAlign = 'left'; }
            x.textBaseline = 'alphabetic';
          }
        });
      });
      visual({ x: PAD, y: axisY, w: CW, h: rowsTop + chartH + bandLabelH - axisY });
    }
  };

  /* three columns, each an illustration (or a numeral), a Season title and one line */
  K.cards3 = {
    name: 'Three columns',
    fields: [
      { key: 'title', label: 'Title', type: 'text', max: 80 },
      { key: 'h1', label: 'Column 1 title', type: 'text', max: 60 }, { key: 'c1', label: 'Column 1 line', type: 'text', max: 160 },
      { key: 'h2', label: 'Column 2 title', type: 'text', max: 60 }, { key: 'c2', label: 'Column 2 line', type: 'text', max: 160 },
      { key: 'h3', label: 'Column 3 title', type: 'text', max: 60 }, { key: 'c3', label: 'Column 3 line', type: 'text', max: 160 },
      { key: 'i1', label: 'Column 1 illustration', type: 'asset', groups: ['illustration'], optional: true },
      { key: 'i2', label: 'Column 2 illustration', type: 'asset', groups: ['illustration'], optional: true },
      { key: 'i3', label: 'Column 3 illustration', type: 'asset', groups: ['illustration'], optional: true },
      { key: 'color', label: 'Field', type: 'color', options: FIELDS }
    ],
    defaults: { title: 'How progress gets measured.', h1: '', c1: '', h2: '', c2: '', h3: '', c3: '', i1: '', i2: '', i3: '', color: 'white' },
    render: async function (x, d, h, slide) {
      var c = get(d, 'color', 'white'), ink = inkFor(c), body = bodyFor(c);
      fill(x, W0, H0, fieldHex(c, h.PAL));
      var H = head(x, d, c, h, slide, { gap: 72 }), y = H.y, bottom = H.bottom;
      var cols = [1, 2, 3].map(function (i) { return { t: get(d, 'h' + i, ''), line: splitLines(get(d, 'c' + i, '')).slice(0, 1).join(' '), img: get(d, 'i' + i, ''), n: i }; }).filter(function (col) { return col.t || col.line; });
      if (!cols.length) return;
      var imgs = await Promise.all(cols.map(function (col) { return col.img ? loadAsset(h, col.img) : Promise.resolve(null); }));
      var CG = 72, colW = (CW - CG * (cols.length - 1)) / cols.length, avail = bottom - y;
      var trs = cols.map(function (col) { return col.t ? fit(x, col.t, 'display', colW, 120, SUB, 30, 1.08, 2, false) : null; });
      var titleH = Math.max.apply(null, trs.map(function (r) { return r ? r.h : 0; }));
      var lineH = Math.max.apply(null, cols.map(function (col) { return col.line ? mixedH(x, col.line, BODY, colW) : 0; }));
      var textH = (titleH ? titleH + 20 : 0) + lineH, imgH = Math.max(240, avail - textH - 48);
      cols.forEach(function (col, i) {
        var cx = PAD + i * (colW + CG), cy = y;
        var box = { x: cx, y: cy, w: colW, h: imgH };
        if (imgs[i]) contain(x, imgs[i], box.x, box.y, box.w, box.h);
        else {
          /* no illustration on file: a hairline circle with the column number */
          var dmt = Math.min(colW, imgH) * .72, ccx = cx + colW / 2, ccy = cy + imgH / 2;
          x.beginPath(); x.arc(ccx, ccy, dmt / 2, 0, Math.PI * 2); x.strokeStyle = lineFor(c); x.lineWidth = 2; x.stroke();
          var nr = fit(x, pad2(col.n), 'display', dmt, dmt, dmt * .34, 32, 1, 1); font(x, 'display', nr.px); block(x, nr, ccx, ccy - nr.h / 2, 'center', ink);
        }
        cy += imgH + 48;
        if (trs[i]) { font(x, 'display', trs[i].px); block(x, trs[i], cx, cy, 'left', ink); }
        cy += titleH + 20;
        if (col.line) mixed(x, col.line, cx, cy, BODY, colW, 1.35, ink, body);
      });
      visual({ x: PAD, y: y, w: CW, h: imgH });
    }
  };

  /* experts, one per function: a 3x2 grid of faces (or hairline circles); with an illustration, the six as a list beside it */
  K.people = {
    name: 'People',
    fields: [
      { key: 'title', label: 'Title', type: 'text', max: 80 },
      { key: 'groups', label: 'Groups (## Function, then Name | credential), up to six', type: 'text', max: 900 },
      ILLUS, ILL,
      { key: 'color', label: 'Field', type: 'color', options: FIELDS }
    ],
    defaults: { title: 'Domain experts who have run this inside their own function.', groups: '## Go-to-Market\nClaudia P. | Example credential', illus: '', ill: '', color: 'white' },
    render: async function (x, d, h, slide) {
      var c = get(d, 'color', 'white'), ink = inkFor(c), body = bodyFor(c), dim = dimFor(c);
      fill(x, W0, H0, fieldHex(c, h.PAL));
      var H = head(x, d, c, h, slide, { gap: 64 }), y = H.y, bottom = H.bottom;
      var groups = [], cur = null;
      splitLines(get(d, 'groups', '')).forEach(function (l) {
        var m = l.match(/^##\s*(.+)$/);
        if (m) { cur = { t: m[1].trim(), people: [] }; groups.push(cur); return; }
        if (!cur) { cur = { t: '', people: [] }; groups.push(cur); }
        var p = l.split('|'); cur.people.push({ n: p[0].trim(), s: (p[1] || '').trim() });
      });
      groups = groups.slice(0, 6).map(function (g) { return { t: g.t, p: g.people[0] || { n: '', s: '' } }; });
      if (!groups.length) return;
      var experts = h.byGroup('expert');
      var faces = await Promise.all(groups.map(function (g) { var a = experts.filter(function (e) { return String(e.title).trim().toLowerCase() === g.p.n.toLowerCase(); })[0]; return a ? h.loadImg(a.src).catch(function () { return null; }) : Promise.resolve(null); }));
      var img = await loadIllus(h, get(d, 'illus', ''));
      if (!img && get(d, 'ill', '')) img = await loadAsset(h, get(d, 'ill', ''));
      if (img) {
        var textW = Math.round(CW * .42), box = { x: PAD + textW + 96, y: y, w: W0 - PAD - (PAD + textW + 96), h: bottom - y };
        var r = contain(x, img, box.x, box.y, box.w, box.h);
        var rowH = Math.min(110, Math.floor((bottom - y) / groups.length)), ly = y + (bottom - y - rowH * groups.length) / 2;
        groups.forEach(function (g, i) {
          var ry = ly + i * rowH; hair(x, c, PAD, ry, textW);
          font(x, 'text600', 30); x.fillStyle = ink; x.textBaseline = 'alphabetic'; x.fillText(g.t, PAD, ry + 22 + 24);
          mixed(x, '**' + g.p.n + '** ' + g.p.s, PAD, ry + 22 + 24 + 14, SMALL + 2, textW, 1.3, ink, body);
        });
        hair(x, c, PAD, ly + rowH * groups.length, textW);
        visual(r); return;
      }
      /* a 3x2 grid: a hairline, the function in Macan 600, the expert line beneath; a face only when a headshot is on file */
      var ncol = 3, nrow = Math.ceil(groups.length / ncol), CG = 72, colW = (CW - CG * (ncol - 1)) / ncol, RG = 56;
      var anyFace = faces.some(Boolean), FACE = anyFace ? 120 : 0;
      var cellH = Math.floor((bottom - y - RG * (nrow - 1)) / nrow), cy0 = y;
      groups.forEach(function (g, i) {
        var cx = PAD + (i % ncol) * (colW + CG), cy = cy0 + Math.floor(i / ncol) * (cellH + RG), f = faces[i];
        hair(x, c, cx, cy, colW); cy += 32;
        if (f) { x.save(); x.beginPath(); x.arc(cx + FACE / 2, cy + FACE / 2, FACE / 2, 0, Math.PI * 2); x.clip(); h.cover(x, f, cx, cy, FACE, FACE, .5, .3); x.restore(); }
        if (FACE) cy += FACE + 24;
        var tr = fit(x, g.t, 'text600', colW, 80, BODY + 2, BODY_MIN, 1.2, 2, false); font(x, 'text600', tr.px); cy = block(x, tr, cx, cy, 'left', ink) + 16;
        mixed(x, '**' + g.p.n + '** ' + g.p.s, cx, cy, BODY - 4, colW, 1.35, ink, body);
      });
      visual({ x: PAD, y: y, w: CW, h: nrow * cellH + (nrow - 1) * RG });
    }
  };

  /* one offer: the figure large on the left, the term under it, up to three lines on the right */
  K.price = {
    name: 'Price',
    fields: [
      { key: 'title', label: 'Title', type: 'text', max: 70 },
      { key: 'p1', label: 'Figure', type: 'text', max: 14 },
      { key: 'd1', label: 'Term', type: 'text', max: 90, optional: true },
      { key: 'l1', label: 'Lines (one per line, up to three)', type: 'text', max: 400 },
      { key: 'color', label: 'Field', type: 'color', options: ['ink', 'white', 'beige', 'blue'] }
    ],
    defaults: { title: '18 months of dedicated support.', p1: '$250,000', d1: '', l1: '', color: 'ink' },
    render: async function (x, d, h, slide) {
      var c = get(d, 'color', 'ink'), ink = inkFor(c);
      fill(x, W0, H0, fieldHex(c, h.PAL));
      var H = head(x, d, c, h, slide, { gap: 72 }), y = H.y, bottom = H.bottom;
      var p = get(d, 'p1', ''), dt = get(d, 'd1', ''), lines = splitLines(get(d, 'l1', '')).slice(0, 3);
      var leftW = Math.round(CW * .52), rx = PAD + leftW + 96, rw = W0 - PAD - rx;
      var pr = fit(x, p, 'display', leftW, bottom - y - (dt ? 90 : 0), 360, 120, 1, 1);
      var dr = dt ? fit(x, dt, 'text500', leftW, 120, BODY, BODY_MIN, 1.3, 2, false) : null;
      var blockH = pr.h + (dr ? 40 + dr.h : 0), py = y + (bottom - y - blockH) / 2;
      font(x, 'display', pr.px); var ey = block(x, pr, PAD - pr.px * .03, py, 'left', ink);
      if (dr) { font(x, 'text500', dr.px); block(x, dr, PAD, ey + 40, 'left', ink); }
      if (lines.length) { var th = linesH(x, lines, rw), ly = y + (bottom - y - th) / 2; linesDraw(x, lines, rx, ly, rw, c); }
      visual({ x: PAD, y: py, w: pr.w, h: pr.h });
    }
  };

  /* next steps: a horizontal rail with dates above and labels below; the last step is filled */
  K.steps = {
    name: 'Next steps',
    fields: [
      { key: 'title', label: 'Title', type: 'text', max: 70 },
      { key: 'steps', label: 'Steps (Date | what happens, one per line, up to five)', type: 'text', max: 600 },
      { key: 'color', label: 'Field', type: 'color', options: FIELDS }
    ],
    defaults: { title: 'From here to kickoff.', steps: 'Sept 18 | Contracting complete\nOct 1 | Kick-off', color: 'white' },
    render: async function (x, d, h, slide) {
      var c = get(d, 'color', 'white'), ink = inkFor(c), body = bodyFor(c);
      fill(x, W0, H0, fieldHex(c, h.PAL));
      var H = head(x, d, c, h, slide, { gap: 0 }), y = H.y, bottom = H.bottom;
      var steps = splitLines(get(d, 'steps', '')).slice(0, 5).map(function (l) { var p = l.split('|'); return { dt: p[0].trim(), t: (p[1] || '').trim() }; });
      if (!steps.length) return;
      var n = steps.length, cellW = CW / n, railY = y + (bottom - y) / 2 - 10, DOT = 28;
      x.fillStyle = lineFor(c); x.fillRect(PAD, railY - 1, CW - cellW + DOT, 2);
      steps.forEach(function (s, i) {
        var sx = PAD + i * cellW, last = i === n - 1;
        x.beginPath(); x.arc(sx + DOT / 2, railY, last ? DOT / 2 + 6 : DOT / 2, 0, Math.PI * 2);
        if (last) { x.fillStyle = BLUE; x.fill(); } else { x.fillStyle = fieldHex(c, h.PAL); x.fill(); x.lineWidth = 2; x.strokeStyle = lineFor(c); x.stroke(); }
        font(x, 'text500', 28); x.fillStyle = ink; x.textBaseline = 'alphabetic'; x.fillText(s.dt, sx, railY - 48);
        var tr = fit(x, s.t, last ? 'text500' : 'text400', cellW - 56, 240, BODY + 2, BODY_MIN, 1.3, 3, false);
        font(x, last ? 'text500' : 'text400', tr.px); block(x, tr, sx, railY + 52, 'left', last ? ink : body);
      });
      visual({ x: PAD, y: railY - 100, w: CW, h: 320 });
    }
  };

  /* five numbered levels in a row, the first filled blue; one optional line above */
  K.levels = {
    name: 'Levels',
    fields: [
      { key: 'title', label: 'Title', type: 'text', max: 70 },
      { key: 'levels', label: 'Levels (one per line, up to five)', type: 'text', max: 400 },
      { key: 'color', label: 'Field', type: 'color', options: FIELDS }
    ],
    defaults: { title: 'Empower every team to be an AI Builder.', levels: 'Use AI to 10x your impact\nBuild complex agentic workflows\nCreate autonomous agents\nBuild your agent workforce\nDesign your AI orchestration layer', color: 'white' },
    render: async function (x, d, h, slide) {
      var c = get(d, 'color', 'white'), ink = inkFor(c), body = bodyFor(c);
      fill(x, W0, H0, fieldHex(c, h.PAL));
      var H = head(x, d, c, h, slide, { gap: 56 }), y = H.y, bottom = H.bottom;
      var levels = splitLines(get(d, 'levels', '')).slice(0, 5);
      var n = levels.length, gap = 24, boxW = (CW - gap * (n - 1)) / n, boxH = Math.min(420, Math.max(240, bottom - y));
      var by = y + Math.max(0, (bottom - y - boxH) / 2);
      levels.forEach(function (t, i) {
        var bx = PAD + i * (boxW + gap), first = i === 0;
        if (first) { x.fillStyle = BLUE; x.fillRect(bx, by, boxW, boxH); } else tightRect(x, bx, by, boxW, boxH, c);
        var tcol = first ? PAL.white : ink;
        label(x, pad2(i + 1), bx + 28, by + 28 + SMALL * .78, c, 'left', first ? PAL.white : null);
        var tr = fit(x, t, 'display', boxW - 56, boxH - 110, 38, 26, 1.1, 3, false); font(x, 'display', tr.px);
        block(x, tr, bx + 28, by + boxH - 28 - tr.h, 'left', tcol);
      });
      visual({ x: PAD, y: by, w: CW, h: boxH });
    }
  };

  /* legacy kinds from older decks map onto the new ones */
  var ALIAS = { heard: 'pair', proof: 'stats' };

  /* public kinds table: { fields } per kind, plus name and defaults */
  var kinds = {};
  Object.keys(K).forEach(function (k) { kinds[k] = { name: K[k].name, fields: K[k].fields, defaults: K[k].defaults }; });

  /* ---------- deck types ---------- */
  var types = [
    { id: 'sales', name: 'Sales', desc: 'Pitch the AI Builder Program to a company.', outline: ['cover', 'section', 'bullets', 'stat', 'section', 'bullets', 'two', 'quote', 'logos', 'photo', 'close'], closeTitle: 'Let’s talk.', contact: 'joinleland.com/ai' },
    { id: 'session', name: 'Session', desc: 'A live cohort session or workshop.', outline: ['cover', 'bullets', 'section', 'bullets', 'two', 'section', 'bullets', 'stat', 'quote', 'close'], closeTitle: 'See you next session.', contact: 'Post what you built on Leland' },
    { id: 'allhands', name: 'All-hands', desc: 'Company update.', outline: ['cover', 'section', 'stat', 'bullets', 'section', 'two', 'bullets', 'quote', 'photo', 'close'], closeTitle: 'Thank you.', contact: 'Questions in #general' },
    { id: 'story', name: 'Customer story', desc: 'One customer, start to finish.', outline: ['cover', 'section', 'bullets', 'two', 'stat', 'quote', 'photo', 'close'], closeTitle: 'Build yours.', contact: 'joinleland.com/ai' },
    { id: 'proposal', name: 'Proposal', desc: 'A client proposal: what we heard, the solution, the roadmap, the price.', outline: ['cover', 'agenda', 'pair', 'stats', 'illus', 'layers', 'illus', 'timeline', 'timeline', 'timeline', 'cards3', 'price', 'price', 'price', 'steps', 'section', 'cards3', 'cards3', 'cards3', 'levels', 'people', 'people', 'illus'], closeTitle: '', contact: '', json: 'data/decks/sheerid.json' }
  ];
  function typeOf(id) { for (var i = 0; i < types.length; i++) if (types[i].id === id) return types[i]; return types[0]; }

  /* ---------- parse: pasted text/markdown -> slides ---------- */
  var MAX_SLIDES = 14;
  var STAT_RE = /^([\$~]?\d[\d,.]*\s?(?:%|\+|x|k|M|hrs?|hours?)?(?:\s*(?:to|-|–)\s*\d[\d,.]*\s?(?:%|\+|x|k|M|hrs?|hours?)?)?)\s+(.{6,110})$/i;
  var QUOTE_RE = /^[“"'](.{4,})[”"']\s*$/;
  function clean(s) { return String(s || '').replace(/\s+/g, ' ').trim(); }
  function stripMd(s) { return clean(s).replace(/\*\*|__|`/g, ''); }

  /* a deck written as JSON ({slides:[{kind,data}]} or a bare array) is used as is: every kind, any length */
  function parseJSON(text) {
    try {
      var j = JSON.parse(text), arr = Array.isArray(j) ? j : j && j.slides;
      if (!Array.isArray(arr)) return null;
      var out = arr.map(function (s) { if (s && ALIAS[s.kind]) s = { kind: ALIAS[s.kind], data: s.data }; return s; }).filter(function (s) { return s && K[s.kind]; }).map(function (s) { return { kind: s.kind, data: Object.assign({}, s.data || {}) }; });
      out.forEach(function (sl, i) { sl.index = i; sl.page = i + 1; });
      return out.length ? out : null;
    } catch (e) { return null; }
  }

  function parse(text, typeId) {
    if (/^\s*[\[{]/.test(String(text || ''))) { var j = parseJSON(text); if (j) return j; }
    var T = typeOf(typeId), out = [], lines = String(text || '').replace(/\r/g, '').split('\n');
    var pending = null;          /* a plain line waiting to become a title for what follows */
    var sectionN = 0, colorFlip = 0, contact = '';
    function push(kind, data) { if (out.length < MAX_SLIDES) out.push({ kind: kind, data: data }); }
    function last() { return out[out.length - 1]; }
    function flushPending() {
      if (!pending) return;
      var p = pending; pending = null;
      if (!out.length) { push('cover', { title: p, color: 'ink' }); return; }
      if (p.length <= 60) { sectionN++; push('section', { title: p, num: pad2(sectionN), color: (colorFlip++ % 2) ? 'beige' : 'white' }); }
      else {
        /* a paragraph: first sentence is the title, the rest is a single point */
        var m = p.match(/^(.{10,70}?[.!?])\s+(.+)$/);
        if (m) push('bullets', { title: m[1].replace(/[.!?]$/, ''), b1: m[2], color: 'white' });
        else push('section', { title: p.slice(0, 70), num: '', color: 'white' });
      }
    }
    function bulletsFor(title, items) {
      while (items.length) {
        var chunk = items.splice(0, 3), d = { title: title, color: 'white' };
        chunk.forEach(function (b, i) { d['b' + (i + 1)] = b; });
        push('bullets', d);
        title = title + (items.length ? ' (cont.)' : '');
      }
    }

    for (var i = 0; i < lines.length; i++) {
      var raw = lines[i], s = stripMd(raw);
      if (!s) continue;
      var m;
      if ((m = raw.match(/^\s*#\s+(.+)/))) { flushPending(); push('cover', { title: stripMd(m[1]), color: 'ink' }); continue; }
      if ((m = raw.match(/^\s*##\s+(.+)/))) { flushPending(); sectionN++; push('section', { title: stripMd(m[1]), num: pad2(sectionN), color: (colorFlip++ % 2) ? 'beige' : 'white' }); continue; }
      if ((m = raw.match(/^\s*###+\s+(.+)/))) { flushPending(); pending = stripMd(m[1]); continue; }
      if (/^\s*[-*•]\s+/.test(raw) || /^\s*\d+[.)]\s+/.test(raw)) {
        var items = [];
        while (i < lines.length && (/^\s*[-*•]\s+/.test(lines[i]) || /^\s*\d+[.)]\s+/.test(lines[i]))) { items.push(stripMd(lines[i].replace(/^\s*(?:[-*•]|\d+[.)])\s+/, ''))); i++; }
        i--;
        var title = pending || (last() && last().kind === 'section' ? last().data.title : (T.id === 'session' ? 'Today' : 'The point'));
        pending = null;
        var pairs = items.map(function (t) { return t.match(/^([A-Z][\w &\/-]{1,28}):\s+(.+)$/); });
        if (items.length === 2 && pairs[0] && pairs[1]) { push('two', { title: title, lhead: pairs[0][1], lbody: pairs[0][2], rhead: pairs[1][1], rbody: pairs[1][2], color: 'white' }); continue; }
        bulletsFor(title, items);
        continue;
      }
      if ((m = raw.match(/^\s*photo:\s*(.+)$/i))) {
        flushPending();
        var parts = m[1].split('|').map(clean);
        push('photo', { photo: parts[0], title: parts[1] || '' });
        continue;
      }
      if ((m = raw.match(/^\s*logos:\s*(.+)$/i))) {
        var lt = pending || 'Experts from the places you want to go'; pending = null;
        var lp = m[1].split('|').map(clean);
        if (lp.length > 1) { lt = lp[0]; lp = lp.slice(1); }
        push('logos', { title: lt, logos: lp.join(', '), color: 'white' });
        continue;
      }
      if ((m = raw.match(/^\s*(?:two|columns?):\s*(.+)$/i))) {
        var tt = pending || 'Before and after'; pending = null;
        var cp = m[1].split('|').map(clean), L = (cp[0] || '').match(/^([^:]{1,30}):\s*(.+)$/), R = (cp[1] || '').match(/^([^:]{1,30}):\s*(.+)$/);
        push('two', { title: tt, lhead: L ? L[1] : 'Before', lbody: L ? L[2] : cp[0] || '', rhead: R ? R[1] : 'After', rbody: R ? R[2] : cp[1] || '', color: 'white' });
        continue;
      }
      if ((m = raw.match(/^\s*(?:contact|close):\s*(.+)$/i))) { flushPending(); contact = clean(m[1]); continue; }
      if ((m = s.match(QUOTE_RE))) {
        flushPending();
        var who = '', nx = lines[i + 1] ? stripMd(lines[i + 1]) : '';
        if (nx && nx.length <= 90 && !/^[-*#]/.test(lines[i + 1]) && !QUOTE_RE.test(nx) && !STAT_RE.test(nx)) { who = nx.replace(/^[—–-]\s*/, ''); i++; }
        push('quote', { quote: m[1], who: who, color: 'white' });
        continue;
      }
      if ((m = s.match(STAT_RE)) && m[1].replace(/\s/g, '').length <= 10) {
        flushPending();
        var nStats = out.filter(function (sl) { return sl.kind === 'stat'; }).length;
        push('stat', { number: m[1].replace(/\s+/g, ' ').trim(), label: m[2].replace(/^[,:—–-]\s*/, ''), source: '', color: (nStats % 2) ? 'ink' : 'white' });
        continue;
      }
      /* plain line */
      if (pending) flushPending();
      pending = s;
    }
    flushPending();

    if (!out.length) push('cover', { title: T.name, color: 'ink' });
    if (out[0].kind !== 'cover') out.unshift({ kind: 'cover', data: { title: out[0].kind === 'section' ? out[0].data.title : T.name, color: 'ink' } });
    if (out.length > MAX_SLIDES - 1) out = out.slice(0, MAX_SLIDES - 1);
    out.push({ kind: 'close', data: { title: T.closeTitle, contact: contact || T.contact, color: 'white' } });
    out.forEach(function (sl, i) { sl.index = i; sl.page = i + 1; });
    return out;
  }

  /* ---------- render ---------- */
  async function render(x, W, H, slide, h) {
    var kind = slide && slide.kind; if (ALIAS[kind]) kind = ALIAS[kind];
    var hh = H_(h), k = K[kind] || K.section, d = Object.assign({}, k.defaults, slide && slide.data || {});
    x.save();
    x.setTransform(1, 0, 0, 1, 0, 0);
    x.clearRect(0, 0, W, H);
    if (W !== W0 || H !== H0) x.scale(W / W0, H / H0);
    x.imageSmoothingEnabled = true; x.imageSmoothingQuality = 'high';
    x.textAlign = 'left'; x.textBaseline = 'alphabetic';
    VISUAL.area = 0; VISUAL.rect = null; VISUAL.content = null;
    await k.render(x, d, hh, slide || {});
    x.restore();
    return { visual: VISUAL.area };
  }

  /* ---------- sample text per deck type (real copy from data/copy.json, no invented numbers) ---------- */
  var SAMPLES = {
    sales: [
      '# The AI Builder Program',
      '## Everyone is a builder now',
      '### How the program works',
      '- A 5-level program, taught live, online, by leading AI instructors',
      '- Each level is 6 sessions over a condensed 3-week period',
      '- Taught on the tools teams use now: Claude Code, n8n, Cowork and more',
      '33 people on the ASU+GSV Summit team went through the program together.',
      '## What they built',
      '### Three builds from one cohort',
      '- Lucy Baldwin, VP Product: a meeting prep system her team triggers from Slack. About 8 hours a week of prep automated.',
      '- Uma Sankar Reddy: a daily Slack digest that pulls to-dos from Slack, Airtable, Granola and email. It freed up 50% of her time.',
      '- Genny Velazquez, SVP Global Partnerships: a proposal generator that writes in her voice. Proposals went from 2 hours to 30 minutes.',
      '### Proposals, before and after',
      '- Before: 2 hours per proposal, written from scratch each time.',
      '- After: 30 minutes, in her own voice. That is 7.5 hours back every week.',
      '"It put everyone in a builder mindset."',
      'Lucy Baldwin, VP Product, ASU+GSV Summit',
      '### Experts from the places you want to go',
      'logos: Google, Meta, Goldman Sachs, Boston Consulting Group, Harvard Business School, Stanford GSB, The Wharton School, Anthropic',
      'photo: photo-diverse-professionals-collaborating-modern-office | Walk away certified.',
      'contact: joinleland.com/ai'
    ].join('\n'),
    session: [
      '# Level 1, Session 3',
      '### Today',
      '- Review what you built since session 2',
      '- Build a research workflow with Claude Code',
      '- Wire the output into Slack',
      '## Warm up',
      '### Research workflow',
      '- Define the question you want answered every Monday',
      '- List the sources it should read',
      '- Send the single most interesting finding to Slack',
      '### Faisal’s scanner, before and after',
      '- Before: Tracking 12 competitors by hand across trade publications, clinical journals and conferences, whenever he remembered.',
      '- After: A scanner that runs every Monday morning, files entries into Notion and sends him one Slack DM with the top finding.',
      '## Build',
      '### Your turn',
      '- Pick one task you do by hand every week',
      '- Write the prompt that does the first step',
      '- Post what you built in the cohort channel',
      '19 healthcare competitors researched by Patrick’s wiki, kept up to date by Claude Code.',
      '"It exceeded my expectations in what I could learn to build in only 3 weeks."',
      'Patrick, VP of Operations, healthcare',
      'contact: Post your build on Leland before next session'
    ].join('\n'),
    allhands: [
      '# All-hands',
      '## Where we are',
      '6,000+ people and companies joined the last AI Transformation Week.',
      '### What shipped this month',
      '- Leland Community launched on iOS, Android and web',
      '- Livestream clips can now be posted straight to Community',
      '- The ASU+GSV Summit team completed the program, 33 people',
      '## Next quarter',
      '### Focus',
      '- Before: AI Builder Program sold one seat at a time.',
      '- After: Team access, sold to companies and enterprises.',
      '### Priorities',
      '- Grow the AI Builder Program with team and enterprise access',
      '- Keep the Community feed full of people who have done it',
      '- Launch Jobs',
      '"It put everyone in a builder mindset."',
      'Lucy Baldwin, VP Product, ASU+GSV Summit',
      'photo: photo-young-business-team-startup-project | Own your future.',
      'contact: Questions in #general'
    ].join('\n'),
    story: [
      '# PlayPower',
      '## The problem',
      'At 8 to 15 minutes a sheet, rebuilding every product spec sheet was scoped at 12 months.',
      '### What they did in the AI Builder Program',
      '- Pulled data scattered across multiple systems into one spreadsheet',
      '- Had Claude generate every spec sheet from it',
      '- Built a weekly competitive report that saves 6 to 8 hours',
      '### The project, before and after',
      '- Before: 1,500+ spec sheets, 8 to 15 minutes each, scoped at 12 months.',
      '- After: Done in weeks, then a weekly competitive report on top.',
      '12 months of work, done in weeks.',
      '"We’re never going to get through that."',
      'Ryan Moats, VP of Global Marketing, PlayPower, before the program',
      'photo: photo-diverse-professionals-brainstorming-session | Build yours.',
      'contact: joinleland.com/ai'
    ].join('\n')
  };
  /* the proposal sample is a real deck kept as JSON in data/decks/; fetched once at load, with a short stand-in until it arrives */
  SAMPLES.proposal = JSON.stringify({ slides: [
    { kind: 'cover', data: { title: 'Layered support for your AI initiative.', color: 'ink' } },
    { kind: 'agenda', data: K.agenda.defaults },
    { kind: 'price', data: K.price.defaults }
  ] }, null, 2);
  var loading = {};
  types.forEach(function (t) {
    if (!t.json || typeof fetch !== 'function') return;
    loading[t.id] = fetch(t.json).then(function (r) { return r.json(); }).then(function (j) { SAMPLES[t.id] = JSON.stringify(j, null, 2); return SAMPLES[t.id]; }).catch(function () { return SAMPLES[t.id]; });
  });
  function sample(typeId) { return SAMPLES[typeId] || SAMPLES.sales; }
  function ready(typeId) { return loading[typeId] || Promise.resolve(sample(typeId)); }

  window.DECK = { types: types, kinds: kinds, parse: parse, render: render, sample: sample, ready: ready, W: W0, H: H0 };
})();
