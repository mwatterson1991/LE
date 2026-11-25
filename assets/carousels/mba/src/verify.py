#!/usr/bin/env python3
"""Checks every number on the slides and in the narration against the research file.
(1) facts.json is re-derived from docs/research/viral-mba.md: the tables there are parsed here, independently, and compared cell by cell;
(2) data.js is an exact copy of facts.json; (3) every element tagged data-k on a slide shows the string recomputed here from facts.json;
(4) every digit-bearing token of visible text on each slide is in that slide's allowed set; (5) positions: order of rows, bar lengths, points on the axes;
(6) figures the file asks to confirm (Booth's test score and years, MIT's essay count, any interview rate) are not on the slides;
(7) every number in the narration; (8) each data slide's source line; (9) headlines. Exit code 1 on any mismatch."""
import json, os, re, sys, importlib.util
from playwright.sync_api import sync_playwright
SRC = os.path.dirname(os.path.abspath(__file__))
spec = importlib.util.spec_from_file_location('build', os.path.join(SRC, 'build.py')); B = importlib.util.module_from_spec(spec); spec.loader.exec_module(B)
F = json.load(open(os.path.join(SRC, 'facts.json'))); S = F['schools']; ORDER = F['order']
MD = open(os.path.join(B.REPO, 'docs/research/viral-mba.md')).read()
bad = []; n = 0
def chk(what, got, want):
    global n; n += 1
    if got != want: bad.append(f'{what}: got {got!r}, expected {want!r}')
tokens = lambda s: set(re.findall(r'\$?\d[\d,.]*\d%?|\$?\d%?', s))
num = lambda s: int(s.replace(',', ''))

# ---------- (1) the research file, parsed independently ----------
def table(after):
    rows = []; body = MD.split(after, 1)[1]
    for line in body.split('\n'):
        if line.startswith('|'): rows.append([c.strip() for c in line.strip().strip('|').split('|')])
        elif rows and len(rows) > 2: break
    return rows[2:]
LABEL = {'harvard': 'Harvard', 'stanford': 'Stanford', 'wharton': 'Wharton', 'kellogg': 'Kellogg', 'booth': 'Booth', 'columbia': 'Columbia', 'mit': 'MIT Sloan'}
def row(rows, k): return next(r for r in rows if LABEL[k] in r[0])
STAT = {'median': 'median', 'avg': 'average'}
prof = table('### Class profile'); adm = table('### Acceptance rate'); req = table('### Application requirements')
chk('file: seven schools in each table', [len(prof), len(adm), len(req)], [7, 7, 7])
for k in ORDER:
    s = S[k]; p = row(prof, k); a = row(adm, k); r = row(req, k)
    chk(f'{k} class year', re.search(r'20\d\d\)?$', p[1]).group(0).rstrip(')'), s['class'])
    m = re.match(r'(median|avg) (\d+)(?: \((mid-80%: )?(\d+)–(\d+)\))?', p[4]); g = s['gmat_focus']
    chk(f'{k} GMAT Focus', [STAT[m.group(1)], int(m.group(2))], [g['stat'], g['value']])
    chk(f'{k} GMAT Focus middle 80%', [int(m.group(4)), int(m.group(5))] if m.group(3) else None, g.get('mid80'))
    m = re.match(r'(median|avg) ([\d.]+)(?: \(range ([\d.]+)–([\d.]+)\))?', p[7]); g = s['gpa']
    chk(f'{k} GPA', [STAT[m.group(1)], m.group(2)], [g['stat'], g['value']]); chk(f'{k} GPA range', [m.group(3), m.group(4)] if m.group(3) else None, g.get('range'))
    m = re.match(r'(median|avg) ([\d.]+) yrs(?: \(mid-80%: (\d+)–(\d+)\))?', p[8]); g = s['work']
    chk(f'{k} work experience', [STAT[m.group(1)], m.group(2)], [g['stat'], g['value']]); chk(f'{k} work middle 80%', [int(m.group(3)), int(m.group(4))] if m.group(3) else None, g.get('mid80'))
    via = 'Clear Admit' if p[11].startswith('Clear Admit') else 'school'; chk(f'{k} profile source type', via, s['via'])
    chk(f'{k} Class of 2027 applications, rate, enrolled', [num(a[1]), a[2].rstrip('%'), num(a[3])], [s['admit']['applications'], s['admit']['rate'], s['admit']['enrolled']])
    m = re.match(r'(\d)(?:, plus| \(was (\d))?', r[2]); chk(f'{k} recommendations', [int(m.group(1)), int(m.group(2)) if m.group(2) else None], [s['recs']['count'], s['recs'].get('was')])
    e = s['essays']
    if e is None: chk(f'{k} essays: no count in the file', re.match(r'\d', r[1]), None)
    else:
        chk(f'{k} essay count', int(re.match(r'(\d)', r[1]).group(1)), e['count'])
        if 'words' in e: chk(f'{k} essay words', [int(x) for x in re.findall(r'\d+', r[1].split('(')[1].split(')')[0])], e['words'])
        if 'chars_each' in e: chk(f'{k} characters each', int(re.search(r'\((\d+) characters each\)', r[1]).group(1)), e['chars_each'])
        m = re.search(r'\+ (\d) ([a-z ]+)$', r[1]); chk(f'{k} essays, the extra pieces', [int(m.group(1)), m.group(2)] if m else None, [e['plus']['count'], e['plus']['unit']] if 'plus' in e else None)
