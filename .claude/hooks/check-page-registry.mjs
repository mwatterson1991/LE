import path from 'node:path'
import { spawnSync } from 'node:child_process'

let raw = ''
for await (const chunk of process.stdin) raw += chunk

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

console.error(`${rel} changed and the page registry check now fails:\n\n${result.stdout}`)
process.exit(2)
