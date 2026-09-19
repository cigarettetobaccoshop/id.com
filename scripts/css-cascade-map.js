const fs = require('fs')
const path = require('path')

const root = process.cwd()
const stylesRoot = path.join(root, 'styles')
const app = fs.readFileSync(path.join(root, 'pages/_app.js'), 'utf8')

function importsOf(text) {
  return [...text.matchAll(/(?:import ['"]\.\.\/styles\/([^'"]+\.css)['"]|@import\s+(?:url\()?['"]([^'"]+\.css)['"]\)?\s*;)/g)].map(m => m[1] || m[2])
}

const registered = []
function register(filePath, chain) {
  const absolute = path.resolve(filePath)
  if (registered.some(item => item.file === absolute)) return
  const relative = path.relative(stylesRoot, absolute)
  const item = { file: absolute, relative, chain: chain || [], missing: !fs.existsSync(absolute) }
  registered.push(item)
  if (item.missing) return
  const content = fs.readFileSync(absolute, 'utf8')
  for (const imported of importsOf(content)) {
    const resolved = imported.startsWith('/') ? path.join(root, imported.slice(1)) : path.resolve(path.dirname(absolute), imported)
    register(resolved, [...item.chain, relative])
  }
}

for (const direct of [...app.matchAll(/import ['"]\.\.\/styles\/([^'"]+\.css)['"]/g)].map(m => m[1])) register(path.join(stylesRoot, direct))

function stripComments(value) { return value.replace(/\/\*[\s\S]*?\*\//g, '') }
function specificity(selector) {
  return [
    (selector.match(/#[A-Za-z0-9_-]+/g) || []).length,
    (selector.match(/\.[A-Za-z0-9_-]+|\[[^\]]+\]|:(?!:)[A-Za-z0-9_-]+/g) || []).length,
    (selector.match(/(^|[ >+~])([A-Za-z][A-Za-z0-9_-]*)/g) || []).length
  ]
}
function sameSpecificity(a,b) { return a[0]===b[0] && a[1]===b[1] && a[2]===b[2] }

function parseRules(css, file) {
  const text = stripComments(css), rules = [], stack = []
  let i = 0
  while (i < text.length) {
    while (/\s/.test(text[i] || '')) i++
    const open = text.indexOf('{', i)
    if (open < 0) break
    const header = text.slice(i, open).trim()
    let depth = 1, j = open + 1
    while (j < text.length && depth) { if (text[j] === '{') depth++; else if (text[j] === '}') depth--; j++ }
    const body = text.slice(open + 1, j - 1)
    if (header.startsWith('@')) {
      stack.push(header)
      rules.push(...parseRules(body, file).map(rule => ({...rule, context:[...stack, ...(rule.context || [])]})))
      stack.pop()
    } else {
      for (const selector of header.split(',').map(s => s.trim()).filter(Boolean)) {
        const declarations = []
        for (const part of body.split(';')) {
          const colon = part.indexOf(':')
          if (colon < 1) continue
          const property = part.slice(0, colon).trim(), value = part.slice(colon + 1).trim()
          if (!/^-{0,2}[A-Za-z][\w-]*$/.test(property) || !value) continue
          declarations.push({property, value})
        }
        rules.push({file, selector, context:[...stack], specificity:specificity(selector), declarations})
      }
    }
    i = j
  }
  return rules
}

const rules = registered.filter(x => !x.missing).flatMap(x => parseRules(fs.readFileSync(x.file, 'utf8'), x.relative))
const candidates = []
for (let i=0; i<rules.length; i++) {
  const earlier = rules[i]
  for (const declaration of earlier.declarations) {
    for (let j=i+1; j<rules.length; j++) {
      const later = rules[j]
      if (earlier.selector !== later.selector) continue
      if (JSON.stringify(earlier.context) !== JSON.stringify(later.context)) continue
      if (!sameSpecificity(earlier.specificity, later.specificity)) continue
      if (!later.declarations.some(x => x.property===declaration.property && x.value===declaration.value)) continue
      candidates.push({earlierFile:earlier.file,selector:earlier.selector,context:earlier.context,property:declaration.property,value:declaration.value,laterFile:later.file,proof:'same selector + same at-rule context + same specificity + identical property/value; later source-order declaration shadows the earlier declaration whenever the same context applies'})
      break
    }
  }
}

const unique=[], seen=new Set()
for (const candidate of candidates) { const key=JSON.stringify(candidate); if (!seen.has(key)) { seen.add(key); unique.push(candidate) } }
console.log('R2 CSS cascade declaration map')
console.log(JSON.stringify({directCssImports:[...app.matchAll(/import ['"]\.\.\/styles\/([^'"]+\.css)['"]/g)].length,registeredCssFiles:registered.length,missingImports:registered.filter(x=>x.missing).map(x=>x.relative),safeExactDuplicateDeclarations:unique.length,candidates:unique},null,2))
if (registered.some(x=>x.missing)) process.exitCode=1