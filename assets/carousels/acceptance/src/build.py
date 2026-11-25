#!/usr/bin/env python3
"""Rebuild the acceptance-rate carousel. Usage: python3 build.py [stills] [v1] [list] [v7] [sheets] [pack]  (no args = everything)
Serves the repo root on a free port, renders each slide's HTML with Playwright, encodes video with ffmpeg."""
import sys, os, subprocess, socket, time, shutil, tempfile
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from playwright.sync_api import sync_playwright
from PIL import Image

SRC = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.dirname(SRC)
REPO = os.path.abspath(os.path.join(SRC, '..', '..', '..', '..'))
WORK = os.environ.get('WORK') or tempfile.mkdtemp(prefix='acceptance-')
W, H, FPS = 1080, 1350, 30

def serve():
    s = socket.socket(); s.bind(('127.0.0.1', 0)); port = s.getsockname()[1]; s.close()
    p = subprocess.Popen([sys.executable, '-m', 'http.server', str(port), '--bind', '127.0.0.1'], cwd=REPO, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    time.sleep(0.8); return p, f'http://127.0.0.1:{port}/assets/carousels/acceptance/src/'

def page(b, base, n, q=''):
    pg = b.new_page(viewport={'width': W, 'height': H}, device_scale_factor=1)
    pg.on('console', lambda m: print('console', n, m.text) if m.type == 'error' else None)
    pg.on('pageerror', lambda e: print('pageerror', n, e))
    pg.goto(f'{base}slide-{n}.html{q}')
    pg.wait_for_function('window.READY===true', timeout=20000)
    pg.wait_for_timeout(300)
    return pg

def shot(pg, path): pg.screenshot(path=path, clip={'x': 0, 'y': 0, 'width': W, 'height': H})

MUSIC = 'assets/audio/community-outcomes-v4-preview.mp3'   # Leland's own film music; see ../README.txt for why this one

def prepare():
    """Everything the pages need that lives elsewhere in the repo is copied in, unchanged, so the folder works on its own (from disk and on Pages)."""
    import json, prep_logos, importlib.util
    sp = importlib.util.spec_from_file_location('refresh', f'{SRC}/../../_shared/refresh.py'); sh = importlib.util.module_from_spec(sp); sp.loader.exec_module(sh); sh.refresh()   # the shared end slide (slide 7)
    d = json.load(open(f'{REPO}/data/lists/ipeds-acceptance.json')); done, missing = prep_logos.run()
    with open(f'{SRC}/data.js', 'w') as f:
        f.write('/* Written by build.py: a straight copy of data/lists/ipeds-acceptance.json, plus the list of school marks that exist, so the slides open from disk. Do not edit. */\n')
        f.write('window.ACCEPT = ' + json.dumps(d, separators=(',', ':')) + ';\n'); f.write('window.LOGOS_PRESENT = ' + json.dumps(done) + ';\n')
    os.makedirs(f'{SRC}/vendor', exist_ok=True)
    for a, b in [('assets/brand/mark.svg', 'mark.svg'), ('assets/leo/leo.js', 'leo.js')]: shutil.copyfile(f'{REPO}/{a}', f'{SRC}/vendor/{b}')
    shutil.copyfile(f'{REPO}/{MUSIC}', f'{OUT}/music.mp3')
    # narration.txt is a readable copy of the NARRATION array at the top of ../index.html (edit the array, not the copy)
    html = open(f'{OUT}/index.html').read(); lines = json.loads(html.split('/*NARRATION-START*/')[1].split('/*NARRATION-END*/')[0])
    with open(f'{OUT}/narration.txt', 'w') as f:
        f.write('Narration, one entry per slide. This is a copy: to change what is spoken, edit the NARRATION list at the top of index.html.\n\n')
        for i, l in enumerate(lines): f.write(f'Slide {i + 1}\n{l}\n\n')
    print(len(done), 'logomarks trimmed; missing from assets/orgs/uni/:', missing or 'none'); return missing

def video(b, base, n, q='', name=None, still=True, film=False, gif=True, sound=False):
    name = name or f'slide-{n}'
    d = os.path.join(WORK, f'frames-{name}'); shutil.rmtree(d, ignore_errors=True); os.makedirs(d)
    pg = page(b, base, n, q); dur = pg.evaluate('window.DURATION'); nf = int(round(dur * FPS))
    for i in range(nf):
        pg.evaluate(f'window.seek({i / FPS})'); shot(pg, f'{d}/f{i:04d}.png')
    if still: pg.evaluate('window.seek(window.FINAL)'); pg.wait_for_timeout(50); shot(pg, f'{OUT}/{name}.png')
    missing = pg.evaluate("[...document.querySelectorAll('[data-missing]')].map(e=>e.dataset.missing)")
    if film:   # filmstrip: one frame per fall, 2014..2023; the last one is the settled final frame
        fr = []; a, z, per = pg.evaluate('window.TRAVEL')
        for j in range(10):
            pg.evaluate('window.seek(window.FINAL)' if j == 9 else f'window.scrubYear({j})' if film == 'chart' else f'window.seek({a + j * per - 0.001 if j else 0.4})'); p = f'{WORK}/film-{name}-{j}.png'; shot(pg, p); fr.append(p)
        sheet(fr, f'{OUT}/' + ('film.png' if film == 'chart' else 'film-table.png'), 5, 432)
    pg.close()
    mp4 = f'{OUT}/{name}.mp4'; silent = f'{WORK}/{name}-silent.mp4' if sound else mp4
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-framerate', str(FPS), '-i', f'{d}/f%04d.png', '-c:v', 'libx264', '-pix_fmt', 'yuv420p',
                    '-crf', '18', '-preset', 'slow', '-movflags', '+faststart', silent], check=True)
    if sound:   # the music bed: faded in and out, levelled to about -16 LUFS
        fo = max(0.8, min(1.5, dur * 0.15))
        subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', silent, '-i', f'{REPO}/{MUSIC}', '-map', '0:v', '-map', '1:a', '-t', f'{dur:.3f}',
                        '-af', f'atrim=0:{dur:.3f},loudnorm=I=-16:TP=-1.5:LRA=11,afade=t=in:d=0.4,afade=t=out:st={dur - fo:.3f}:d={fo:.3f}',
                        '-c:v', 'copy', '-c:a', 'aac', '-b:a', '160k', '-movflags', '+faststart', mp4], check=True)
    msg = f'{name}: {nf} frames, {dur:.2f}s, mp4 {os.path.getsize(mp4)/1e6:.2f}MB'
    if gif:
        g, pal = f'{OUT}/{name}.gif', f'{WORK}/pal-{name}.png'
        vf = 'fps=15,scale=720:-1:flags=lanczos'
        subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-framerate', str(FPS), '-i', f'{d}/f%04d.png', '-vf', f'{vf},palettegen=max_colors=128:stats_mode=diff', pal], check=True)
        subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-framerate', str(FPS), '-i', f'{d}/f%04d.png', '-i', pal, '-lavfi', f'{vf} [x]; [x][1:v] paletteuse=dither=none:diff_mode=rectangle', '-loop', '0', g], check=True)
        msg += f', gif {os.path.getsize(g)/1e6:.2f}MB'
    print(msg + f', missing logomarks: {missing}')

