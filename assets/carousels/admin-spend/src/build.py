#!/usr/bin/env python3
"""Rebuild the admin-spend carousel. Usage: python3 build.py [stills] [v1] [v6] [sheets]  (no args = everything)
Serves the repo root on a free port, renders each slide's HTML with Playwright, encodes video with ffmpeg."""
import sys, os, subprocess, socket, time, shutil, tempfile
from playwright.sync_api import sync_playwright
from PIL import Image

SRC = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.dirname(SRC)
REPO = os.path.abspath(os.path.join(SRC, '..', '..', '..', '..'))
WORK = os.environ.get('WORK') or tempfile.mkdtemp(prefix='admin-spend-')
W, H, FPS = 1080, 1350, 30

def serve():
    s = socket.socket(); s.bind(('127.0.0.1', 0)); port = s.getsockname()[1]; s.close()
    p = subprocess.Popen([sys.executable, '-m', 'http.server', str(port), '--bind', '127.0.0.1'], cwd=REPO, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    time.sleep(0.8); return p, f'http://127.0.0.1:{port}/assets/carousels/admin-spend/src/'

def page(b, base, n, q=''):
    pg = b.new_page(viewport={'width': W, 'height': H}, device_scale_factor=1)
    pg.on('console', lambda m: print('console', n, m.text) if m.type == 'error' else None)
    pg.on('pageerror', lambda e: print('pageerror', n, e))
    pg.goto(f'{base}slide-{n}.html{q}')
    pg.wait_for_function('window.READY===true', timeout=20000)
    pg.wait_for_timeout(300)
    return pg

def shot(pg, path): pg.screenshot(path=path, clip={'x': 0, 'y': 0, 'width': W, 'height': H})

def video(b, base, n):
    d = os.path.join(WORK, f'frames{n}'); shutil.rmtree(d, ignore_errors=True); os.makedirs(d)
    pg = page(b, base, n); dur = pg.evaluate('window.DURATION'); nf = int(round(dur * FPS))
    for i in range(nf):
        pg.evaluate(f'window.seek({i / FPS})'); shot(pg, f'{d}/f{i:04d}.png')
    pg.evaluate('window.seek(window.FINAL)'); pg.wait_for_timeout(50); shot(pg, f'{OUT}/slide-{n}.png')
    missing = pg.evaluate("[...document.querySelectorAll('[data-missing]')].map(e=>e.dataset.missing)")
    if n == 1:   # filmstrip: 8 evenly spaced frames across the travel
        fr = []
        for j in range(8):
            t = 1.0 + (dur - 0.8 - 2.5 - 1.0) * j / 7 + (0.25 if 0 < j < 7 else 0)
            pg.evaluate(f'window.seek({t})'); p = f'{WORK}/film{j}.png'; shot(pg, p); fr.append(p)
        sheet(fr, f'{OUT}/film.png', 4, 540)
    pg.close()
    mp4 = f'{OUT}/slide-{n}.mp4'
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-framerate', str(FPS), '-i', f'{d}/f%04d.png', '-c:v', 'libx264', '-pix_fmt', 'yuv420p',
                    '-crf', '18', '-preset', 'slow', '-movflags', '+faststart', mp4], check=True)
    gif, pal = f'{OUT}/slide-{n}.gif', f'{WORK}/pal{n}.png'
    vf = 'fps=15,scale=540:-1:flags=lanczos'
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-framerate', str(FPS), '-i', f'{d}/f%04d.png', '-vf', f'{vf},palettegen=max_colors=128:stats_mode=diff', pal], check=True)
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-framerate', str(FPS), '-i', f'{d}/f%04d.png', '-i', pal, '-lavfi', f'{vf} [x]; [x][1:v] paletteuse=dither=none:diff_mode=rectangle', '-loop', '0', gif], check=True)
    print(f'slide-{n}: {nf} frames, {dur:.2f}s, mp4 {os.path.getsize(mp4)/1e6:.2f}MB, gif {os.path.getsize(gif)/1e6:.2f}MB, missing logomarks: {missing}')

def sheet(paths, out, cols, w):
    h = round(w * H / W); rows = (len(paths) + cols - 1) // cols; g = 12
    im = Image.new('RGB', (cols * w + (cols + 1) * g, rows * h + (rows + 1) * g), '#D9D9DC')
    for i, p in enumerate(paths):
        im.paste(Image.open(p).convert('RGB').resize((w, h), Image.LANCZOS), (g + (i % cols) * (w + g), g + (i // cols) * (h + g)))
    im.save(out)

if __name__ == '__main__':
    what = set(sys.argv[1:]) or {'stills', 'v1', 'v6', 'sheets'}
    srv, base = serve()
    try:
        with sync_playwright() as pw:
            b = pw.chromium.launch()
            if 'stills' in what:
                for n in (2, 3, 4, 5):
                    pg = page(b, base, n); shot(pg, f'{OUT}/slide-{n}.png')
                    print(f'slide-{n}: missing logomarks:', pg.evaluate("[...document.querySelectorAll('[data-missing]')].map(e=>e.dataset.missing)")); pg.close()
            if 'v1' in what: video(b, base, 1)
            if 'v6' in what: video(b, base, 6)
            b.close()
        if 'sheets' in what: sheet([f'{OUT}/slide-{n}.png' for n in range(1, 7)], f'{OUT}/all.png', 6, 540)
    finally:
        srv.terminate()
