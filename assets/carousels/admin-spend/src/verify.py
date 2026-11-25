#!/usr/bin/env python3
"""Recompute every number shown on the slides from data/lists/ipeds-admin-spend.json (independently of the slide code) and diff it against the rendered pages.
Checks: (1) data.js is an exact copy of the file; (2) every element tagged data-k shows the expected string; (3) every digit-bearing token of visible text
on each slide is in that slide's allowed set; (4) the chart (slide 1) at each fiscal year and the list (slide 2, and its animation) show that year's
top ten with the file's values; (5) every number in the narration lines. Exit code 1 on any mismatch."""
import json, os, re, sys, importlib.util
from playwright.sync_api import sync_playwright
SRC = os.path.dirname(os.path.abspath(__file__))
spec = importlib.util.spec_from_file_location('build', os.path.join(SRC, 'build.py')); B = importlib.util.module_from_spec(spec); spec.loader.exec_module(B)
RAW = json.load(open(os.path.join(B.REPO, 'data/lists/ipeds-admin-spend.json'))); S = RAW['schools']
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
st = S['stanford']['years']['2024']; mit = S['mit']['years']; ro = S['rochester']['years']; ha = S['harvard']['years']['2024']
# (1) data.js
js = open(os.path.join(SRC, 'data.js')).read(); chk('data.js is a copy of the file', json.loads(js.split('window.IPEDS = ')[1].split(';\nwindow.LELAND_LOGO_SVG')[0]) == RAW, True)
# headline facts, recomputed
H = {3: {'11%': '{:.0f}%'.format(100 * st['inst_support'] / st['total_expenses']), '$8.4': '${:.1f}'.format(st['total_expenses'] / 1e9)},
     4: {'54%': '{:.0f}%'.format(100 * (1 - mit['2024']['per_student'] / max(v['per_student'] for v in mit.values())))}}
peak = max(mit, key=lambda y: mit[y]['per_student']); chk('slide 4 peak year', peak, '2021'); chk('slide 4 "three years"', 2024 - int(peak), 3)
chk('slide 5 Rochester FY2023 rank', top(2023).index('rochester') + 1, 8); chk('slide 5 Rochester FY2024 rank', top(2024).index('rochester') + 1, 3)
t5 = top(2024, 5); chk('slide 6 admin > student services at all five', all(S[k]['years']['2024']['per_student'] > S[k]['years']['2024']['student_services'] / S[k]['years']['2024']['fte'] for k in t5), True)
fn = ['instruction', 'research', 'public_service', 'academic_support', 'student_services', 'inst_support', 'auxiliary', 'hospital', 'independent_ops', 'net_grant_aid']
chk('slide 3 functions sum to total (within $1,000)', abs(sum(st[f] or 0 for f in fn) - st['total_expenses']) < 1000, True)
# (5) narration: every number spoken, recomputed. Plain numbers only (the lines say "dollars" and "percent" in words).
plain = lambda v: '{:,}'.format(int(v + 0.5)); t24 = top(2024)
NARR = {1: {'2017', '2024', plain(S[t24[0]]['years']['2024']['per_student'])},
        2: {'2024'} | {plain(S[k]['years']['2024']['per_student']) for k in t24[:3]},
        3: {'2024', '{:.1f}'.format(st['total_expenses'] / 1e9), str(int(st['inst_support'] / 1e6 + .5)), '{:.0f}'.format(100 * st['inst_support'] / st['total_expenses'])},
        4: {peak, plain(mit[peak]['per_student']), plain(mit['2024']['per_student']), H[4]['54%'].rstrip('%')},
        5: {'2023', '2024', plain(ro['2023']['per_student']), plain(ro['2024']['per_student'])},
        6: {plain(ha['per_student']), plain(ha['student_services'] / ha['fte'])}, 7: {'7', '3'}}
html = open(os.path.join(B.OUT, 'index.html')).read(); lines = json.loads(html.split('/*NARRATION-START*/')[1].split('/*NARRATION-END*/')[0])
chk('narration has seven lines', len(lines), 7)
for i, l in enumerate(lines, 1):
    for tok in sorted(tokens(l) - NARR[i]): bad.append(f'narration {i}: number {tok!r} was not recomputed from the file')
    n += len(tokens(l)); chk(f'narration {i} under 30 words', len(l.split()) <= 30, True)
chk('narration 1 names the FY2024 leader', S[t24[0]]['name'].split()[0] in lines[0], True)
chk('narration 2 order', [S[k]['name'].replace('University of ', '').split()[0] for k in t24[:3]], [w for w in re.findall(r'[A-Z][a-z]+', lines[1]) if w not in ('In',)][:3])
chk('narration 7 is the on-screen line', lines[6], 'Leland MBA customers are admitted to M7 programs at 3x the national average.')
AX = {'$0', '$20,000', '$40,000', '$60,000'}; R10 = {str(i) for i in range(1, 11)}
ALLOW = {1: {str(y) for y in range(2017, 2025)} | AX | R10, 2: {'2024'} | R10, 3: {'2024'}, 4: {'2011', '2016', '2021', '2024'} | AX, 5: {'2023', '2024'} | R10, 6: {'2024'}, 7: {'7', '3'}}
VIS = """(() => { const L=document.querySelector('.list'); const lb=L?L.getBoundingClientRect().bottom:1e9; let out=[];
  const shown=e=>{ for(let x=e;x&&x.nodeType===1;x=x.parentElement){ const c=getComputedStyle(x); if(c.visibility==='hidden'||c.display==='none'||+c.opacity<0.05) return false;} return true; };
  const w=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT); let nd; while(nd=w.nextNode()){ const p=nd.parentElement; if(['SCRIPT','STYLE'].includes(p.tagName))continue; const r=p.getBoundingClientRect(); if(r.width===0||!shown(p))continue; if(L&&L.contains(p)&&r.top>lb-10)continue; out.push(nd.textContent);} return out.join(' | ') })()"""
