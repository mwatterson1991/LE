#!/usr/bin/env python3
"""Copies what the shared end slide needs from elsewhere in the repo, unchanged, so it opens from disk and on Pages:
js/mark.js -> mark.js, and the lockup svg (assets/brand/logo-white.svg) -> logo.js. Every post's build.py calls refresh()."""
import os, json, shutil
HERE = os.path.dirname(os.path.abspath(__file__)); REPO = os.path.abspath(os.path.join(HERE, '..', '..', '..'))
def refresh():
    shutil.copyfile(f'{REPO}/js/mark.js', f'{HERE}/mark.js')
    with open(f'{HERE}/logo.js', 'w') as f: f.write('/* Written by refresh.py from assets/brand/logo-white.svg. Do not edit. */\nwindow.LELAND_LOGO_SVG = ' + json.dumps(open(f'{REPO}/assets/brand/logo-white.svg').read()) + ';\n')
if __name__ == '__main__': refresh(); print('shared end slide refreshed')
