#!/usr/bin/env python3
"""Recompute every number shown on the slides and spoken in the narration from data/lists/ipeds-acceptance.json (independently of the slide code)
and diff it against the rendered pages. Checks: data.js is a copy of the file; every rate in the file equals admitted / applied to two decimals;
every element tagged data-k shows the expected string; every digit-bearing token of visible text is in that slide's allowed set; the chart (slide 1)
and the table version (slide-2.html?anim) show each fall's true ten lowest in order; positions of points and lengths of bars; headlines' facts;
the source line; no missing marks, and no mix of marks and typed names. Exit code 1 on any mismatch."""
import json, os, re, sys, math, importlib.util
from playwright.sync_api import sync_playwright
SRC = os.path.dirname(os.path.abspath(__file__))
spec = importlib.util.spec_from_file_location('build', os.path.join(SRC, 'build.py')); B = importlib.util.module_from_spec(spec); spec.loader.exec_module(B)
RAW = json.load(open(os.path.join(B.REPO, 'data/lists/ipeds-acceptance.json'))); S = RAW['schools']; YEARS = list(range(2014, 2024))
bad = []; n = 0
def chk(what, got, want):
    global n; n += 1
    if got != want: bad.append(f'{what}: shown {got!r}, file gives {want!r}')
tokens = lambda s: set(re.findall(r'\d[\d,.]*\d%?|\d%?', s))
r = lambda k, y: S[k]['years'][str(y)]; ex = lambda k, y: r(k, y)['admitted'] / r(k, y)['applied'] * 100
pc = lambda v: f'{v:.2f}%'; commas = lambda v: f'{v:,}'
def top(y, m=10): return sorted(S, key=lambda k: ex(k, y))[:m]
def expect(key): k, y, f = key.split('.'); return pc(r(k, y)['rate']) if f == 'rate' else commas(r(k, y)[f])
# the file itself
chk('15 schools, ten falls each', [len(S), {len(v['years']) for v in S.values()}], [15, {10}])
for k in S:
    for y in YEARS: chk(f'file: {k} {y} rate is admitted / applied', round(ex(k, y), 2), r(k, y)['rate'])
chk('file: these 15 are every school in a ten lowest', {k for y in YEARS for k in top(y)} | set(), {k for k in S if any(k in top(y) for y in YEARS)}); chk('file: every school is in a ten lowest some fall', all(any(k in top(y) for y in YEARS) for k in S), True)
js = open(os.path.join(SRC, 'data.js')).read(); chk('data.js is a copy of the file', json.loads(js.split('window.ACCEPT = ')[1].split(';\nwindow.LOGOS_PRESENT')[0]) == RAW, True)
present = json.loads(js.split('window.LOGOS_PRESENT = ')[1].rsplit(';', 1)[0]); chk('a mark for every school', sorted(present), sorted(S))
# facts behind the headlines and the narration
ne = lambda y: r('northeastern', y); t23 = top(2023); five = ['harvard', 'stanford', 'columbia', 'yale', 'princeton']
chk('slide 3 headline: 32% and 6%', [f"{ne(2014)['rate']:.0f}%", f"{ne(2023)['rate']:.0f}%"], ['32%', '6%'])
chk('slide 4 headline: applications rose at all ten in fall 2021', all(r(k, 2021)['applied'] > r(k, 2020)['applied'] for k in t23), True)
chk('slide 5 headline: all five lower in 2023 than 2014', all(ex(k, 2023) < ex(k, 2014) for k in five), True)
chk('slide 6 headline: Harvard, fall 2023', [commas(r('harvard', 2023)['admitted']), commas(r('harvard', 2023)['applied'])], ['1,965', '56,937']); chk('slide 6: the five lowest of fall 2023', t23[:5], ['harvard', 'stanford', 'columbia', 'princeton', 'yale'])
HEAD = {1: 'The hardest colleges to get into', 2: 'The ten lowest acceptance rates, fall 2023', '2-graph': 'The ten lowest acceptance rates, fall 2023', 3: 'Northeastern admitted 32% in 2014 and 6% in 2023',
        4: 'Applications to all ten rose in fall 2021', 5: 'Five schools, all harder to get into than in 2014', 6: 'In fall 2023 Harvard admitted 1,965 of 56,937 applicants'}
