/* LE image templates. Plain script: defines window.TEMPLATES and window.TPL_HELPERS.
   Everything draws on a 2d canvas context; the export is the preview. */
(function () {
  'use strict';

  /* ---------- palette & brand rules ---------- */
  var PAL = { yellow: '#FFD96F', blue: '#80ACED', slate: '#869AA6', beige: '#F3F1E6', tan: '#EBD4B5', paper: '#F9F8F3', ink: '#010101', neutral: '#222222', follow: '#3963D7', white: '#ffffff' };
  var DARK = { blue: 1, slate: 1, ink: 1, neutral: 1 };
  function fieldHex(name, pal) { return (pal && pal[name]) || PAL[name] || name || PAL.yellow; }
  function isDark(name) { return !!DARK[name]; }
  /* type colour on a field */
  function inkFor(name) { return isDark(name) ? PAL.white : PAL.ink; }
  /* secondary type: same hue, lower alpha */
  function dimFor(name) { return isDark(name) ? 'rgba(255,255,255,.72)' : 'rgba(1,1,1,.58)'; }
  /* the one coloured phrase in a headline: blue on light, white on blue/slate/ink, ink on yellow/tan */
  function accentFor(name) {
    if (name === 'yellow' || name === 'tan') return PAL.ink;
    if (isDark(name)) return PAL.white;
    return PAL.blue;
  }

  /* ---------- vector lockup (assets/brand/logo.svg, viewBox 0 0 112 24) ---------- */
  var LOGO_D = [
    'M11.9802 17.8755C15.1281 17.8755 17.9582 19.1526 19.914 21.1848L17.3403 23.7428C16.9934 24.0876 16.4314 24.0704 16.0486 23.7657C14.9651 22.9036 13.5407 22.3802 11.9802 22.3802C10.4187 22.3802 8.9933 22.9043 7.90957 23.7676C7.52623 24.0729 6.96286 24.09 6.61592 23.7439L4.04826 21.183C6.00399 19.1519 8.83326 17.8755 11.9802 17.8755Z',
    'M6.3609 12.8557C8.1151 12.2606 10.0073 11.9361 11.9802 11.9361C16.4824 11.9361 20.564 13.6254 23.5446 16.3653C23.8923 16.6849 23.8873 17.2263 23.5528 17.5595L20.984 20.1187C18.7472 17.8398 15.5414 16.4122 11.9802 16.4122C8.42564 16.4122 5.22493 17.8346 2.98872 20.1062C2.60613 19.7228 1.02242 18.1308 0.250839 17.3554C-0.00469259 17.0986 -0.0719692 16.7104 0.0812831 16.3824L7.42731 0.662845C7.61626 0.258507 8.02296 2.94936e-06 8.47026 0H12.3686L6.3609 12.8557Z',
    'M17.2854 0C17.9167 0 18.3343 0.653777 18.0677 1.22442L13.6053 10.7733C13.0607 10.7263 12.5091 10.7023 11.9514 10.7023C10.9085 10.7023 9.88649 10.7862 8.89258 10.947L14.0083 0H17.2854Z',
    'M49.9446 6.78918C54.9776 6.78918 57.673 10.1358 57.0404 15.2927H46.9193C47.2767 17.35 48.7073 18.0358 49.9997 18.0358C51.1271 18.0358 52.1452 17.5421 52.2826 16.9935H56.8203C55.6378 20.5594 52.3924 21.7389 50.1646 21.7389C46.0394 21.7389 42.684 19.4896 42.684 14.2504C42.684 9.45012 45.8194 6.78922 49.9446 6.78918ZM70.7232 6.78918C72.9509 6.78918 74.2713 7.55757 75.2338 8.43536L75.509 7.09088H79.6618V21.4645H75.481L74.9586 18.0358H74.6012C74.9035 20.5319 72.5935 21.7389 70.7232 21.7389C66.1579 21.7389 63.8754 18.0084 63.8754 14.2504C63.8754 10.5199 66.1579 6.78922 70.7232 6.78918ZM111.757 21.4632H107.577L107.055 18.0345H106.697C106.834 20.695 104.689 21.7376 102.82 21.7376C98.2542 21.7376 95.9709 18.007 95.9709 14.2491C95.9709 10.5186 98.2542 6.78791 102.82 6.78791C105.047 6.78796 106.367 7.55596 107.329 8.43362V2.2619H111.785L111.757 21.4632ZM62.7541 2.28917L62.727 21.4904L58.2715 21.4632L58.2991 2.2619L62.7541 2.28917ZM90.2838 6.78918C92.6214 6.78927 94.8491 8.21583 94.8491 11.5074V21.4645H90.3936V12.7691C90.3936 11.288 89.4587 10.7118 88.3588 10.7118C87.3412 10.7118 86.2409 11.5075 85.6634 12.3029V21.4645H81.2079V7.09088L85.3886 7.06361L85.911 10.4923H86.2684C86.2684 7.83165 88.4139 6.78918 90.2838 6.78918ZM35.6926 16.5507H42.2106V21.4334H31.2372V3.08222L35.6926 3.05494V16.5507ZM71.8786 10.7118C69.8158 10.7118 68.551 12.3029 68.551 14.2504C68.551 16.198 69.8158 17.789 71.8786 17.789C73.9686 17.789 75.2063 16.1979 75.2063 14.2504C75.2063 12.3029 73.9686 10.7118 71.8786 10.7118ZM103.974 10.7105C101.912 10.7105 100.646 12.3016 100.646 14.2491C100.646 16.1966 101.912 17.7873 103.974 17.7873C106.064 17.7873 107.302 16.1966 107.302 14.2491C107.302 12.3016 106.064 10.7105 103.974 10.7105ZM50.1646 10.1356C48.4873 10.1357 47.3869 10.9588 47.0019 12.5497H52.9148V12.3852C52.9148 11.0137 51.6224 10.1356 50.1646 10.1356Z'
  ];
  var _paths = null;
  function paths() { if (!_paths) _paths = LOGO_D.map(function (d) { return new Path2D(d); }); return _paths; }
  function brandColor(c) { return c === 'white' ? PAL.white : (!c || c === 'ink') ? PAL.ink : c; }
  /* draw mark + wordmark at a given height; returns the drawn width */
  function logo(x, X, Y, h, color) {
    var s = h / 24, p = paths();
    x.save(); x.translate(X, Y); x.scale(s, s); x.fillStyle = brandColor(color);
    for (var i = 0; i < 4; i++) x.fill(p[i]);
    x.restore(); return 112 * s;
  }
  /* the mark alone (square) */
  function mark(x, X, Y, h, color) {
    var s = h / 24, p = paths();
    x.save(); x.translate(X, Y); x.scale(s, s); x.fillStyle = brandColor(color);
    for (var i = 0; i < 3; i++) x.fill(p[i]);
    x.restore(); return 24 * s;
  }
  /* cover-fit an image into a box, optional focal point 0..1 */
  function cover(x, img, X, Y, w, h, fx, fy) {
    if (!img) return;
    if (fx == null) fx = .5; if (fy == null) fy = .5;
    var iw = img.naturalWidth || img.width, ih = img.naturalHeight || img.height;
    var s = Math.max(w / iw, h / ih), dw = iw * s, dh = ih * s;
    x.save(); x.beginPath(); x.rect(X, Y, w, h); x.clip();
    x.drawImage(img, X + (w - dw) * fx, Y + (h - dh) * fy, dw, dh); x.restore();
  }
  /* contain-fit, centred; returns the drawn rect */
  function contain(x, img, X, Y, w, h) {
    var iw = img.naturalWidth || img.width, ih = img.naturalHeight || img.height;
    var s = Math.min(w / iw, h / ih), dw = iw * s, dh = ih * s, dx = X + (w - dw) / 2, dy = Y + (h - dh) / 2;
    x.drawImage(img, dx, dy, dw, dh); return { x: dx, y: dy, w: dw, h: dh };
  }
  function roundRect(x, X, Y, w, h, r) {
    r = Math.min(r, w / 2, h / 2);
    x.beginPath(); x.moveTo(X + r, Y); x.arcTo(X + w, Y, X + w, Y + h, r); x.arcTo(X + w, Y + h, X, Y + h, r);
    x.arcTo(X, Y + h, X, Y, r); x.arcTo(X, Y, X + w, Y, r); x.closePath();
  }

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
  /* word wrap that keeps [bracketed] phrases intact, honours \n, and pulls one word down to avoid a widow */
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
  /* balance: the narrowest measure that keeps the same line count, so a 2-3 line headline rags evenly */
  function balance(x, text, maxW, lines) {
    var n = lines.length; if (n < 2) return lines;
    var best = lines, bestRag = rag(x, lines);
    for (var w = maxW * .97; w >= maxW * .45; w -= maxW * .02) {
      var l = wrap(x, text, w); if (l.length !== n) { if (l.length > n) break; continue; }
      var r = rag(x, l); if (r < bestRag) { bestRag = r; best = l; }
    }
    return best;
  }
  /* raggedness: squared slack of every line against the longest one */
  function rag(x, lines) {
    var ws = lines.map(function (l) { return mw(x, l); }), m = Math.max.apply(null, ws);
    return ws.reduce(function (a, w) { return a + (m - w) * (m - w); }, 0);
  }
  function capOf(x) { var m = x.measureText('H'); return m.actualBoundingBoxAscent || 0; }
  /* pick the largest size (start -> min) whose wrapped block fits maxW x maxH and maxLines */
  function fit(x, text, kind, maxW, maxH, start, min, lh, maxLines, bal) {
    var px = start, r, extra = 0; if (bal == null) bal = kind === 'display';
    /* short display lines want few lines: never more than half the word count */
    if (kind === 'display') { var nw = plain(text).split(/\s+/).filter(Boolean).length; maxLines = Math.min(maxLines || 99, Math.max(2, Math.ceil(nw / 2))); }
    for (; ;) {
      font(x, kind, px);
      var lines = wrap(x, text, maxW), cap = capOf(x), line = px * lh;
      if (bal) lines = balance(x, text, maxW, lines);
      var h = (lines.length - 1) * line + cap, wide = lines.some(function (l) { return mw(x, l) > maxW; });
      r = { px: px, lines: lines, lineH: line, cap: cap, h: h, w: Math.max.apply(null, lines.map(function (l) { return mw(x, l); })) };
      var ok = h <= maxH && !wide && (!maxLines || lines.length <= maxLines);
      /* a balanced block with one very short line reads as a mistake: trade a little size for an even rag */
      if (ok && bal && kind === 'display' && lines.length >= 3 && extra < 3) { var ws = lines.map(function (l) { return mw(x, l); }), mx = Math.max.apply(null, ws); if (Math.min.apply(null, ws) < mx * .62) { extra++; ok = false; } }
      if (ok || px <= min) break;
      px = Math.max(min, Math.round(px * .94));
    }
    return r;
  }
  /* one line with the [bracketed] phrase in accent */
  function rich(x, line, X, Y, align, ink, accent) {
    var parts = String(line).split(/(\[[^\]]+\])/).filter(Boolean);
    var widths = parts.map(function (p) { return x.measureText(plain(p)).width; });
    var tw = widths.reduce(function (a, b) { return a + b; }, 0);
    var cx = align === 'center' ? X - tw / 2 : align === 'right' ? X - tw : X;
    x.textAlign = 'left'; x.textBaseline = 'alphabetic';
    parts.forEach(function (p, i) { x.fillStyle = p.charAt(0) === '[' ? (accent || PAL.blue) : ink; x.fillText(plain(p), cx, Y); cx += widths[i]; });
  }
  /* draw a fitted block with its top-left (or top-centre) at X,Y; returns bottom y */
  function block(x, r, X, Y, align, ink, accent) {
    var y = Y + r.cap;
    r.lines.forEach(function (l) { rich(x, l, X, y, align, ink, accent); y += r.lineH; });
    return Y + r.h;
  }

  /* ---------- layout ---------- */
  function frame(W, H) {
    var u = Math.min(W, H * 1.2);                 /* type unit: width for portrait, ~1.2x height for wide */
    var pad = Math.round(.08 * u);
    return { u: u, pad: pad, cw: W - 2 * pad, ch: H - 2 * pad, land: W > H * 1.15, tall: H > W * 1.5 };
  }
  function fill(x, W, H, hex) { x.fillStyle = hex; x.fillRect(0, 0, W, H); }
  /* one size for the mark and one for the lockup, on every template */
  function markSize(f) { return Math.round(f.u * .095); }
  function logoSize(f) { return Math.round(f.u * .052); }
  /* an outlined store badge: small line over a bold name, no platform logos */
  function storeBadge(x, X, Y, w, h, small, big, ink) {
    x.save(); x.strokeStyle = ink; x.lineWidth = Math.max(2, Math.round(h * .035)); roundRect(x, X, Y, w, h, h * .22); x.stroke();
    x.fillStyle = ink; x.textAlign = 'left'; x.textBaseline = 'alphabetic';
    var px1 = font(x, 'text400', h * .2), tx = X + h * .3;
    x.fillText(small, tx, Y + h * .4);
    font(x, 'text600', h * .36); x.fillText(big, tx, Y + h * .78);
    x.restore();
  }
  /* film grain, very light; keeps photos from looking flat */
  function grain(x, W, H, a) {
    var step = 2, n = Math.floor(W * H / (step * step) * .08);
    x.save(); x.globalAlpha = a; x.fillStyle = '#000';
    for (var i = 0; i < n; i++) { x.fillRect((Math.random() * W) | 0, (Math.random() * H) | 0, step, step); }
    x.restore();
  }

  async function loadAsset(h, id, fallbackGroup) {
    var a = h.A && h.A(id);
    if (!a && fallbackGroup && h.byGroup) a = h.byGroup(fallbackGroup)[0];
    if (!a) return null;
    try { return await h.loadImg(a.src); } catch (e) { return null; }
  }
  function get(d, k, def) { var v = d[k]; if (v == null) return def; v = String(v).trim(); return v === '' ? def : v; }

  /* ---------- templates ---------- */
  var FIELDS = ['yellow', 'blue', 'beige', 'tan', 'slate', 'paper', 'ink'];

  var T = [];

  /* 1. Headline on a field — the board's "Own your future." tile */
  T.push({
    id: 'field-headline', name: 'Headline on a field',
    desc: 'One Season line on a yellow, blue or beige field with the mark.',
    ratios: ['r45', 'r11', '', 'r916'],
    fields: [
      { key: 'head', label: 'Headline', type: 'text', max: 60 },
      { key: 'sub', label: 'Line two', type: 'text', max: 120, optional: true },
      { key: 'color', label: 'Field', type: 'color', options: FIELDS },
      { key: 'brand', label: 'Brand', type: 'choice', options: ['mark', 'lockup'] },
      { key: 'align', label: 'Align', type: 'choice', options: ['left', 'center'] }
    ],
    defaults: { head: 'Own your future.', sub: '', color: 'yellow', brand: 'mark', align: 'left' },
    render: async function (x, W, H, d, h) {
      var f = frame(W, H), c = get(d, 'color', 'yellow'), ink = inkFor(c), acc = accentFor(c), center = get(d, 'align', 'left') === 'center';
      fill(x, W, H, fieldHex(c, h.PAL));
      var brandH = get(d, 'brand', 'mark') === 'lockup' ? logoSize(f) : markSize(f);
      var head = get(d, 'head', ''), sub = get(d, 'sub', '');
      var maxW = f.land ? f.cw * .78 : f.cw * .9, textTop = f.pad, textBottom = H - f.pad - brandH - f.u * .06;
      var hr = fit(x, head, 'display', maxW, (textBottom - textTop) * (sub ? .72 : 1), f.u * (f.land ? .15 : .145), f.u * .06, .98, 4);
      var sr = sub ? (font(x, 'text400', f.u * .034), fit(x, sub, 'text400', Math.min(maxW, f.u * .78), f.u * .3, f.u * .034, f.u * .024, 1.32, 4)) : null;
      var gap = sub ? f.u * .035 : 0, total = hr.h + gap + (sr ? sr.h : 0);
      var X = center ? W / 2 : f.pad, al = center ? 'center' : 'left';
      var y = center ? textTop + (textBottom - textTop - total) / 2 : textTop;
      font(x, 'display', hr.px); y = block(x, hr, X, y, al, ink, acc);
      if (sr) { font(x, 'text400', sr.px); block(x, sr, X, y + gap, al, dimFor(c)); }
      if (get(d, 'brand', 'mark') === 'lockup') logo(x, center ? W / 2 - 112 / 24 * brandH / 2 : f.pad, H - f.pad - brandH, brandH, ink);
      else mark(x, center ? W / 2 - brandH / 2 : W - f.pad - brandH, H - f.pad - brandH, brandH, ink);
    }
  });

  /* 2. Photo with a white lockup — the board's stairs / city tiles */
  T.push({
    id: 'photo-lockup', name: 'Photo with lockup',
    desc: 'Full-bleed photo, white lockup, Season headline in white.',
    ratios: ['r45', 'r11', '', 'r916'],
    fields: [
      { key: 'photo', label: 'Photo', type: 'asset', groups: ['photo', 'background', 'hero'] },
      { key: 'head', label: 'Headline', type: 'text', max: 60 },
      { key: 'sub', label: 'Line two', type: 'text', max: 120, optional: true },
      { key: 'align', label: 'Align', type: 'choice', options: ['left', 'center'] }
    ],
    defaults: { photo: 'photo-businesswoman-outdoors-city-skyscrapers', head: 'Get there, with the people who have been there.', sub: '', align: 'left' },
    render: async function (x, W, H, d, h) {
      var f = frame(W, H), center = get(d, 'align', 'left') === 'center';
      var img = await loadAsset(h, get(d, 'photo', ''), 'photo');
      fill(x, W, H, PAL.neutral);
      if (img) cover(x, img, 0, 0, W, H, .5, .35);
      var lh = logoSize(f);
      var head = get(d, 'head', ''), sub = get(d, 'sub', '');
      var maxW = f.land ? f.cw * .7 : f.cw;
      var hr = fit(x, head, 'display', maxW, H * .42, f.u * (f.land ? .11 : .105), f.u * .055, 1.0, 4);
      var sr = sub ? fit(x, sub, 'text400', Math.min(maxW, f.u * .72), f.u * .22, f.u * .034, f.u * .024, 1.32, 3) : null;
      var gap = sub ? f.u * .03 : 0, total = hr.h + gap + (sr ? sr.h : 0) + (sr ? sr.px * .25 : hr.px * .12);
      var X = center ? W / 2 : f.pad, al = center ? 'center' : 'left', y = H - f.pad - total;
      /* no gradients: one flat darkening over the whole photo, the type carries a soft shadow */
      x.fillStyle = 'rgba(0,0,0,.26)'; x.fillRect(0, 0, W, H);
      grain(x, W, H, .05);
      logo(x, center ? W / 2 - 112 / 24 * lh / 2 : f.pad, f.pad, lh, 'white');
      x.save(); x.shadowColor = 'rgba(0,0,0,.45)'; x.shadowBlur = f.u * .05; x.shadowOffsetY = f.u * .006;
      font(x, 'display', hr.px); y = block(x, hr, X, y, al, PAL.white, PAL.white);
      if (sr) { font(x, 'text400', sr.px); block(x, sr, X, y + gap, al, 'rgba(255,255,255,.88)'); }
      x.restore();
    }
  });

  /* 3. Expert spotlight — a face, a credential, a quote */
  T.push({
    id: 'expert-spotlight', name: 'Expert spotlight',
    desc: 'Headshot on a warm field with name, credential and a short quote.',
    ratios: ['r45', 'r11', '', 'r916'],
    fields: [
      { key: 'expert', label: 'Expert', type: 'asset', groups: ['expert'] },
      { key: 'name', label: 'Name', type: 'text', max: 32 },
      { key: 'role', label: 'Credential', type: 'text', max: 70 },
      { key: 'quote', label: 'Quote', type: 'text', max: 140 },
      { key: 'color', label: 'Field', type: 'color', options: ['beige', 'tan', 'yellow', 'blue', 'paper', 'slate'] },
      { key: 'shape', label: 'Photo', type: 'choice', options: ['square', 'circle'] }
    ],
    defaults: { expert: 'coach-ava-b', name: 'Ava B.', role: 'MBA admissions expert · Stanford GSB · 100+ admits', quote: 'The essay that gets you in is the one only you could have written.', color: 'beige', shape: 'square' },
    render: async function (x, W, H, d, h) {
      var f = frame(W, H), c = get(d, 'color', 'beige'), ink = inkFor(c), dim = dimFor(c);
      fill(x, W, H, fieldHex(c, h.PAL));
      var img = await loadAsset(h, get(d, 'expert', ''), 'expert');
      var markH = markSize(f), circle = get(d, 'shape', 'square') === 'circle';
      var name = get(d, 'name', ''), role = get(d, 'role', ''), quote = get(d, 'quote', '');
      if (quote && !/^[“"]/.test(quote)) quote = '“' + quote.replace(/[”"]$/, '') + '”';
      var ph, tx, ty, tw, th;
      if (f.land) { ph = Math.round(Math.min(f.ch, W * .36)); tx = f.pad + ph + f.u * .06; ty = f.pad; tw = W - f.pad - tx; th = f.ch - markH - f.u * .04; }
      else { ph = Math.round(f.u * (f.tall ? .44 : f.ch > f.cw * 1.15 ? .4 : .27)); tx = f.pad; ty = f.pad + ph + f.u * .06; tw = f.cw; th = H - f.pad - markH - f.u * .05 - ty; }
      /* name, credential, quote: measure, then fit the quote into what is left */
      var nr = fit(x, name, 'text600', tw, f.u * .2, f.u * .052, f.u * .036, 1.1, 2);
      var rr = role ? fit(x, role, 'text400', tw, f.u * .2, f.u * .03, f.u * .022, 1.3, 3) : null;
      var headH = nr.h + (rr ? f.u * .018 + rr.h : 0), gap = f.u * .055;
      var qr = fit(x, quote, 'display', tw, Math.max(f.u * .1, th - headH - gap), f.u * (f.land ? .085 : .088), f.u * .04, 1.06, 6);
      var y = ty, spare = th - (headH + gap + qr.h), dy = 0;
      if (f.land) y = ty + Math.max(0, spare) / 2;
      else if (f.tall) dy = Math.max(0, spare) / 2;        /* stories: centre photo and copy together */
      var py = f.pad + dy; y += dy;
      if (img) {
        x.save();
        if (circle) { x.beginPath(); x.arc(f.pad + ph / 2, py + ph / 2, ph / 2, 0, Math.PI * 2); x.closePath(); }
        else roundRect(x, f.pad, py, ph, ph, f.u * .035);
        x.clip(); cover(x, img, f.pad, py, ph, ph, .5, .3); x.restore();
      }
      font(x, 'text600', nr.px); y = block(x, nr, tx, y, 'left', ink);
      if (rr) { font(x, 'text400', rr.px); y = block(x, rr, tx, y + f.u * .018, 'left', dim); }
      font(x, 'display', qr.px); block(x, qr, tx, y + gap, 'left', ink, accentFor(c));
      mark(x, W - f.pad - markH, H - f.pad - markH, markH, ink);
    }
  });

  /* 4. One number */
  T.push({
    id: 'stat', name: 'One number',
    desc: 'A big Season number, what it means, and the source.',
    ratios: ['r11', 'r45', '', 'r916'],
    fields: [
      { key: 'number', label: 'Number', type: 'text', max: 8 },
      { key: 'label', label: 'What it means', type: 'text', max: 90 },
      { key: 'source', label: 'Source', type: 'text', max: 60, optional: true },
      { key: 'color', label: 'Field', type: 'color', options: ['blue', 'yellow', 'ink', 'slate', 'beige', 'tan'] }
    ],
    defaults: { number: '33', label: 'people on the ASU+GSV Summit team went through the AI Builder Program together.', source: 'Customer story, October 2026', color: 'blue' },
    render: async function (x, W, H, d, h) {
      var f = frame(W, H), c = get(d, 'color', 'blue'), ink = inkFor(c), dim = dimFor(c);
      fill(x, W, H, fieldHex(c, h.PAL));
      var num = get(d, 'number', ''), label = get(d, 'label', ''), src = get(d, 'source', '');
      var lh = logoSize(f), footH = lh + (src ? f.u * .07 : 0);
      var top = f.pad, bottom = H - f.pad - footH - f.u * .05;
      if (f.land) {
        var colW = f.cw * .54;
        var nr = fit(x, num, 'display', colW, bottom - top, f.u * .46, f.u * .15, .9, 1);
        var lr = fit(x, label, 'text500', f.cw - colW - f.u * .05, bottom - top, f.u * .058, f.u * .03, 1.22, 5);
        var ny = top + (bottom - top - nr.h) / 2; font(x, 'display', nr.px); block(x, nr, f.pad, ny, 'left', ink);
        font(x, 'text500', lr.px); block(x, lr, f.pad + colW + f.u * .05, ny + nr.cap - lr.cap - (lr.h - lr.cap), 'left', ink);
      } else {
        var nr2 = fit(x, num, 'display', f.cw, (bottom - top) * .6, f.u * .42, f.u * .15, .9, 1);
        var lr2 = fit(x, label, 'text500', f.cw * .92, (bottom - top) * .4, f.u * .052, f.u * .03, 1.22, 5);
        var gap = f.u * .05, total = nr2.h + gap + lr2.h, y = top + (bottom - top - total) / 2;
        font(x, 'display', nr2.px); y = block(x, nr2, f.pad - nr2.px * .02, y, 'left', ink);
        font(x, 'text500', lr2.px); block(x, lr2, f.pad, y + gap, 'left', ink);
      }
      if (src) { var sr = fit(x, src, 'text400', f.cw, f.u * .1, f.u * .026, f.u * .02, 1.3, 2); font(x, 'text400', sr.px); block(x, sr, f.pad, H - f.pad - lh - f.u * .055 - sr.cap, 'left', dim); }
      logo(x, f.pad, H - f.pad - lh, lh, ink);
    }
  });

  /* 5. Three line illustrations on paper */
  T.push({
    id: 'three-illustrations', name: 'Three illustrations',
    desc: 'Headline over three line illustrations with short captions.',
    ratios: ['r45', '', 'r11', 'r916'],
    fields: [
      { key: 'head', label: 'Headline', type: 'text', max: 60 },
      { key: 'ill1', label: 'Illustration 1', type: 'asset', groups: ['illustration'] },
      { key: 'cap1', label: 'Caption 1', type: 'text', max: 40 },
      { key: 'ill2', label: 'Illustration 2', type: 'asset', groups: ['illustration'] },
      { key: 'cap2', label: 'Caption 2', type: 'text', max: 40 },
      { key: 'ill3', label: 'Illustration 3', type: 'asset', groups: ['illustration'] },
      { key: 'cap3', label: 'Caption 3', type: 'text', max: 40 },
      { key: 'color', label: 'Field', type: 'color', options: ['paper', 'beige', 'white', 'tan', 'yellow'] }
    ],
    defaults: { head: 'Three ways to use Leland this week.', ill1: 'ill-group-chat', cap1: 'Ask an expert in the feed', ill2: 'ill-on-air', cap2: 'Catch a livestream', ill3: 'ill-calendar', cap3: 'Book a session', color: 'paper' },
    render: async function (x, W, H, d, h) {
      var f = frame(W, H), c = get(d, 'color', 'paper'), ink = inkFor(c);
      fill(x, W, H, fieldHex(c, h.PAL));
      var head = get(d, 'head', ''), lh = logoSize(f);
      var imgs = await Promise.all([1, 2, 3].map(function (i) { return loadAsset(h, get(d, 'ill' + i, ''), 'illustration'); }));
      var caps = [1, 2, 3].map(function (i) { return get(d, 'cap' + i, ''); });
      var hr = fit(x, head, 'display', f.land ? f.cw * .7 : f.cw, H * .3, f.u * .1, f.u * .05, 1.0, f.land ? 2 : 3);
      font(x, 'display', hr.px); var y = block(x, hr, f.pad, f.pad, 'left', ink, accentFor(c));
      var gap = f.u * .035, colW = (f.cw - 2 * gap) / 3;
      var areaTop = y + f.u * .06, areaBottom = H - f.pad - lh - f.u * .06, areaH = areaBottom - areaTop;
      var capPx = f.u * .036, caps_ = caps.map(function (t) { return fit(x, t, 'text500', colW, f.u * .12, capPx, f.u * .022, 1.25, 3, true); });
      /* the three captions share one size */
      var capMin = Math.min.apply(null, caps_.map(function (r) { return r.px; }));
      caps_ = caps.map(function (t) { return fit(x, t, 'text500', colW, f.u * .12, capMin, f.u * .022, 1.25, 3, true); });
      var capH = Math.max.apply(null, caps_.map(function (r) { return r.h; }));
      var illH = Math.min(colW, areaH - capH - f.u * .04, f.u * .4);
      var blockH = illH + f.u * .04 + capH, top = areaTop + Math.max(0, (areaH - blockH) / 2) * (f.tall ? .6 : 1);
      for (var i = 0; i < 3; i++) {
        var cx = f.pad + i * (colW + gap);
        if (imgs[i]) contain(x, imgs[i], cx + colW * .03, top, colW * .94, illH);
        font(x, 'text500', caps_[i].px); block(x, caps_[i], cx + colW / 2, top + illH + f.u * .04, 'center', ink);
      }
      logo(x, f.pad, H - f.pad - lh, lh, ink);
    }
  });

  /* 6. Product moment */
  T.push({
    id: 'product-moment', name: 'Product moment',
    desc: 'A screenshot in a soft frame on a field, with a headline.',
    ratios: ['r45', '', 'r11', 'r916'],
    fields: [
      { key: 'head', label: 'Headline', type: 'text', max: 60 },
      { key: 'shot', label: 'Screenshot', type: 'asset', groups: ['card', 'aipost', 'hero', 'upload'] },
      { key: 'color', label: 'Field', type: 'color', options: ['blue', 'yellow', 'beige', 'tan', 'slate', 'paper', 'ink'] },
      { key: 'align', label: 'Headline', type: 'choice', options: ['left', 'above'] }
    ],
    defaults: { head: 'Follow the people who have done what you are trying to do.', shot: 'card-alex', color: 'blue', align: 'left' },
    render: async function (x, W, H, d, h) {
      var f = frame(W, H), c = get(d, 'color', 'blue'), ink = inkFor(c), acc = accentFor(c);
      fill(x, W, H, fieldHex(c, h.PAL));
      var img = await loadAsset(h, get(d, 'shot', ''), 'card');
      var head = get(d, 'head', ''), lh = logoSize(f), side = get(d, 'align', 'left') === 'left' && f.land;
      var ar = img ? (img.naturalWidth || img.width) / (img.naturalHeight || img.height) : 16 / 9;
      var r = f.u * .025;
      function shot(sx, sy, sw, sh) {
        if (!img) return;
        x.save(); x.shadowColor = 'rgba(0,0,0,' + (isDark(c) ? .35 : .22) + ')'; x.shadowBlur = f.u * .07; x.shadowOffsetY = f.u * .025;
        roundRect(x, sx, sy, sw, sh, r); x.fillStyle = '#fff'; x.fill(); x.restore();
        x.save(); roundRect(x, sx, sy, sw, sh, r); x.clip(); x.drawImage(img, sx, sy, sw, sh); x.restore();
        x.save(); x.strokeStyle = isDark(c) ? 'rgba(255,255,255,.35)' : 'rgba(0,0,0,.08)'; x.lineWidth = Math.max(1, f.u * .0015); roundRect(x, sx, sy, sw, sh, r); x.stroke(); x.restore();
      }
      if (side) {
        var colW = f.cw * .42, sw = f.cw - colW - f.u * .06, sh = sw / ar;
        if (sh > f.ch) { sh = f.ch; sw = sh * ar; }
        var hr = fit(x, head, 'display', colW, f.ch - lh - f.u * .08, f.u * .095, f.u * .05, 1.0, 5);
        font(x, 'display', hr.px); block(x, hr, f.pad, f.pad, 'left', ink, acc);
        shot(W - f.pad - sw, f.pad + (f.ch - sh) / 2, sw, sh);
      } else {
        var hr2 = fit(x, head, 'display', f.land ? f.cw * .7 : f.cw, H * (f.land ? .22 : .3), f.u * (f.land ? .085 : .095), f.u * .05, 1.0, 3);
        font(x, 'display', hr2.px); var y = block(x, hr2, f.pad, f.pad, 'left', ink, acc);
        var top = y + f.u * .06, bottom = H - f.pad - (f.land ? 0 : lh + f.u * .06), avail = bottom - top;
        var sw2 = f.cw, sh2 = sw2 / ar; if (sh2 > avail) { sh2 = avail; sw2 = sh2 * ar; }
        /* wide tiles park the shot on the right so the lockup keeps its corner */
        var sy = top + (avail - sh2) * (f.tall ? .4 : .5), sx = f.land ? W - f.pad - sw2 : (W - sw2) / 2;
        shot(sx, sy, sw2, sh2);
      }
      logo(x, f.pad, H - f.pad - lh, lh, ink);
    }
  });

  /* 7. Quote — one Season line from a customer or expert, attributed */
  T.push({
    id: 'quote', name: 'Quote',
    desc: 'A big Season quote on a warm field, with who said it.',
    ratios: ['r45', 'r11', '', 'r916'],
    fields: [
      { key: 'quote', label: 'Quote', type: 'text', max: 160 },
      { key: 'name', label: 'Name', type: 'text', max: 32 },
      { key: 'role', label: 'Role', type: 'text', max: 60, optional: true },
      { key: 'color', label: 'Field', type: 'color', options: ['beige', 'tan', 'yellow', 'paper'] }
    ],
    defaults: { quote: 'It put everyone in a builder mindset.', name: 'Lucy Baldwin', role: 'VP Product, ASU+GSV', color: 'beige' },
    render: async function (x, W, H, d, h) {
      var f = frame(W, H), c = get(d, 'color', 'beige'), ink = inkFor(c), dim = dimFor(c);
      fill(x, W, H, fieldHex(c, h.PAL));
      var quote = get(d, 'quote', ''), name = get(d, 'name', ''), role = get(d, 'role', '');
      if (quote && !/^[“"]/.test(quote)) quote = '“' + quote.replace(/[”"]$/, '') + '”';
      var markH = markSize(f), maxW = f.land ? f.cw * .82 : f.cw;
      /* attribution first, so the quote gets what is left */
      var nr = fit(x, name, 'text600', maxW, f.u * .1, f.u * .036, f.u * .028, 1.2, 1);
      var rr = role ? fit(x, role, 'text400', maxW, f.u * .1, f.u * .03, f.u * .022, 1.3, 2) : null;
      var attrH = nr.h + (rr ? f.u * .014 + rr.h : 0), gap = f.u * .06;
      var top = f.pad, bottom = H - f.pad - markH - f.u * .06;
      var qr = fit(x, quote, 'display', maxW, bottom - top - attrH - gap, f.u * (f.land ? .105 : .12), f.u * .05, 1.02, 7);
      var total = qr.h + gap + attrH, y = top + (bottom - top - total) * (f.land ? .5 : .36);
      /* hanging punctuation: the opening quote sits in the margin */
      font(x, 'display', qr.px); var hang = x.measureText('“').width * .85;
      y = block(x, qr, f.pad - hang, y, 'left', ink, accentFor(c));
      font(x, 'text600', nr.px); y = block(x, nr, f.pad, y + gap, 'left', ink);
      if (rr) { font(x, 'text400', rr.px); block(x, rr, f.pad, y + f.u * .014, 'left', dim); }
      mark(x, W - f.pad - markH, H - f.pad - markH, markH, ink);
    }
  });

  /* 8. Before / after — two columns under a headline */
  T.push({
    id: 'before-after', name: 'Before and after',
    desc: 'A headline, then Before and After side by side.',
    ratios: ['r45', 'r11', '', 'r916'],
    fields: [
      { key: 'head', label: 'Headline', type: 'text', max: 60 },
      { key: 'beforeBig', label: 'Before, the number', type: 'text', max: 14, optional: true },
      { key: 'before', label: 'Before', type: 'text', max: 110 },
      { key: 'afterBig', label: 'After, the number', type: 'text', max: 14, optional: true },
      { key: 'after', label: 'After', type: 'text', max: 110 },
      { key: 'color', label: 'Field', type: 'color', options: ['paper', 'beige', 'tan', 'yellow'] }
    ],
    defaults: { head: 'PlayPower rebuilt 1,500+ product spec sheets.', beforeBig: '12 months', before: 'Scoped at 8 to 15 minutes a sheet. “We’re never going to get through that.”', afterBig: 'Weeks', after: 'One spreadsheet, then Claude generated every sheet.', color: 'paper' },
    render: async function (x, W, H, d, h) {
      var f = frame(W, H), c = get(d, 'color', 'paper'), ink = inkFor(c), dim = dimFor(c);
      fill(x, W, H, fieldHex(c, h.PAL));
      var head = get(d, 'head', ''), markH = markSize(f);
      var cols = [
        { label: 'Before', big: get(d, 'beforeBig', ''), body: get(d, 'before', ''), rule: 'rgba(1,1,1,.22)' },
        { label: 'After', big: get(d, 'afterBig', ''), body: get(d, 'after', ''), rule: c === 'yellow' || c === 'tan' ? PAL.ink : PAL.blue }
      ];
      var hr = fit(x, head, 'display', f.land ? f.cw * .8 : f.cw, H * .3, f.u * (f.land ? .085 : .09), f.u * .05, 1.0, 3);
      var gap = f.u * .07, colW = (f.cw - gap) / 2, top = f.pad + hr.h + f.u * .08, bottom = H - f.pad - markH - f.u * .06;
      var hasBig = cols.some(function (k) { return k.big; });
      /* shared sizes across the two columns */
      var lab = fit(x, 'Before', 'text500', colW, f.u * .1, f.u * .028, f.u * .022, 1.2, 1);
      var bigPx = hasBig ? Math.min.apply(null, cols.map(function (k) { return k.big ? fit(x, k.big, 'display', colW, f.u * .2, f.u * .14, f.u * .05, 1.0, 1).px : 999; })) : 0;
      var bigH = hasBig ? fit(x, cols[0].big || cols[1].big, 'display', colW, f.u * .2, bigPx, bigPx, 1.0, 1).cap : 0;
      var bodyTop = top + lab.h + f.u * .03 + f.u * .035 + (hasBig ? bigH + f.u * .035 : 0);
      var bodyPx = Math.min.apply(null, cols.map(function (k) { return fit(x, k.body, 'text400', colW, bottom - bodyTop, f.u * .044, f.u * .026, 1.32, 8).px; }));
      /* on stories, centre the whole thing */
      var colH = Math.max.apply(null, cols.map(function (k) { return fit(x, k.body, 'text400', colW, bottom - bodyTop, bodyPx, bodyPx, 1.32, 8).h; })) + (bodyTop - top);
      var dy = f.tall ? Math.max(0, (bottom - top - colH)) * .45 : 0;
      font(x, 'display', hr.px); block(x, hr, f.pad, f.pad + dy, 'left', ink, accentFor(c));
      cols.forEach(function (k, i) {
        var cx = f.pad + i * (colW + gap), yy = top + dy;
        font(x, 'text500', lab.px); var lr = fit(x, k.label, 'text500', colW, f.u * .1, lab.px, lab.px, 1.2, 1);
        block(x, lr, cx, yy, 'left', dim); yy += lab.h + f.u * .03;
        x.fillStyle = k.rule; x.fillRect(cx, yy, colW, Math.max(3, Math.round(f.u * .005))); yy += f.u * .035;
        if (hasBig) { if (k.big) { var br = fit(x, k.big, 'display', colW, f.u * .2, bigPx, bigPx, 1.0, 1); font(x, 'display', br.px); block(x, br, cx, yy, 'left', ink); } yy += bigH + f.u * .035; }
        var body = fit(x, k.body, 'text400', colW, bottom - yy, bodyPx, bodyPx, 1.35, 8); font(x, 'text400', body.px); block(x, body, cx, yy, 'left', ink);
      });
      mark(x, W - f.pad - markH, H - f.pad - markH, markH, ink);
    }
  });

  /* 9. Numbered list — three to five points */
  T.push({
    id: 'list', name: 'Numbered list',
    desc: 'A headline and three to five numbered points.',
    ratios: ['r45', 'r11', '', 'r916'],
    fields: [
      { key: 'head', label: 'Headline', type: 'text', max: 60 },
      { key: 'item1', label: 'Point 1', type: 'text', max: 70 },
      { key: 'item2', label: 'Point 2', type: 'text', max: 70 },
      { key: 'item3', label: 'Point 3', type: 'text', max: 70 },
      { key: 'item4', label: 'Point 4', type: 'text', max: 70, optional: true },
      { key: 'item5', label: 'Point 5', type: 'text', max: 70, optional: true },
      { key: 'color', label: 'Field', type: 'color', options: ['paper', 'beige', 'tan', 'yellow'] }
    ],
    defaults: { head: 'Five levels of the AI Builder Program.', item1: 'Use AI to 10x your impact', item2: 'Build complex agentic workflows', item3: 'Create autonomous agents', item4: 'Build your agent workforce', item5: 'Design your AI orchestration layer', color: 'paper' },
    render: async function (x, W, H, d, h) {
      var f = frame(W, H), c = get(d, 'color', 'paper'), ink = inkFor(c);
      fill(x, W, H, fieldHex(c, h.PAL));
      var head = get(d, 'head', ''), markH = markSize(f), num = accentFor(c);
      var items = [1, 2, 3, 4, 5].map(function (i) { return get(d, 'item' + i, ''); }).filter(Boolean);
      var hr = fit(x, head, 'display', f.land ? f.cw * .42 : f.cw, H * (f.land ? .6 : .3), f.u * (f.land ? .085 : .09), f.u * .05, 1.0, f.land ? 4 : 3);
      var lx = f.land ? f.pad + f.cw * .48 : f.pad, lw = f.land ? f.cw * .52 : f.cw;
      var top = f.land ? f.pad : f.pad + hr.h + f.u * .07, bottom = H - f.pad - markH - f.u * .06;
      var n = items.length, numW = f.u * .075, rowPad = f.u * .024;
      /* one text size for every row, the largest that fits the column */
      var px = f.u * .055, rows, floor1 = f.u * .036, floor2 = f.u * .024;
      /* first try to keep every point on one line; below floor1 allow a second line */
      for (; ;) {
        rows = items.map(function (t) { return fit(x, t, 'text500', lw - numW, f.u * .3, px, px, 1.25, 3); });
        var total = rows.reduce(function (a, r) { return a + r.h + 2 * rowPad; }, 0) + (n - 1) * f.u * .012;
        var multi = rows.some(function (r) { return r.lines.length > 1; });
        if ((total <= bottom - top && (!multi || px <= floor1)) || px <= floor2) break;
        px = Math.max(floor2, px * .95);
      }
      var used = rows.reduce(function (a, r) { return a + r.h + 2 * rowPad; }, 0), lead = Math.min(f.u * .06, Math.max(0, (bottom - top - used) / Math.max(1, n)));
      var spare = Math.max(0, bottom - top - used - lead * (n - 1)), dy = f.land ? 0 : f.tall ? spare * .45 : 0;
      font(x, 'display', hr.px); block(x, hr, f.pad, f.pad + dy, 'left', ink, accentFor(c));
      var yy = top + dy + (f.land ? spare / 2 : 0);
      rows.forEach(function (r, i) {
        var y0 = yy;
        yy += rowPad;
        font(x, 'text500', r.px); x.fillStyle = num; x.textAlign = 'left'; x.textBaseline = 'alphabetic'; x.fillText(String(i + 1), lx, yy + r.cap);
        block(x, r, lx + numW, yy, 'left', ink);
        yy += r.h + rowPad;
        if (i < n - 1) { x.fillStyle = isDark(c) ? 'rgba(255,255,255,.25)' : 'rgba(1,1,1,.14)'; x.fillRect(lx, Math.round(yy + lead / 2), lw, 1); yy += lead; }
      });
      mark(x, W - f.pad - markH, H - f.pad - markH, markH, ink);
    }
  });

  /* 10. Announcement — a launch tile with store badges */
  T.push({
    id: 'announcement', name: 'Announcement',
    desc: 'Lockup, a launch headline, one line and the store badges.',
    ratios: ['r45', 'r11', '', 'r916'],
    fields: [
      { key: 'head', label: 'Headline', type: 'text', max: 60 },
      { key: 'line', label: 'Line', type: 'text', max: 90, optional: true },
      { key: 'shot', label: 'Screenshot', type: 'asset', groups: ['card', 'aipost', 'hero'], optional: true },
      { key: 'color', label: 'Field', type: 'color', options: ['yellow', 'blue'] },
      { key: 'badges', label: 'Badges', type: 'choice', options: ['both', 'none'] }
    ],
    defaults: { head: 'Today we launched Leland Community.', line: 'It’s free on iOS, Android and web.', shot: 'card-alex', color: 'yellow', badges: 'both' },
    render: async function (x, W, H, d, h) {
      var f = frame(W, H), c = get(d, 'color', 'yellow'), ink = inkFor(c), acc = accentFor(c);
      fill(x, W, H, fieldHex(c, h.PAL));
      var head = get(d, 'head', ''), line = get(d, 'line', ''), lh = logoSize(f), badges = get(d, 'badges', 'both') !== 'none';
      var img = await loadAsset(h, get(d, 'shot', ''), null);
      logo(x, f.pad, f.pad, lh, ink);
      var bh = Math.round(f.u * .072), bw = Math.round(bh * 3.1), bgap = Math.round(f.u * .02);
      var footTop = badges ? H - f.pad - bh : H - f.pad;
      /* the screenshot peeks in from the right edge, clear of the badges */
      var sx = 0, sy = 0, sw = 0, sh = 0;
      if (img) {
        var ar = (img.naturalWidth || img.width) / (img.naturalHeight || img.height);
        if (f.land) { sw = W * .44; sh = sw / ar; sx = W - sw + f.u * .03; sy = Math.max(f.pad + lh + f.u * .04, (H - sh) / 2 + f.u * .04); }
        else { sw = W * (f.tall ? .7 : .6); sh = sw / ar; sx = W - sw + f.u * .05; sy = footTop - f.u * .06 - sh; }
      }
      var maxW = f.land ? (img ? sx - f.pad - f.u * .06 : f.cw * .85) : f.cw;
      var textTop = f.pad + lh + f.u * .07, textBottom = f.land ? footTop - f.u * .06 : (img ? sy - f.u * .06 : footTop - f.u * .06);
      var hr = fit(x, head, 'display', maxW, (textBottom - textTop) * (line ? .76 : 1), f.u * (f.land ? .11 : .12), f.u * .05, 1.0, 4);
      var lr = line ? fit(x, line, 'text400', Math.min(maxW, f.u * .7), f.u * .2, f.u * .034, f.u * .024, 1.32, 3) : null;
      var gap = line ? f.u * .035 : 0;
      var y = textTop;
      font(x, 'display', hr.px); y = block(x, hr, f.pad, y, 'left', ink, acc);
      if (lr) { font(x, 'text400', lr.px); y = block(x, lr, f.pad, y + gap, 'left', dimFor(c)); }
      if (img && !f.land) { var lo = y + f.u * .08, hi = footTop - f.u * .06 - sh; sy = lo + Math.max(0, hi - lo) * .5; }
      if (img) {
        var r = f.u * .025;
        x.save(); x.shadowColor = 'rgba(0,0,0,' + (isDark(c) ? .3 : .2) + ')'; x.shadowBlur = f.u * .06; x.shadowOffsetY = f.u * .02;
        roundRect(x, sx, sy, sw, sh, r); x.fillStyle = '#fff'; x.fill(); x.restore();
        x.save(); roundRect(x, sx, sy, sw, sh, r); x.clip(); x.drawImage(img, sx, sy, sw, sh); x.restore();
      }
      if (badges) { storeBadge(x, f.pad, H - f.pad - bh, bw, bh, 'Download on the', 'App Store', ink); storeBadge(x, f.pad + bw + bgap, H - f.pad - bh, bw, bh, 'Get it on', 'Google Play', ink); }
    }
  });

  window.TEMPLATES = T;
  window.TPL_HELPERS = { logo: logo, mark: mark, cover: cover, PAL: PAL };
})();
