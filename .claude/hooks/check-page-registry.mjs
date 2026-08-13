import path from 'node:path'
import { spawnSync } from 'node:child_process'

let raw = ''
try {
  for await (const chunk of process.stdin) raw += chunk
} catch {
  process.exit(0)
}

const root = process.env.CLAUDE_PROJECT_DIR ?? process.cwd()
let filePath = ''
try {
  filePath = JSON.parse(raw || '{}').tool_input?.file_path ?? ''
} catch {
  process.exit(0)
}

if (!filePath) process.exit(0)
const rel = path.relative(root, filePath)
if (!/^[^/]+\.html$/.test(rel)) process.exit(0)

const result = spawnSync('node', [path.join(root, 'scripts/checks/registry.mjs')], {
  cwd: root,
  encoding: 'utf8',
})
if (result.status === 0) process.exit(0)

const detail = result.stdout
  ? result.stdout
  : `The check script itself crashed before it could run.
This usually means a file it imports has a syntax error. vite.config.js is the
most likely one.
Fix: run \`npm run check\` in your terminal to see the real error.`
console.error(`${rel} changed and the page registry check now fails:\n\n${detail}`)
process.exit(2)
