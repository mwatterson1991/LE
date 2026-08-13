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
