/* LE image templates. Plain script: defines window.TEMPLATES and window.TPL_HELPERS.
   Everything draws on a 2d canvas context; the export is the preview. */
(function () {
  'use strict';

  /* ---------- palette & brand rules ---------- */
  var PAL = { yellow: '#FFD96F', blue: '#80ACED', slate: '#869AA6', beige: '#F3F1E6', tan: '#EBD4B5', paper: '#F9F8F3', ink: '#010101', neutral: '#222222', white: '#ffffff' };
  var DARK = { blue: 1, slate: 1, ink: 1, neutral: 1 };
  /* yellow is never a field under type: an old saved 'yellow' renders white */
  function fieldHex(name, pal) { if (name === 'yellow') name = 'white'; return (pal && pal[name]) || PAL[name] || name || PAL.white; }
  function isDark(name) { return !!DARK[name]; }
  /* type colour on a field */
  function inkFor(name) { return isDark(name) ? PAL.white : PAL.ink; }
  /* secondary type: same hue, lower alpha */
  function dimFor(name) { return isDark(name) ? 'rgba(255,255,255,.72)' : 'rgba(1,1,1,.58)'; }
  /* the one coloured phrase in a headline: the brand blue #80ACED on every field (the UI blue #3963D7 never appears in assets) */
  function accentFor(name) { return PAL.blue; }

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
  /* numerals: Macan's figures are not used. Inside Macan text every figure (with its currency sign, separators and percent)
     is set in Helvetica Neue at the same size and weight; its figures are tabular. Season headlines keep their own. */
  var NUMF = '"Helvetica Neue", Helvetica, Arial', NUMRE = /([$\u20ac\u00a3]?\d(?:[\d.,:]*\d)?%?)/;
  function runs(x, s) { return /Macan/.test(x.font) && /\d/.test(s) ? String(s).split(NUMRE).filter(Boolean) : null; }
  function isNum(p) { return /^[$\u20ac\u00a3]?\d/.test(p); }
  /* width of a string in the current font, figures swapped */
  function textW(x, s) {
    var r = runs(x, s); if (!r) return x.measureText(s).width;
    var base = x.font, nf = base.replace('Macan', NUMF), w = 0;
    r.forEach(function (p) { x.font = isNum(p) ? nf : base; w += x.measureText(p).width; }); x.font = base; return w;
  }
  /* draw a string left-aligned at X on the alphabetic baseline, figures swapped; returns its width */
  function td(x, s, X, Y, stroke) {
    var r = runs(x, s); x.textAlign = 'left'; x.textBaseline = 'alphabetic';
    if (!r) { if (stroke) x.strokeText(s, X, Y); else x.fillText(s, X, Y); return x.measureText(s).width; }
    var base = x.font, nf = base.replace('Macan', NUMF), cx = X;
    r.forEach(function (p) { x.font = isNum(p) ? nf : base; if (stroke) x.strokeText(p, cx, Y); else x.fillText(p, cx, Y); cx += x.measureText(p).width; }); x.font = base; return cx - X;
  }
  /* one plain line, aligned left / center / right on X */
  function say(x, s, X, Y, align, color, stroke) {
    var w = textW(x, s), cx = align === 'center' ? X - w / 2 : align === 'right' ? X - w : X;
    if (stroke) x.strokeStyle = color; else x.fillStyle = color; td(x, s, cx, Y, stroke); return w;
  }
  /* shorten a line that cannot fit, with an ellipsis */
  function clip(x, s, maxW) { s = String(s); if (textW(x, s) <= maxW) return s; while (s.length > 1 && textW(x, s + '\u2026') > maxW) s = s.slice(0, -1); return s.replace(/[\s,.]+$/, '') + '\u2026'; }
  function mw(x, s) { return textW(x, plain(s)); }
  /* word wrap that keeps [bracketed] phrases intact, honours \n, and pulls one word down to avoid a widow */
  function wrap(x, text, maxW) {
    var out = [];
    /* a bracketed phrase may break across lines: bracket each of its words so every piece keeps the accent */
    text = String(text || '').replace(/\[([^\]]+)\]/g, function (m, p) { return p.trim().split(/\s+/).map(function (w) { return '[' + w + ']'; }).join(' '); });
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
    var widths = parts.map(function (p) { return textW(x, plain(p)); });
    var tw = widths.reduce(function (a, b) { return a + b; }, 0);
    var cx = align === 'center' ? X - tw / 2 : align === 'right' ? X - tw : X;
    x.textAlign = 'left'; x.textBaseline = 'alphabetic';
    parts.forEach(function (p, i) { x.fillStyle = p.charAt(0) === '[' ? (accent || PAL.blue) : ink; td(x, plain(p), cx, Y); cx += widths[i]; });
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
  /* the deck's LOCK is 24px on a 1296 unit (1.85%); the same proportion on every tile */
  function markSize(f) { return Math.max(18, Math.round(f.u * .0185)); }
  function logoSize(f) { return Math.max(18, Math.round(f.u * .0185)); }
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
  var FIELDS = ['white', 'paper', 'beige', 'tan', 'slate', 'blue', 'ink'];

  var T = [];

  /*@@PHOTO@@*/
  /* a picture and a headline share the tile: side by side on wide tiles, picture on top on the others (half of a square, 55% of a tall tile) */
  function halves(W, H, f) {
    if (f.land) { var hw = Math.round(W / 2); return { side: true, ix: W - hw, iy: 0, iw: hw, ih: H, tx: f.pad, ty: f.pad, tw: W - hw - f.pad - Math.round(f.u * .05), tb: H - f.pad }; }
    var ih = Math.round(H * (W >= H ? .5 : .55));
    return { side: false, ix: 0, iy: 0, iw: W, ih: ih, tx: f.pad, ty: ih + Math.round(f.u * .06), tw: f.cw, tb: H - f.pad };
  }
  /* the headline at the top of the white half, the lockup in its bottom-left corner */
  function halfText(x, f, g, head, H) {
    var lh = logoSize(f);
    var hr = fit(x, head, 'display', g.tw, g.tb - lh - f.u * .05 - g.ty, f.u * (g.side ? .1 : .098), f.u * .042, 1.0, g.side ? 5 : 3);
    font(x, 'display', hr.px); block(x, hr, g.tx, g.ty, 'left', PAL.ink, accentFor('white'));
    logo(x, f.pad, H - f.pad - lh, lh, 'ink');
  }

  /* 1. Photo with headline — full-bleed with the line over the photo, or split with the line on white */
  T.push({
    id: 'photo-headline', name: 'Photo with headline',
    desc: 'A photo and a Season headline: over the photo, or beside it on white.',
    ratios: ['r45', 'r11', '', 'r916'],
    fields: [
      { key: 'photo', label: 'Photo', type: 'asset', groups: ['photo', 'background', 'hero'] },
      { key: 'head', label: 'Headline', type: 'text', max: 60 },
      { key: 'layout', label: 'Layout', type: 'choice', options: ['full', 'split'] }
    ],
    /* headline: data/copy.json c-051 (tagline) */
    defaults: { photo: 'photo-college-friends-talking-hallway', head: 'Get there, with the people who\'ve been there.', layout: 'full' },
    render: async function (x, W, H, d, h) {
      var f = frame(W, H), head = get(d, 'head', ''), lh = logoSize(f);
      var img = await loadAsset(h, get(d, 'photo', ''), 'photo');
      if (get(d, 'layout', 'full') === 'split') {
        var g = halves(W, H, f);
        fill(x, W, H, PAL.white);
        x.fillStyle = PAL.neutral; x.fillRect(g.ix, g.iy, g.iw, g.ih);
        if (img) cover(x, img, g.ix, g.iy, g.iw, g.ih, .5, .35);
        halfText(x, f, g, head, H);
        return;
      }
      fill(x, W, H, PAL.neutral);
      if (img) cover(x, img, 0, 0, W, H, .5, .35);
      var lw = 112 / 24 * lh, maxW = Math.min(f.cw - lw - f.u * .05, f.land ? f.cw * .62 : f.cw);
      var hr = fit(x, head, 'display', maxW, H * .4, f.u * (f.land ? .1 : .098), f.u * .05, 1.0, 4);
      var top = H - f.pad - hr.h - hr.px * .1;
      /* the photo darkens only behind the words: clear above the headline, deepest at the bottom edge */
      var s0 = Math.max(0, top - f.u * .22), sh = x.createLinearGradient(0, s0, 0, H);
      sh.addColorStop(0, 'rgba(0,0,0,0)'); sh.addColorStop(.45, 'rgba(0,0,0,.34)'); sh.addColorStop(1, 'rgba(0,0,0,.62)');
      x.fillStyle = sh; x.fillRect(0, s0, W, H - s0);
      font(x, 'display', hr.px); block(x, hr, f.pad, top, 'left', PAL.white, PAL.white);
      logo(x, W - f.pad - lw, H - f.pad - lh, lh, 'white');
    }
  });

  /* 2. Illustration with headline — one flat illustration fills half the tile, edge to edge */
  /* the same drawing exists in several shapes (wide, square, tall): use the one closest to the space it fills */
  function bestCrop(h, a, ar) {
    if (!a || a.group !== 'flat' || !h.byGroup) return a;
    var best = a, score = function (b) { return b.w && b.h ? Math.abs(Math.log((b.w / b.h) / ar)) : 9; };
    h.byGroup('flat').forEach(function (b) { if (b.title === a.title && score(b) < score(best)) best = b; });
    return best;
  }
  T.push({
    id: 'illustration-headline', name: 'Illustration with headline',
    desc: 'One flat illustration on half the tile, a Season headline on white on the other.',
    ratios: ['r45', 'r11', '', 'r916'],
    fields: [
      { key: 'ill', label: 'Illustration', type: 'asset', groups: ['flat'] },
      { key: 'head', label: 'Headline', type: 'text', max: 60 }
    ],
    /* headline: data/copy.json c-049 (tagline) */
    defaults: { ill: 'flat-door-v', head: 'Own your future.' },
    render: async function (x, W, H, d, h) {
      var f = frame(W, H), g = halves(W, H, f);
      fill(x, W, H, PAL.white);
      var a = (h.A && h.A(get(d, 'ill', ''))) || (h.byGroup && h.byGroup('flat')[0]) || null, img = null;
      a = bestCrop(h, a, g.iw / g.ih);
      if (a) { try { img = await h.loadImg(a.src); } catch (e) { img = null; } }
      if (img) cover(x, img, g.ix, g.iy, g.iw, g.ih, .5, .5);
      halfText(x, f, g, get(d, 'head', ''), H);
    }
  });

  /* 3. Expert spotlight — a face, a credential, a quote */
  T.push({
    id: 'expert-spotlight', name: 'Expert spotlight',
    desc: 'Headshot with the name and one line.',
    ratios: ['r45', 'r11', '', 'r916'],
    fields: [
      { key: 'expert', label: 'Expert', type: 'asset', groups: ['expert'] },
      { key: 'name', label: 'Name', type: 'text', max: 32 },
      { key: 'role', label: 'Credential', type: 'text', max: 70, optional: true },
      { key: 'quote', label: 'Line (quote it yourself if it is one)', type: 'text', max: 140 },
      { key: 'color', label: 'Field', type: 'color', options: ['white', 'paper', 'beige', 'tan', 'blue', 'slate'] },
      { key: 'shape', label: 'Photo', type: 'choice', options: ['square', 'circle'] }
    ],
    defaults: { expert: 'coach-ava-b', name: 'Ava B.', role: 'Leland expert', quote: 'Learn from people who\'ve done it', color: 'white', shape: 'square' },
    render: async function (x, W, H, d, h) {
      var f = frame(W, H), c = get(d, 'color', 'white'), ink = inkFor(c), dim = dimFor(c);
      fill(x, W, H, fieldHex(c, h.PAL));
      var img = await loadAsset(h, get(d, 'expert', ''), 'expert');
      var markH = markSize(f), circle = get(d, 'shape', 'square') === 'circle';
      var name = get(d, 'name', ''), role = get(d, 'role', ''), quote = get(d, 'quote', '');
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

  /* 4. Chart — one series, drawn from the values typed in */
  T.push({
    id: 'chart', name: 'Chart',
    desc: 'A bar or line chart from your numbers, with the source.',
    ratios: ['r45', 'r11', '', 'r916'],
    fields: [
      { key: 'head', label: 'Headline', type: 'text', max: 70 },
      { key: 'data', label: 'Values, one per line: label, number', type: 'text', max: 400 },
      { key: 'unit', label: 'Unit', type: 'text', max: 10, optional: true },
      { key: 'kind', label: 'Chart', type: 'choice', options: ['bars', 'line'] },
      { key: 'source', label: 'Source', type: 'text', max: 60, optional: true },
      { key: 'color', label: 'Field', type: 'color', options: ['white', 'paper', 'beige', 'ink'] }
    ],
    /* real numbers: "Proposals went from 2 hours to 30 minutes." (data/copy.json c-014, the ASU+GSV customer story) */
    defaults: { head: 'Proposals went from 2 hours to 30 minutes.', data: 'Before, 120\nAfter, 30', unit: 'min', kind: 'bars', source: 'ASU+GSV customer story, October 2026', color: 'white' },
    render: async function (x, W, H, d, h) {
      var f = frame(W, H), c = get(d, 'color', 'white'), ink = inkFor(c), dim = dimFor(c), series = PAL.blue;
      fill(x, W, H, fieldHex(c, h.PAL));
      var rows = String(d.data || '').split(/\n/).map(function (l) {
        var m = l.match(/^(.*?)[,:\t]\s*(-?[\d.,]+)\s*$/); if (!m) return null;
        var v = parseFloat(m[2].replace(/,/g, '')); return isNaN(v) ? null : { label: m[1].trim(), v: Math.max(0, v) };
      }).filter(Boolean).slice(0, 8);
      var unit = get(d, 'unit', ''), src = get(d, 'source', ''), line = get(d, 'kind', 'bars') === 'line' && rows.length > 1;
      var lh = logoSize(f), top = f.pad;
      var hr = fit(x, get(d, 'head', ''), 'display', f.land ? f.cw * .8 : f.cw, (H - 2 * f.pad) * .3, f.u * .078, f.u * .042, 1, 3);
      font(x, 'display', hr.px); var y = block(x, hr, f.pad, top, 'left', ink, accentFor(c));
      var footH = lh + (src ? f.u * .07 : 0), labPx = f.u * .026, valPx = labPx * 1.25;   /* the value is one step above its label, never a giant figure over a small word */
      var plotTop = y + f.u * .07 + valPx * 1.3, plotBottom = H - f.pad - footH - f.u * .05 - labPx * 1.9, plotH = Math.max(10, plotBottom - plotTop);
      var n = rows.length || 1, max = Math.max.apply(null, rows.map(function (r) { return r.v; }).concat([1e-9]));
      var plotW = Math.min(f.cw, f.u * (.2 + .2 * n)), slot = plotW / n, bw = Math.min(slot - 2, slot * .62), x0 = f.pad;
      var fmt = function (v) { return (Math.round(v * 100) / 100).toLocaleString('en-US') + (unit ? ' ' + unit : ''); };
      var pts = rows.map(function (r, i) { return { cx: x0 + slot * i + (line ? slot / 2 : bw / 2), y: plotBottom - plotH * (r.v / max), r: r }; });
      /* baseline: recessive, one hairline */
      x.fillStyle = dim; x.globalAlpha = .35; x.fillRect(x0, plotBottom, plotW - (line ? 0 : slot - bw), Math.max(1, f.u * .0015)); x.globalAlpha = 1;
      if (line) {
        x.strokeStyle = series; x.lineWidth = Math.max(2, f.u * .005); x.lineJoin = 'round'; x.lineCap = 'round';
        x.beginPath(); pts.forEach(function (p, i) { i ? x.lineTo(p.cx, p.y) : x.moveTo(p.cx, p.y); }); x.stroke();
        var pr = Math.max(4, f.u * .009);
        pts.forEach(function (p) { x.beginPath(); x.arc(p.cx, p.y, pr + Math.max(2, f.u * .003), 0, 7); x.fillStyle = fieldHex(c, h.PAL); x.fill(); x.beginPath(); x.arc(p.cx, p.y, pr, 0, 7); x.fillStyle = series; x.fill(); });
      } else {
        var rad = Math.max(4, f.u * .006);
        pts.forEach(function (p) { var bh = Math.max(1, plotBottom - p.y), X = p.cx - bw / 2, r = Math.min(rad, bh);
          x.beginPath(); x.moveTo(X, plotBottom); x.lineTo(X, p.y + r); x.arcTo(X, p.y, X + r, p.y, r); x.lineTo(X + bw - r, p.y); x.arcTo(X + bw, p.y, X + bw, p.y + r, r); x.lineTo(X + bw, plotBottom); x.closePath(); x.fillStyle = series; x.fill(); });
      }
      /* direct labels in ink: the value above each mark, the category beneath */
      x.textBaseline = 'alphabetic';
      pts.forEach(function (p, i) {
        var show = !line || n <= 6 || i === 0 || i === n - 1;
        var al = line ? 'center' : 'left';
        if (show) { font(x, 'text600', valPx); var lx = line ? p.cx : p.cx - bw / 2, ly = p.y - valPx * .45 - (line ? f.u * .012 : 0);
          /* on a line chart the label sits on the line's path: a halo in the field colour keeps it readable */
          if (line) { x.lineWidth = valPx * .4; x.lineJoin = 'round'; say(x, fmt(p.r.v), lx, ly, al, fieldHex(c, h.PAL), true); }
          say(x, fmt(p.r.v), lx, ly, al, ink); }
        font(x, 'text400', labPx); say(x, p.r.label, line ? p.cx : p.cx - bw / 2, plotBottom + labPx * 1.6, al, dim);
      });
      x.textAlign = 'left';
      if (src) { var sr = fit(x, src, 'text400', f.cw, f.u * .1, f.u * .026, f.u * .02, 1.3, 2); font(x, 'text400', sr.px); block(x, sr, f.pad, H - f.pad - lh - f.u * .055 - sr.cap, 'left', dim); }
      logo(x, f.pad, H - f.pad - lh, lh, ink);
    }
  });

  /* 5. Product moment */
  T.push({
    id: 'product-moment', name: 'Product moment',
    desc: 'A screenshot in a soft frame on a field, with a headline.',
    ratios: ['r45', '', 'r11', 'r916'],
    fields: [
      { key: 'head', label: 'Headline', type: 'text', max: 60 },
      { key: 'shot', label: 'Screenshot', type: 'asset', groups: ['card', 'aipost', 'hero', 'upload'] },
      { key: 'color', label: 'Field', type: 'color', options: FIELDS },
      { key: 'align', label: 'Headline', type: 'choice', options: ['left', 'above'] }
    ],
    defaults: { head: 'Real answers from people who\'ve done it.', shot: 'card-alex', color: 'white', align: 'left' },
    render: async function (x, W, H, d, h) {
      var f = frame(W, H), c = get(d, 'color', 'white'), ink = inkFor(c), acc = accentFor(c);
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

  /* 6. Quote — a customer's words, who said them */
  function normName(s) { return String(s || '').toLowerCase().replace(/\([^)]*\)/g, ' ').replace(/[^a-z0-9+&]+/g, ' ').replace(/^the /, '').trim(); }
  T.push({
    id: 'quote', name: 'Quote',
    desc: 'A customer\'s words in Season, their name and role beneath.',
    ratios: ['r45', 'r11', '', 'r916'],
    fields: [
      { key: 'quote', label: 'Quote, word for word', type: 'text', max: 200 },
      { key: 'name', label: 'Name', type: 'text', max: 40 },
      { key: 'role', label: 'Role and company', type: 'text', max: 60, optional: true }
    ],
    /* data/copy.json c-115: verbatim, Lucy Baldwin, VP Product, ASU+GSV */
    defaults: { quote: 'It put everyone in a builder mindset.', name: 'Lucy Baldwin', role: 'VP Product, ASU+GSV' },
    render: async function (x, W, H, d, h) {
      var f = frame(W, H), ink = PAL.ink, dim = dimFor('white');
      fill(x, W, H, PAL.white);
      var q = get(d, 'quote', '').replace(/^["“”\s]+|["“”\s]+$/g, ''), name = get(d, 'name', ''), role = get(d, 'role', '');
      var lh = logoSize(f), lw = 112 / 24 * lh, px = Math.round(f.u * .03), lineH = px * 1.36;
      /* a face only when the library holds a photo of this very person (an expert headshot titled with the same name) */
      var who = name && h.byGroup ? h.byGroup('expert').filter(function (a) { return normName(a.title) === normName(name); })[0] : null, img = null;
      if (who) { try { img = await h.loadImg(who.src); } catch (e) { img = null; } }
      var rows = (name ? 1 : 0) + (role ? 1 : 0), footH = rows ? (rows - 1) * lineH + px : lh;
      var ph = img ? Math.round(lineH + px * 1.5) : 0; if (img) footH = Math.max(footH, ph);
      var footTop = H - f.pad - footH;
      var maxW = f.land ? f.cw * .82 : f.cw;
      var qr = fit(x, q + '”', 'display', maxW, footTop - f.u * .07 - f.pad, f.u * (f.land ? .105 : .11), f.u * .045, 1.04, 8);
      font(x, 'display', qr.px);
      /* the opening mark hangs in the margin so the words keep one left edge */
      x.fillStyle = ink; x.textAlign = 'right'; x.textBaseline = 'alphabetic'; x.fillText('“', f.pad - qr.px * .02, f.pad + qr.cap); x.textAlign = 'left';
      block(x, qr, f.pad, f.pad, 'left', ink, accentFor('white'));
      var tx = f.pad;
      if (img) { x.save(); x.beginPath(); x.arc(f.pad + ph / 2, footTop + footH / 2, ph / 2, 0, Math.PI * 2); x.closePath(); x.clip(); cover(x, img, f.pad, footTop + (footH - ph) / 2, ph, ph, .5, .3); x.restore(); tx = f.pad + ph + px * .7; }
      var by = H - f.pad - (img ? (footH - ((rows - 1) * lineH + px)) / 2 : 0) - px * .12;
      var nameW = W - f.pad - lw - f.u * .05 - tx;
      if (role) { font(x, 'text400', px); say(x, clip(x, role, nameW), tx, by, 'left', dim); by -= lineH; }
      if (name) { font(x, 'text600', px); say(x, clip(x, name, nameW), tx, by, 'left', ink); }
      logo(x, W - f.pad - lw, H - f.pad - lh, lh, 'ink');
    }
  });

  /* 7. Ranked list — the calm version of a "top 20" infographic */
  /* a logo from the org shelf: an id if one is typed, else the title that equals the name, else the one title that holds it
     (never a single school of a university: "Harvard" may find Harvard University, not Harvard Business School) */
  function findOrg(h, name, id) {
    if (!h.byGroup) return null;
    if (id) { var a = h.A(id) || h.A('org-' + id); if (a && a.group === 'org') return a; }
    var n = normName(name); if (!n) return null;
    var orgs = h.byGroup('org'), exact = orgs.filter(function (o) { return normName(o.title) === n; })[0];
    if (exact) return exact;
    var near = orgs.filter(function (o) {
      var t = ' ' + normName(o.title) + ' ', k = ' ' + n + ' ';
      if (t.indexOf(k) >= 0) return !/\b(school|college|law|medicine|business)\b/.test(t.replace(k, ' '));
      return t.trim().length >= 5 && k.indexOf(t) >= 0;
    }).sort(function (a, b) { return a.title.length - b.title.length; });
    return near[0] || null;
  }
  /* "Name, value" or "Name, value, logo-id": the value is the last part that carries a figure, so "$42,428" survives its comma */
  function parseRanked(h, text) {
    return String(text || '').split(/\n/).map(function (l) {
      l = l.trim(); if (!l) return null;
      var id = '', m = l.match(/^(.*\d.*?),\s*([A-Za-z][\w.()&+\-]*)$/);
      if (m && h.A && (h.A(m[2]) || h.A('org-' + m[2]))) { l = m[1].trim(); id = m[2]; }
      m = l.match(/^(.*?)[,\t]\s*([^\s,]*\d[\d,.]*[^\s,]*(?:\s+[^\d,]+)?)$/);
      if (!m) return null;
      var v = parseFloat(m[2].replace(/[^\d.\-]/g, ''));
      return { name: m[1].trim(), value: m[2].trim(), v: isNaN(v) ? 0 : Math.max(0, v), id: id };
    }).filter(Boolean);
  }
  T.push({
    id: 'ranked-list', name: 'Ranked list',
    desc: 'A ranking from your rows: name, value and a bar, with the source.',
    ratios: ['r45', 'r11', '', 'r916'],
    fields: [
      { key: 'head', label: 'Headline', type: 'text', max: 70 },
      { key: 'rows', label: 'Rows, one per line: name, value', type: 'text', max: 1600, tall: true },
      { key: 'source', label: 'Source', type: 'text', max: 200 }
    ],
    /* the reference's top 10 (NCES IPEDS Finance, FY2023); the headline labels the data */
    defaults: {
      head: 'Top 10 colleges by [administration spending] per student',
      rows: 'Stanford University, $42,428\nHarvard University, $33,487\nMIT, $31,400\nUSC, $28,876\nJohns Hopkins University, $27,115\nUniversity of Chicago, $26,040\nVanderbilt University, $24,695\nUniversity of Rochester, $23,023\nDuke University, $21,951\nUniversity of Miami, $21,759',
      source: 'Source: NCES IPEDS Finance, FY2023. Institutional support expenses per FTE student, 4-year schools with 10,000+ FTE students.'
    },
    render: async function (x, W, H, d, h) {
      var f = frame(W, H), ink = PAL.ink, dim = dimFor('white'), hair = 'rgba(1,1,1,.14)';
      fill(x, W, H, PAL.white);
      var rows = parseRanked(h, d.rows).slice(0, f.land ? 20 : f.tall ? 12 : 10), n = rows.length;
      var cols = f.land && n > 10 ? 2 : 1, per = Math.ceil(n / cols) || 1, beside = f.land && cols === 1;
      var lh = logoSize(f), lw = 112 / 24 * lh, head = get(d, 'head', ''), src = get(d, 'source', '');
      /* logos: every row or none */
      var orgs = rows.map(function (r) { return findOrg(h, r.name, r.id); }), logos = null;
      if (n && orgs.every(Boolean)) { logos = await Promise.all(orgs.map(function (a) { return h.loadImg(a.src).catch(function () { return null; }); })); if (!logos.every(Boolean)) logos = null; }
      /* foot: the source on the left, the lockup on the right, one baseline */
      var headW = beside ? f.cw * .36 : f.land ? f.cw * .7 : f.cw;
      var srcPx = Math.round(f.u * .021), sr = src ? fit(x, src, 'text400', Math.min(beside ? headW : f.cw - lw - f.u * .06, f.u * .78), f.u * .12, srcPx, srcPx, 1.36, 4) : null;
      var footH = Math.max(lh, sr ? sr.h : 0), footTop = H - f.pad - footH;
      if (sr) { font(x, 'text400', sr.px); block(x, sr, f.pad, H - f.pad - sr.h, 'left', dim); }
      logo(x, W - f.pad - lw, H - f.pad - lh, lh, 'ink');
      /* headline */
      var hr = fit(x, head, 'display', headW, beside ? f.ch * .6 : H * .17, f.u * (beside ? .07 : .064), f.u * .04, 1.02, beside ? 5 : 3);
      font(x, 'display', hr.px); var hb = block(x, hr, f.pad, f.pad, 'left', ink, accentFor('white'));
      if (!n) return;
      /* the list */
      var lx = beside ? f.pad + f.cw * .44 : f.pad, lwid = W - f.pad - lx, cgap = f.u * .07, colW = (lwid - (cols - 1) * cgap) / cols;
      var top = beside ? f.pad : hb + f.u * .05, bottom = beside ? H - f.pad - lh - f.u * .045 : footTop - f.u * .045;
      var minPx = Math.round(f.u / 1080 * 30), rowH = Math.min((bottom - top) / per, minPx * (f.tall ? 4.2 : 3.2));
      var floor = cols === 2 ? Math.round(minPx * .86) : minPx, px = Math.max(floor, Math.min(Math.round(rowH * .46), Math.round(f.u * .034)));
      var max = Math.max.apply(null, rows.map(function (r) { return r.v; }).concat([1e-9]));
      /* rank, name and value share one size: the largest that lets the longest name fit. Two columns on a wide tile may go a little under the floor before a name is cut */
      var gap, rankW, valW, cap, logoS, nameX, nameW;
      for (px = px + 1; px > floor;) {
        px--; gap = px * .55;
        font(x, 'text400', px); rankW = textW(x, n > 9 ? '00' : '0') + gap;
        font(x, 'text500', px); valW = Math.max.apply(null, rows.map(function (r) { return textW(x, r.value); })); cap = capOf(x);
        logoS = logos ? Math.round(px * 1.3) : 0; nameX = rankW + (logos ? logoS + gap : 0); nameW = colW - nameX - valW - gap * 1.4;
        if (rows.every(function (r) { return textW(x, r.name) <= nameW; })) break;
      }
      var npx = px;
      var barT = Math.max(3, Math.round(f.u * .004)), hairT = Math.max(1, Math.round(f.u * .0015));
      rows.forEach(function (r, i) {
        var c = Math.floor(i / per), X = lx + c * (colW + cgap), y = top + (i % per) * rowH, yb = y + rowH, base = Math.round(y + (rowH - barT) / 2 + cap / 2);
        font(x, 'text400', px); say(x, String(i + 1), X, base, 'left', dim);
        if (logos) contain(x, logos[i], X + rankW, Math.round(base - cap / 2 - logoS / 2), logoS, logoS);
        font(x, 'text500', npx); say(x, clip(x, r.name, nameW), X + nameX, base, 'left', ink);
        font(x, 'text500', px); say(x, r.value, X + colW, base, 'right', ink);
        /* the rule under each row is the bar's track; the fill is the value against the largest */
        x.fillStyle = hair; x.fillRect(X, yb - hairT, colW, hairT);
        x.fillStyle = i === 0 ? PAL.blue : ink; x.fillRect(X, yb - barT, Math.max(barT, colW * r.v / max), barT);
      });
    }
  });

  window.TEMPLATES = T;
  window.TPL_HELPERS = { logo: logo, mark: mark, cover: cover, PAL: PAL };
})();
