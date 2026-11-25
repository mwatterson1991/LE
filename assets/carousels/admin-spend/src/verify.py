#!/usr/bin/env python3
"""Recompute every number shown on the slides from data/lists/ipeds-admin-spend.json (independently of the slide code) and diff it against the rendered pages.
Checks: (1) every element tagged data-k shows the expected string; (2) every digit-bearing token of visible text on each slide is in that slide's allowed set;
(3) slide 1 at each settled year shows that year's top ten in order with the file's values. Exit code 1 on any mismatch."""
import json, os, re, sys, importlib.util
from playwright.sync_api import sync_playwright
SRC = os.path.dirname(os.path.abspath(__file__))
spec = importlib.util.spec_from_file_location('build', os.path.join(SRC, 'build.py')); B = importlib.util.module_from_spec(spec); spec.loader.exec_module(B)
S = json.load(open(os.path.join(B.REPO, 'data/lists/ipeds-admin-spend.json')))['schools']
usd = lambda v: '${:,}'.format(int(v + 0.5))
def money(v): return '${:.2f} billion'.format(v / 1e9) if v >= 1e9 else '${} million'.format(int(v / 1e6 + 0.5))
def top(y, n=10): return sorted(S, key=lambda k: -S[k]['years'][str(y)]['per_student'])[:n]
def expect(key):
    p = key.split('.'); r = S[p[0]]['years'][p[1]]
    if p[2] == 'per_student':
        assert round(r['inst_support'] / r['fte']) == r['per_student'], key   # the file's own per_student agrees with its parts
        return usd(r['per_student'])
    if p[2] == 'ss_per_fte': return usd(r['student_services'] / r['fte'])
    if p[3] == 'money': return money(r[p[2]])
    if p[3] == 'share1': return '{:.1f}%'.format(100 * r[p[2]] / r['total_expenses'])
    raise KeyError(key)
bad = []; n = 0
def chk(what, got, want):
    global n; n += 1
    if got != want: bad.append(f'{what}: shown {got!r}, file gives {want!r}')
tokens = lambda s: set(re.findall(r'\$?\d[\d,.]*\d%?|\$?\d%?', s))
st = S['stanford']['years']['2024']; mit = S['mit']['years']
# headline facts, recomputed
H = {2: {'11%': '{:.0f}%'.format(100 * st['inst_support'] / st['total_expenses']), '$8.4': '${:.1f}'.format(st['total_expenses'] / 1e9)},
     3: {'54%': '{:.0f}%'.format(100 * (1 - mit['2024']['per_student'] / max(v['per_student'] for v in mit.values())))}}
peak = max(mit, key=lambda y: mit[y]['per_student']); chk('slide 3 peak year', peak, '2021'); chk('slide 3 "three years"', 2024 - int(peak), 3)
chk('slide 4 Rochester FY2023 rank', top(2023).index('rochester') + 1, 8); chk('slide 4 Rochester FY2024 rank', top(2024).index('rochester') + 1, 3)
t5 = top(2024, 5); chk('slide 5 admin > student services at all five', all(S[k]['years']['2024']['per_student'] > S[k]['years']['2024']['student_services'] / S[k]['years']['2024']['fte'] for k in t5), True)
fn = ['instruction', 'research', 'public_service', 'academic_support', 'student_services', 'inst_support', 'auxiliary', 'hospital', 'independent_ops', 'net_grant_aid']
chk('slide 2 functions sum to total (within $1,000)', abs(sum(st[f] or 0 for f in fn) - st['total_expenses']) < 1000, True)
ALLOW = {1: {'2017', '2024'}, 2: {'2024'}, 3: {'2011', '2016', '2021', '2024', '$0', '$20,000', '$40,000', '$60,000'}, 4: {'2023', '2024'} | {str(i) for i in range(1, 11)}, 5: {'2024'}, 6: {'7', '3'}}
srv, base = B.serve()
try:
    with sync_playwright() as pw:
        b = pw.chromium.launch()
        for s in range(1, 7):
            pg = B.page(b, base, s)
            if s in (1, 6): pg.evaluate('window.seek(window.FINAL)')
            tagged = pg.evaluate("[...document.querySelectorAll('[data-k]')].filter(e=>e.dataset.k && e.getBoundingClientRect().top < 1350 && (!e.closest('.list') || e.closest('.row').getBoundingClientRect().top < e.closest('.list').getBoundingClientRect().bottom - 10)).map(e=>[e.dataset.k,e.textContent])")
            allowed = set(ALLOW[s])
            for k, txt in tagged: chk(f'slide {s} {k}', txt, expect(k)); allowed |= tokens(expect(k))
            head = pg.evaluate("(document.querySelector('h1')||document.querySelector('.line')).innerText.replace(/\\s+/g,' ')")
            for tok, want in H.get(s, {}).items(): chk(f'slide {s} headline {tok}', tok if tok in head else None, want); allowed.add(tok)
            if s == 1: allowed |= {str(i) for i in range(1, 11)}
            # visible text only (rows waiting below the list are clipped and excluded)
            vis = pg.evaluate("""(() => { const L=document.querySelector('.list'); const lb=L?L.getBoundingClientRect().bottom:1e9; let out=[];
              const w=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT); let nd; while(nd=w.nextNode()){ const p=nd.parentElement; if(['SCRIPT','STYLE'].includes(p.tagName))continue; const r=p.getBoundingClientRect(); if(r.width===0)continue; if(L&&L.contains(p)&&r.top>lb-10)continue; out.push(nd.textContent);} return out.join(' | ') })()""")
            for tok in sorted(tokens(vis) - allowed): bad.append(f'slide {s}: number {tok!r} is on the slide but was not recomputed from the file')
            n += len(tokens(vis))
            if s == 1:   # every settled year of the animation
                a, z, per = pg.evaluate('window.TRAVEL')
                for i, y in enumerate(range(2017, 2025)):
                    pg.evaluate(f'window.seek({a + i * per - 0.001 if i else 0.5})')
                    rows = pg.evaluate("[...document.querySelectorAll('.row')].map(r=>[r.getBoundingClientRect().top,r.querySelector('.name').textContent,r.querySelector('.val').textContent]).sort((a,b)=>a[0]-b[0]).slice(0,10).map(r=>r.slice(1))")
                    want = [[S[k]['name'], usd(S[k]['years'][str(y)]['per_student'])] for k in top(y)]
                    chk(f'slide 1 FY{y} top ten', rows, want); chk(f'slide 1 FY{y} readout', pg.evaluate("document.getElementById('fy').textContent"), f'FY {y}')
            if s == 4:
                c = pg.evaluate('window.CHECK'); chk('slide 4 FY2023 order', c['A'], top(2023)); chk('slide 4 FY2024 order', c['B'], top(2024))
            if s == 5: chk('slide 5 schools', sorted({k.split('.')[0] for k, _ in tagged}), sorted(t5))
            if s == 6: chk('slide 6 line', head, 'Leland MBA customers are admitted to M7 programs at 3x the national average.')
            pg.close()
        b.close()
finally: srv.terminate()
print(f'{n} checks, {len(bad)} mismatches'); [print('  MISMATCH', x) for x in bad]; sys.exit(1 if bad else 0)