chk('file: GMAT Focus scale', [int(x) for x in re.search(r'scale (\d+)–(\d+)\)', MD).groups()], F['gmat_focus_scale'])
chk('file: share of Harvard class sending a GRE', int(re.search(r"About half of HBS's class sent a GRE \((\d+)%\)", MD).group(1)), S['harvard']['gre_share'])
chk('file: acceptance source', 'Poets&Quants using U.S. News data' in MD and 'Class of 2027, entered autumn 2025' in MD, True)
chk('file: requirements sources', 'gradpilot.com' in MD and '(checked 24 Sep 2026)' in MD and '## Part 2' in MD and 'Application requirements, 2026–27 cycle' in MD, True)
chk('file: flags Booth test and years', "Booth's page text was ambiguous" in MD and '"6 years" is up from 5' in MD, True); chk("file: flags MIT Sloan's pieces", "Sources disagree on MIT Sloan's exact pieces" in MD, True)
chk('holds', sorted(F['hold']), ['booth.gmat_focus', 'booth.work', 'mit.essays'])
chk('file: three schools cut recommendations to one', sorted(k for k in ORDER if S[k]['recs'].get('was') == 2 and S[k]['recs']['count'] == 1), ['booth', 'columbia', 'wharton'])

# ---------- (2) data.js ----------
chk('data.js is a copy of facts.json', json.loads(open(os.path.join(SRC, 'data.js')).read().split('window.FACTS = ')[1].rsplit(';', 1)[0]) == F, True)

# ---------- (3) expected strings, recomputed ----------
def expect(key):
    p = key.split('.')
    if p[0] == 'gmat_focus': return p[1] if any(S[k]['gmat_focus']['value'] == int(p[1]) for k in ORDER) else None
    if p[0] == 'recs': return '2'
    s = S[p[0]]; f = '.'.join(p[1:])
    if f == 'gmat_focus': return str(s['gmat_focus']['value'])
    if f == 'gmat_focus.mid80': return '–'.join(map(str, s['gmat_focus']['mid80']))
    if f == 'gre_share': return f"{s['gre_share']}%"
    if f == 'gpa': return s['gpa']['value']
    if f == 'gpa.range': return '–'.join(s['gpa']['range'])
    if f == 'work': return s['work']['value']
    if f == 'work.mid80': return '–'.join(map(str, s['work']['mid80']))
    if f == 'essays': return str(s['essays']['count'])
    if f == 'essays.words': w = s['essays']['words']; return ' and '.join(map(str, w)) if len(w) == 2 else ', '.join(map(str, w))
    if f == 'essays.chars': return str(s['essays']['chars_each'])
    if f == 'essays.plus': return str(s['essays']['plus']['count'])
    if f == 'recs': return str(s['recs']['count'])
    if f == 'admit.applications': return '{:,}'.format(s['admit']['applications'])
    if f == 'admit.enrolled': return '{:,}'.format(s['admit']['enrolled'])
    if f == 'admit.rate': return s['admit']['rate'] + '%'
    raise KeyError(key)
