let raw = ''
for await (const chunk of process.stdin) raw += chunk

let filePath = ''
try {
  filePath = JSON.parse(raw || '{}').tool_input?.file_path ?? ''
} catch {
  process.exit(0)
}

if (/(^|\/)(dist|node_modules)\//.test(filePath)) {
  console.error(
    `Refusing to write ${filePath}.\n` +
      'dist/ and node_modules/ are generated and git-ignored, so the change would be lost.\n' +
      'Edit the source in src/ or a root .html file, then run npm run build.'
  )
  process.exit(2)
}
process.exit(0)