def sheet(paths, out, cols, w):
    h = round(w * H / W); rows = (len(paths) + cols - 1) // cols; g = 12
    im = Image.new('RGB', (cols * w + (cols + 1) * g, rows * h + (rows + 1) * g), '#D9D9DC')
    for i, p in enumerate(paths):
        im.paste(Image.open(p).convert('RGB').resize((w, h), Image.LANCZOS), (g + (i % cols) * (w + g), g + (i // cols) * (h + g)))
    im.save(out)

N = 7
PACK = ['carousel.pdf', 'slide-1.mp4', 'slide-7.mp4', 'slide-1.gif'] + [f'slide-{n}.png' for n in range(1, N + 1)] + ['slide-1-table.mp4', 'slide-2-graph.png', 'narration.txt', 'README.txt']
def pack():
    # carousel.pdf: seven pages, 1080x1350 points each (72 dpi), then the zip for handing off
    import zipfile
    ims = [Image.open(f'{OUT}/slide-{n}.png').convert('RGB') for n in range(1, N + 1)]
    ims[0].save(f'{OUT}/carousel.pdf', save_all=True, append_images=ims[1:], resolution=72.0)
    with zipfile.ZipFile(f'{OUT}/acceptance-carousel.zip', 'w', zipfile.ZIP_DEFLATED) as z:
        for f in PACK: z.write(f'{OUT}/{f}', f'acceptance-carousel/{f}')
    print('pack:', ', '.join(f'{f} {os.path.getsize(OUT + "/" + f) / 1e6:.2f}MB' for f in ['carousel.pdf', 'acceptance-carousel.zip']))

if __name__ == '__main__':
    what = set(sys.argv[1:]) or {'stills', 'v1', 'list', 'v7', 'sheets', 'pack'}
    prepare()
    srv, base = serve()
    try:
        with sync_playwright() as pw:
            b = pw.chromium.launch()
            if 'stills' in what:
                for n in (2, '2-graph', 3, 4, 5, 6):   # 2-graph is the bar-chart version of slide 2, for the Graph / Table switch in the phone demo
                    pg = page(b, base, n); shot(pg, f'{OUT}/slide-{n}.png')
                    print(f'slide-{n}: missing logomarks:', pg.evaluate("[...document.querySelectorAll('[data-missing]')].map(e=>e.dataset.missing)")); pg.close()
            if 'v1' in what: video(b, base, 1, film='chart', sound=True)
            if 'list' in what: video(b, base, 2, q='?anim', name='slide-1-table', gif=False, film='table')   # slide 1 as a table: the ten lowest rates re-ordering fall by fall
            if 'v7' in what: video(b, base, 7, sound=True)
            b.close()
        if 'sheets' in what: sheet([f'{OUT}/slide-{n}.png' for n in range(1, N + 1)], f'{OUT}/all.png', 7, 540)
        if 'pack' in what: pack()
    finally:
        srv.terminate()