SRCL = 'Source: NCES IPEDS Admissions, first-time undergraduate applicants. Schools with at least 10,000 applicants and an entering class of at least 1,000.'
chk('source line rests on the file', ['NCES IPEDS Admissions' in RAW['source'], 'First-time degree-seeking undergraduate applicants' in RAW['source'], 'at least 10,000 applicants and an entering class of at least 1,000' in RAW['universe']], [True, True, True])
SRCT = {'10,000', '1,000'}; YR = {str(y) for y in YEARS}; R10 = {str(i) for i in range(1, 11)}
ALLOW = {1: YR | R10 | {f'{g}%' for g in range(0, 13, 2)}, 2: {'2023'} | R10, '2-graph': {'2023'} | R10, 3: YR | {'0%', '10%', '20%', '30%'}, 4: {'2020', '2021'}, 5: {'2014', '2023'}, 6: {'2023'}, 7: {'7', '3'}}
VIS = """(() => { const L=document.querySelector('.list'); const lb=L?L.getBoundingClientRect().bottom:1e9; let out=[];
  const shown=e=>{ for(let x=e;x&&x.nodeType===1;x=x.parentElement){ const c=getComputedStyle(x); if(c.visibility==='hidden'||c.display==='none'||+c.opacity<0.05) return false;} return true; };
  const w=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT); let nd; while(nd=w.nextNode()){ const p=nd.parentElement; if(['SCRIPT','STYLE'].includes(p.tagName))continue; const r=p.getBoundingClientRect(); if(r.width===0||!shown(p))continue; if(L&&L.contains(p)&&r.top>lb-10)continue; out.push(nd.textContent);} return out.join(' | ') })()"""
TAG = """(() => { const shown=e=>{ for(let x=e;x&&x.nodeType===1;x=x.parentElement){ const c=getComputedStyle(x); if(c.visibility==='hidden'||c.display==='none'||+c.opacity<0.05) return false;} return true; };
  return [...document.querySelectorAll('[data-k]')].filter(e=>e.dataset.k && shown(e) && (!e.closest('.list') || e.closest('.row').getBoundingClientRect().top < e.closest('.list').getBoundingClientRect().bottom - 10)).map(e=>[e.dataset.k,e.textContent]) })()"""
