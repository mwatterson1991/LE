---
name: add-an-image
description: >
  Add, replace, or shrink an image or video in this repo. Use when the user
  wants a new photo, hero image, logo, screenshot, or video on a page, when
  they hand over a file from a camera, a phone, or a stock site, or when the
  asset size check fails in a pull request.
---

# Add an image

The budget is **400 KB per image** and **2 MB per video**. Camera and stock
exports run 20 to 40 times over it. Shrink the file **before** you commit it.

Page weight decides conversion on this site. This is not housekeeping.

## Resize with sips

`sips` ships with macOS, so it needs no install.

Photos and screenshots:

```bash
sips -Z 1600 -s format jpeg -s formatOptions 72 input.jpg --out public/assets/images/name.jpg
```

`-Z 1600` caps the longest side at 1600 pixels and keeps the aspect ratio.
`formatOptions 72` sets JPEG quality. A real example from this repo: a 12 MB
file at 7952 by 5304 pixels became 254 KB at 1600 by 1067.

Use `-Z 2400` only for a full-bleed hero on a wide screen. Use `-Z 800` for a
card or thumbnail.

Images that need transparency stay PNG:

```bash
sips -Z 1200 input.png --out public/logos/name.png
```

Do not ask `sips` to write WebP. It cannot, and it fails with
`Can't write format: org.webmproject.webp`.

## Video

Check for `ffmpeg` first, because it is not installed everywhere:

```bash
command -v ffmpeg || echo "ffmpeg missing: ask the user to shrink the video, or run: brew install ffmpeg"
ffmpeg -i input.mp4 -vf "scale=-2:1080" -vcodec libx264 -crf 30 -an public/assets/videos/name.mp4
```

`-an` drops the audio track. Background video on this site is always muted, and
the audio is pure page weight.

## Where files go

- `public/assets/images/` — photos and illustrations
- `public/logos/` — brand and partner logos
- `public/assets/videos/` — video

Reference them from the site root, not with a relative path:

```jsx
<img src="/assets/images/name.jpg" alt="A short description of the picture" />
```

Never write `../public/...`. That path breaks in the build.

## Avoid spaces in file names

Three current files have spaces, which forces `%20` in the reference and is
easy to get wrong. Use hyphens for anything new.

## Always write alt text

Describe what the picture shows. Leave `alt=""` only for pure decoration.

## Verify

```bash
ls -lh public/assets/images/name.jpg   # confirm under 400 KB
npm run check
```
