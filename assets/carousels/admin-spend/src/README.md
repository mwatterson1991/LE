# Admin-spend carousel

Seven 1080×1350 slides rendered from the HTML in this folder, plus the swipeable viewer one level up (`../index.html`). Every number is read from `data/lists/ipeds-admin-spend.json` (through `data.js`, a straight copy that `build.py` writes so the pages also open from disk); nothing is typed in by hand except the headlines and the narration lines.

| file | what it is |
|---|---|
| `slide-1.html` | the chart over time, FY 2017 to FY 2024: lines draw left to right, each school's logomark rides the tip (video + final still; scrubbable in the viewer) |
| `slide-2.html` | the FY 2024 ranking (still). With `?anim` it is the earlier re-ordering list, rendered as `slide-1-list.mp4` |
| `slide-3.html` … `slide-6.html` | Stanford's expenses, MIT over time, Rochester's move, administration against student services |
| `slide-7.html` | the Leland lockup animation (from `js/mark.js`) and the closing line (video + final still) |
| `base.css`, `base.js` | fonts, colours, the green scale for money figures, helpers, and the messages a slide exchanges with the viewer |
| `data.js`, `vendor/`, `logos/` | written by `build.py`: the data copy, unchanged copies of `js/mark.js`, `assets/brand/mark.svg`, `assets/leo/leo.js`, and trimmed school marks (`prep_logos.py`) |
| `build.py` | renders everything into the folder above |
| `verify.py` | recomputes every number shown or spoken from the data file and compares it with the rendered slides |
| `test_viewer.py` | drives the viewer in a phone and a desktop window (navigation, scrubbing, sound, narration, captions) |

## Rebuild

From this folder:

    python3 build.py            # everything: stills, videos with music, all.png, film.png, PDF, zip
    python3 build.py stills     # only slides 2 to 6
    python3 build.py v1         # slide 1 (mp4 with music, gif, png, film.png)
    python3 build.py list       # slide-1-list.mp4
    python3 build.py v7         # slide 7 (mp4 with music, gif, png)
    python3 build.py sheets pack
    python3 verify.py           # prints "N checks, 0 mismatches" when the slides match the file
    python3 test_viewer.py      # prints "N viewer checks passed, 0 failed"

`build.py` starts its own local web server, opens each page in Chromium through Playwright, steps the animations frame by frame at 30 fps (`window.seek(t)`, `window.DURATION`), and encodes with ffmpeg (H.264, yuv420p, crf 18; AAC music bed at about -16 LUFS). Needs Python Playwright, Pillow, numpy and ffmpeg.

## Editing

- Headlines: the `<h1>` in each slide; `<em>` marks the one blue phrase. Slide 7's line is the `LINE` constant, with `[brackets]` for the blue phrase.
- Narration: the `NARRATION` list at the top of `../index.html` (`narration.txt` is a copy). A recorded voice goes in `../narration/` and is listed in `RECORDED` just below it.
- Music: `MUSIC` near the top of `build.py` (copied to `../music.mp3`).
- Slide 1 timing: `HOLD0`, `PER`, `SETTLE`, `HOLD1`, `RESET` at the top of its script.
- Numerals use Helvetica Neue where it is installed, then Helvetica, then a metric-compatible stand-in.
