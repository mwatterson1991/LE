#!/usr/bin/env python3
"""Write trimmed copies of the seven parent-university marks to src/logos/ (the originals are not touched).
Five come from assets/orgs/uni/; Penn's shield and Columbia's crown come from assets/orgs/ (the manifest's org group).
Each is cropped to its visible pixels so it fills its box. Columbia's file has a solid white ground, which is made clear first."""
import os
import numpy as np
from PIL import Image
SRC = os.path.dirname(os.path.abspath(__file__))
ORGS = os.path.abspath(os.path.join(SRC, '..', '..', '..', 'orgs'))
OUT = os.path.join(SRC, 'logos')
MARKS = {'harvard': 'uni/harvard.png', 'stanford': 'uni/stanford.png', 'northwestern': 'uni/northwestern.png', 'uchicago': 'uni/uchicago.png', 'mit': 'uni/mit.png',
         'penn': 'University_of_Pennsylvania.png',
         'columbia': 'Columbia_University_Vagelos_College_of_Physicians.png'}   # that entry's image is the Columbia University crown; there is no "Columbia University" entry

def run():
    os.makedirs(OUT, exist_ok=True); done = []
    for slug, f in MARKS.items():
        im = Image.open(os.path.join(ORGS, f)).convert('RGBA'); a = np.asarray(im).astype(float)
        if a[..., 3].min() > 250:   # opaque file: white becomes clear, in proportion, so edges stay smooth
            ink = 1 - a[..., :3].min(2) / 255.0; out = a.copy(); out[..., 3] = np.clip(ink * 1.15, 0, 1) * 255
            nz = ink > 0.02; rgb = a[..., :3].copy(); rgb[nz] = np.clip((a[..., :3][nz] - 255 * (1 - ink[nz][:, None])) / ink[nz][:, None], 0, 255); out[..., :3] = rgb
            im = Image.fromarray(out.round().astype('uint8'), 'RGBA')
        bb = im.split()[3].point(lambda v: 255 if v > 8 else 0).getbbox()
        im.crop(bb).save(os.path.join(OUT, slug + '.png')); done.append(slug)
    return done
if __name__ == '__main__': print(len(run()), 'marks trimmed to', OUT)
