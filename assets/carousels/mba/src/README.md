# MBA carousel: "What does it take to get an MBA?"

Seven 1080×1350 slides rendered from the HTML in this folder, plus the swipeable viewer one level up (`../index.html`). The system is copied from `../../admin-spend/`. Every number is read from `facts.json` (through `data.js`, a straight copy that `build.py` writes so the pages also open from disk); `facts.json` is transcribed from `docs/research/viral-mba.md`, and `verify.py` re-reads that file's tables to check the transcription. Nothing is typed in by hand except the headlines and the narration lines.

| file | what it is |
|---|---|
| `slide-1.html` | the question, word by word, then the seven school marks one at a time (video + final still) |
| `slide-2.html` | GMAT Focus by school on one axis, 675 to 695; schools with the same score stack; each labelled median or average |
| `slide-3.html` | GPA by school, a point per school on one axis |
| `slide-4.html` | average years of work experience, bars from zero; Harvard's middle 80% as a line |
| `slide-5.html` | essays and recommendations asked for, one square per piece; an outlined square is a recommendation dropped this cycle |
| `slide-6.html` | acceptance rate, Class of 2027, ranked bars with applications and enrolled |
| `slide-7.html` | the Leland end slide: only the line is set here; the slide itself is `../../_shared/end-slide.js` and `.css`, shared by every post |
| `slide-table.html` | table versions of slides 2, 3, 4 and 6 (`?m=gmat`, `gpa`, `work`, `admit`), rendered as `slide-N-table.png` |
| `facts.json` | the numbers, and `hold`: figures the research file asks to confirm before publishing, which the slides leave off |
| `base.css`, `base.js` | fonts, colours, the green scale for figures, helpers, and the messages a slide exchanges with the viewer |
| `data.js`, `vendor/`, `logos/` | written by `build.py`: the facts copy, unchanged copies of `assets/brand/mark.svg`, `assets/brand/logo.svg`, `assets/leo/leo.js`, and trimmed school marks (`prep_logos.py`) |
| `build.py` | renders everything into the folder above |
| `verify.py` | checks every number shown or spoken against the research file and the rendered slides |
| `test_viewer.py` | drives the viewer in a phone and a desktop window (navigation, isolating a school, sound, narration, captions) |

## Rebuild

From this folder:

    python3 build.py            # everything: stills, slide 1 video with music, alt stills, all.png, film.png, PDF, zip
    python3 build.py stills     # only slides 2 to 6
    python3 build.py v1         # slide 1 (mp4 with music, gif, png, film.png)
    python3 build.py alt        # ../alt/: slides 2 and 4 with Chicago Booth shown
    python3 build.py sheets pack
    python3 verify.py           # prints "N checks, 0 mismatches" when the slides match the file
    python3 test_viewer.py      # prints "N viewer checks passed, 0 failed"

Needs Python Playwright, Pillow, numpy and ffmpeg.

## Held figures

`facts.json` → `hold` lists three things the research file flags: Chicago Booth's GMAT Focus score, Booth's years of work experience, and MIT Sloan's essay count. A held figure is not drawn, and slides 2 and 4 say "Chicago Booth is not shown." in the source line. To show one, delete its line from `hold` and rebuild (adding `?all` to a slide's address shows them without editing the file; that is how `../alt/` is made).

## Editing

- Headlines: the `<h1>` in each slide; `<em>` marks the one blue phrase. Slide 1's line is the `LINE` constant, with `[brackets]` for the blue phrase and `/` for a line break.
- Narration: the `NARRATION` list at the top of `../index.html` (`narration.txt` is a copy). A recorded voice goes in `../narration/` and is listed in `RECORDED` just below it.
- Music: `MUSIC` near the top of `build.py` (copied to `../music.mp3`).
- Slide 1 timing: the constants at the top of its script.
- Numerals use Helvetica Neue where it is installed, then Helvetica, then a metric-compatible stand-in.