SRCTOK = {'p': {'2028', '2027'}, 'a': {'2027', '2025'}, 'r': {'24', '2026', '2026–27', '27'}}
AXIS = {2: {'680'}, 3: {'3.5', '3.6', '3.7', '3.8', '3.9'}, 4: {'0', '2', '4', '6', '8'}}
def allow(s, shown):
    a = set(AXIS.get(s, set()))
    if s in (2, 3, 4): a |= SRCTOK['p']
    if s == 2: a |= {'205', '805', '80%'}
    if s == 4: a |= {'80%'}
    if s == 5: a |= SRCTOK['r']
    if s == 6: a |= SRCTOK['a'] | {str(i) for i in range(1, 8)}
    return a
gm = lambda held: [k for k in ORDER if not (held and k == 'booth')]
by_gpa = sorted(ORDER, key=lambda k: (-float(S[k]['gpa']['value']), ORDER.index(k)))
by_rate = sorted(ORDER, key=lambda k: float(S[k]['admit']['rate']))
def by_work(held): return sorted(gm(held), key=lambda k: (-float(S[k]['work']['value']), ORDER.index(k)))
WANT = {2: lambda h: {f'{k}' for k in gm(h)}, 3: lambda h: set(ORDER), 4: lambda h: set(gm(h)), 5: lambda h: set(ORDER), 6: lambda h: set(ORDER)}
HEAD = {1: 'What does it take to get an MBA?'}
VIS = """(() => { let out=[]; const shown=e=>{ for(let x=e;x&&x.nodeType===1;x=x.parentElement){ const c=getComputedStyle(x); if(c.visibility==='hidden'||c.display==='none'||+c.opacity<0.05) return false;} return true; };
  const w=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT); let nd; while(nd=w.nextNode()){ const p=nd.parentElement; if(['SCRIPT','STYLE'].includes(p.tagName))continue; const r=p.getBoundingClientRect(); if(r.width===0||!shown(p))continue; out.push(nd.textContent);} return out.join(' | ') })()"""
