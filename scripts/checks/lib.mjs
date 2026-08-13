import fs from 'node:fs'
import path from 'node:path'

export const ROOT = path.resolve(process.env.CHECK_ROOT ?? process.cwd())

export function rootPages() {
  return fs.readdirSync(ROOT).filter(f => f.endsWith('.html'))
}

export function sourceFiles(pattern = /\.(jsx?|css)$/) {
  const files = rootPages().map(f => path.join(ROOT, f))
  const src = path.join(ROOT, 'src')
  if (fs.existsSync(src)) {
    for (const rel of fs.readdirSync(src, { recursive: true })) {
      if (pattern.test(rel)) files.push(path.join(src, rel))
    }
  }
  return files
}

export function reporter(name) {
  const problems = []
  return {
    fail(title, lines) {
      problems.push(`✗ ${title}\n${lines.map(line => `  ${line}`).join('\n')}`)
    },
    finish(summary) {
      if (problems.length) {
        console.log(problems.join('\n\n'))
        console.log(`\n${problems.length} problem(s) found. Nothing was changed.`)
        process.exit(1)
      }
      console.log(`✓ ${name}: ${summary}`)
    },
  }
}

const BUDGETS = [
  {
    kind: 'video',
    match: /\.(mp4|webm|mov)$/i,
    limit: 2 * 1024 * 1024,
    fix: rel => `ffmpeg -i "${rel}" -vf "scale=-2:1080" -vcodec libx264 -crf 30 -an "${rel}.small.mp4"`,
  },
  {
    kind: 'raster',
    match: /\.(png|jpe?g|webp|gif|avif)$/i,
    limit: 400 * 1024,
    fix: rel => `sips -Z 1600 -s format jpeg -s formatOptions 72 "${rel}" --out "/tmp/sips-resize-${path.basename(rel)}"`,
  },
  {
    kind: 'svg',
    match: /\.svg$/i,
    limit: 400 * 1024,
    fix: () => 'Re-export the SVG with fewer points, or use a PNG instead.',
  },
  {
    kind: 'other',
    match: /\.(woff2?|pdf|ico|ics)$/i,
    limit: 2 * 1024 * 1024,
    fix: () => 'Compress the file, or ask an engineer whether it belongs in the repo.',
  },
]

export function assetBudget(rel) {
  return BUDGETS.find(entry => entry.match.test(rel)) ?? null
}
