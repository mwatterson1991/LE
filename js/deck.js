/* LE deck engine. Plain script: defines window.DECK.
   Slides are 1920x1080 canvases that look like brand/board.html: one flat field per slide, Season for titles,
   Macan for everything else, the lockup or the mark on every slide. Loads after js/templates.js and reuses
   window.TPL_HELPERS (logo, mark, cover, PAL) plus the same shrink-to-fit type code. */
(function () {
  'use strict';

  var TH = window.TPL_HELPERS || {};
  var PAL = TH.PAL || { yellow: '#FFD96F', blue: '#80ACED', slate: '#869AA6', beige: '#F3F1E6', tan: '#EBD4B5', paper: '#F9F8F3', ink: '#010101', neutral: '#222222', follow: '#3963D7', white: '#ffffff' };
  var DARK = { blue: 1, slate: 1, ink: 1, neutral: 1 };
  var W0 = 1920, H0 = 1080;

  function fieldHex(name, pal) { return (pal && pal[name]) || PAL[name] || name || PAL.yellow; }
  function isDark(name) { return !!DARK[name]; }
  function inkFor(name) { return isDark(name) ? PAL.white : PAL.ink; }
  function dimFor(name) { return isDark(name) ? 'rgba(255,255,255,.72)' : 'rgba(1,1,1,.58)'; }
  /* the one coloured phrase: follow blue (#3963D7) on light fields, white on dark/blue/slate (one accent per slide, never two) */
  function accentFor(name) {
    if (isDark(name)) return PAL.white;
    return PAL.follow;
  }

  /* ---------- type (same approach as templates.js) ---------- */
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
    parts.forEach(function (p, i) { x.fillStyle = p.charAt(0) === '[' ? (accent || PAL.follow) : ink; x.fillText(plain(p), cx, Y); cx += widths[i]; });
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
  var PADY = Math.round(.08 * H0) + 18;     /* 104: a little more than 8% so the foot rows have air */
  var CW = W0 - 2 * PAD;                    /* 1612 */
  var LOCK = 44;                             /* lockup height on content slides */
  var PAGE_PX = 26;                          /* page number, Macan 500 */
  var BODY_MIN = 28;                         /* body text never below 28px at 1920 */
  var FOOT_Y = H0 - PADY - LOCK;             /* top of the foot row */

  /* lockup bottom-left, page number bottom-right; returns the y content must stay above */
  function foot(x, h, color, page, opts) {
    opts = opts || {};
    var ink = inkFor(color);
    if (opts.mark) h.mark(x, PAD, FOOT_Y, LOCK, isDark(color) ? 'white' : 'ink');
    else h.logo(x, PAD, FOOT_Y, LOCK, isDark(color) ? 'white' : 'ink');
    if (page) {
      font(x, 'text500', PAGE_PX); x.fillStyle = isDark(color) ? 'rgba(255,255,255,.72)' : 'rgba(1,1,1,.55)';
      x.textAlign = 'right'; x.textBaseline = 'alphabetic';
      x.fillText(String(page), W0 - PAD, FOOT_Y + LOCK - 8);
      x.textAlign = 'left';
    }
    return FOOT_Y - 56;
  }
  function pageOf(slide) { return slide && slide.page ? slide.page : (slide && slide.index ? slide.index + 1 : 0); }
  function pad2(n) { return (n < 10 ? '0' : '') + n; }

  /* ---------- shared pieces for the proposal kinds ----------
     Three sizes on a content slide: the Season headline, BODY for everything you read, SMALL for the eyebrow,
     labels and the page number. Row and column titles are Season at SUB. Hierarchy comes from weight, colour
     and hairlines, never from boxes inside boxes. */
  var SMALL = 26, BODY = 32, SUB = 40, COLGAP = 72;
  function splitLines(s) { return String(s || '').split(/\n/).map(function (l) { return l.trim(); }).filter(Boolean); }
  function bodyFor(c) { return isDark(c) ? 'rgba(255,255,255,.86)' : PAL.neutral; }
  function hairFor(c) { return isDark(c) ? 'rgba(255,255,255,.32)' : 'rgba(1,1,1,.16)'; }
  function hair(x, c, X, Y, w) { x.fillStyle = hairFor(c); x.fillRect(X, Y, w, 2); }
  /* a caps label in Macan 500 at SMALL; Y is the baseline */
  function caps(x, s, X, Y, c, align, color) {
    font(x, 'text500', SMALL); x.letterSpacing = (SMALL * .08).toFixed(2) + 'px';
    x.fillStyle = color || dimFor(c); x.textAlign = align || 'left'; x.textBaseline = 'alphabetic';
    x.fillText(String(s).toUpperCase(), X, Y);
    var w = x.measureText(String(s).toUpperCase()).width;
    x.textAlign = 'left'; x.letterSpacing = '0px'; return w;
  }
  /* eyebrow and headline at the top of a content slide; returns where the content starts and where it must end */
  function head(x, d, c, h, slide, o) {
    o = o || {};
    var ink = inkFor(c), acc = accentFor(c), eye = get(d, 'eyebrow', ''), title = get(d, 'title', '');
    var bottom = foot(x, h, c, pageOf(slide)), y = PADY;
    if (eye) { caps(x, eye, PAD, y + SMALL * .78, c); y += SMALL + 30; }
    /* one line when it holds at a readable size, else two balanced lines */
    var maxW = o.maxW || CW * .94, px = o.px || 92, hr = fit(x, title, 'display', maxW, o.maxH || 230, px, Math.min(px, o.oneMin || 72), 1.0, 1);
    if (hr.lines.length > 1 || hr.w > maxW) hr = fit(x, title, 'display', maxW, o.maxH || 230, px, 56, 1.0, o.lines || 2);
    font(x, 'display', hr.px); y = block(x, hr, PAD, y, 'left', ink, acc);
    return { y: y + (o.gap == null ? 72 : o.gap), bottom: bottom, hr: hr };
  }
  /* "**Lead.** rest of the line": bold lead in ink, the rest in the body colour, wrapped as one paragraph */
  function segs(s) {
    var out = [];
    String(s || '').split(/(\*\*[^*]+\*\*)/).forEach(function (p) { if (!p) return; out.push(/^\*\*/.test(p) ? { t: p.slice(2, -2), b: true } : { t: p, b: false }); });
    return out;
  }
  function mixedLines(x, s, px, maxW) {
    var words = [];
    segs(s).forEach(function (sg) { sg.t.split(/\s+/).filter(Boolean).forEach(function (w) { words.push({ w: w, b: sg.b }); }); });
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
  /* a dim note pinned above the foot, with a hairline over it; returns the y the content above must stay under */
  function noteAt(x, c, note, bottom, px, gap) {
    if (!note) return bottom;
    px = px || BODY - 2; gap = gap || 56;
    var nh = mixedH(x, note, px, CW), y = bottom - nh;
    hair(x, c, PAD, y - 28, CW);
    mixed(x, note, PAD, y, px, CW, 1.35, inkFor(c), dimFor(c));
    return y - 28 - gap;
  }
  function tightRect(x, X, Y, w, h, c, dashed) {
    x.save(); x.strokeStyle = hairFor(c); x.lineWidth = 2; if (dashed) x.setLineDash([10, 10]);
    x.strokeRect(X + 1, Y + 1, w - 2, h - 2); x.restore();
  }

  /* a column of items: a small ink dot in the left gutter, a gap of ~.6 line between items */
  var DOT = 8, IND = 30, BODY_MAX = 36;
  function listH(x, items, px, w, gap, mark) { var ind = mark ? IND : 0; return items.reduce(function (a, s, i) { return a + mixedH(x, s, px, w - ind) + (i ? gap : 0); }, 0); }
  function listDraw(x, items, X, Y, px, w, gap, mark, ink, body) {
    var ind = mark ? IND : 0, y = Y;
    items.forEach(function (s) {
      font(x, 'text400', px); var cap = capOf(x);
      if (mark) { x.fillStyle = ink; x.beginPath(); x.arc(X + DOT / 2, y + cap / 2 + 1, DOT / 2, 0, Math.PI * 2); x.fill(); }
      y = mixed(x, s, X + ind, y, px, w - ind, 1.35, ink, body) + gap;
    });
    return y - gap;
  }
  /* body size for a block: shrink to fit; grow (never past 36) when the block would leave a quarter of the area empty */
  function sizeFor(avail, measure) {
    var px = BODY;
    while (measure(px) > avail && px > BODY_MIN) px -= 1;
    if (measure(px) <= avail * .75) { while (px < BODY_MAX && measure(px + 1) <= avail) px += 1; }
    return px;
  }
  function gapFor(px) { return Math.round(px * .6); }
  /* extra space shared between n items so a column fills its area, capped at one line */
  function spread(avail, used, n, px) { return n > 1 ? Math.max(0, Math.min((avail - used) / (n - 1), px * 1.2)) : 0; }

  /* ---------- slide kinds ---------- */
  var K = {};

  K.cover = {
    name: 'Cover',
    fields: [
      { key: 'eyebrow', label: 'Eyebrow', type: 'text', max: 40, optional: true },
      { key: 'title', label: 'Title', type: 'text', max: 70 },
      { key: 'sub', label: 'Line two', type: 'text', max: 120, optional: true },
      { key: 'meta', label: 'Date or audience', type: 'text', max: 60, optional: true },
      { key: 'photo', label: 'Photo (instead of a field)', type: 'asset', groups: ['background', 'photo'], optional: true },
      { key: 'color', label: 'Field', type: 'color', options: ['yellow', 'blue', 'beige', 'paper', 'ink'] }
    ],
    defaults: { eyebrow: '', title: 'The AI Builder Program', sub: 'Become an AI Builder in 6 to 10 weeks.', meta: '', photo: '', color: 'yellow' },
    render: async function (x, d, h, slide) {
      var c = get(d, 'color', 'yellow'), ink = inkFor(c), acc = accentFor(c), dim = dimFor(c);
      var img = get(d, 'photo', '') ? await loadAsset(h, get(d, 'photo', '')) : null;
      fill(x, W0, H0, fieldHex(c, h.PAL));
      if (img) {
        /* a photo carries a white lockup and white type; a flat darkening keeps the type readable (no gradient) */
        h.cover(x, img, 0, 0, W0, H0, .5, .5);
        x.fillStyle = 'rgba(0,0,0,.22)'; x.fillRect(0, 0, W0, H0);
        ink = PAL.white; acc = PAL.white; dim = 'rgba(255,255,255,.82)'; c = 'ink';
      }
      var title = get(d, 'title', ''), sub = get(d, 'sub', ''), meta = get(d, 'meta', ''), eye = get(d, 'eyebrow', '');
      var lockH = 64, top = PADY, bottom = H0 - PADY - lockH - 72;
      var hr = fit(x, title, 'display', CW * .82, (bottom - top) * (sub ? .7 : .9), 188, 72, .98, 3);
      var sr = sub ? fit(x, sub, 'text400', Math.min(CW * .7, 1100), 220, 48, BODY_MIN, 1.3, 3, true) : null;
      var gap = sub ? Math.round(hr.px * .4) : 0, eyeH = eye ? SMALL + 36 : 0, total = eyeH + hr.h + gap + (sr ? sr.h : 0);
      var y = top + Math.max(0, (bottom - top - total)) * .42;
      if (eye) { caps(x, eye, PAD, y + SMALL * .78, c, 'left', img ? 'rgba(255,255,255,.82)' : null); y += eyeH; }
      font(x, 'display', hr.px); y = block(x, hr, PAD, y, 'left', ink, acc);
      if (sr) { font(x, 'text400', sr.px); block(x, sr, PAD, y + gap, 'left', dim); }
      h.logo(x, PAD, H0 - PADY - lockH, lockH, isDark(c) ? 'white' : 'ink');
      if (meta) { font(x, 'text500', 28); x.fillStyle = dim; x.textAlign = 'right'; x.textBaseline = 'alphabetic'; x.fillText(meta, W0 - PAD, H0 - PADY - 14); x.textAlign = 'left'; }
    }
  };

  K.section = {
    name: 'Section',
    fields: [
      { key: 'title', label: 'Title', type: 'text', max: 70 },
      { key: 'sub', label: 'Line two', type: 'text', max: 140, optional: true },
      { key: 'num', label: 'Number', type: 'text', max: 4, optional: true },
      { key: 'color', label: 'Field', type: 'color', options: ['blue', 'slate', 'ink'] }
    ],
    defaults: { title: 'How the program works', sub: '', num: '01', color: 'blue' },
    render: async function (x, d, h, slide) {
      var c = get(d, 'color', 'blue'), ink = inkFor(c), acc = accentFor(c);
      fill(x, W0, H0, fieldHex(c, h.PAL));
      var title = get(d, 'title', ''), sub = get(d, 'sub', ''), num = get(d, 'num', '');
      var top = PADY, bottom = foot(x, h, c, pageOf(slide));
      var numH = num ? 60 : 0;
      var hr = fit(x, title, 'display', CW * .8, (bottom - top - numH) * (sub ? .62 : .85), 150, 64, .98, 3);
      var sr = sub ? fit(x, sub, 'text400', Math.min(CW * .66, 1080), 220, 44, BODY_MIN, 1.3, 3, true) : null;
      var gap = sub ? Math.round(hr.px * .38) : 0, total = numH + hr.h + gap + (sr ? sr.h : 0);
      var y = top + (bottom - top - total) / 2;
      if (num) { font(x, 'text500', 30); x.fillStyle = dimFor(c); x.textBaseline = 'alphabetic'; x.fillText(num, PAD, y + 26); y += numH; }
      font(x, 'display', hr.px); y = block(x, hr, PAD, y, 'left', ink, acc);
      if (sr) { font(x, 'text400', sr.px); block(x, sr, PAD, y + gap, 'left', dimFor(c)); }
    }
  };

  K.bullets = {
    name: 'Bullets',
    fields: [
      { key: 'title', label: 'Title', type: 'text', max: 70 },
      { key: 'b1', label: 'Point 1', type: 'text', max: 140 },
      { key: 'b2', label: 'Point 2', type: 'text', max: 140, optional: true },
      { key: 'b3', label: 'Point 3', type: 'text', max: 140, optional: true },
      { key: 'b4', label: 'Point 4', type: 'text', max: 140, optional: true },
      { key: 'b5', label: 'Point 5', type: 'text', max: 140, optional: true },
      { key: 'color', label: 'Field', type: 'color', options: ['paper', 'beige', 'tan', 'yellow'] }
    ],
    defaults: { title: 'What you will build', b1: '', b2: '', b3: '', b4: '', b5: '', color: 'paper' },
    render: async function (x, d, h, slide) {
      var c = get(d, 'color', 'paper'), ink = inkFor(c), acc = accentFor(c);
      fill(x, W0, H0, fieldHex(c, h.PAL));
      var title = get(d, 'title', ''), items = [1, 2, 3, 4, 5].map(function (i) { return get(d, 'b' + i, ''); }).filter(Boolean).slice(0, 5);
      var top = PADY, bottom = foot(x, h, c, pageOf(slide));
      var colW = Math.round(CW * .4), listX = PAD + colW + 72, listW = W0 - PAD - listX;
      var hr = fit(x, title, 'display', colW, bottom - top, 96, 48, 1.0, 4);
      font(x, 'display', hr.px); block(x, hr, PAD, top, 'left', ink, acc);
      /* one size for every bullet, shrink until the whole list fits */
      var px = items.length <= 2 ? 72 : items.length === 3 ? 66 : items.length === 4 ? 60 : 54, rs, gapB, listH, dot, indent, y;
      for (; ;) {
        font(x, 'text400', px); gapB = Math.round(px * .75); dot = Math.round(px * .28); indent = Math.round(px * 1.1);
        rs = items.map(function (t) { return fit(x, t, 'text400', listW - indent, 9999, px, px, 1.3, 0, true); });
        listH = rs.reduce(function (a, r) { return a + r.h; }, 0) + gapB * (items.length - 1);
        y = top + Math.max(0, hr.cap - rs[0].cap);   /* the first bullet's cap sits on the title's cap line */
        if (listH <= bottom - y || px <= BODY_MIN) break;
        px -= 2;
      }
      rs.forEach(function (r) {
        font(x, 'text400', r.px);
        x.fillStyle = ink;
        x.beginPath(); x.arc(listX + dot / 2, y + r.cap / 2 + 1, dot / 2, 0, Math.PI * 2); x.fill();
        y = block(x, r, listX + indent, y, 'left', ink, acc) + gapB;
      });
    }
  };

  K.stat = {
    name: 'Stat',
    fields: [
      { key: 'number', label: 'Number', type: 'text', max: 10 },
      { key: 'label', label: 'What it means', type: 'text', max: 110 },
      { key: 'source', label: 'Source', type: 'text', max: 70, optional: true },
      { key: 'color', label: 'Field', type: 'color', options: ['blue', 'yellow', 'ink', 'slate'] }
    ],
    defaults: { number: '33', label: 'people on the ASU+GSV Summit team went through the AI Builder Program.', source: '', color: 'blue' },
    render: async function (x, d, h, slide) {
      var c = get(d, 'color', 'blue'), ink = inkFor(c), dim = dimFor(c);
      fill(x, W0, H0, fieldHex(c, h.PAL));
      var num = get(d, 'number', ''), label = get(d, 'label', ''), src = get(d, 'source', '');
      var top = PADY, bottom = foot(x, h, c, pageOf(slide)) - (src ? 48 : 0);
      /* the number takes the width it needs (up to 60%), the label gets the rest */
      var nr = fit(x, num, 'display', CW * .6, bottom - top, 520, 160, .9, 1);
      var labelX = PAD + Math.max(nr.w, CW * .3) + 80, labelW = W0 - PAD - labelX;
      var lr = fit(x, label, 'text500', labelW, bottom - top, 64, BODY_MIN, 1.22, 5, true);
      var ny = top + (bottom - top - nr.h) / 2;
      font(x, 'display', nr.px); block(x, nr, PAD - nr.px * .02, ny, 'left', ink);
      font(x, 'text500', lr.px); block(x, lr, labelX, ny + nr.cap - lr.cap - (lr.h - lr.cap), 'left', ink);
      if (src) { font(x, 'text400', 26); x.fillStyle = dim; x.textBaseline = 'alphabetic'; x.fillText(src, PAD, FOOT_Y - 36); }
    }
  };

  K.quote = {
    name: 'Quote',
    fields: [
      { key: 'quote', label: 'Quote', type: 'text', max: 200 },
      { key: 'who', label: 'Who', type: 'text', max: 90, optional: true },
      { key: 'expert', label: 'Headshot', type: 'asset', groups: ['expert'], optional: true },
      { key: 'color', label: 'Field', type: 'color', options: ['beige', 'tan', 'paper', 'yellow'] }
    ],
    defaults: { quote: 'It put everyone in a builder mindset.', who: 'Lucy Baldwin, VP Product, ASU+GSV Summit', expert: '', color: 'beige' },
    render: async function (x, d, h, slide) {
      var c = get(d, 'color', 'beige'), ink = inkFor(c), dim = dimFor(c), acc = accentFor(c);
      fill(x, W0, H0, fieldHex(c, h.PAL));
      var quote = get(d, 'quote', ''), who = get(d, 'who', '');
      quote = quote.replace(/^[“"']+|[”"']+$/g, '');
      var img = get(d, 'expert', '') ? await loadAsset(h, get(d, 'expert', '')) : null;
      /* the big curly quote is the one accent on the slide; the text hangs under it */
      var top = PADY, bottom = foot(x, h, c, pageOf(slide));
      var markPx = 360; font(x, 'display', markPx); var markH = capOf(x);
      var qx = PAD, qw = CW * .88;
      var qr = fit(x, quote, 'display', qw, bottom - top - markH * .55 - (who ? 150 : 0), 124, 48, 1.04, 4);
      var wr = who ? fit(x, who, 'text400', qw, 120, 36, BODY_MIN, 1.3, 2) : null;
      var total = markH * .55 + qr.h + (who ? 56 + Math.max(wr.h, img ? 84 : 0) : 0);
      var y = top + Math.max(0, (bottom - top - total) / 2) * .8;
      font(x, 'display', markPx); x.fillStyle = acc; x.textBaseline = 'alphabetic'; x.fillText('\u201C', qx - markPx * .05, y + markH);
      y += markH * .55;
      font(x, 'display', qr.px); y = block(x, qr, qx, y, 'left', ink);
      if (wr || img) {
        y += 56; var wx = qx;
        if (img) { var ph = 84; x.save(); x.beginPath(); x.arc(qx + ph / 2, y + ph / 2, ph / 2, 0, Math.PI * 2); x.clip(); h.cover(x, img, qx, y, ph, ph, .5, .3); x.restore(); wx = qx + ph + 28; }
        if (wr) { font(x, 'text400', wr.px); block(x, wr, wx, y + (img ? (84 - wr.h) / 2 : 0), 'left', dim); }
      }
    }
  };

  K.two = {
    name: 'Two columns',
    fields: [
      { key: 'title', label: 'Title', type: 'text', max: 70 },
      { key: 'lhead', label: 'Left heading', type: 'text', max: 40 },
      { key: 'lbody', label: 'Left text', type: 'text', max: 260 },
      { key: 'rhead', label: 'Right heading', type: 'text', max: 40 },
      { key: 'rbody', label: 'Right text', type: 'text', max: 260 },
      { key: 'color', label: 'Field', type: 'color', options: ['paper', 'beige', 'tan'] }
    ],
    defaults: { title: 'Before and after', lhead: 'Before', lbody: '', rhead: 'After', rbody: '', color: 'paper' },
    render: async function (x, d, h, slide) {
      var c = get(d, 'color', 'paper'), ink = inkFor(c), dim = dimFor(c), acc = accentFor(c);
      fill(x, W0, H0, fieldHex(c, h.PAL));
      var title = get(d, 'title', ''), top = PADY, bottom = foot(x, h, c, pageOf(slide));
      var hr = fit(x, title, 'display', CW * .8, 260, 96, 48, 1.0, 2);
      font(x, 'display', hr.px); var y = block(x, hr, PAD, top, 'left', ink, acc) + 88;
      var gap = 96, colW = (CW - gap) / 2, avail = bottom - y;
      var cols = [['lhead', 'lbody'], ['rhead', 'rbody']].map(function (k) { return { head: get(d, k[0], ''), body: get(d, k[1], '') }; });
      var px = 60, done = false, rs;
      while (!done) {
        rs = cols.map(function (col) { return { hr: col.head ? fit(x, col.head, 'text600', colW, 160, px + 8, BODY_MIN, 1.2, 2, false) : null, br: col.body ? fit(x, col.body, 'text400', colW, 9999, px, px, 1.35, 0, false) : null }; });
        var tallest = Math.max.apply(null, rs.map(function (r) { return (r.hr ? r.hr.h + 28 : 0) + (r.br ? r.br.h : 0); }));
        done = tallest <= avail || px <= BODY_MIN; if (!done) px -= 2;
      }
      cols.forEach(function (col, i) {
        var cx = PAD + i * (colW + gap), cy = y, r = rs[i];
        /* a hairline above each column, like a rule in a table */
        x.fillStyle = isDark(c) ? 'rgba(255,255,255,.35)' : 'rgba(1,1,1,.2)'; x.fillRect(cx, cy - 32, colW, 2);
        if (r.hr) { font(x, 'text600', r.hr.px); cy = block(x, r.hr, cx, cy, 'left', ink) + 28; }
        if (r.br) { font(x, 'text400', r.br.px); block(x, r.br, cx, cy, 'left', ink, acc); }
      });
    }
  };

  K.photo = {
    name: 'Photo',
    fields: [
      { key: 'photo', label: 'Photo', type: 'asset', groups: ['photo', 'background', 'hero'] },
      { key: 'title', label: 'Title', type: 'text', max: 70, optional: true },
      { key: 'sub', label: 'Line two', type: 'text', max: 120, optional: true }
    ],
    defaults: { photo: 'photo-businesswoman-outdoors-city-skyscrapers', title: '', sub: '' },
    render: async function (x, d, h, slide) {
      var img = await loadAsset(h, get(d, 'photo', ''), 'photo');
      fill(x, W0, H0, PAL.neutral);
      if (img) h.cover(x, img, 0, 0, W0, H0, .5, .35);
      x.fillStyle = 'rgba(0,0,0,.1)'; x.fillRect(0, 0, W0, H0);
      var title = get(d, 'title', ''), sub = get(d, 'sub', '');
      var hr = title ? fit(x, title, 'display', CW * .7, H0 * .4, 120, 56, 1.0, 3) : null;
      var sr = sub ? fit(x, sub, 'text400', Math.min(CW * .6, 1000), 200, 40, BODY_MIN, 1.3, 3, true) : null;
      var gap = sub && hr ? Math.round(hr.px * .36) : 0, total = (hr ? hr.h : 0) + gap + (sr ? sr.h : 0);
      var y = H0 - PADY - total - (sr ? 10 : 0);
      var g = x.createLinearGradient(0, 0, 0, H0), t0 = Math.max(.2, (y - H0 * .16) / H0);
      g.addColorStop(0, 'rgba(0,0,0,.3)'); g.addColorStop(Math.min(.3, t0 * .8), 'rgba(0,0,0,0)'); g.addColorStop(t0, 'rgba(0,0,0,0)'); g.addColorStop(Math.min(1, t0 + (1 - t0) * .55), 'rgba(0,0,0,.5)'); g.addColorStop(1, 'rgba(0,0,0,.7)');
      x.fillStyle = g; x.fillRect(0, 0, W0, H0);
      grain(x, W0, H0, .05);
      h.logo(x, PAD, PADY, 56, 'white');
      x.save(); x.shadowColor = 'rgba(0,0,0,.25)'; x.shadowBlur = 24;
      if (hr) { font(x, 'display', hr.px); y = block(x, hr, PAD, y, 'left', PAL.white, PAL.white); }
      if (sr) { font(x, 'text400', sr.px); block(x, sr, PAD, y + gap, 'left', 'rgba(255,255,255,.88)'); }
      x.restore();
      var p = pageOf(slide);
      if (p) { font(x, 'text500', PAGE_PX); x.fillStyle = 'rgba(255,255,255,.8)'; x.textAlign = 'right'; x.textBaseline = 'alphabetic'; x.fillText(String(p), W0 - PAD, FOOT_Y + LOCK - 8); x.textAlign = 'left'; }
    }
  };

  K.logos = {
    name: 'Logos',
    fields: [
      { key: 'title', label: 'Title', type: 'text', max: 70 },
      { key: 'logos', label: 'Organizations (comma separated)', type: 'text', max: 300 },
      { key: 'color', label: 'Field', type: 'color', options: ['paper', 'beige', 'white'] }
    ],
    defaults: { title: 'Experts from the places you want to go', logos: 'Google, Meta, Goldman Sachs, Boston Consulting Group, Harvard Business School, Stanford GSB, The Wharton School, Anthropic', color: 'paper' },
    render: async function (x, d, h, slide) {
      var c = get(d, 'color', 'paper'), ink = inkFor(c), acc = accentFor(c);
      fill(x, W0, H0, fieldHex(c, h.PAL));
      var title = get(d, 'title', ''), names = get(d, 'logos', '').split(/[,\n;]/).map(function (s) { return s.trim(); }).filter(Boolean).slice(0, 8);
      var top = PADY, bottom = foot(x, h, c, pageOf(slide));
      var hr = title ? fit(x, title, 'display', CW * .8, 220, 88, 48, 1.0, 2) : null;
      var y = top; if (hr) { font(x, 'display', hr.px); y = block(x, hr, PAD, top, 'left', ink, acc) + 64; }
      var orgs = names.map(function (n) { return { name: n, a: findOrg(h, n) }; });
      var imgs = await Promise.all(orgs.map(function (o) { return o.a ? h.loadImg(o.a.mono && o.a.mono.black || o.a.src).catch(function () { return null; }) : Promise.resolve(null); }));
      var n = orgs.length, cols = n <= 4 ? n : 4, rows = Math.ceil(n / cols), gap = 40, capPx = 32, capGap = 36;
      var cellW = (CW - gap * (cols - 1)) / cols;
      var labels = orgs.map(function (o) {
        var label = o.a ? String(o.a.title).replace(/\s*\(.*?\)\s*/g, ' ').trim() : o.name;
        if (/Stanford University Graduate School of Business/i.test(label)) label = 'Stanford GSB';
        return label;
      });
      /* captions share one size and one height, so every row lines up */
      var crs = labels.map(function (l) { return fit(x, l, 'text500', cellW, 90, capPx, BODY_MIN, 1.25, 2, false); });
      var capH = Math.max.apply(null, crs.map(function (r) { return r.h; }));
      var avail = bottom - y - gap * (rows - 1), cellH = Math.min(320, avail / rows);
      var markH = Math.max(96, Math.min(176, cellH - capGap - capH));
      cellH = markH + capGap + capH;
      var gridH = rows * cellH + gap * (rows - 1), gy = y + Math.max(0, (bottom - y - gridH) / 2);
      orgs.forEach(function (o, i) {
        var cx = PAD + (i % cols) * (cellW + gap), cy = gy + Math.floor(i / cols) * (cellH + gap);
        var img = imgs[i], ty = cy + markH + capGap;
        if (img) contain(x, img, cx + (cellW - markH) / 2, cy, markH, markH);
        else { /* no mark on file: set the name in Season instead */ var fr = fit(x, labels[i], 'display', cellW, markH, 64, 32, 1, 2); font(x, 'display', fr.px); block(x, fr, cx + cellW / 2, cy + (markH - fr.h) / 2, 'center', ink); }
        font(x, 'text500', crs[i].px); block(x, crs[i], cx + cellW / 2, ty, 'center', dimFor(c));
      });
    }
  };

  K.close = {
    name: 'Close',
    fields: [
      { key: 'title', label: 'Title', type: 'text', max: 60 },
      { key: 'contact', label: 'Contact line', type: 'text', max: 90, optional: true },
      { key: 'color', label: 'Field', type: 'color', options: ['yellow', 'blue', 'beige'] }
    ],
    defaults: { title: 'Let’s talk.', contact: 'joinleland.com', color: 'yellow' },
    render: async function (x, d, h, slide) {
      var c = get(d, 'color', 'yellow'), ink = inkFor(c), acc = accentFor(c);
      fill(x, W0, H0, fieldHex(c, h.PAL));
      var title = get(d, 'title', ''), contact = get(d, 'contact', '');
      var lockH = 132, lockW = 112 / 24 * lockH;
      var hr = title ? fit(x, title, 'display', CW * .8, 260, 110, 56, 1.0, 2) : null;
      var cr = contact ? fit(x, contact, 'text400', CW * .8, 120, 40, BODY_MIN, 1.3, 2) : null;
      var total = lockH + (hr ? 72 + hr.h : 0) + (cr ? 28 + cr.h : 0);
      var y = (H0 - total) / 2 - 10;
      h.logo(x, (W0 - lockW) / 2, y, lockH, isDark(c) ? 'white' : 'ink'); y += lockH;
      if (hr) { font(x, 'display', hr.px); y = block(x, hr, W0 / 2, y + 72, 'center', ink, acc); }
      if (cr) { font(x, 'text400', cr.px); block(x, cr, W0 / 2, y + 28, 'center', dimFor(c)); }
    }
  };

  /* ---------- proposal kinds (sales decks) ---------- */
  var LIGHT = ['paper', 'beige', 'tan', 'yellow'];

  /* numbered rows with hairline rules; "Title | note" per line. Also the clean list for a few components. */
  K.agenda = {
    name: 'Agenda',
    fields: [
      { key: 'eyebrow', label: 'Eyebrow', type: 'text', max: 40, optional: true },
      { key: 'title', label: 'Title', type: 'text', max: 70 },
      { key: 'items', label: 'Rows (Title | note, one per line)', type: 'text', max: 1200 },
      { key: 'numbers', label: 'Numbers', type: 'choice', options: ['yes', 'no'] },
      { key: 'color', label: 'Field', type: 'color', options: LIGHT }
    ],
    defaults: { eyebrow: '', title: 'Agenda.', items: 'What we heard | AI Acceleration at SheerID\nAbout Leland\nOur solution | Enablement, dedicated support, and services\nCommercial details | What it costs and what happens next', numbers: 'yes', color: 'beige' },
    render: async function (x, d, h, slide) {
      var c = get(d, 'color', 'beige'), ink = inkFor(c), dim = dimFor(c);
      fill(x, W0, H0, fieldHex(c, h.PAL));
      var H = head(x, d, c, h, slide, { gap: 56 });
      var rows = splitLines(get(d, 'items', '')).slice(0, 6).map(function (l) { var p = l.split('|'); return { t: p[0].trim(), s: (p[1] || '').trim() }; });
      if (!rows.length) return;
      var numbered = get(d, 'numbers', 'yes') !== 'no', numW = numbered ? 100 : 0;
      var avail = H.bottom - H.y, tpx = 52, bpx = BODY, rs, padR, titleW, descX, descW;
      for (; ;) {
        font(x, 'display', tpx);
        titleW = Math.min(680, Math.max.apply(null, rows.map(function (r) { return mw(x, r.t); })) + 8);
        descX = PAD + numW + titleW + 64; descW = W0 - PAD - descX;
        rs = rows.map(function (r) {
          var tr = fit(x, r.t, 'display', titleW, 999, tpx, tpx, 1.05, 0, false);
          var dr = r.s ? fit(x, r.s, 'text400', descW, 999, bpx, bpx, 1.35, 0, false) : null;
          return { tr: tr, dr: dr, h: Math.max(tr.h, dr ? dr.h : 0) };
        });
        padR = Math.round(tpx * .62);
        var total = rs.reduce(function (a, r) { return a + r.h + padR * 2; }, 0);
        if (total <= avail || (tpx <= 36 && bpx <= BODY_MIN)) break;
        if (tpx > 36) tpx -= 2; if (bpx > BODY_MIN) bpx -= 1;
      }
      var sumH = rs.reduce(function (a, r) { return a + r.h; }, 0);
      padR = Math.max(padR, Math.min(Math.round(tpx * 1.1), Math.floor((avail - sumH) / (2 * rows.length))));
      var totalH = sumH + padR * 2 * rows.length;
      var y = H.y + Math.max(0, Math.min(80, (avail - totalH) * .25));
      rows.forEach(function (r, i) {
        var R = rs[i]; hair(x, c, PAD, y, CW); var ty = y + padR;
        if (numbered) caps(x, pad2(i + 1), PAD, ty + R.tr.cap, c);
        font(x, 'display', R.tr.px); block(x, R.tr, PAD + numW, ty, 'left', ink);
        if (R.dr) { font(x, 'text400', R.dr.px); block(x, R.dr, descX, ty + R.tr.cap - R.dr.cap, 'left', r.s && rows.length > 4 ? bodyFor(c) : dim); }
        y += R.h + padR * 2;
      });
      hair(x, c, PAD, y, CW);
    }
  };

  /* two columns of "**Lead.** one line" items: challenges and outcomes */
  K.heard = {
    name: 'What we heard',
    fields: [
      { key: 'eyebrow', label: 'Eyebrow', type: 'text', max: 40, optional: true },
      { key: 'title', label: 'Title', type: 'text', max: 110 },
      { key: 'sub', label: 'Lead line', type: 'text', max: 120, optional: true },
      { key: 'lhead', label: 'Left label', type: 'text', max: 30 },
      { key: 'left', label: 'Left items (**Lead.** text, one per line)', type: 'text', max: 1200 },
      { key: 'rhead', label: 'Right label', type: 'text', max: 30 },
      { key: 'right', label: 'Right items', type: 'text', max: 1200 },
      { key: 'color', label: 'Field', type: 'color', options: LIGHT }
    ],
    defaults: { eyebrow: 'What we heard', title: '', sub: '', lhead: 'Challenges', left: '', rhead: 'Outcomes', right: '', color: 'paper' },
    render: async function (x, d, h, slide) {
      var c = get(d, 'color', 'paper'), ink = inkFor(c), body = bodyFor(c);
      fill(x, W0, H0, fieldHex(c, h.PAL));
      var H = head(x, d, c, h, slide, { gap: 32, maxH: 240 }), y = H.y, sub = get(d, 'sub', '');
      if (sub) { font(x, 'text400', BODY + 2); var sr = fit(x, sub, 'text400', CW * .8, 120, BODY + 2, BODY, 1.3, 2, false); y = block(x, sr, PAD, y, 'left', dimFor(c)) + 64; } else y += 32;
      var cols = [{ head: get(d, 'lhead', ''), items: splitLines(get(d, 'left', '')).slice(0, 5) }, { head: get(d, 'rhead', ''), items: splitLines(get(d, 'right', '')).slice(0, 5) }];
      var colW = (CW - 120) / 2, avail = H.bottom - y;
      function measure(px) { return 82 + Math.max.apply(null, cols.map(function (col) { return listH(x, col.items, px, colW, gapFor(px), true); })); }
      var px = sizeFor(avail, measure), n = Math.max.apply(null, cols.map(function (col) { return col.items.length; }));
      var gap = gapFor(px) + spread(avail, measure(px), n, px);
      cols.forEach(function (col, i) {
        var cx = PAD + i * (colW + 120), cy = y;
        hair(x, c, cx, cy, colW); caps(x, col.head, cx, cy + 24 + SMALL * .78, c); cy += 82;
        listDraw(x, col.items, cx, cy, px, colW, gap, true, ink, body);
      });
    }
  };

  /* who we are: a logo row, three proof figures, two plain lines */
  K.proof = {
    name: 'Proof',
    fields: [
      { key: 'eyebrow', label: 'Eyebrow', type: 'text', max: 40, optional: true },
      { key: 'title', label: 'Title', type: 'text', max: 70 },
      { key: 'logolabel', label: 'Logo row label', type: 'text', max: 30, optional: true },
      { key: 'logos', label: 'Organizations (comma separated)', type: 'text', max: 300, optional: true },
      { key: 'stats', label: 'Figures (number | what it means, one per line)', type: 'text', max: 300, optional: true },
      { key: 'lines', label: 'Lines (**Lead.** text, one per line)', type: 'text', max: 600, optional: true },
      { key: 'color', label: 'Field', type: 'color', options: ['paper', 'beige', 'ink'] }
    ],
    defaults: { eyebrow: 'About Leland', title: 'An end-to-end AI enablement partner.', logolabel: 'Trusted by teams at', logos: 'Salesforce, Adobe, LinkedIn, Morgan Stanley', stats: '3,500+ | industry experts, 150+ pathways\n4.99 | average rating\n7.5M+ | people building careers on Leland', lines: '', color: 'paper' },
    render: async function (x, d, h, slide) {
      var c = get(d, 'color', 'paper'), ink = inkFor(c), dim = dimFor(c), body = bodyFor(c);
      fill(x, W0, H0, fieldHex(c, h.PAL));
      var H = head(x, d, c, h, slide, { gap: 64 }), y = H.y;
      /* "=Name" forces the name set in type instead of a mark on file */
      var names = get(d, 'logos', '').split(/[,\n;]/).map(function (s) { return s.trim(); }).filter(Boolean).slice(0, 8);
      if (names.length) {
        var orgs = names.map(function (n) { var text = n.charAt(0) === '='; n = n.replace(/^=/, ''); return { name: n, a: text ? null : findOrg(h, n) }; });
        var imgs = await Promise.all(orgs.map(function (o) { return o.a ? h.loadImg(o.a.mono && (isDark(c) ? o.a.mono.white : o.a.mono.black) || o.a.src).catch(function () { return null; }) : Promise.resolve(null); }));
        var label = get(d, 'logolabel', ''), lx = PAD, rowH = 64, markH = 56;
        if (label) { lx += caps(x, label, PAD, y + rowH / 2 + SMALL * .36, c) + 72; }
        /* marks take the width they need (contained in a 56px band), names are set in Macan 600; spread evenly */
        font(x, 'text600', 30);
        var ws = orgs.map(function (o, i) { var im = imgs[i]; if (!im) return mw(x, o.name); var s = Math.min(markH / (im.naturalHeight || im.height), 200 / (im.naturalWidth || im.width)); return (im.naturalWidth || im.width) * s; });
        var total = ws.reduce(function (a, b) { return a + b; }, 0), space = Math.max(40, (W0 - PAD - lx - total) / Math.max(1, orgs.length - 1)), cx = lx;
        orgs.forEach(function (o, i) {
          if (imgs[i]) contain(x, imgs[i], cx, y + (rowH - markH) / 2, ws[i], markH);
          else { font(x, 'text600', 30); x.fillStyle = ink; x.textAlign = 'left'; x.textBaseline = 'middle'; x.fillText(o.name, cx, y + rowH / 2); x.textBaseline = 'alphabetic'; }
          cx += ws[i] + space;
        });
        y += rowH + 80;
      }
      var stats = splitLines(get(d, 'stats', '')).slice(0, 3).map(function (l) { var p = l.split('|'); return { n: p[0].trim(), l: (p[1] || '').trim() }; });
      var lines = splitLines(get(d, 'lines', '')).slice(0, 3);
      var linesH = lines.reduce(function (a, s) { return a + mixedH(x, s, BODY, CW) + 20; }, 0);
      if (stats.length) {
        var colW = (CW - COLGAP * (stats.length - 1)) / stats.length, numPx = 132;
        var avail = H.bottom - y - (lines.length ? linesH + 72 : 0);
        numPx = Math.min(numPx, Math.max(72, Math.round(avail - 24 - BODY * 1.35 - 32)));
        var statH = 0;
        stats.forEach(function (s, i) {
          var cx = PAD + i * (colW + COLGAP), cy = y;
          hair(x, c, cx, cy, colW); cy += 36;
          var nr = fit(x, s.n, 'display', colW, 400, numPx, 48, 1, 1); font(x, 'display', nr.px); cy = block(x, nr, cx, cy, 'left', ink) + 22;
          var lr = fit(x, s.l, 'text400', colW, 200, BODY, BODY_MIN, 1.3, 2, false); font(x, 'text400', lr.px); cy = block(x, lr, cx, cy, 'left', dim);
          statH = Math.max(statH, cy - y);
        });
        y += statH + 72;
      }
      if (lines.length) {
        var ly = stats.length ? y : y;
        if (!stats.length) ly = y;
        lines.forEach(function (s) { ly = mixed(x, s, PAD, ly, BODY, CW, 1.35, ink, body) + 20; });
      }
    }
  };

  /* a roadmap: month axis, one bar (or several) per row, an optional shaded band, three short columns or a note below */
  K.timeline = {
    name: 'Timeline',
    fields: [
      { key: 'eyebrow', label: 'Eyebrow', type: 'text', max: 60, optional: true },
      { key: 'title', label: 'Title', type: 'text', max: 70 },
      { key: 'months', label: 'Axis labels (comma separated)', type: 'text', max: 120 },
      { key: 'rows', label: 'Rows (Label | sublabel | start-end style text ; ...)', type: 'text', max: 1600 },
      { key: 'band', label: 'Shaded band (start | end | label)', type: 'text', max: 40, optional: true },
      { key: 'cols', label: 'Columns below (Title | text, up to three)', type: 'text', max: 700, optional: true },
      { key: 'note', label: 'Note', type: 'text', max: 400, optional: true },
      { key: 'color', label: 'Field', type: 'color', options: ['paper', 'beige'] }
    ],
    defaults: { eyebrow: '', title: 'Roadmap.', months: 'Oct, Nov, Dec, Jan, Feb', rows: 'Foundations | Everyone | 0-2 solid All employees', band: '', cols: '', note: '', color: 'paper' },
    render: async function (x, d, h, slide) {
      var c = get(d, 'color', 'paper'), ink = inkFor(c), dim = dimFor(c), body = bodyFor(c);
      fill(x, W0, H0, fieldHex(c, h.PAL));
      var H = head(x, d, c, h, slide, { gap: 48, lines: 1, maxH: 120 }), y = H.y, bottom = H.bottom;
      var months = get(d, 'months', '').split(',').map(function (s) { return s.trim(); }).filter(Boolean), N = Math.max(1, months.length);
      var rows = splitLines(get(d, 'rows', '')).slice(0, 8).map(function (l) {
        var p = l.split('|').map(function (s) { return s.trim(); });
        var segs = (p[2] || '').split(';').map(function (s) { var m = s.trim().match(/^([\d.]+)\s*-\s*([\d.]+)\s+(solid|light|dashed)\s*(.*)$/); return m ? { a: +m[1], b: +m[2], st: m[3], t: m[4] } : null; }).filter(Boolean);
        return { label: p[0] || '', sub: p[1] || '', segs: segs };
      });
      var cols = splitLines(get(d, 'cols', '')).slice(0, 3).map(function (l) { var p = l.split('|'); return { t: p[0].trim(), s: (p[1] || '').trim() }; });
      var note = get(d, 'note', '');
      /* what sits under the chart */
      if (note) bottom = noteAt(x, c, note, bottom, BODY - 2);
      var colsH = 0, colW = cols.length ? (CW - COLGAP * (cols.length - 1)) / cols.length : 0;
      var CPX = BODY - 4;
      if (cols.length) {
        colsH = Math.max.apply(null, cols.map(function (col) { return 24 + CPX * 1.2 + 14 + mixedH(x, col.s, CPX, colW); }));
        var cy0 = bottom - colsH;
        cols.forEach(function (col, i) {
          var cx = PAD + i * (colW + COLGAP), cy = cy0;
          hair(x, c, cx, cy, colW); cy += 24;
          font(x, 'text600', CPX); x.fillStyle = ink; x.textBaseline = 'alphabetic'; x.fillText(col.t, cx, cy + capOf(x)); cy += CPX * 1.2 + 14;
          mixed(x, col.s, cx, cy, CPX, colW, 1.35, ink, body);
        });
        bottom = cy0 - 56;
      }
      /* the chart */
      var band = get(d, 'band', '').split('|').map(function (s) { return s.trim(); }), hasBand = band.length >= 2 && !isNaN(+band[0]) && !isNaN(+band[1]);
      var labelW = 380, axisX = PAD + labelW + 48, axisW = W0 - PAD - axisX;
      function mx(m) { return axisX + (m / N) * axisW; }
      var axisY = y + SMALL, rowsTop = axisY + 28, bandLabelH = hasBand && band[2] ? SMALL + 16 : 0;
      var rowH = Math.min(96, Math.floor((bottom - rowsTop - bandLabelH) / Math.max(1, rows.length))), barH = Math.min(44, Math.round(rowH * .6));
      if (hasBand) {
        var bx0 = mx(+band[0]), bx1 = mx(+band[1]);
        x.save(); x.beginPath(); x.rect(bx0, rowsTop, bx1 - bx0, rowH * rows.length); x.clip();
        x.fillStyle = isDark(c) ? 'rgba(255,255,255,.04)' : 'rgba(1,1,1,.03)'; x.fillRect(bx0, rowsTop, bx1 - bx0, rowH * rows.length);
        x.strokeStyle = isDark(c) ? 'rgba(255,255,255,.1)' : 'rgba(1,1,1,.07)'; x.lineWidth = 2;
        for (var k = -rowH * rows.length; k < bx1 - bx0 + rowH * rows.length; k += 18) { x.beginPath(); x.moveTo(bx0 + k, rowsTop); x.lineTo(bx0 + k + rowH * rows.length, rowsTop + rowH * rows.length); x.stroke(); }
        x.restore();
        if (band[2]) caps(x, band[2], (bx0 + bx1) / 2, rowsTop + rowH * rows.length + 16 + SMALL * .78, c, 'center');
      }
      months.forEach(function (m, i) { caps(x, m, mx(i), axisY, c); });
      hair(x, c, axisX, axisY + 14, axisW);
      x.save(); x.strokeStyle = hairFor(c); x.lineWidth = 1; x.globalAlpha = .6;
      for (var i = 1; i < N; i++) { x.beginPath(); x.moveTo(mx(i), rowsTop); x.lineTo(mx(i), rowsTop + rowH * rows.length); x.stroke(); }
      x.restore();
      rows.forEach(function (r, i) {
        var ry = rowsTop + i * rowH, mid = ry + rowH / 2;
        if (i) { x.fillStyle = hairFor(c); x.globalAlpha = .5; x.fillRect(PAD, ry, CW, 1); x.globalAlpha = 1; }
        var LPX = rowH >= 64 ? 28 : 26, SPX = rowH >= 64 ? 24 : 22;
        var lr = fit(x, r.label, 'text600', labelW, 70, LPX, 22, 1.15, 2, false);
        var subH = r.sub ? SPX * .78 : 0, lh = lr.h + (subH ? subH + 6 : 0), ly = mid - lh / 2;
        font(x, 'text600', lr.px); block(x, lr, PAD + labelW, ly, 'right', ink);
        if (r.sub) { font(x, 'text400', SPX); x.fillStyle = dim; x.textAlign = 'right'; x.textBaseline = 'alphabetic'; x.fillText(r.sub, PAD + labelW, ly + lr.h + 6 + SPX * .78); }
        x.textAlign = 'left';
        r.segs.forEach(function (s) {
          var x0 = mx(s.a), x1 = mx(s.b), w = Math.max(barH, x1 - x0), by = mid - barH / 2;
          if (s.st === 'solid') { x.fillStyle = ink; x.fillRect(x0, by, w, barH); }
          else if (s.st === 'light') { x.fillStyle = isDark(c) ? 'rgba(255,255,255,.18)' : 'rgba(1,1,1,.1)'; x.fillRect(x0, by, w, barH); }
          else tightRect(x, x0, by, w, barH, c, true);
          if (s.t) {
            font(x, 'text500', SMALL); var tw = mw(x, s.t), inside = tw + 28 <= w;
            x.fillStyle = s.st === 'solid' ? (isDark(c) ? PAL.ink : PAL.white) : ink; x.textBaseline = 'middle';
            if (inside) x.fillText(s.t, x0 + 16, mid + 1);
            else if (x1 + 16 + tw <= W0 - PAD) { x.fillStyle = ink; x.fillText(s.t, x1 + 16, mid + 1); }
            else { x.fillStyle = ink; x.textAlign = 'right'; x.fillText(s.t, x0 - 16, mid + 1); x.textAlign = 'left'; }
            x.textBaseline = 'alphabetic';
          }
        });
      });
    }
  };

  /* three plain columns: a hairline, a title, up to four lines (or one paragraph), an optional note */
  K.cards3 = {
    name: 'Three columns',
    fields: [
      { key: 'eyebrow', label: 'Eyebrow', type: 'text', max: 40, optional: true },
      { key: 'title', label: 'Title', type: 'text', max: 80 },
      { key: 'h1', label: 'Column 1 title', type: 'text', max: 60 }, { key: 'c1', label: 'Column 1 lines', type: 'text', max: 700 },
      { key: 'h2', label: 'Column 2 title', type: 'text', max: 60 }, { key: 'c2', label: 'Column 2 lines', type: 'text', max: 700 },
      { key: 'h3', label: 'Column 3 title', type: 'text', max: 60 }, { key: 'c3', label: 'Column 3 lines', type: 'text', max: 700 },
      { key: 'i1', label: 'Column 1 illustration', type: 'asset', groups: ['illustration'], optional: true },
      { key: 'i2', label: 'Column 2 illustration', type: 'asset', groups: ['illustration'], optional: true },
      { key: 'i3', label: 'Column 3 illustration', type: 'asset', groups: ['illustration'], optional: true },
      { key: 'note', label: 'Note', type: 'text', max: 300, optional: true },
      { key: 'color', label: 'Field', type: 'color', options: LIGHT }
    ],
    defaults: { eyebrow: '', title: 'How progress gets measured.', h1: '', c1: '', h2: '', c2: '', h3: '', c3: '', i1: '', i2: '', i3: '', note: '', color: 'beige' },
    render: async function (x, d, h, slide) {
      var c = get(d, 'color', 'beige'), ink = inkFor(c), body = bodyFor(c);
      fill(x, W0, H0, fieldHex(c, h.PAL));
      var H = head(x, d, c, h, slide, { gap: 64 }), y = H.y, bottom = noteAt(x, c, get(d, 'note', ''), H.bottom);
      var cols = [1, 2, 3].map(function (i) { return { t: get(d, 'h' + i, ''), lines: splitLines(get(d, 'c' + i, '')).slice(0, 4), img: get(d, 'i' + i, '') }; }).filter(function (col) { return col.t || col.lines.length; });
      if (!cols.length) return;
      var imgs = await Promise.all(cols.map(function (col) { return col.img ? loadAsset(h, col.img) : Promise.resolve(null); }));
      var CG = 60, colW = (CW - CG * (cols.length - 1)) / cols.length, imgH = imgs.some(Boolean) ? 150 : 0, avail = bottom - y;
      var trs = cols.map(function (col) { return col.t ? fit(x, col.t, 'display', colW, 140, SUB, 32, 1.08, 2, false) : null; });
      var titleH = Math.max.apply(null, trs.map(function (r) { return r ? r.h : 0; })), top = 26 + imgH + (imgH ? 32 : 0) + titleH + 26;
      var n = Math.max.apply(null, cols.map(function (col) { return col.lines.length; })), mark = n > 1;
      function measure(px) { return top + Math.max.apply(null, cols.map(function (col) { return listH(x, col.lines, px, colW, gapFor(px), mark); })); }
      var px = sizeFor(avail, measure), gap = gapFor(px) + spread(avail, measure(px), n, px);
      cols.forEach(function (col, i) {
        var cx = PAD + i * (colW + CG), cy = y;
        hair(x, c, cx, cy, colW); cy += 26;
        if (imgH) { if (imgs[i]) contain(x, imgs[i], cx, cy, Math.min(colW, 200), imgH); cy += imgH + 32; }
        if (trs[i]) { font(x, 'display', trs[i].px); block(x, trs[i], cx, cy, 'left', ink); }
        cy += titleH + 26;
        listDraw(x, col.lines, cx, cy, px, colW, gap, mark, ink, body);
      });
    }
  };

  /* experts grouped by function: "## Function" then "Name | credential" lines; a face only when the manifest has that name */
  K.people = {
    name: 'People',
    fields: [
      { key: 'eyebrow', label: 'Eyebrow', type: 'text', max: 60, optional: true },
      { key: 'title', label: 'Title', type: 'text', max: 80 },
      { key: 'groups', label: 'Groups (## Function, then Name | credential per line)', type: 'text', max: 1600 },
      { key: 'note', label: 'Note', type: 'text', max: 200, optional: true },
      { key: 'color', label: 'Field', type: 'color', options: LIGHT }
    ],
    defaults: { eyebrow: '', title: 'Domain experts who have run this inside their own function.', groups: '## Go-to-Market\nClaudia P. | Example credential', note: '', color: 'paper' },
    render: async function (x, d, h, slide) {
      var c = get(d, 'color', 'paper'), ink = inkFor(c), body = bodyFor(c);
      fill(x, W0, H0, fieldHex(c, h.PAL));
      var H = head(x, d, c, h, slide, { gap: 56 }), y = H.y, bottom = noteAt(x, c, get(d, 'note', ''), H.bottom, BODY - 2, 40);
      var groups = [], cur = null;
      splitLines(get(d, 'groups', '')).forEach(function (l) {
        var m = l.match(/^##\s*(.+)$/);
        if (m) { cur = { t: m[1].trim(), people: [] }; groups.push(cur); return; }
        if (!cur) { cur = { t: '', people: [] }; groups.push(cur); }
        var p = l.split('|'); cur.people.push({ n: p[0].trim(), s: (p[1] || '').trim() });
      });
      groups = groups.slice(0, 6);
      if (!groups.length) return;
      /* a face only when the manifest has an expert with exactly that name */
      var experts = h.byGroup('expert');
      var faces = await Promise.all(groups.map(function (g) { return Promise.all(g.people.map(function (p) { var a = experts.filter(function (e) { return String(e.title).trim().toLowerCase() === p.n.toLowerCase(); })[0]; return a ? h.loadImg(a.src).catch(function () { return null; }) : Promise.resolve(null); })); }));
      var ncol = groups.length <= 3 ? groups.length : 3, nrow = Math.ceil(groups.length / ncol);
      var colW = (CW - COLGAP * (ncol - 1)) / ncol, FACE = 56, rowGap = 36, gh, avail = bottom - y, px, pgap;
      function groupH(g, gi) { var hh = 22 + SUB * .78 + 22; g.people.forEach(function (p, pi) { var ind = faces[gi][pi] ? FACE + 20 : IND; hh += Math.max(faces[gi][pi] ? FACE : 0, mixedH(x, '**' + p.n + '** ' + p.s, px, colW - ind)) + pgap; }); return hh - pgap; }
      function measure(p) { px = p; pgap = gapFor(p); gh = groups.map(groupH); var rowsH = 0; for (var r = 0; r < nrow; r++) rowsH += Math.max.apply(null, gh.slice(r * ncol, r * ncol + ncol)) + (r ? rowGap : 0); return rowsH; }
      px = sizeFor(avail, measure); var used = measure(px);
      if (nrow > 1) rowGap += Math.max(0, Math.min((avail - used) / (nrow - 1), 72));
      var ry = y;
      for (var r = 0; r < nrow; r++) {
        var rowH = Math.max.apply(null, gh.slice(r * ncol, r * ncol + ncol));
        groups.slice(r * ncol, r * ncol + ncol).forEach(function (g, ci) {
          var gi = r * ncol + ci, cx = PAD + ci * (colW + COLGAP), cy = ry;
          hair(x, c, cx, cy, colW); cy += 22;
          var tr = fit(x, g.t, 'display', colW, 60, SUB, 30, 1, 1); font(x, 'display', tr.px); block(x, tr, cx, cy, 'left', ink); cy += SUB * .78 + 22;
          g.people.forEach(function (p, pi) {
            var f = faces[gi][pi], ind = f ? FACE + 20 : IND;
            if (f) { x.save(); x.beginPath(); x.arc(cx + FACE / 2, cy + FACE / 2, FACE / 2, 0, Math.PI * 2); x.clip(); h.cover(x, f, cx, cy, FACE, FACE, .5, .3); x.restore(); }
            else { font(x, 'text400', px); var cap = capOf(x); x.fillStyle = ink; x.beginPath(); x.arc(cx + DOT / 2, cy + cap / 2 + 1, DOT / 2, 0, Math.PI * 2); x.fill(); }
            var th = mixedH(x, '**' + p.n + '** ' + p.s, px, colW - ind);
            mixed(x, '**' + p.n + '** ' + p.s, cx + ind, cy + (f ? Math.max(0, (FACE - th) / 2) : 0), px, colW - ind, 1.35, ink, body);
            cy += Math.max(f ? FACE : 0, th) + pgap;
          });
        });
        ry += rowH + rowGap;
      }
    }
  };

  /* one or two offers: eyebrow, the figure in Season, up to six lines, a dated line */
  K.price = {
    name: 'Price',
    fields: [
      { key: 'eyebrow', label: 'Eyebrow', type: 'text', max: 40, optional: true },
      { key: 'title', label: 'Title', type: 'text', max: 70 },
      { key: 'e1', label: 'Offer 1 label', type: 'text', max: 60 }, { key: 'p1', label: 'Offer 1 figure', type: 'text', max: 14 },
      { key: 'l1', label: 'Offer 1 lines', type: 'text', max: 900 }, { key: 'd1', label: 'Offer 1 dates', type: 'text', max: 80, optional: true },
      { key: 'e2', label: 'Offer 2 label', type: 'text', max: 60, optional: true }, { key: 'p2', label: 'Offer 2 figure', type: 'text', max: 14, optional: true },
      { key: 'l2', label: 'Offer 2 lines', type: 'text', max: 900, optional: true }, { key: 'd2', label: 'Offer 2 dates', type: 'text', max: 80, optional: true },
      { key: 'note', label: 'Note', type: 'text', max: 200, optional: true },
      { key: 'color', label: 'Field', type: 'color', options: ['ink', 'paper', 'beige', 'blue'] }
    ],
    defaults: { eyebrow: 'Commercial details', title: '', e1: 'Full solution', p1: '$250,000', l1: '', d1: '', e2: '', p2: '', l2: '', d2: '', note: '', color: 'ink' },
    render: async function (x, d, h, slide) {
      var c = get(d, 'color', 'ink'), ink = inkFor(c), dim = dimFor(c), body = bodyFor(c);
      fill(x, W0, H0, fieldHex(c, h.PAL));
      var H = head(x, d, c, h, slide, { gap: 72 }), y = H.y, bottom = H.bottom;
      var offers = [1, 2].map(function (i) { return { e: get(d, 'e' + i, ''), p: get(d, 'p' + i, ''), lines: splitLines(get(d, 'l' + i, '')).slice(0, 6), dt: get(d, 'd' + i, '') }; }).filter(function (o) { return o.p; });
      if (!offers.length) return;
      if (offers.length === 1) {
        bottom = noteAt(x, c, get(d, 'note', ''), bottom);
        var o = offers[0], leftW = 720, rx = PAD + leftW + 120, rw = W0 - PAD - rx;
        hair(x, c, PAD, y, CW); var cy = y + 40;
        caps(x, o.e, PAD, cy + SMALL * .78, c); cy += SMALL + 28;
        var pr = fit(x, o.p, 'display', leftW, 300, 220, 96, 1, 1); font(x, 'display', pr.px); var py = block(x, pr, PAD - pr.px * .03, cy, 'left', ink);
        if (o.dt) { font(x, 'text500', BODY); x.fillStyle = ink; x.textBaseline = 'alphabetic'; var dr = fit(x, o.dt, 'text500', leftW, 120, BODY, BODY_MIN, 1.3, 2, false); font(x, 'text500', dr.px); block(x, dr, PAD, py + 36, 'left', ink); }
        var ly = y + 40 + SMALL + 28 - 8;
        o.lines.forEach(function (s, i) { if (i) hair(x, c, rx, ly - 22, rw); ly = mixed(x, s, rx, ly, BODY, rw, 1.35, ink, body) + 44; });
      } else {
        /* two offers: the first (the one we recommend) gets the wider column; lines are a plain list, the note sits under the shorter column */
        var gap = 96, colWs = [(CW - gap) * .54, (CW - gap) * .46], px = BODY, hs, FIG = 100, LH = 1.28, note = get(d, 'note', '');
        bottom = H.bottom + 16;
        function capsLines(s, w) { font(x, 'text500', SMALL); x.letterSpacing = (SMALL * .08).toFixed(2) + 'px'; var ok = mw(x, String(s).toUpperCase()) <= w; x.letterSpacing = '0px'; if (ok || s.indexOf('·') < 0) return [s]; var i = s.indexOf('·'); return [s.slice(0, i).trim(), s.slice(i + 1).trim()]; }
        for (; ;) {
          hs = offers.map(function (o, i) { var g = Math.round(px * .8); return capsLines(o.e, colWs[i]).length * (SMALL + 6) + 20 + FIG * .74 + 28 + o.lines.reduce(function (a, s) { return a + mixedH(x, s, px, colWs[i], LH) + g; }, 0) + 20 + px; });
          if (Math.max.apply(null, hs) + 18 <= bottom - y || px <= BODY_MIN) break; px -= 1;
        }
        var cxs = [PAD, PAD + colWs[0] + gap];
        offers.forEach(function (o, i) {
          var cx = cxs[i], colW = colWs[i], cy = y, g = Math.round(px * .8);
          hair(x, c, cx, cy, colW); cy += 18;
          capsLines(o.e, colW).forEach(function (l) { caps(x, l, cx, cy + SMALL * .78, c); cy += SMALL + 6; });
          cy += 20;
          var pr = fit(x, o.p, 'display', colW, 200, FIG, 60, 1, 1); font(x, 'display', pr.px); block(x, pr, cx - pr.px * .03, cy, 'left', ink); cy += FIG * .74 + 28;
          o.lines.forEach(function (s) { cy = mixed(x, s, cx, cy, px, colW, LH, ink, body) + g; });
          cy += 20 - g;
          if (o.dt) { font(x, 'text500', px); x.fillStyle = ink; x.textBaseline = 'alphabetic'; x.fillText(o.dt, cx, cy + capOf(x)); cy += px * LH; }
          o.endY = cy;
        });
        if (note) {
          var shortI = offers[1].endY <= offers[0].endY ? 1 : 0, ny = Math.max(offers[shortI].endY + 28, Math.min(offers[1 - shortI].endY, bottom) - mixedH(x, note, px, colWs[shortI], LH));
          mixed(x, note, cxs[shortI], ny, px, colWs[shortI], LH, ink, dim);
        }
      }
    }
  };

  /* next steps: a horizontal rail with dates above and labels below; the last step is filled */
  K.steps = {
    name: 'Next steps',
    fields: [
      { key: 'eyebrow', label: 'Eyebrow', type: 'text', max: 40, optional: true },
      { key: 'title', label: 'Title', type: 'text', max: 70 },
      { key: 'steps', label: 'Steps (Date | what happens, one per line)', type: 'text', max: 600 },
      { key: 'color', label: 'Field', type: 'color', options: ['yellow', 'paper', 'beige', 'blue', 'ink'] }
    ],
    defaults: { eyebrow: 'Next steps', title: 'From here to kickoff.', steps: 'Sept 18 | Contracting complete\nOct 1 | Kick-off', color: 'yellow' },
    render: async function (x, d, h, slide) {
      var c = get(d, 'color', 'yellow'), ink = inkFor(c), dim = dimFor(c), body = bodyFor(c);
      fill(x, W0, H0, fieldHex(c, h.PAL));
      var H = head(x, d, c, h, slide, { gap: 0 }), y = H.y, bottom = H.bottom;
      var steps = splitLines(get(d, 'steps', '')).slice(0, 6).map(function (l) { var p = l.split('|'); return { dt: p[0].trim(), t: (p[1] || '').trim() }; });
      if (!steps.length) return;
      var n = steps.length, cellW = CW / n, railY = y + (bottom - y) / 2 - 20, DOT = 18;
      hair(x, c, PAD, railY - 1, CW - cellW + DOT);
      steps.forEach(function (s, i) {
        var sx = PAD + i * cellW, last = i === n - 1;
        x.beginPath(); x.arc(sx + DOT / 2, railY, last ? DOT / 2 + 4 : DOT / 2, 0, Math.PI * 2);
        if (last) { x.fillStyle = ink; x.fill(); } else { x.fillStyle = fieldHex(c, h.PAL); x.fill(); x.lineWidth = 2; x.strokeStyle = ink; x.stroke(); }
        caps(x, s.dt, sx, railY - 36, c, 'left', last ? ink : null);
        var tr = fit(x, s.t, last ? 'text600' : 'text400', cellW - 48, 200, BODY + 2, BODY_MIN, 1.3, 3, false);
        font(x, last ? 'text600' : 'text400', tr.px); block(x, tr, sx, railY + 40, 'left', last ? ink : body);
      });
    }
  };

  /* five numbered levels in a row, the first filled ink */
  K.levels = {
    name: 'Levels',
    fields: [
      { key: 'eyebrow', label: 'Eyebrow', type: 'text', max: 40, optional: true },
      { key: 'title', label: 'Title', type: 'text', max: 70 },
      { key: 'intro', label: 'Lines above (one per line)', type: 'text', max: 500, optional: true },
      { key: 'levels', label: 'Levels (one per line)', type: 'text', max: 400 },
      { key: 'note', label: 'Note', type: 'text', max: 300, optional: true },
      { key: 'color', label: 'Field', type: 'color', options: LIGHT }
    ],
    defaults: { eyebrow: 'AI Builder Program', title: 'Empower every team to be an AI Builder.', intro: '', levels: 'Use AI to 10x your impact\nBuild complex agentic workflows\nCreate autonomous agents\nBuild your agent workforce\nDesign your AI orchestration layer', note: '', color: 'beige' },
    render: async function (x, d, h, slide) {
      var c = get(d, 'color', 'beige'), ink = inkFor(c), dim = dimFor(c), body = bodyFor(c);
      fill(x, W0, H0, fieldHex(c, h.PAL));
      var H = head(x, d, c, h, slide, { gap: 56 }), y = H.y, bottom = noteAt(x, c, get(d, 'note', ''), H.bottom);
      var intro = splitLines(get(d, 'intro', '')).slice(0, 3), levels = splitLines(get(d, 'levels', '')).slice(0, 6);
      intro.forEach(function (s) { y = mixed(x, s, PAD, y, BODY, CW * .88, 1.35, ink, body) + 18; });
      if (intro.length) y += 46;
      var n = levels.length, gap = 24, boxW = (CW - gap * (n - 1)) / n, boxH = Math.min(240, Math.max(160, bottom - y));
      var by = y + Math.max(0, (bottom - y - boxH) / 2);
      levels.forEach(function (t, i) {
        var bx = PAD + i * (boxW + gap), first = i === 0;
        if (first) { x.fillStyle = ink; x.fillRect(bx, by, boxW, boxH); } else tightRect(x, bx, by, boxW, boxH, c);
        var tcol = first ? (isDark(c) ? PAL.ink : PAL.white) : ink;
        caps(x, pad2(i + 1), bx + 28, by + 28 + SMALL * .78, c, 'left', first ? tcol : null);
        var tr = fit(x, t, 'display', boxW - 56, boxH - 110, 36, 26, 1.1, 3, false); font(x, 'display', tr.px);
        block(x, tr, bx + 28, by + boxH - 28 - tr.h, 'left', tcol);
      });
    }
  };

  /* public kinds table: { fields } per kind, plus name and defaults */
  var kinds = {};
  Object.keys(K).forEach(function (k) { kinds[k] = { name: K[k].name, fields: K[k].fields, defaults: K[k].defaults }; });

  /* ---------- deck types ---------- */
  var types = [
    { id: 'sales', name: 'Sales', desc: 'Pitch the AI Builder Program to a company.', outline: ['cover', 'section', 'bullets', 'stat', 'section', 'bullets', 'two', 'quote', 'logos', 'photo', 'close'], closeTitle: 'Let’s talk.', contact: 'joinleland.com/ai' },
    { id: 'session', name: 'Session', desc: 'A live cohort session or workshop.', outline: ['cover', 'bullets', 'section', 'bullets', 'two', 'section', 'bullets', 'stat', 'quote', 'close'], closeTitle: 'See you next session.', contact: 'Post what you built on Leland' },
    { id: 'allhands', name: 'All-hands', desc: 'Company update.', outline: ['cover', 'section', 'stat', 'bullets', 'section', 'two', 'bullets', 'quote', 'photo', 'close'], closeTitle: 'Thank you.', contact: 'Questions in #general' },
    { id: 'story', name: 'Customer story', desc: 'One customer, start to finish.', outline: ['cover', 'section', 'bullets', 'two', 'stat', 'quote', 'photo', 'close'], closeTitle: 'Build yours.', contact: 'joinleland.com/ai' },
    { id: 'proposal', name: 'Proposal', desc: 'A client proposal: what we heard, the solution, the roadmap, the price.', outline: ['cover', 'agenda', 'heard', 'proof', 'agenda', 'timeline', 'timeline', 'cards3', 'price', 'price', 'steps', 'section', 'cards3', 'levels', 'people', 'cards3'], closeTitle: '', contact: '', json: 'data/decks/sheerid.json' }
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
      var out = arr.filter(function (s) { return s && K[s.kind]; }).map(function (s) { return { kind: s.kind, data: Object.assign({}, s.data || {}) }; });
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
      if (!out.length) { push('cover', { title: p, sub: '', color: 'yellow' }); return; }
      var l = last();
      /* a plain line right after a cover or section with no line two becomes its line two */
      if ((l.kind === 'cover' || l.kind === 'section') && !l.data.sub && p.length <= 140) { l.data.sub = p; return; }
      if (p.length <= 60) { sectionN++; push('section', { title: p, sub: '', num: pad2(sectionN), color: (colorFlip++ % 2) ? 'slate' : 'blue' }); }
      else {
        /* a paragraph: first sentence is the title, the rest is a single point */
        var m = p.match(/^(.{10,70}?[.!?])\s+(.+)$/);
        if (m) push('bullets', { title: m[1].replace(/[.!?]$/, ''), b1: m[2], color: 'paper' });
        else push('section', { title: p.slice(0, 70), sub: '', num: '', color: 'slate' });
      }
    }
    function pad2(n) { return (n < 10 ? '0' : '') + n; }
    function bulletsFor(title, items) {
      while (items.length) {
        var chunk = items.splice(0, 5), d = { title: title, color: (out.length % 2) ? 'beige' : 'paper' };
        chunk.forEach(function (b, i) { d['b' + (i + 1)] = b; });
        push('bullets', d);
        title = title + (items.length ? ' (cont.)' : '');
      }
    }

    for (var i = 0; i < lines.length; i++) {
      var raw = lines[i], s = stripMd(raw);
      if (!s) continue;
      var m;
      if ((m = raw.match(/^\s*#\s+(.+)/))) { flushPending(); push('cover', { title: stripMd(m[1]), sub: '', color: 'yellow' }); continue; }
      if ((m = raw.match(/^\s*##\s+(.+)/))) { flushPending(); sectionN++; push('section', { title: stripMd(m[1]), sub: '', num: pad2(sectionN), color: (colorFlip++ % 2) ? 'slate' : 'blue' }); continue; }
      if ((m = raw.match(/^\s*###+\s+(.+)/))) { flushPending(); pending = stripMd(m[1]); continue; }
      if (/^\s*[-*•]\s+/.test(raw) || /^\s*\d+[.)]\s+/.test(raw)) {
        var items = [];
        while (i < lines.length && (/^\s*[-*•]\s+/.test(lines[i]) || /^\s*\d+[.)]\s+/.test(lines[i]))) { items.push(stripMd(lines[i].replace(/^\s*(?:[-*•]|\d+[.)])\s+/, ''))); i++; }
        i--;
        var title = pending || (last() && last().kind === 'section' ? last().data.title : (T.id === 'session' ? 'Today' : 'The point'));
        pending = null;
        /* two columns: "Before: x" / "After: y" pairs, or exactly two "Heading: text" items */
        var pairs = items.map(function (t) { return t.match(/^([A-Z][\w &\/-]{1,28}):\s+(.+)$/); });
        if (items.length === 2 && pairs[0] && pairs[1]) { push('two', { title: title, lhead: pairs[0][1], lbody: pairs[0][2], rhead: pairs[1][1], rbody: pairs[1][2], color: 'paper' }); continue; }
        bulletsFor(title, items);
        continue;
      }
      if ((m = raw.match(/^\s*photo:\s*(.+)$/i))) {
        flushPending();
        var parts = m[1].split('|').map(clean);
        push('photo', { photo: parts[0], title: parts[1] || '', sub: parts[2] || '' });
        continue;
      }
      if ((m = raw.match(/^\s*logos:\s*(.+)$/i))) {
        var lt = pending || 'Experts from the places you want to go'; pending = null;
        var lp = m[1].split('|').map(clean);
        if (lp.length > 1) { lt = lp[0]; lp = lp.slice(1); }
        push('logos', { title: lt, logos: lp.join(', '), color: 'paper' });
        continue;
      }
      if ((m = raw.match(/^\s*(?:two|columns?):\s*(.+)$/i))) {
        var tt = pending || 'Before and after'; pending = null;
        var cp = m[1].split('|').map(clean), L = (cp[0] || '').match(/^([^:]{1,30}):\s*(.+)$/), R = (cp[1] || '').match(/^([^:]{1,30}):\s*(.+)$/);
        push('two', { title: tt, lhead: L ? L[1] : 'Before', lbody: L ? L[2] : cp[0] || '', rhead: R ? R[1] : 'After', rbody: R ? R[2] : cp[1] || '', color: 'paper' });
        continue;
      }
      if ((m = raw.match(/^\s*(?:contact|close):\s*(.+)$/i))) { flushPending(); contact = clean(m[1]); continue; }
      if ((m = s.match(QUOTE_RE))) {
        flushPending();
        var who = '', nx = lines[i + 1] ? stripMd(lines[i + 1]) : '';
        if (nx && nx.length <= 90 && !/^[-*#]/.test(lines[i + 1]) && !QUOTE_RE.test(nx) && !STAT_RE.test(nx)) { who = nx.replace(/^[—–-]\s*/, ''); i++; }
        push('quote', { quote: m[1], who: who, color: 'beige' });
        continue;
      }
      if ((m = s.match(STAT_RE)) && m[1].replace(/\s/g, '').length <= 10) {
        flushPending();
        var nStats = out.filter(function (sl) { return sl.kind === 'stat'; }).length;
        push('stat', { number: m[1].replace(/\s+/g, ' ').trim(), label: m[2].replace(/^[,:—–-]\s*/, ''), source: '', color: (nStats % 2) ? 'yellow' : 'blue' });
        continue;
      }
      /* plain line */
      if (pending) flushPending();
      pending = s;
    }
    flushPending();

    if (!out.length) push('cover', { title: T.name, sub: '', color: 'yellow' });
    if (out[0].kind !== 'cover') out.unshift({ kind: 'cover', data: { title: out[0].kind === 'section' ? out[0].data.title : T.name, sub: '', color: 'yellow' } });
    if (out.length > MAX_SLIDES - 1) out = out.slice(0, MAX_SLIDES - 1);
    out.push({ kind: 'close', data: { title: T.closeTitle, contact: contact || T.contact, color: 'yellow' } });
    out.forEach(function (sl, i) { sl.index = i; sl.page = i + 1; });
    return out;
  }

  /* ---------- render ---------- */
  async function render(x, W, H, slide, h) {
    var hh = H_(h), k = K[slide && slide.kind] || K.section, d = Object.assign({}, k.defaults, slide && slide.data || {});
    x.save();
    x.setTransform(1, 0, 0, 1, 0, 0);
    x.clearRect(0, 0, W, H);
    if (W !== W0 || H !== H0) x.scale(W / W0, H / H0);
    x.imageSmoothingEnabled = true; x.imageSmoothingQuality = 'high';
    x.textAlign = 'left'; x.textBaseline = 'alphabetic';
    await k.render(x, d, hh, slide || {});
    x.restore();
  }

  /* ---------- sample text per deck type (real copy from data/copy.json, no invented numbers) ---------- */
  var SAMPLES = {
    sales: [
      '# The AI Builder Program',
      'Become an AI Builder in 6 to 10 weeks.',
      '## Everyone is a builder now',
      'Most teams use AI for simple productivity. The ones pulling ahead are building real systems.',
      '### How the program works',
      '- A 5-level program, taught live, online, by leading AI instructors',
      '- Each level is 6 sessions over a condensed 3-week period',
      '- Taught on the tools teams use now: Claude Code, n8n, Cowork and more',
      '- Each level builds directly on the last',
      '- Designed for non-technical knowledge workers of all AI skill levels',
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
      'photo: photo-diverse-professionals-collaborating-modern-office | Walk away certified. | Bring your team. Build together for 3 weeks. Leave with systems that run.',
      'contact: joinleland.com/ai'
    ].join('\n'),
    session: [
      '# Level 1, Session 3',
      'Workflows that automate research, communication and analysis.',
      '### Today',
      '- Review what you built since session 2',
      '- Build a research workflow with Claude Code',
      '- Wire the output into Slack',
      '- Ship it before we leave',
      '## Warm up',
      'Open the workflow you built last session and run it once.',
      '### Research workflow',
      '- Define the question you want answered every Monday',
      '- List the sources it should read',
      '- Have Claude classify what it finds by significance',
      '- Send the single most interesting finding to Slack',
      '### Faisal’s scanner, before and after',
      '- Before: Tracking 12 competitors by hand across trade publications, clinical journals and conferences, whenever he remembered.',
      '- After: A scanner that runs every Monday morning, files entries into Notion and sends him one Slack DM with the top finding.',
      '## Build',
      '### Your turn',
      '- Pick one task you do by hand every week',
      '- Write the prompt that does the first step',
      '- Run it, read the output, fix one thing',
      '- Post what you built in the cohort channel',
      '19 healthcare competitors researched by Patrick’s wiki, kept up to date by Claude Code.',
      '"It exceeded my expectations in what I could learn to build in only 3 weeks."',
      'Patrick, VP of Operations, healthcare',
      'contact: Post your build on Leland before next session'
    ].join('\n'),
    allhands: [
      '# All-hands',
      'October 2026',
      '## Where we are',
      '6,000+ people and companies joined the last AI Transformation Week.',
      '### What shipped this month',
      '- Leland Community launched on iOS, Android and web',
      '- Livestream clips can now be posted straight to Community',
      '- AI Builder Program grads have a home on Leland',
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
      'A marketing team, 1,500+ spec sheets, and a project they had put off for years.',
      '## The problem',
      'At 8 to 15 minutes a sheet, rebuilding every product spec sheet was scoped at 12 months.',
      '### What they did in the AI Builder Program',
      '- Pulled data scattered across multiple systems into one spreadsheet',
      '- Had Claude generate every spec sheet from it',
      '- Built a weekly competitive report that saves 6 to 8 hours',
      '- Ran ad campaigns that brought in more qualified leads',
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
    { kind: 'cover', data: { eyebrow: 'Client x Leland', title: 'Layered support for your AI initiative.', sub: '', color: 'blue' } },
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
