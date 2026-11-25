#!/usr/bin/env python3
"""Checks the phone demo (index.html) at 390x844 with touch, 360x640 with touch, and inside the desktop frame at 1280x900:
every slide of both posts is reached by swiping; the Graph / Table switch appears only on slides that have both versions, changes the media in place,
restarts the video and is remembered per post; keys g and t; the sound control; the icons, caption, switch and dots never overlap or leave the screen;
no console errors, no failed requests. Usage: python3 test_phone.py [folder for screenshots]"""
import sys, os, subprocess, socket, time, tempfile, json, re
from playwright.sync_api import sync_playwright
HERE = os.path.dirname(os.path.abspath(__file__)); REPO = os.path.abspath(os.path.join(HERE, '..', '..', '..'))
SHOTS = sys.argv[1] if len(sys.argv) > 1 else tempfile.mkdtemp(prefix='phone-demo-'); os.makedirs(SHOTS, exist_ok=True)
s = socket.socket(); s.bind(('127.0.0.1', 0)); port = s.getsockname()[1]; s.close()
srv = subprocess.Popen([sys.executable, '-m', 'http.server', str(port), '--bind', '127.0.0.1'], cwd=REPO, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL); time.sleep(0.8)
URL = f'http://127.0.0.1:{port}/assets/carousels/phone/index.html'
fails = []; passed = 0
def ok(name, cond, detail=''):
    global passed
    if cond: passed += 1
    else: fails.append(f'{name} {detail}')
STATE = """(() => { const feed=document.getElementById('feed'), i=Math.round(feed.scrollTop/feed.clientHeight), post=feed.children[i], sl=post.querySelector('.slides'), k=Math.round(sl.scrollLeft/sl.clientWidth);
  const on=post.querySelectorAll('.slide')[k].querySelectorAll('.on'), m=on[0]; const tog=post.querySelector('.tog');
  return {post:i, slide:k, n:post.querySelectorAll('.slide').length, onCount:on.length, src:(m.getAttribute('src')), tag:m.tagName, starts:+(m.dataset.starts||0), paused:m.tagName==='VIDEO'?m.paused:null,
    tog:tog.classList.contains('show'), sel:[...tog.querySelectorAll('button.on')].map(b=>b.textContent), count:post.querySelector('.count').textContent, loaded:m.tagName==='IMG'?m.naturalWidth>0:m.readyState>=0}; })()"""
BOXES = """(() => { const feed=document.getElementById('feed'), post=feed.children[Math.round(feed.scrollTop/feed.clientHeight)], ph=document.getElementById('phone'); const sl=post.querySelector('.slides'), k=Math.round(sl.scrollLeft/sl.clientWidth);
  const R=e=>{const r=e.getBoundingClientRect();return [r.left,r.top,r.right,r.bottom]}; const U=es=>{const a=[...es].map(R);return [Math.min(...a.map(r=>r[0])),Math.min(...a.map(r=>r[1])),Math.max(...a.map(r=>r[2])),Math.max(...a.map(r=>r[3]))]};
  const o={rail:R(post.querySelector('.rail')), caption:U(post.querySelectorAll('.meta b, .meta p, .meta .sound')), dots:U(post.querySelectorAll('.dots i')), count:R(post.querySelector('.count')), mute:R(document.getElementById('mute')), media:R(post.querySelectorAll('.media')[k]), nav:R(document.querySelector('.nav')), phone:R(ph)};
  if(post.querySelector('.tog').classList.contains('show')) o.toggle=U(post.querySelectorAll('.tog button')); return o; })()"""
def overlaps(a, b): return a[0] < b[2] - .5 and b[0] < a[2] - .5 and a[1] < b[3] - .5 and b[1] < a[3] - .5
def layout(pg, name):
    b = pg.evaluate(BOXES); parts = [k for k in ('rail', 'caption', 'dots', 'toggle') if k in b]
    for i, x in enumerate(parts):
        for y in parts[i + 1:]: ok(f'{name}: {x} and {y} do not overlap', not overlaps(b[x], b[y]), f'{b[x]} {b[y]}')
        ok(f'{name}: {x} sits between the slide and the bottom bar', b[x][1] >= b['media'][3] - .5 and b[x][3] <= b['nav'][1] + .5 and b[x][0] >= b['phone'][0] - .5 and b[x][2] <= b['phone'][2] + .5, f'{b[x]} media {b["media"]} nav {b["nav"]}')
    ok(f'{name}: counter and sound are in the top bar, above the slide', b['count'][3] <= b['media'][1] + .5 and b['mute'][3] <= b['media'][1] + .5 and not overlaps(b['count'], b['mute']))
    ok(f'{name}: slide is 4:5', abs((b['media'][3] - b['media'][1]) / (b['media'][2] - b['media'][0]) - 1.25) < .01)