TAG = """(() => { const shown=e=>{ for(let x=e;x&&x.nodeType===1;x=x.parentElement){ const c=getComputedStyle(x); if(c.visibility==='hidden'||c.display==='none'||+c.opacity<0.05) return false;} return true; };
  return [...document.querySelectorAll('[data-k]')].filter(e=>e.dataset.k && shown(e) && (!e.closest('.list') || e.closest('.row').getBoundingClientRect().top < e.closest('.list').getBoundingClientRect().bottom - 10)).map(e=>[e.dataset.k,e.textContent]) })()"""
srv, base = B.serve()
try:
    with sync_playwright() as pw:
        b = pw.chromium.launch()
        for s in range(1, 8):
            pg = B.page(b, base, s)
            if s in (1, 7): pg.evaluate('window.seek(window.FINAL)')
            tagged = pg.evaluate(TAG); allowed = set(ALLOW[s])
            for k, txt in tagged: chk(f'slide {s} {k}', txt, expect(k)); allowed |= tokens(expect(k))
            head = pg.evaluate("(document.querySelector('h1')||document.querySelector('.line')).innerText.replace(/\\s+/g,' ')")
            for tok, want in H.get(s, {}).items(): chk(f'slide {s} headline {tok}', tok if tok in head else None, want); allowed.add(tok)
            vis = pg.evaluate(VIS)
            for tok in sorted(tokens(vis) - allowed): bad.append(f'slide {s}: number {tok!r} is on the slide but was not recomputed from the file')
            n += len(tokens(vis))
            if s == 1:   # the chart: final frame, then every fiscal year
                want = [[k, usd(S[k]['years']['2024']['per_student'])] for k in top(2024)]
                got = pg.evaluate("[...document.querySelectorAll('.tip')].filter(t=>t.style.visibility!=='hidden'&&+t.style.opacity>.5).map(t=>[t.getBoundingClientRect().top,t.querySelector('.logo').dataset.slug,t.querySelector('.val').textContent,t.querySelector('.rank').textContent]).sort((a,b)=>a[0]-b[0]).map(r=>r.slice(1))")
                chk('slide 1 final frame, top to bottom', [g[:2] for g in got], want); chk('slide 1 final rank circles', [g[2] for g in got], [str(i) for i in range(1, 11)])
                chk('slide 1 final year label', pg.evaluate("document.getElementById('now').textContent"), 'FY 2024')
                for i, y in enumerate(range(2017, 2025)):
                    pg.evaluate(f'window.scrubYear({i})')
                    got = pg.evaluate("[...document.querySelectorAll('.tip')].filter(t=>t.style.visibility!=='hidden'&&+t.style.opacity>.5).map(t=>[t.querySelector('.logo').dataset.slug,t.querySelector('.val').textContent]).sort()")
                    chk(f'slide 1 FY{y} schools and figures', got, sorted([k, usd(S[k]['years'][str(y)]['per_student'])] for k in top(y)))
                    chk(f'slide 1 FY{y} year label', pg.evaluate("document.getElementById('now').textContent"), f'FY {y}')
                    tops = pg.evaluate("[...document.querySelectorAll('.tip')].filter(t=>t.style.visibility!=='hidden'&&+t.style.opacity>.5).map(t=>t.getBoundingClientRect().top).sort((a,b)=>a-b)")
                    chk(f'slide 1 FY{y} labels do not overlap', all(b2 - a2 >= 44 for a2, b2 in zip(tops, tops[1:])), True)
            if s == 2:   # the list: the still, then every settled year of its animation (slide-1-list.mp4)
                rowsjs = "[...document.querySelectorAll('.row')].map(r=>[r.getBoundingClientRect().top,r.querySelector('.name').textContent,r.querySelector('.val').textContent]).sort((a,b)=>a[0]-b[0]).slice(0,10).map(r=>r.slice(1))"
                chk('slide 2 still', pg.evaluate(rowsjs), [[S[k]['name'], usd(S[k]['years']['2024']['per_student'])] for k in top(2024)])
                a, z, per = pg.evaluate('window.TRAVEL')
                for i, y in enumerate(range(2017, 2025)):
                    pg.evaluate(f'window.seek({a + i * per - 0.001 if i else 0.5})')
                    chk(f'list animation FY{y} top ten', pg.evaluate(rowsjs), [[S[k]['name'], usd(S[k]['years'][str(y)]['per_student'])] for k in top(y)])
                    chk(f'list animation FY{y} readout', pg.evaluate("document.getElementById('fy').textContent"), f'FY {y}')
            if s == 5:
                c = pg.evaluate('window.CHECK'); chk('slide 5 FY2023 order', c['A'], top(2023)); chk('slide 5 FY2024 order', c['B'], top(2024))
            if s == 6: chk('slide 6 schools', sorted({k.split('.')[0] for k, _ in tagged}), sorted(t5))
            if s == 7: chk('slide 7 line', head, 'Leland MBA customers are admitted to M7 programs at 3x the national average.')
            pg.close()
        b.close()
finally: srv.terminate()
print(f'{n} checks, {len(bad)} mismatches'); [print('  MISMATCH', x) for x in bad]; sys.exit(1 if bad else 0)