TIPS = "[...document.querySelectorAll('.tip')].filter(t=>t.style.visibility!=='hidden'&&+t.style.opacity>.5).map(t=>[t.getBoundingClientRect().top,t.firstChild.dataset.slug,t.querySelector('.val').textContent,t.querySelector('.rank').textContent]).sort((a,b)=>a[0]-b[0])"
LIST = "[...document.querySelectorAll('.row')].map(r=>[r.getBoundingClientRect().top,r.dataset.school,...[...r.querySelectorAll('.n')].map(e=>e.textContent),r.querySelector('.val').textContent]).sort((a,b)=>a[0]-b[0]).slice(0,10).map(r=>r.slice(1))"
want_list = lambda y: [[k, commas(r(k, y)['applied']), commas(r(k, y)['admitted']), pc(r(k, y)['rate'])] for k in top(y)]
srv, base = B.serve()
try:
    with sync_playwright() as pw:
        b = pw.chromium.launch()
        for s in [1, 2, '2-graph', 3, 4, 5, 6, 7]:
            pg = B.page(b, base, s)
            if s in (1, 7): pg.evaluate('window.seek(window.FINAL)')
            tagged = pg.evaluate(TAG); allowed = set(ALLOW[s])
            for k, txt in tagged: chk(f'slide {s} {k}', txt, expect(k)); allowed |= tokens(expect(k))
            if s != 7:
                head = pg.evaluate("document.querySelector('h1').innerText.replace(/\\s+/g,' ').trim()"); chk(f'slide {s} headline', head, HEAD[s]); allowed |= tokens(head) | SRCT
                chk(f'slide {s} headline: ten words or fewer, one blue phrase', [len(head.split()) <= 10, pg.evaluate("document.querySelectorAll('h1 em').length")], [True, 1])
                chk(f'slide {s} source line', pg.evaluate("document.getElementById('src').textContent").startswith(SRCL), True)
                chk(f'slide {s} no missing marks, no mix of marks and names', pg.evaluate("[document.querySelectorAll('[data-missing]').length, document.querySelectorAll('.nm').length]"), [0, 0])
                chk(f'slide {s} nothing outside the tile', pg.evaluate("[...document.querySelectorAll('body *')].filter(e => { const c = getComputedStyle(e); if (c.visibility === 'hidden' || +c.opacity < .05 || e.closest('.list') || e.closest('svg') || e.id === 'scrub') return false; const r = e.getBoundingClientRect(); return r.width && (r.left < 0 || r.right > 1080 || r.top < 0 || r.bottom > 1350); }).length"), 0)
            vis = pg.evaluate(VIS)
            for tok in sorted(tokens(vis) - allowed): bad.append(f'slide {s}: number {tok!r} is on the slide but was not recomputed from the file')
            n += len(tokens(vis))
            if s == 1:
                got = pg.evaluate(TIPS); chk('slide 1 final frame, top to bottom', [g[1:3] for g in got], [[k, pc(r(k, 2023)['rate'])] for k in t23]); chk('slide 1 final rank circles', [g[3] for g in got], [str(i) for i in range(1, 11)])
                chk('slide 1 final year label', pg.evaluate("document.getElementById('now').textContent"), 'Fall 2023')
                ax = dict(pg.evaluate("[...document.querySelectorAll('#grid text.ax')].filter(t=>t.textContent.endsWith('%')).map(t=>[t.textContent, t.getBoundingClientRect().top])")); chk('slide 1 axis runs upside down: 0% above 12%, evenly spaced', [ax['0%'] < ax['12%'], max(abs((ax[f'{g + 2}%'] - ax[f'{g}%']) - (ax['2%'] - ax['0%'])) for g in range(0, 12, 2)) < 1], [True, True])
                chk('slide 1 says so on the axis', 'harder to get into ↑' in vis, True)
                for i, y in enumerate(YEARS):
                    pg.evaluate(f'window.scrubYear({i})'); got = pg.evaluate(TIPS)
                    chk(f'slide 1 fall {y}: the ten lowest, in order, with their rates', [g[1:3] for g in got], [[k, pc(r(k, y)['rate'])] for k in top(y)]); chk(f'slide 1 fall {y} year label', pg.evaluate("document.getElementById('now').textContent"), f'Fall {y}')
                    chk(f'slide 1 fall {y} labels do not overlap', all(b2[0] - a2[0] >= 44 for a2, b2 in zip(got, got[1:])), True)
                    pts = dict(pg.evaluate("(() => { const o={}; document.querySelectorAll('#lines polyline').forEach((l,i)=>{ const p=l.getAttribute('points').trim().split(' ').pop().split(','); o[KEYS[i]]=+p[1]; }); return Object.entries(o); })()"))
                    y0, y12 = ax['0%'] + 0, ax['12%'] + 0; a0 = pts[top(y)[0]]; a9 = pts[top(y)[9]]; chk(f'slide 1 fall {y}: line tips are in proportion', abs((a9 - a0) / (ax['12%'] - ax['0%']) * 12 - (ex(top(y)[9], y) - ex(top(y)[0], y))) < 0.02, True)
            if s == 2:
                chk('slide 2 still: fall 2023, ten rows', pg.evaluate(LIST), want_list(2023)); pg.close(); pg = B.page(b, base, 2, '?anim'); a, z, per = pg.evaluate('window.TRAVEL')
                chk('slide 1 table: headline is slide 1\'s', pg.evaluate("document.querySelector('h1').innerText.replace(/\\s+/g,' ').trim()"), HEAD[1])
                for i, y in enumerate(YEARS):
                    pg.evaluate(f'window.seek({a + i * per - 0.001 if i else 0.5})'); chk(f'slide 1 table fall {y}', pg.evaluate(LIST), want_list(y)); chk(f'slide 1 table fall {y} readout and track', [pg.evaluate("document.getElementById('fy').textContent"), pg.evaluate("[...document.querySelectorAll('#track .yr.on')].map(e=>e.textContent)")], [f'Fall {y}', [str(y)]])
                    w = dict(pg.evaluate("[...document.querySelectorAll('.row')].map(r=>[r.dataset.school, r.querySelector('.bar').getBoundingClientRect().width])")); chk(f'slide 1 table fall {y} bars in proportion', all(abs(w[k] / w[top(y)[0]] - r(k, y)['rate'] / r(top(y)[0], y)['rate']) < 0.004 for k in top(y)), True)
                extra = tokens(pg.evaluate(VIS)) - YR - R10 - SRCT - {t for row in want_list(2023) for c in row[1:] for t in tokens(c)}; chk('slide 1 table: no other numbers', extra, set())
            if s == '2-graph':
                d = pg.evaluate("[...document.querySelectorAll('.r')].map(r=>[r.getBoundingClientRect().top,r.dataset.school,r.querySelector('.val').textContent,r.querySelector('.rank').textContent,r.querySelector('.bar').getBoundingClientRect().width]).sort((a,b)=>a[0]-b[0]).map(r=>r.slice(1))")
                chk('slide 2 graph: schools, rates, ranks', [x[:3] for x in d], [[k, pc(r(k, 2023)['rate']), str(i + 1)] for i, k in enumerate(t23)]); chk('slide 2 graph: bar lengths in proportion', all(abs(x[3] / d[-1][3] - r(x[0], 2023)['rate'] / r(t23[-1], 2023)['rate']) < 0.003 for x in d), True)
            if s == 3:
                d = pg.evaluate("(() => { const ax=[...document.querySelectorAll('text.ax')].filter(t=>t.textContent.endsWith('%')).map(t=>[parseFloat(t.textContent), t.getBoundingClientRect().top + t.getBoundingClientRect().height/2]); const sq=[...document.querySelectorAll('svg rect')].map(e=>{const r=e.getBoundingClientRect(); return [r.left+r.width/2, r.top+r.height/2, r.width, r.height, r.bottom]}); const poly=document.querySelector('polygon').getAttribute('points').split(' ').map(p=>p.split(',').map(Number)); return [ax, sq, poly]; })()")
                ax = dict((int(a), y) for a, y in d[0]); per = (ax[30] - ax[0]) / 30; mk = [q for q in d[1] if abs(q[2] - 16) < 1 and abs(q[3] - 16) < 1]; bars = [q for q in d[1] if q[2] > 40]
                chk('slide 3: ten points and ten bars', [len(mk), len(bars)], [10, 10]); chk('slide 3 axis upside down', ax[0] < ax[30], True)
                y0 = mk[0][1] - ne(2014)['rate'] * per
                for i, y in enumerate(YEARS): chk(f'slide 3 point fall {y} at {ne(y)["rate"]}%', abs(mk[i][1] - (y0 + ne(y)['rate'] * per)) < 1, True); chk(f'slide 3 applicants bar fall {y}', abs(bars[i][3] / bars[-1][3] - ne(y)['applied'] / ne(2023)['applied']) < 0.01, True)
                oth = [k for k in S if k != 'northeastern']
                for i, y in enumerate(YEARS): lo = min(r(k, y)['rate'] for k in oth); hi = max(r(k, y)['rate'] for k in oth); chk(f'slide 3 band fall {y} spans the other fourteen', [abs((d[2][i][1] - 0) - (y0 + lo * per)) < 1, abs(d[2][19 - i][1] - (y0 + hi * per)) < 1], [True, True])
            if s == 4:
                d = pg.evaluate("[...document.querySelectorAll('.r')].map(r=>[r.getBoundingClientRect().top,r.dataset.school,r.querySelector('.b0').getBoundingClientRect().width,r.querySelector('.b1').getBoundingClientRect().width]).sort((a,b)=>a[0]-b[0]).map(r=>r.slice(1))")
                chk('slide 4: the ten of fall 2023, in order', [x[0] for x in d], t23); mx = max(r(k, 2021)['applied'] for k in t23); wm = max(x[2] for x in d)
                for k, w0, w1 in d: chk(f'slide 4 {k} bars', [abs(w0 / wm - r(k, 2020)['applied'] / mx) < 0.004, abs(w1 / wm - r(k, 2021)['applied'] / mx) < 0.004], [True, True])
            if s == 5:
                c = pg.evaluate('window.CHECK'); chk('slide 5: the five', [p[0] for p in c['pts']], five); sc = (c['pts'][0][2] - c['pts'][0][1]) / (ex('harvard', 2023) - ex('harvard', 2014))
                for k, ya, yb in c['pts']: chk(f'slide 5 {k} line', [abs((yb - ya) / sc - (ex(k, 2023) - ex(k, 2014))) < 0.01, abs((ya - c['pts'][0][1]) / sc - (ex(k, 2014) - ex('harvard', 2014))) < 0.01], [True, True])
                chk('slide 5 lower rate is higher up', sc > 0, True); chk('slide 5 says so on the axis', 'harder to get into ↑' in vis, True)
            if s == 6:
                d = pg.evaluate("[...document.querySelectorAll('.r')].map(r=>[r.getBoundingClientRect().top,r.dataset.school,r.querySelector('.sq').getBoundingClientRect().width,r.querySelector('.in').getBoundingClientRect().width]).sort((a,b)=>a[0]-b[0]).map(r=>r.slice(1))")
                chk('slide 6: the five lowest, in order', [x[0] for x in d], t23[:5]); mx = max(r(k, 2023)['applied'] for k in t23[:5]); sm = max(x[1] for x in d)
                for k, a, i in d: chk(f'slide 6 {k}: areas in proportion', [abs((a / sm) ** 2 - r(k, 2023)['applied'] / mx) < 0.004, abs((i / a) ** 2 - r(k, 2023)['admitted'] / r(k, 2023)['applied']) < 0.002], [True, True])
            if s == 7:
                chk('slide 7 line', pg.evaluate("document.querySelector('.line').innerText.replace(/\\s+/g,' ').trim()"), 'Leland MBA customers are admitted to M7 programs at 3x the national average.')
                chk('slide 7 is the shared black end slide', pg.evaluate("[getComputedStyle(document.body).backgroundColor, getComputedStyle(document.querySelector('.line em')).color]"), ['rgb(15, 15, 16)', 'rgb(137, 171, 232)'])
            pg.close()
        b.close()
