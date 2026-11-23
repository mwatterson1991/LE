#!/usr/bin/env python3
"""Macan with a plain question mark.

Macan's own '?' is never used at Leland. This copies the '?' outline from Arimo (Apache 2.0, metric-compatible
with Helvetica/Arial; the variable font is vendored beside this script) into each Macan weight. Arimo is
instanced at the weight whose stem matches the Macan weight, and scaled so the cap heights match.
Writes fonts/Macan-<Weight>-Q.woff2.

    pip install fonttools brotli
    python3 tools/macan-q.py
"""
import os
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer
from fontTools.pens.ttGlyphPen import TTGlyphPen
from fontTools.pens.recordingPen import DecomposingRecordingPen
from fontTools.pens.boundsPen import BoundsPen
from fontTools.pens.cu2quPen import Cu2QuPen

HERE = os.path.dirname(os.path.abspath(__file__))
FONTS = os.path.join(HERE, '..', 'fonts')
ARIMO = os.path.join(HERE, 'arimo-latin-wght-normal.woff2')

def bounds(font, ch):
    gs = font.getGlyphSet(); b = BoundsPen(gs); gs[font.getBestCmap()[ord(ch)]].draw(b); return b.bounds
def stem(font):
    b = bounds(font, 'l'); return b[2] - b[0]
def arimo(wght):
    return instancer.instantiateVariableFont(TTFont(ARIMO), {'wght': wght})

a400, a700 = arimo(400), arimo(700)
for w in ['Book', 'Medium', 'SemiBold']:
    f = TTFont(os.path.join(FONTS, 'Macan-%s.woff2' % w))
    k = bounds(f, 'H')[3] / bounds(a400, 'H')[3]                    # match cap height
    s4, s7, sm = stem(a400) * k, stem(a700) * k, stem(f)
    wght = max(400, min(700, round(400 + 300 * (sm - s4) / (s7 - s4))))
    src = arimo(wght)
    gs = src.getGlyphSet(); rp = DecomposingRecordingPen(gs); gs[src.getBestCmap()[63]].draw(rp)
    tt = TTGlyphPen(None); pen = Cu2QuPen(tt, 1.0)
    for op, pts in rp.value:
        getattr(pen, op)(*[(round(x * k), round(y * k)) for x, y in pts])
    g = tt.glyph()
    name = f.getBestCmap()[63]
    f['glyf'][name] = g
    g.recalcBounds(f['glyf'])
    f['hmtx'][name] = (round(src['hmtx'][src.getBestCmap()[63]][0] * k), g.xMin)
    for n in f['name'].names:
        if n.nameID == 5: n.string = n.toUnicode() + '; question mark from Arimo'
    f.flavor = 'woff2'
    out = os.path.join(FONTS, 'Macan-%s-Q.woff2' % w)
    f.save(out)
    print(w, 'scale %.4f' % k, 'macan stem', sm, 'arimo wght', wght, 'advance', f['hmtx'][name], os.path.getsize(out), 'bytes')
