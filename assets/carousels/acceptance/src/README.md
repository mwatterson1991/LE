# Acceptance-rate carousel

Seven 1080×1350 slides rendered from the HTML in this folder, plus the swipeable viewer one level up (`../index.html`). The system is the admin-spend carousel's. Every number is read from `data/lists/ipeds-acceptance.json` (through `data.js`, a straight copy that `build.py` writes so the pages also open from disk); nothing is typed in by hand except the headlines and the narration lines.

| file | what it is |
|---|---|
| `slide-1.html` | acceptance rates over time, fall 2014 to fall 2023: lines draw left to right, each school's mark rides the tip; the rate axis runs upside down (0% at the top) and says so |
| `slide-2.html` | the fall 2023 ranking as a table (still). With `?anim` it is slide 1 as a table, rendered as `slide-1-table.mp4` |
| `slide-2-graph.html` | slide 2 as bars (`slide-2-graph.png`) |
| `slide-3.html` … `slide-6.html` | Northeastern; applications in fall 2020 and 2021; five schools 2014 and 2023; applied and admitted as squares |
| `slide-7.html` | the Leland end slide: only the line is set here; the slide itself is `../../_shared/end-slide.js` and `.css` |
| `base.css`, `base.js` | fonts, colours, the green scale (deeper = lower rate), helpers, the messages a slide exchanges with the viewer |
| `data.js`, `vendor/`, `logos/` | written by `build.py`: the data copy and the list of marks that exist, copies of `mark.svg` and `leo.js`, trimmed school marks (`prep_logos.py`) |
| `build.py`, `verify.py`, `test_viewer.py` | render everything; recompute every number from the file and compare; drive the viewer |

If a school's mark is missing from `assets/orgs/uni/`, every slide that would show it names all of its schools in type instead (never a mix), and `build.py` prints which were missing.

## Rebuild

    python3 build.py            # everything: stills, videos with music, all.png, film.png, film-table.png, PDF, zip
    python3 build.py stills | v1 | list | v7 | sheets | pack
    python3 verify.py
    python3 test_viewer.py

## Editing

- Headlines: the `<h1>` in each slide (slide 2 and its `?anim` version set theirs in the script); `<em>` marks the one blue phrase.
- Narration: the `NARRATION` list at the top of `../index.html` (`narration.txt` is a copy).
- Slide 1 timing: `HOLD0`, `PER`, `SETTLE`, `HOLD1`, `RESET` at the top of its script.
