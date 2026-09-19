const fs = require('fs')
const path = require('path')

const root = process.cwd()
const app = fs.readFileSync(path.join(root, 'pages/_app.js'), 'utf8')
const cssImports = [...app.matchAll(/import ['"]\.\.\/styles\/([^'"]+\.css)['"]/g)].map(m => m[1])

const sourceFiles = []
function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (['node_modules', '.next', '.git'].includes(entry.name)) continue
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) walk(full)
    else if (/\.(js|jsx|ts|tsx|html)$/.test(entry.name)) sourceFiles.push(full)
  }
}
walk(root)

const source = sourceFiles.map(file => fs.readFileSync(file, 'utf8')).join('\n')
const report = []
let missingImports = 0

for (const file of cssImports) {
  const full = path.join(root, 'styles', file)
  if (!fs.existsSync(full)) {
    missingImports++
    report.push({ file, status: 'MISSING', rules: 0, referencedSelectors: 0 })
    continue
  }

  const css = fs.readFileSync(full, 'utf8')
  const selectorMatches = [...css.matchAll(/(^|[}])\\s*([^@{}][^{}]*)\\{/g)]
  const selectors = selectorMatches
    .flatMap(m => m[2].split(','))
    .map(s => s.trim())
    .filter(Boolean)

  const referenced = selectors.filter(selector => {
    const clean = selector
      .replace(/::?[a-z-]+(?:\\([^)]*\\))?/gi, '')
      .replace(/\\[[^\\]]+\\]/g, '')
      .replace(/[.#][a-zA-Z0-9_-]+/g, match => match)
    const classes = [...clean.matchAll(/\\.([a-zA-Z0-9_-]+)/g)].map(m => m[1])
    const ids = [...clean.matchAll(/#([a-zA-Z0-9_-]+)/g)].map(m => m[1])
    return classes.some(c => source.includes('className="' + c) || source.includes('className={' + "'" + c) || source.includes('.' + c)) ||
      ids.some(id => source.includes('id="' + id) || source.includes('#' + id))
  })

  report.push({
    file,
    status: 'OK',
    rules: selectors.length,
    referencedSelectors: referenced.length,
    unreferencedSelectors: Math.max(0, selectors.length - referenced.length)
  })
}

const summary = {
  cssImports: cssImports.length,
  missingImports,
  filesWithPotentiallyUnreferencedSelectors: report.filter(r => r.unreferencedSelectors > 0).length,
  totalRules: report.reduce((n, r) => n + (r.rules || 0), 0),
  totalReferencedSelectors: report.reduce((n, r) => n + (r.referencedSelectors || 0), 0)
}

console.log('R2 CSS declaration-level audit')
console.log(JSON.stringify(summary, null, 2))
for (const item of report) console.log(JSON.stringify(item))

if (missingImports) process.exitCode = 1
