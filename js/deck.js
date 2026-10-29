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
  /* the one coloured phrase: blue on light fields, white on dark, ink on yellow/tan (one accent per slide, never two) */
  function accentFor(name) {
    if (name === 'yellow' || name === 'tan') return PAL.ink;
    if (isDark(name)) return PAL.white;
    return PAL.blue;
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
    parts.forEach(function (p, i) { x.fillStyle = p.charAt(0) === '[' ? (accent || PAL.blue) : ink; x.fillText(plain(p), cx, Y); cx += widths[i]; });
  }
  function block(x, r, X, Y, align, ink, accent) {
    var y = Y + r.cap;
    r.lines.forEach(function (l) { rich(x, l, X, y, align, ink, accent); y += r.lineH; });
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

  /* ---------- slide kinds ---------- */
  var K = {};

  K.cover = {
    name: 'Cover',
    fields: [
      { key: 'title', label: 'Title', type: 'text', max: 70 },
      { key: 'sub', label: 'Line two', type: 'text', max: 120, optional: true },
      { key: 'meta', label: 'Date or audience', type: 'text', max: 60, optional: true },
      { key: 'color', label: 'Field', type: 'color', options: ['yellow', 'blue', 'beige', 'paper', 'ink'] }
    ],
    defaults: { title: 'The AI Builder Program', sub: 'Become an AI Builder in 6 to 10 weeks.', meta: '', color: 'yellow' },
    render: async function (x, d, h, slide) {
      var c = get(d, 'color', 'yellow'), ink = inkFor(c), acc = accentFor(c);
      fill(x, W0, H0, fieldHex(c, h.PAL));
      var title = get(d, 'title', ''), sub = get(d, 'sub', ''), meta = get(d, 'meta', '');
      var lockH = 64, top = PADY, bottom = H0 - PADY - lockH - 72;
      var hr = fit(x, title, 'display', CW * .82, (bottom - top) * (sub ? .7 : .9), 188, 72, .98, 3);
      var sr = sub ? fit(x, sub, 'text400', Math.min(CW * .7, 1100), 220, 48, BODY_MIN, 1.3, 3, true) : null;
      var gap = sub ? Math.round(hr.px * .4) : 0, total = hr.h + gap + (sr ? sr.h : 0);
      var y = top + Math.max(0, (bottom - top - total)) * .42;
      font(x, 'display', hr.px); y = block(x, hr, PAD, y, 'left', ink, acc);
      if (sr) { font(x, 'text400', sr.px); block(x, sr, PAD, y + gap, 'left', dimFor(c)); }
      h.logo(x, PAD, H0 - PADY - lockH, lockH, isDark(c) ? 'white' : 'ink');
      if (meta) { font(x, 'text500', 28); x.fillStyle = dimFor(c); x.textAlign = 'right'; x.textBaseline = 'alphabetic'; x.fillText(meta, W0 - PAD, H0 - PADY - 14); x.textAlign = 'left'; }
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

  /* public kinds table: { fields } per kind, plus name and defaults */
  var kinds = {};
  Object.keys(K).forEach(function (k) { kinds[k] = { name: K[k].name, fields: K[k].fields, defaults: K[k].defaults }; });

  /* ---------- deck types ---------- */
  var types = [
    { id: 'sales', name: 'Sales', desc: 'Pitch the AI Builder Program to a company.', outline: ['cover', 'section', 'bullets', 'stat', 'section', 'bullets', 'two', 'quote', 'logos', 'photo', 'close'], closeTitle: 'Let’s talk.', contact: 'joinleland.com/ai' },
    { id: 'session', name: 'Session', desc: 'A live cohort session or workshop.', outline: ['cover', 'bullets', 'section', 'bullets', 'two', 'section', 'bullets', 'stat', 'quote', 'close'], closeTitle: 'See you next session.', contact: 'Post what you built on Leland' },
    { id: 'allhands', name: 'All-hands', desc: 'Company update.', outline: ['cover', 'section', 'stat', 'bullets', 'section', 'two', 'bullets', 'quote', 'photo', 'close'], closeTitle: 'Thank you.', contact: 'Questions in #general' },
    { id: 'story', name: 'Customer story', desc: 'One customer, start to finish.', outline: ['cover', 'section', 'bullets', 'two', 'stat', 'quote', 'photo', 'close'], closeTitle: 'Build yours.', contact: 'joinleland.com/ai' }
  ];
  function typeOf(id) { for (var i = 0; i < types.length; i++) if (types[i].id === id) return types[i]; return types[0]; }

  /* ---------- parse: pasted text/markdown -> slides ---------- */
  var MAX_SLIDES = 14;
  var STAT_RE = /^([\$~]?\d[\d,.]*\s?(?:%|\+|x|k|M|hrs?|hours?)?(?:\s*(?:to|-|–)\s*\d[\d,.]*\s?(?:%|\+|x|k|M|hrs?|hours?)?)?)\s+(.{6,110})$/i;
  var QUOTE_RE = /^[“"'](.{4,})[”"']\s*$/;
  function clean(s) { return String(s || '').replace(/\s+/g, ' ').trim(); }
  function stripMd(s) { return clean(s).replace(/\*\*|__|`/g, ''); }

  function parse(text, typeId) {
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
  function sample(typeId) { return SAMPLES[typeId] || SAMPLES.sales; }

  window.DECK = { types: types, kinds: kinds, parse: parse, render: render, sample: sample, W: W0, H: H0 };
})();
