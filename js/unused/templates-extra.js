/* Image templates taken out of the picker on Nov 23 (One number, Quote, Before and after, Numbered list, Announcement).
   Not loaded by index.html. To bring one back, paste its T.push({...}) block into js/templates.js before `window.TEMPLATES = T;`
   (they use that file's helpers: frame, fit, block, font, logo, storeBadge...). */

  /* 4. One number */
  T.push({
    id: 'stat', name: 'One number',
    desc: 'A big Season number, what it means, and the source.',
    ratios: ['r11', 'r45', '', 'r916'],
    fields: [
      { key: 'number', label: 'Number', type: 'text', max: 8 },
      { key: 'label', label: 'What it means', type: 'text', max: 90 },
      { key: 'source', label: 'Source', type: 'text', max: 60, optional: true },
      { key: 'color', label: 'Field', type: 'color', options: ['white', 'paper', 'beige', 'tan', 'slate', 'blue', 'ink'] }
    ],
    defaults: { number: '33', label: 'people on the ASU+GSV Summit team went through the AI Builder Program together.', source: 'ASU+GSV customer story, October 2026', color: 'white' },
    render: async function (x, W, H, d, h) {
      var f = frame(W, H), c = get(d, 'color', 'white'), ink = inkFor(c), dim = dimFor(c);
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

  /* 7. Quote — one Season line from a customer or expert, attributed */
  T.push({
    id: 'quote', name: 'Quote',
    desc: 'A big Season quote, with who said it.',
    ratios: ['r45', 'r11', '', 'r916'],
    fields: [
      { key: 'quote', label: 'Quote', type: 'text', max: 160 },
      { key: 'name', label: 'Name', type: 'text', max: 32 },
      { key: 'role', label: 'Role', type: 'text', max: 60, optional: true },
      { key: 'color', label: 'Field', type: 'color', options: ['white', 'paper', 'beige', 'tan'] }
    ],
    defaults: { quote: 'It put everyone in a builder mindset.', name: 'Lucy Baldwin', role: 'VP Product, ASU+GSV', color: 'white' },
    render: async function (x, W, H, d, h) {
      var f = frame(W, H), c = get(d, 'color', 'white'), ink = inkFor(c), dim = dimFor(c);
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
      { key: 'color', label: 'Field', type: 'color', options: ['white', 'paper', 'beige', 'tan'] }
    ],
    defaults: { head: 'PlayPower rebuilt 1,500+ product spec sheets.', beforeBig: '12 months', before: 'Scoped at 8 to 15 minutes a sheet. “We’re never going to get through that.”', afterBig: 'Weeks', after: 'One spreadsheet, then Claude generated every sheet.', color: 'white' },
    render: async function (x, W, H, d, h) {
      var f = frame(W, H), c = get(d, 'color', 'white'), ink = inkFor(c), dim = dimFor(c);
      fill(x, W, H, fieldHex(c, h.PAL));
      var head = get(d, 'head', ''), markH = markSize(f);
      var cols = [
        { label: 'Before', big: get(d, 'beforeBig', ''), body: get(d, 'before', ''), rule: 'rgba(1,1,1,.22)' },
        { label: 'After', big: get(d, 'afterBig', ''), body: get(d, 'after', ''), rule: c === 'tan' ? PAL.ink : PAL.blue }
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
    desc: 'A headline and up to three numbered points.',
    ratios: ['r45', 'r11', '', 'r916'],
    fields: [
      { key: 'head', label: 'Headline', type: 'text', max: 60 },
      { key: 'item1', label: 'Point 1', type: 'text', max: 70 },
      { key: 'item2', label: 'Point 2', type: 'text', max: 70 },
      { key: 'item3', label: 'Point 3', type: 'text', max: 70, optional: true },
      { key: 'color', label: 'Field', type: 'color', options: ['white', 'paper', 'beige', 'tan'] }
    ],
    defaults: { head: 'The AI Builder Program.', item1: 'A 5-level program, taught live, online, by leading AI instructors', item2: 'Each level is 6 sessions over a condensed 3-week period', item3: 'Taught on the most in-demand tools: Claude Code, n8n, Cowork and more', color: 'white' },
    render: async function (x, W, H, d, h) {
      var f = frame(W, H), c = get(d, 'color', 'white'), ink = inkFor(c);
      fill(x, W, H, fieldHex(c, h.PAL));
      var head = get(d, 'head', ''), markH = markSize(f), num = accentFor(c);
      var items = [1, 2, 3].map(function (i) { return get(d, 'item' + i, ''); }).filter(Boolean);
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
    desc: 'Lockup, a launch headline, a screenshot and the store badges.',
    ratios: ['r45', 'r11', '', 'r916'],
    fields: [
      { key: 'head', label: 'Headline', type: 'text', max: 60 },
      { key: 'shot', label: 'Screenshot', type: 'asset', groups: ['card', 'aipost', 'hero'], optional: true },
      { key: 'color', label: 'Field', type: 'color', options: ['white', 'paper', 'blue'] },
      { key: 'badges', label: 'Badges', type: 'choice', options: ['both', 'none'] }
    ],
    defaults: { head: 'Today we launched Leland Community.', shot: 'card-alex', color: 'white', badges: 'both' },
    render: async function (x, W, H, d, h) {
      var f = frame(W, H), c = get(d, 'color', 'white'), ink = inkFor(c), acc = accentFor(c);
      fill(x, W, H, fieldHex(c, h.PAL));
      var head = get(d, 'head', ''), line = '', lh = logoSize(f), badges = get(d, 'badges', 'both') !== 'none';
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