TAG = "[...document.querySelectorAll('[data-k]')].filter(e => !e.dataset.k.startsWith('axis')).map(e => [e.dataset.k, e.textContent])"
ROWS = "[...document.querySelectorAll('[data-school]')].filter(e => e.classList.contains('row') || e.classList.contains('unit')).map(e => [e.getBoundingClientRect().top, e.dataset.school]).sort((a, b) => a[0] - b[0]).map(r => r[1])"
srv, base = B.serve()
try:
    with sync_playwright() as pw:
        b = pw.chromium.launch()
        for s, q in [(1, ''), (2, ''), (3, ''), (4, ''), (5, ''), (6, ''), (2, '?all'), (4, '?all')]:
            held = q == ''; tag = f'slide {s}{" (alt, with Booth)" if q else ""}'
            pg = B.page(b, base, s, q)
            if s == 1: pg.evaluate('window.seek(window.FINAL)')
            head = pg.evaluate("(document.querySelector('h1')||document.querySelector('.q')).innerText.replace(/\\s+/g,' ').trim()")
            chk(f'{tag} headline is ten words or fewer', len(head.split()) <= 10, True); chk(f'{tag} one blue phrase', pg.evaluate("document.querySelectorAll('h1 em, .q em').length"), 1)
            if s in HEAD: chk(f'{tag} line is verbatim', head, HEAD[s])
            tagged = pg.evaluate(TAG); allowed = allow(s, tagged) | tokens(head)
            for k, txt in tagged: chk(f'{tag} {k}', txt, expect(k)); allowed |= tokens(expect(k) or '')
            vis = pg.evaluate(VIS)
            for tok in sorted(tokens(vis) - allowed): bad.append(f'{tag}: number {tok!r} is on the slide but was not recomputed from the file')
            n += len(tokens(vis))
            chk(f'{tag} no missing logomarks', pg.evaluate("document.querySelectorAll('[data-missing]').length"), 0)
            chk(f'{tag} nothing outside the tile', pg.evaluate("[...document.querySelectorAll('body *')].filter(e => { const r = e.getBoundingClientRect(); return r.width && (r.left < 0 || r.right > 1080 || r.top < 0 || r.bottom > 1350); }).length"), 0)
            chk(f'{tag} no interview figure', 'interview' in vis.lower(), False)
            if s == 1:
                chk('slide 1 marks, left to right', pg.evaluate("[...document.querySelectorAll('.marks .logo')].sort((a,b)=>a.getBoundingClientRect().left-b.getBoundingClientRect().left).map(e=>e.dataset.slug)"), [S[k]['logo'] for k in ORDER])
                d = pg.evaluate('window.DURATION'); chk('slide 1 loop is 6 to 8 seconds', 6 <= d <= 8, True)
                chk('slide 1 loop starts and ends on an empty tile', pg.evaluate("[0, window.DURATION - 0.001].map(t => { window.seek(t); return [...document.querySelectorAll('.mw, .marks .logo')].every(e => +e.style.opacity < 0.02); })"), [True, True])
                pg.close(); continue
            src = pg.evaluate("document.getElementById('src').textContent")
            schools = pg.evaluate(ROWS); chk(f'{tag} schools shown', set(schools), WANT[s](held))
            if s in (2, 3, 4):
                chk(f'{tag} source line', src.startswith('Source: school class profiles, Class of 2028 (Columbia: Class of 2027). Wharton and MIT Sloan as reported by Clear Admit.'), True)
                chk(f'{tag} source line names the profiles taken from Clear Admit', sorted(k for k in ORDER if S[k]['via'] == 'Clear Admit'), ['mit', 'wharton']); chk(f'{tag} Columbia is the one Class of 2027 profile', [k for k in ORDER if S[k]['class'] == '2027'], ['columbia'])
            if s in (2, 4): chk(f'{tag} says Booth is not shown', 'Chicago Booth is not shown.' in src, held); chk(f'{tag} Booth on the slide', 'Chicago Booth' in vis.replace(src, ''), not held)
            if s == 2:
                u = pg.evaluate("[...document.querySelectorAll('.unit')].map(e => { const r = e.getBoundingClientRect(); return [e.dataset.school, r.left + r.width / 2, e.querySelector('.sub').textContent, r.top, r.bottom]; })")
                tick = dict(pg.evaluate("[...document.querySelectorAll('.score, .minor')].map(e => { const r = e.getBoundingClientRect(); return [e.textContent, r.left + r.width / 2]; })"))
                for k, x, stat, t, bt in u:
                    chk(f'{tag} {k} sits over its score', abs(x - tick[str(S[k]['gmat_focus']['value'])]) < 1, True); chk(f'{tag} {k} is labelled {S[k]["gmat_focus"]["stat"]}', stat, S[k]['gmat_focus']['stat'])
                xs = [tick[str(v)] for v in (675, 680, 685, 690, 695)]; chk(f'{tag} axis is evenly spaced', max(abs((b2 - a2) - (xs[1] - xs[0])) for a2, b2 in zip(xs, xs[1:])) < 0.5, True)
                chk(f'{tag} stacked schools do not overlap', all(not (a[0] != c[0] and abs(a[1] - c[1]) < 1 and a[3] < c[4] and c[3] < a[4]) for a in u for c in u), True)
                chk(f'{tag} scale in the source line', 'GMAT Focus scale: 205–805.' in src, True)
            if s == 3:
                chk('slide 3 order, highest first', schools, by_gpa)
                d = pg.evaluate("(() => { const t = [...document.querySelectorAll('.tick')].map(e => { const r = e.getBoundingClientRect(); return [+e.textContent, r.left + r.width / 2]; }); return [t, [...document.querySelectorAll('.row')].map(r => { const b = r.querySelector('.dot').getBoundingClientRect(); return [r.dataset.school, b.left + b.width / 2, r.querySelector('.sub').textContent.split(',')[0]]; })]; })()")
                (v0, x0), (v1, x1) = d[0][0], d[0][-1]
                for k, x, stat in d[1]: chk(f'slide 3 {k} point is at {S[k]["gpa"]["value"]}', abs(x - (x0 + (float(S[k]['gpa']['value']) - v0) / (v1 - v0) * (x1 - x0))) < 1, True); chk(f'slide 3 {k} is labelled {S[k]["gpa"]["stat"]}', stat, S[k]['gpa']['stat'])
            if s == 4:
                chk(f'{tag} order, highest first', schools, by_work(held)); chk(f'{tag} every figure is an average', {S[k]['work']['stat'] for k in ORDER}, {'average'})
                d = pg.evaluate("(() => { const t = [...document.querySelectorAll('.tick')].map(e => { const r = e.getBoundingClientRect(); return [parseFloat(e.textContent), r.left + r.width / 2]; }); const g = e => { const r = e.getBoundingClientRect(); return [r.left, r.right]; }; return [t, [...document.querySelectorAll('.row')].map(r => [r.dataset.school, g(r.querySelector('.bar')), r.querySelector('.rng') ? g(r.querySelector('.rng')) : null])]; })()")
                (v0, x0), (v1, x1) = d[0][0], d[0][-1]; X = lambda v: x0 + (v - v0) / (v1 - v0) * (x1 - x0)
                for k, bar, rng in d[1]:
                    chk(f'{tag} {k} bar runs from 0 to {S[k]["work"]["value"]}', abs(bar[0] - X(0)) < 1 and abs(bar[1] - X(float(S[k]['work']['value']))) < 1, True)
                    m8 = S[k]['work'].get('mid80'); chk(f'{tag} {k} range line', None if not rng else abs(rng[0] - X(m8[0])) < 1 and abs(rng[1] - X(m8[1])) < 1, True if m8 else None)
            if s == 5:
                chk('slide 5 order is the file\'s', schools, ORDER); chk('slide 5 source line', src, 'Sources: GradPilot (checked 24 Sep 2026) and Poets&Quants. 2026–27 application cycle.')
                d = pg.evaluate("[...document.querySelectorAll('.row')].map(r => { const c = r.querySelectorAll('.cell'); return [r.dataset.school, c[0].querySelectorAll('.sq').length, c[1].querySelectorAll('.sq:not(.was)').length, c[1].querySelectorAll('.sq.was').length, c[0].innerText]; })")
                for k, es, rs, ws, txt in d:
                    e = S[k]['essays']; chk(f'slide 5 {k} essay squares', es, e['count'] if e else 0); chk(f'slide 5 {k} recommendation squares', [rs, ws], [S[k]['recs']['count'], S[k]['recs'].get('was', S[k]['recs']['count']) - S[k]['recs']['count']])
                    if e is None: chk(f'slide 5 {k} essay cell has no number', [tokens(txt), 'sources differ' in txt], [set(), True])
            if s == 6:
                chk('slide 6 order, lowest rate first', schools, by_rate); chk('slide 6 source line', src, 'Source: Poets&Quants, using U.S. News data. Class of 2027 (entered autumn 2025).')
                chk('slide 6 rank circles', pg.evaluate("[...document.querySelectorAll('.row')].sort((a,b)=>a.getBoundingClientRect().top-b.getBoundingClientRect().top).map(r=>r.querySelector('.rank').textContent)"), [str(i) for i in range(1, 8)])
                w = dict(pg.evaluate("[...document.querySelectorAll('.row')].map(r => [r.dataset.school, r.querySelector('.bar').getBoundingClientRect().width])")); full = 920 - 148
                for k in ORDER: chk(f'slide 6 {k} bar length', abs(w[k] - float(S[k]['admit']['rate']) / 30 * full) < 0.6, True)
                chk('slide 6 has the mark top right and no lockup (Leland closes on slide 7)', pg.evaluate("[document.querySelectorAll('.lmark').length, document.querySelectorAll('.lock').length]"), [1, 0])
            pg.close()
        # ---------- the table versions of the chart slides (Graph / Table in the phone demo): same figures, same order, same source line ----------
        gmk = lambda: sorted(gm(True), key=lambda k: (-S[k]['gmat_focus']['value'], ORDER.index(k)))
        TB = {'gmat': (2, gmk(), lambda k: S[k]['gmat_focus']['stat'] + (', middle 80%: ' + '–'.join(map(str, S[k]['gmat_focus']['mid80'])) if 'mid80' in S[k]['gmat_focus'] else '')),
              'gpa': (3, by_gpa, lambda k: S[k]['gpa']['stat'] + (', range ' + '–'.join(S[k]['gpa']['range']) if 'range' in S[k]['gpa'] else '')),
              'work': (4, by_work(True), lambda k: S[k]['work']['stat'] + (', middle 80%: ' + '–'.join(map(str, S[k]['work']['mid80'])) + ' years' if 'mid80' in S[k]['work'] else '')),
              'admit': (6, by_rate, None)}
        for m, (s, order, sub) in TB.items():
            tag = f'slide {s} table'; pg = B.page(b, base, 'table', f'?m={m}'); chart = B.page(b, base, s)
            head = pg.evaluate("document.querySelector('h1').innerText.replace(/\\s+/g,' ').trim()"); chk(f'{tag} headline is the chart slide\'s', head, chart.evaluate("document.querySelector('h1').innerText.replace(/\\s+/g,' ').trim()"))
            chk(f'{tag} source line is the chart slide\'s', pg.evaluate("document.getElementById('src').textContent"), chart.evaluate("document.getElementById('src').textContent")); chart.close()
            tagged = pg.evaluate(TAG); allowed = (allow(s, tagged) - AXIS.get(s, set())) | tokens(head)
            for k, txt in tagged: chk(f'{tag} {k}', txt, expect(k)); allowed |= tokens(expect(k) or '')
            vis = pg.evaluate(VIS)
            for tok in sorted(tokens(vis) - allowed): bad.append(f'{tag}: number {tok!r} is on the slide but was not recomputed from the file')
            n += len(tokens(vis))
            d = pg.evaluate("[...document.querySelectorAll('.row')].map(r => [r.getBoundingClientRect().top, r.dataset.school, r.querySelector('.val').dataset.k, r.querySelector('.sub') ? r.querySelector('.sub').textContent : null, r.querySelector('.rank') ? r.querySelector('.rank').textContent : null]).sort((a, b) => a[0] - b[0]).map(r => r.slice(1))")
            chk(f'{tag} schools, in order', [r[0] for r in d], order); chk(f'{tag} each row shows its own school\'s figure', all(r[1].startswith(r[0] + '.') for r in d), True)
            if sub: chk(f'{tag} median / average labels', [r[2] for r in d], [sub(k) for k in order])
            else: chk(f'{tag} rank circles', [r[3] for r in d], [str(i + 1) for i in range(len(order))])
            chk(f'{tag} no missing logomarks', pg.evaluate("document.querySelectorAll('[data-missing]').length"), 0)
            chk(f'{tag} nothing outside the tile', pg.evaluate("[...document.querySelectorAll('body *')].filter(e => { const r = e.getBoundingClientRect(); return r.width && (r.left < 0 || r.right > 1080 || r.top < 0 || r.bottom > 1350); }).length"), 0)
            if s in (2, 4): chk(f'{tag} Booth is held', 'booth' in [r[0] for r in d], False)
            pg.close()
        # ---------- slide 7: the shared end slide ----------
        pg = B.page(b, base, 7); pg.evaluate('window.seek(window.FINAL)')
        chk('slide 7 line', pg.evaluate("document.querySelector('.line').innerText.replace(/\\s+/g,' ').trim()"), 'Leland MBA customers are admitted to M7 programs at 3x the national average.')
        chk('slide 7 one accent phrase', pg.evaluate("[...document.querySelectorAll('.line em')].map(e => e.textContent)"), ['3x'])
        chk('slide 7 is black with a white lockup and the lighter blue accent', pg.evaluate("[getComputedStyle(document.body).backgroundColor, getComputedStyle(document.querySelector('.wm svg')).fill, getComputedStyle(document.querySelector('.line em')).color]"), ['rgb(15, 15, 16)', 'rgb(255, 255, 255)', 'rgb(137, 171, 232)'])
        chk('slide 7 has no other numbers', tokens(pg.evaluate(VIS)), {'7', '3'}); pg.close()
        b.close()