def run(pw, name, vp, touch):
    br = pw.chromium.launch(args=['--autoplay-policy=no-user-gesture-required'])
    ctx = br.new_context(viewport=vp, has_touch=touch, is_mobile=touch, device_scale_factor=2 if touch else 1); pg = ctx.new_page(); errs = []; failed = []
    pg.on('console', lambda m: errs.append(m.text) if m.type == 'error' else None); pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.on('requestfailed', lambda r: None if (r.failure or '').endswith('ERR_ABORTED') and re.search(r'\.(mp3|mp4)$', r.url) else failed.append(f'{r.failure} {r.url}'))   # a media element that stops buffering cancels its own request
    pg.on('response', lambda r: failed.append(f'{r.status} {r.url}') if r.status >= 400 else None)
    pg.goto(URL); pg.wait_for_timeout(1200); st = lambda: pg.evaluate(STATE)
    posts = pg.evaluate('POSTS'); can = pg.evaluate("document.createElement('video').canPlayType('video/mp4; codecs=\"avc1.42E01E\"')")
    box = pg.evaluate("(() => { const r=document.getElementById('phone').getBoundingClientRect(); return [r.left,r.top,r.width,r.height]; })()"); X = lambda f: box[0] + box[2] * f; Y = lambda f: box[1] + box[3] * f
    def swipe(dx, dy):
        if touch:   # a real touch scroll of the snapping strip
            c = ctx.new_cdp_session(pg); x0, y0, x1, y1 = X(.5 + dx * .33), Y(.45 + dy * .3), X(.5 - dx * .33), Y(.45 - dy * .3)
            c.send('Input.dispatchTouchEvent', {'type': 'touchStart', 'touchPoints': [{'x': x0, 'y': y0}]})
            for j in range(1, 11): c.send('Input.dispatchTouchEvent', {'type': 'touchMove', 'touchPoints': [{'x': x0 + (x1 - x0) * j / 10, 'y': y0 + (y1 - y0) * j / 10}]}); time.sleep(.016)
            c.send('Input.dispatchTouchEvent', {'type': 'touchEnd', 'touchPoints': []}); c.detach()
        else: pg.mouse.move(X(.5 + dx * .3), Y(.35 + dy * .25)); pg.mouse.down(); pg.mouse.move(X(.5 - dx * .3), Y(.35 - dy * .25), steps=8); pg.mouse.up()
        pg.wait_for_timeout(900)
    tap = (lambda sel: pg.tap(sel)) if touch else (lambda sel: pg.click(sel))
    for pi, post in enumerate(posts):
        if pi: swipe(0, 1); ok(f'{name}: swipe up goes to post {pi + 1}', st()['post'] == pi, str(st()))
        for k, sl in enumerate(post['slides']):
            if k: swipe(1, 0)
            s = st(); tagn = f'{name} post {pi + 1} slide {k + 1}'; both = isinstance(sl, dict)
            ok(f'{tagn}: reached by swiping', s['post'] == pi and s['slide'] == k and s['count'] == f'{k + 1}/{len(post["slides"])}', str(s)); ok(f'{tagn}: one version showing', s['onCount'] == 1)
            ok(f'{tagn}: switch shows only when the slide has both versions', s['tog'] == both, str(s)); layout(pg, tagn)
            if not both: ok(f'{tagn}: file', s['src'].endswith(sl), s['src']); continue
            ok(f'{tagn}: starts on the graph', s['src'].endswith(sl['graph']) and s['sel'] == ['Graph'], str(s))
            if (pi, k) in ((0, 0), (0, 1), (1, 1)): pg.wait_for_timeout(250); pg.screenshot(path=f'{SHOTS}/{name}-p{pi + 1}-s{k + 1}-graph.png')
            tap(f'.post:nth-child({pi + 1}) .tog button[data-m="table"]'); pg.wait_for_timeout(350); t = st()
            ok(f'{tagn}: Table changes the media in place', t['src'].endswith(sl['table']) and t['sel'] == ['Table'] and t['slide'] == k and t['onCount'] == 1, str(t))
            ok(f'{tagn}: the table file loaded', pg.evaluate(f"(() => {{ const m=document.querySelectorAll('.post')[{pi}].querySelectorAll('.slide')[{k}].querySelector('.on'); return m.tagName==='IMG' ? m.complete && m.naturalWidth===1080 : !m.error || m.error.code===4; }})()"))
            if t['tag'] == 'VIDEO': ok(f'{tagn}: the video restarts on switching', t['starts'] >= 1 and pg.evaluate(f"document.querySelectorAll('.post')[{pi}].querySelectorAll('.slide')[{k}].querySelector('.on').currentTime || 0") < 1.5, str(t))
            layout(pg, tagn + ' (table)')
            if (pi, k) in ((0, 0), (0, 1), (1, 1)): pg.wait_for_timeout(250); pg.screenshot(path=f'{SHOTS}/{name}-p{pi + 1}-s{k + 1}-table.png')
            if not touch:
                pg.keyboard.press('g'); pg.wait_for_timeout(300); ok(f'{tagn}: key g', st()['sel'] == ['Graph'] and st()['src'].endswith(sl['graph'])); pg.keyboard.press('t'); pg.wait_for_timeout(300); ok(f'{tagn}: key t', st()['sel'] == ['Table'])
            tap(f'.post:nth-child({pi + 1}) .tog button[data-m="graph"]'); pg.wait_for_timeout(350); g = st()
            ok(f'{tagn}: Graph switches back', g['src'].endswith(sl['graph']) and g['sel'] == ['Graph'], str(g))
            if g['tag'] == 'VIDEO': ok(f'{tagn}: the graph video restarts', g['starts'] > s['starts'], f"{s['starts']}->{g['starts']}")
        if pi == 0:   # the black end slide
            pg.wait_for_timeout(300); pg.screenshot(path=f'{SHOTS}/{name}-end.png')
        if pi == 1:   # the choice is per post: Table here leaves the college post on Graph, and holds for this post's other slides
            tap('.post:nth-child(2) .tog button[data-m="table"]') if st()['tog'] else None
            pg.evaluate("(() => { const s=document.querySelectorAll('.post')[1].querySelector('.slides'); s.scrollTo({left:s.clientWidth*5}); })()"); pg.wait_for_timeout(500); tap('.post:nth-child(2) .tog button[data-m="table"]'); pg.wait_for_timeout(300)
            pg.evaluate("(() => { const s=document.querySelectorAll('.post')[1].querySelector('.slides'); s.scrollTo({left:s.clientWidth*1}); })()"); pg.wait_for_timeout(500)
            ok(f'{name}: the choice holds across the post', st()['sel'] == ['Table'] and st()['src'].endswith('slide-2-table.png'), str(st()))
            ok(f'{name}: the other post keeps its own choice', pg.evaluate("document.querySelector('.post .media img[data-m=\"graph\"]').classList.contains('on')"))
            pg.reload(); pg.wait_for_timeout(900); ok(f'{name}: the choice is remembered after a reload', pg.evaluate("[...document.querySelectorAll('.post')].map(p => p.querySelector('.tog button.on').textContent)") == ['Graph', 'Table'])
    # sound: off until asked
    ok(f'{name}: silent at start', pg.evaluate('audio.every(a => a.paused)')); tap('#mute'); pg.wait_for_timeout(900)
    ok(f'{name}: the sound control starts the music', pg.evaluate('!audio[cur].paused && audio[cur].currentTime > 0'), str(pg.evaluate('[cur, audio.map(a => [a.paused, a.currentTime])]')))
    tap('#mute'); pg.wait_for_timeout(300); ok(f'{name}: and stops it', pg.evaluate('audio.every(a => a.paused)'))
    ok(f'{name}: no console errors', not errs, str(errs[:4])); ok(f'{name}: no failed requests', not failed, str(failed[:4])); br.close(); return can
try:
    with sync_playwright() as pw:
        can = run(pw, 'phone-390', {'width': 390, 'height': 844}, True); run(pw, 'phone-360', {'width': 360, 'height': 640}, True); run(pw, 'desktop', {'width': 1280, 'height': 900}, False)
finally: srv.terminate()
print(f'{passed} phone-demo checks passed, {len(fails)} failed' + ('' if can else '  (this test browser cannot decode H.264, so video frames were not played; sources and restarts were still checked)')); [print('  FAIL', f) for f in fails[:40]]; print('screenshots in', SHOTS); sys.exit(1 if fails else 0)
