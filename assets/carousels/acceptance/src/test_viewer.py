#!/usr/bin/env python3
"""Checks the swipeable viewer (../index.html) in a phone and a desktop window: screenshots of every slide, navigation by key, drag, tap and dots,
scrubbing the chart, the sound control, the narration queue (speech is stubbed so the test can record what would be spoken), captions,
reduced motion, opening from disk, and that nothing errors or fails to load. Usage: python3 test_viewer.py [folder for screenshots]"""
import sys, os, importlib.util
from playwright.sync_api import sync_playwright
SRC = os.path.dirname(os.path.abspath(__file__))
spec = importlib.util.spec_from_file_location('build', os.path.join(SRC, 'build.py')); B = importlib.util.module_from_spec(spec); spec.loader.exec_module(B)
SHOTS = sys.argv[1] if len(sys.argv) > 1 else os.path.join(B.WORK, 'viewer'); os.makedirs(SHOTS, exist_ok=True)
STUB = """if (window.top === window) { window.__utter = []; window.SpeechSynthesisUtterance = function (t) { this.text = t; };
  Object.defineProperty(window, 'speechSynthesis', { configurable: true, value: { getVoices: () => [{ name: 'Test Natural', lang: 'en-US', localService: true }], addEventListener() {}, cancel() { this._c = (this._c || 0) + 1; },
    speak(u) { window.__utter.push(u.text); const c = this._c || 0; setTimeout(() => { if ((this._c || 0) !== c) return; u.onstart && u.onstart(); u.onboundary && u.onboundary({}); setTimeout(() => { if ((this._c || 0) === c && u.onend) u.onend(); }, 900); }, 30); } } }); }"""
fails = []; passed = 0
def ok(name, cond, detail=''):
    global passed
    if cond: passed += 1
    else: fails.append(f'{name} {detail}')