finally: srv.terminate()

# ---------- (7) narration: every number spoken, recomputed ----------
html = open(os.path.join(B.OUT, 'index.html')).read(); lines = json.loads(html.split('/*NARRATION-START*/')[1].split('/*NARRATION-END*/')[0])
shown2 = [S[k]['gmat_focus']['value'] for k in ORDER if k != 'booth']; gp = [float(S[k]['gpa']['value']) for k in ORDER]
NARR = {1: set(), 2: {str(min(shown2)), str(max(shown2)), str(S['stanford']['gmat_focus']['value']), str(S['harvard']['gmat_focus']['value'])},
        3: {'%.1f' % min(gp), S['stanford']['gpa']['value'], S['harvard']['gpa']['value']},
        4: {S['stanford']['work']['value'], S['kellogg']['work']['value'], '80', *map(str, S['harvard']['work']['mid80'])},
        5: {str(S['harvard']['essays']['count']), str(S['stanford']['essays']['count']), str(S['wharton']['recs']['count']), str(S['wharton']['recs']['was'])},
        6: {'2027', S['stanford']['admit']['rate'], S['harvard']['admit']['rate'], S['kellogg']['admit']['rate']}, 7: {'7', '3'}}
chk('narration has seven lines', len(lines), 7); chk('narration 7 is the on-screen line', lines[6], 'Leland MBA customers are admitted to M7 programs at 3x the national average.'); chk('narration.txt is a copy', all(l in open(os.path.join(B.OUT, 'narration.txt')).read() for l in lines), True)
for i, l in enumerate(lines, 1):
    for tok in sorted(tokens(l) - NARR[i]): bad.append(f'narration {i}: number {tok!r} was not recomputed from the file')
    n += len(tokens(l)); chk(f'narration {i} under 30 words', len(l.split()) <= 30, True)
