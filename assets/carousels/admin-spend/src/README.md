# Admin-spend carousel

Six 1080×1350 slides rendered from the HTML in this folder. Every number is read from `data/lists/ipeds-admin-spend.json` when the page loads; nothing is typed in by hand except the headlines.

| file | what it is |
|---|---|
| `slide-1.html` | the ranking moving through FY 2011 to FY 2024 (video + final still) |
| `slide-2.html` … `slide-5.html` | the four breakdown stills |
| `slide-6.html` | the Leland lockup animation (from `js/mark.js`) and the closing line (video + final still) |
| `base.css`, `base.js` | fonts, colours, the shared green scale, helpers |
| `build.py` | renders everything into the folder above |
| `verify.py` | recomputes every number shown from the data file and compares it with the rendered slides |

## Rebuild

From this folder:

    python3 build.py            # everything: stills, both videos, all.png, film.png
    python3 build.py stills     # only slides 2 to 5
    python3 build.py v1         # only slide 1 (mp4, gif preview, png, film.png)
    python3 build.py v6         # only slide 6 (mp4, gif preview, png)
    python3 build.py sheets     # only the contact sheet all.png
    python3 verify.py           # prints "N checks, 0 mismatches" when the slides match the file

`build.py` starts its own local web server on a free port, opens each page in Chromium through Playwright, steps the animations frame by frame at 30 fps (`window.seek(t)`, `window.DURATION`), and encodes with ffmpeg (H.264, yuv420p, crf 18). Needs Python Playwright, Pillow and ffmpeg.

To preview an animation in a browser, serve the repo root (`python3 -m http.server 8000` in `/home/claude/le`) and open `…/assets/carousels/admin-spend/src/slide-1.html?play` (or `slide-6.html?play`). `?final` shows the last frame.

## Editing

- Headlines: the `<h1>` in each slide; `<em>` marks the one blue phrase. Slide 6's line is the `LINE` constant, with `[brackets]` for the blue phrase.
- Slide 1 timing: `HOLD0`, `PER`, `HOLD1`, `BACK` at the top of its script.
- School logomarks: `assets/orgs/uni/<slug>.png`. A missing file renders as a grey circle and `build.py` prints which were missing.
- Numerals use Helvetica Neue where it is installed, then Helvetica, then a metric-compatible stand-in (`base.css`, the `Helv` and `Num` faces).