def run(pw, url, name, vp, touch=False, reduced=False, full=True):
    b = pw.chromium.launch(args=['--autoplay-policy=no-user-gesture-required'])
    ctx = b.new_context(viewport=vp, has_touch=touch, is_mobile=touch, device_scale_factor=2 if touch else 1, reduced_motion='reduce' if reduced else 'no-preference')
    ctx.add_init_script(STUB); pg = ctx.new_page(); errs = []; failed = []
    pg.on('console', lambda m: errs.append(m.text) if m.type == 'error' else None); pg.on('pageerror', lambda e: errs.append(str(e)))
    # a media element that stops buffering cancels its own request (ERR_ABORTED); that is not a failed load
    pg.on('requestfailed', lambda r: None if (r.failure or '').endswith('ERR_ABORTED') and r.url.endswith('.mp3') else failed.append(f'{r.failure} {r.url}')); pg.on('response', lambda r: failed.append(f'{r.status} {r.url}') if r.status >= 400 else None)
    pg.goto(url); pg.wait_for_function("window.__viewer && window.__viewer.frames.length === 7"); pg.wait_for_timeout(1500)
    fr = lambda n: next(f for f in pg.frames if f.url.endswith(f'slide-{n}.html'))
    for n in range(1, 8): fr(n).wait_for_function('window.READY === true', timeout=20000)
    cur = lambda: pg.evaluate('window.__viewer.slide')
    tile = pg.evaluate("(() => { const r = document.querySelector('.tile').getBoundingClientRect(); return [r.left, r.top, r.width, r.height]; })()")
    L, T, W, H = tile; ok(f'{name}: tile is 4:5 and fits', abs(H / W - 1.25) < .01 and L >= 0 and L + W <= vp['width'] + 1 and T + H <= vp['height'], str(tile))
    if reduced:
        pg.wait_for_timeout(600); ok(f'{name}: reduced motion shows the final chart', fr(1).evaluate("document.getElementById('now').textContent") == 'Fall 2023')
        ok(f'{name}: reduced motion, no track transition', pg.evaluate("getComputedStyle(document.getElementById('track')).transitionDuration") in ('0s', '0s, 0s'))
        ok(f'{name}: no console errors', not errs, str(errs)); ok(f'{name}: no failed requests', not failed, str(failed)); b.close(); return
    # slide 1 plays on its own
    y0 = fr(1).evaluate('window.STATE.f'); pg.wait_for_timeout(2500); y1 = fr(1).evaluate('window.STATE.f'); ok(f'{name}: slide 1 animates', y1 > y0, f'{y0}->{y1}')
    if not full: ok(f'{name}: no console errors', not errs, str(errs)); ok(f'{name}: no failed requests', not failed, str(failed)); pg.screenshot(path=f'{SHOTS}/{name}-1.png'); b.close(); return
    # scrub: drag across the chart; the year under the pointer changes and autoplay stops
    cx = lambda x: L + x / 1080 * W; cy = lambda y: T + y / 1350 * H
    pg.mouse.move(cx(260), cy(760)); pg.mouse.down(); pg.wait_for_timeout(80); a = fr(1).evaluate("document.getElementById('now').textContent")
    pg.mouse.move(cx(500), cy(760), steps=6); pg.mouse.move(cx(680), cy(760), steps=6); c = fr(1).evaluate("document.getElementById('now').textContent"); pg.mouse.up()
    ok(f'{name}: scrub changes the year', a != c and a.startswith('Fall 201') and c == 'Fall 2022', f'{a}->{c}'); ok(f'{name}: scrub did not change slide', cur() == 1)
    f1 = fr(1).evaluate('window.STATE.f'); pg.wait_for_timeout(500); ok(f'{name}: scrub pauses autoplay', fr(1).evaluate('window.STATE.f') == f1)
    ok(f'{name}: viewer heard the scrub', pg.evaluate('window.__viewer.scrubYear') == 2022)
    # tap a logomark: that school's line is followed and its figure for the year shown
    box = fr(1).evaluate("(() => { const t=[...document.querySelectorAll('.tip')].find(t=>t.firstChild.dataset.slug==='stanford'); const r=t.firstChild.getBoundingClientRect(); return [r.left+r.width/2, r.top+r.height/2]; })()")
    pg.mouse.click(cx(box[0]), cy(box[1])); pg.wait_for_timeout(200)
    ok(f'{name}: tapping a logomark shows its readout', fr(1).evaluate("document.getElementById('read').innerText.replace(/\\s+/g,' ')") == 'Stanford University 3.68%', fr(1).evaluate("document.getElementById('read').innerText")); ok(f'{name}: logo tap did not change slide', cur() == 1)
    pg.screenshot(path=f'{SHOTS}/{name}-1-scrub.png'); pg.mouse.click(cx(box[0]), cy(box[1]))
    # sound: off until asked; then music plays, narration is queued, captions show, music ducks under the voice, Leo's mouth moves
    ok(f'{name}: silent at start', pg.evaluate("document.getElementById('musicA').paused && window.__utter.length === 0 && document.getElementById('cap').textContent === ''"))
    pg.click('#snd'); pg.wait_for_timeout(700); t1 = pg.evaluate("document.getElementById('musicA').currentTime"); capt = pg.evaluate("document.getElementById('cap').textContent")
    mouth = pg.evaluate("window.__viewer.mouth"); vol = pg.evaluate("document.getElementById('musicA').volume"); pg.wait_for_timeout(700)
    ok(f'{name}: music plays after the sound control', pg.evaluate("!document.getElementById('musicA').paused") and pg.evaluate("document.getElementById('musicA').currentTime") > t1 > 0, f't={t1}')
    ok(f'{name}: narration fires for slide 1', pg.evaluate('window.__utter[0]').startswith('These are the colleges'), str(pg.evaluate('window.__utter')))
    ok(f'{name}: caption shows the sentence being spoken', capt.startswith('These are the colleges'), capt); ok(f'{name}: mouth moves while speaking', mouth > 0, str(mouth)); ok(f'{name}: music ducks under the voice', 0 < vol < .3, str(vol))
    pg.screenshot(path=f'{SHOTS}/{name}-1-sound.png')
    pg.wait_for_timeout(2600); ok(f'{name}: second sentence follows', pg.evaluate('window.__utter.length') >= 2 and pg.evaluate('window.__utter[1]').startswith('Harvard ends lowest'), str(pg.evaluate('window.__utter')))
    pg.wait_for_timeout(1500); ok(f'{name}: music returns to level after the voice', pg.evaluate("document.getElementById('musicA').volume") > .45, str(pg.evaluate("document.getElementById('musicA').volume")))
    # navigation: arrow key, drag inside the slide, tap on the right and left thirds, dots; each arrival narrates
    pg.keyboard.press('ArrowRight'); pg.wait_for_timeout(700); ok(f'{name}: arrow key goes to slide 2', cur() == 2)
    ok(f'{name}: slide 2 narration queued', any(u.startswith('In fall 2023') for u in pg.evaluate('window.__utter')))
    pg.mouse.move(cx(800), cy(300)); pg.mouse.down(); pg.mouse.move(cx(500), cy(310), steps=5); pg.mouse.move(cx(250), cy(310), steps=5); pg.mouse.up(); pg.wait_for_timeout(700); ok(f'{name}: drag left goes to slide 3', cur() == 3)
    pg.mouse.move(cx(300), cy(250)); pg.mouse.down(); pg.mouse.move(cx(360), cy(250), steps=3); pg.mouse.up(); pg.wait_for_timeout(600); ok(f'{name}: a short drag snaps back', cur() == 3)
    pg.mouse.click(cx(960), cy(200)); pg.wait_for_timeout(700); ok(f'{name}: tap on the right third goes to slide 4', cur() == 4)
    pg.mouse.click(cx(120), cy(250)); pg.wait_for_timeout(700); ok(f'{name}: tap on the left third goes back to slide 3', cur() == 3)
    pg.mouse.click(cx(500), cy(650)); pg.wait_for_timeout(400); ok(f'{name}: tap on a bar does not change slide', cur() == 3)
    pg.click('#dots button:nth-child(7)'); pg.wait_for_timeout(900); ok(f'{name}: dot goes to slide 7', cur() == 7)
    ok(f'{name}: slide 7 narration is the on-screen line', pg.evaluate('window.__utter').count('Leland MBA customers are admitted to M7 programs at 3x the national average.') >= 1)
    t0 = fr(7).evaluate("document.getElementById('wm').style.width"); pg.wait_for_timeout(1500); ok(f'{name}: slide 7 animates on arrival', fr(7).evaluate("document.getElementById('wm').style.width") != t0)
    nu = pg.evaluate('window.__utter.length'); pg.click('#leoBtn'); pg.wait_for_timeout(400); ok(f'{name}: tapping Leo replays the narration', pg.evaluate('window.__utter.length') > nu)
    pg.keyboard.press('ArrowRight'); pg.wait_for_timeout(500); ok(f'{name}: stops at the last slide', cur() == 7)
    pg.click('#snd'); pg.wait_for_timeout(900); ok(f'{name}: sound off pauses music and clears the caption', pg.evaluate("document.getElementById('musicA').paused && document.getElementById('musicB').paused && document.getElementById('cap').textContent === ''"))
    # hover isolates a row (pointer devices)
    if not touch:
        pg.evaluate('window.__viewer.go(2)'); pg.wait_for_timeout(700); pg.mouse.move(cx(500), cy(650)); pg.wait_for_timeout(350)
        ok(f'{name}: hover isolates a row on slide 2', fr(2).evaluate("[...document.querySelectorAll('.row')].filter(r=>r.style.opacity==='1').length") == 1); pg.screenshot(path=f'{SHOTS}/{name}-2-hover.png'); pg.mouse.move(2, 2)
    # a clean screenshot of every slide (animations settled on their last frame)
    for s in range(1, 8):
        pg.evaluate(f'window.__viewer.go({s})'); pg.wait_for_timeout(650)
        if s in (1, 7): fr(s).evaluate('Player.stop(); window.seek(window.FINAL)'); pg.wait_for_timeout(100)
        pg.screenshot(path=f'{SHOTS}/{name}-{s}.png')
    ok(f'{name}: no console errors', not errs, str(errs)); ok(f'{name}: no failed requests', not failed, str(failed)); b.close()
srv, base = B.serve(); web = base.replace('/src/', '/index.html')
try:
    with sync_playwright() as pw:
        run(pw, web, 'phone', {'width': 390, 'height': 844}, touch=True)
        run(pw, web, 'desktop', {'width': 1440, 'height': 900})
        run(pw, web, 'small', {'width': 360, 'height': 640}, touch=True, full=False)
        run(pw, web, 'reduced', {'width': 1440, 'height': 900}, reduced=True)
        run(pw, 'file://' + os.path.join(B.OUT, 'index.html'), 'disk', {'width': 1440, 'height': 900}, full=False)
finally: srv.terminate()
print(f'{passed} viewer checks passed, {len(fails)} failed'); [print('  FAIL', f) for f in fails]; print('screenshots in', SHOTS); sys.exit(1 if fails else 0)
