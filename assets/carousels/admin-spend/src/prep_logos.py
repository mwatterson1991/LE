#!/usr/bin/env python3
"""Write trimmed copies of the school marks to src/logos/ (the originals in assets/orgs/uni/ are not touched).
Each mark is cropped to its visible pixels so it fills its box on the slide. NYU's file is a white torch on a purple square:
the torch is lifted out and drawn in that purple on a clear ground."""
import os, glob
import numpy as np
from PIL import Image
SRC = os.path.dirname(os.path.abspath(__file__))
ORG = os.path.abspath(os.path.join(SRC, '..', '..', '..', 'orgs', 'uni'))
OUT = os.path.join(SRC, 'logos')

def run():
    os.makedirs(OUT, exist_ok=True); done = []
    for f in sorted(glob.glob(os.path.join(ORG, '*.png'))):
        slug = os.path.basename(f)[:-4]; im = Image.open(f).convert('RGBA')
        if slug == 'nyu':
            a = np.asarray(im).astype(float); op = a[..., 3] > 200
            purple = np.median(a[op][:, :3][a[op][:, :3].sum(1) < 500], axis=0)          # the square's colour
            t = np.clip((a[..., :3] - purple).sum(2) / (255 * 3 - purple.sum()), 0, 1)     # 0 on the square, 1 on the white torch
            out = np.zeros_like(a); out[..., :3] = purple; out[..., 3] = np.where(t > 0.2, t, 0) * a[..., 3]                                      # drop the faint residue of the square
            im = Image.fromarray(out.round().astype('uint8'), 'RGBA')
        bb = im.split()[3].point(lambda v: 255 if v > 8 else 0).getbbox()
        im.crop(bb).save(os.path.join(OUT, slug + '.png')); done.append(slug)
    return done
if __name__ == '__main__': print(len(run()), 'marks trimmed to', OUT)
