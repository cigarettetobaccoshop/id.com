const fs = require('fs')
const path = require('path')

const root = process.cwd()
const stylesRoot = path.join(root, 'styles')
const app = fs.readFileSync(path.join(root, 'pages/_app.js'), 'utf8')

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

function extractImports(fileContent) {
  return [...fileContent.matchAll(/@import\s+(?:url\()?['"]([^'"]+\.css)['"]\)?\s*;/g)].map(m => m[1])
}

function resolveCssImport(fromFile, importPath) {
  if (importPath.startsWith('/')) return path.join(root, importPath.slice(1))
  return path.resolve(path.dirname(fromFile), importPath)
}

const registered = []
function registerCss(filePath, chain = []) {
  const normalized = path.resolve(filePath)
  if (registered.some(item => item.file === normalized)) return
  const relative = path.relative(stylesRoot, normalized)
  const item = { file: normalized, relative, chain: [...chain], missing: !fs.existsSync(normalized) }
  registered.push(item)
  if (item.missing) return
  const css = fs.readFileSync(normalized, 'utf8')
  for (const imported of extractImports(css)) {
    registerCss(resolveCssImport(normalized, imported), [...chain, relative])
  }
}

const directImports = [...app.matchAll(/import ['"]\.\.\/styles\/([^'"]+\.css)['"]/g)].map(m => m[1])
for (const file of directImports) registerCss(path.join(stylesRoot, file))

function selectorTokens(selector) {
  const classes = [...selector.matchAll(/\.([A-Za-z0-9_-]+)/g)].map(m => m[1])
  const ids = [...selector.matchAll(/#([A-Za-z0-9_-]+)/g)].map(m => m[1])
  return { classes, ids }
}

function selectorIsReferenced(selector) {
  const { classes, ids } = selectorTokens(selector)
  const classHit = classes.some(token =>
    source.includes(`className="${token}`) ||
    source.includes(`className='${token}`) ||
    source.includes(`'${token}'`) ||
    source.includes(`"${token}"`) ||
    source.includes(`.${token}`)
  )
  const idHit = ids.some(token =>
    source.includes(`id="${token}"`) ||
    source.includes(`id='${token}'`) ||
    source.includes(`#${token}`)
  )
  return classHit || idHit
}

function auditFile(item) {
  if (item.missing) return {
    file: item.relative,
    status: 'MISSING',
    rules: 0,
    referencedSelectors: 0,
    unreferencedSelectors: 0,
    declarations: 0,
    transitive: item.chain.length > 0,
    importedBy: item.chain
  }

  const css = fs.readFileSync(item.file, 'utf8')
  const selectorMatches = [...css.matchAll(/(^|[}])\s*([^@{}][^{}]*)\{/g)]
  const selectors = selectorMatches
    .flatMap(m => m[2].split(','))
    .map(s => s.trim())
    .filter(Boolean)

  const referencedSelectors = selectors.filter(selectorIsReferenced)
  const declarations = (css.match(/(?:^|[;{])\s*[-_a-zA-Z][-_a-zA-Z0-9]*\s*:/g) || []).length
  const status =
    referencedSelectors.length > 0 ? 'ACTIVE_OR_SHARED' :
    'UNKNOWN_STATIC_MAPPING'

  return {
    file: item.relative,
    status,
    rules: selectors.length,
    referencedSelectors: referencedSelectors.length,
    unreferencedSelectors: Math.max(0, selectors.length - referencedSelectors.length),
    declarations,
    transitive: item.chain.length > 0,
    importedBy: item.chain
  }
}

const report = registered.map(auditFile)
const summary = {
  directCssImports: directImports.length,
  registeredCssFiles: report.length,
  missingImports: report.filter(r => r.status === 'MISSING').length,
  activeOrSharedCandidates: report.filter(r => r.status === 'ACTIVE_OR_SHARED').length,
  unknownStaticMapping: report.filter(r => r.status === 'UNKNOWN_STATIC_MAPPING').length,
  totalRules: report.reduce((n, r) => n + r.rules, 0),
  totalReferencedSelectors: report.reduce((n, r) => n + r.referencedSelectors, 0),
  totalDeclarations: report.reduce((n, r) => n + r.declarations, 0)
}

console.log('R2 CSS declaration-level audit')
console.log(JSON.stringify(summary, null, 2))
for (const item of report) console.log(JSON.stringify(item))

// This audit is intentionally conservative: UNKNOWN_STATIC_MAPPING is never
// treated as safe-to-delete because runtime/dynamic class composition can
// evade static source matching. Only missing imports fail the smoke gate.
if (summary.missingImports) process.exitCode = 1
