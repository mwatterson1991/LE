# Illustration prompts (ChatGPT image generation)

Claude does not draw illustrations. Generate each image below in ChatGPT, save it under the file name given, drop it in
`assets/illus/`, and the deck renderer (js/deck.js) picks it up on the next render. Until the file exists the slide draws a
code placeholder (stacked bars, a grid of circles, an arrow) or a library illustration from assets/illustrations/.

Shared style, paste before every prompt:

> Flat, minimal vector illustration on a plain white background. Exactly two colours: a soft blue (#80ACED) for fills and
> near-black ink (#010101) for lines, nothing else. Thin even line weight, no gradients, no shadows, no texture, no 3D,
> no text, no letters, no numbers, no logos. Generous empty space around the subject. Landscape 4:3.

## Leland x SheerID deck (data/decks/sheerid.json)

### `sheerid-cover.png` (slide 1, cover; this one sits on a black field)
Same style but on a plain black (#010101) background with white lines and soft blue (#80ACED) fills. Five flat horizontal
bands stacked like strata, each a little narrower than the one below, the bottom band filled blue, the others outlined in
white. A small simple figure of a person standing on the top band, seen from behind, looking at a horizon line. Landscape 4:3.

### `sheerid-partner.png` (slide 5, "Proven at scale")
A long row of simple identical people figures seen from the front, dozens of them receding into the distance, drawn in ink
line; the three nearest figures filled blue. Suggests a whole workforce. No faces detailed, no text.

### `sheerid-layers.png` (slide 6, "End-to-end layered support")
Five flat horizontal layers stacked, widest at the bottom, each slightly inset, drawn as outlined slabs in ink; the bottom
slab filled blue. A small ladder leaning against the stack from the ground to the top layer. Nothing else.

### `sheerid-sprint.png` (slide 7, "Squads walk into AKO with working agents to demo")
Three small simple people figures in ink line walking left to right toward an open double door, each carrying a flat
geometric object (a cube, a gear, a rectangle) filled blue. The door frame is ink line, the light inside the doorway is a
flat blue rectangle. No text.

### `sheerid-experts.png` (slide 21, "Domain experts who have run this inside their own function")
Six simple head-and-shoulders silhouettes in ink line arranged in a 3 x 2 grid, each inside a thin outlined circle, with a
small flat blue shape beside each one (a chart bar, a gear, a shield, a cube, a speech bubble, a compass). No faces, no text.

### `sheerid-measured.png` (slide 23, "How progress gets measured")
Three tall flat bars rising left to right, outlined in ink, the tallest filled blue, with a thin ink line tracing their tops
and a small simple magnifying glass resting against the first bar. No axis labels, no numbers, no text.