chk('narration 1 opens with the line', lines[0].startswith(HEAD[1]), True)
chk('narration 2: 695 is Stanford\'s average, 685 Harvard\'s median', [S['stanford']['gmat_focus']['stat'], S['harvard']['gmat_focus']['stat'], 'Stanford reports an average of 695' in lines[1], 'Harvard reports a median of 685' in lines[1]], ['average', 'median', True, True])
chk('narration 3: 3.6 is Booth and Columbia, 3.8 is the highest and Stanford', [sorted(k for k in ORDER if float(S[k]['gpa']['value']) == min(gp)), max(gp) == float(S['stanford']['gpa']['value'])], [['booth', 'columbia'], True])
chk('narration 5: who asks for 3 essays; who cut to 1', [[k for k in ORDER if S[k]['essays'] and S[k]['essays']['count'] == 3 and S[k]['essays']['unit'] == 'essays'], [k for k in ORDER if S[k]['recs'].get('was')]], [['harvard', 'wharton', 'columbia'], ['wharton', 'booth', 'columbia']])
chk('narration 6: lowest two and highest', [by_rate[0], by_rate[1], by_rate[-1]], ['stanford', 'harvard', 'kellogg'])
chk('narration does not speak a held figure', any(re.search(r'Booth[^.]*\b(675|6 years)', l) for l in lines), False)
print(f'{n} checks, {len(bad)} mismatches'); [print('  MISMATCH', x) for x in bad]; sys.exit(1 if bad else 0)