finally: srv.terminate()
# narration
html = open(os.path.join(B.OUT, 'index.html')).read(); lines = json.loads(html.split('/*NARRATION-START*/')[1].split('/*NARRATION-END*/')[0]); h = lambda k, y, f: commas(r(k, y)[f]); rt = lambda k, y: f"{r(k, y)['rate']:.2f}"
NARR = {1: {'2014', '2023', rt(t23[0], 2023)}, 2: {'2023'} | {rt(k, 2023) for k in t23[:3]}, 3: {'2014', '2023', rt('northeastern', 2014), rt('northeastern', 2023), h('northeastern', 2014, 'applied'), h('northeastern', 2023, 'applied')},
        4: {'2021', h('harvard', 2020, 'applied'), h('harvard', 2021, 'applied'), h('columbia', 2020, 'applied'), h('columbia', 2021, 'applied')}, 5: {'2014', '2023', rt('harvard', 2014), rt('harvard', 2023), rt('stanford', 2014), rt('stanford', 2023)},
        6: {'2023', h('harvard', 2023, 'applied'), h('harvard', 2023, 'admitted'), h('stanford', 2023, 'applied'), h('stanford', 2023, 'admitted')}, 7: {'7', '3'}}
chk('narration has seven lines', len(lines), 7); chk('narration.txt is a copy', all(l in open(os.path.join(B.OUT, 'narration.txt')).read() for l in lines), True)
for i, l in enumerate(lines, 1):
    for tok in sorted(tokens(l) - NARR[i]): bad.append(f'narration {i}: number {tok!r} was not recomputed from the file')
    n += len(tokens(l)); chk(f'narration {i} under 30 words', len(l.split()) <= 30, True)
chk('narration 1: Harvard is lowest in fall 2023', [t23[0], 'Harvard ends lowest' in lines[0]], ['harvard', True]); chk('narration 2: order', t23[:3], ['harvard', 'stanford', 'columbia'])
chk('narration 7 is the on-screen line', lines[6], 'Leland MBA customers are admitted to M7 programs at 3x the national average.')
print(f'{n} checks, {len(bad)} mismatches'); [print('  MISMATCH', x) for x in bad[:40]]; sys.exit(1 if bad else 0)
