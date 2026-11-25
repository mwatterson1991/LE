#!/usr/bin/env python3
"""Write trimmed copies of the school marks this post uses to src/logos/ (the originals in assets/orgs/uni/ are not touched).
Each mark is cropped to its visible pixels so it fills its box on the slide. Returns (written, missing): a mark that is not in
assets/orgs/uni/ yet is reported, and the slides then name every school in type instead of mixing marks and names."""
import os, json
from PIL import Image
SRC = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.abspath(os.path.join(SRC, '..', '..', '..', '..'))
ORG = os.path.join(REPO, 'assets', 'orgs', 'uni'); OUT = os.path.join(SRC, 'logos')

def run():
    os.makedirs(OUT, exist_ok=True); done, missing = [], []
    for slug in json.load(open(os.path.join(REPO, 'data/lists/ipeds-acceptance.json')))['schools']:
        f = os.path.join(ORG, slug + '.png'); o = os.path.join(OUT, slug + '.png')
        if not os.path.exists(f):
            missing.append(slug)
            if os.path.exists(o): os.remove(o)
            continue
        im = Image.open(f).convert('RGBA'); bb = im.split()[3].point(lambda v: 255 if v > 8 else 0).getbbox()
        im.crop(bb).save(o); done.append(slug)
    return done, missing
if __name__ == '__main__': d, m = run(); print(len(d), 'marks trimmed;', 'missing:', m)
