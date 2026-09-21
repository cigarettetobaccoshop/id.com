const fs = require('fs')
const path = require('path')

const root = process.cwd()
const stylesRoot = path.join(root, 'styles')
const defaultUrls = [
  '/',
  '/products',
  '/katalog',
  '/lokasi',
  '/checkout',
  '/login',
  '/admin/dashboard'
]
const baseUrl = process.env.CSS_AUDIT_BASE_URL || 'https://r2nusantara-shop.vercel.app'
const urls = (process.env.CSS_AUDIT_PATHS || defaultUrls.join(',')).split(',').map(s => s.trim()).filter(Boolean)

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (['node_modules', '.next', '.git'].includes(entry.name)) continue
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) walk(full, out)
    else out.push(full)
  }
  return out
}

function cssFiles() {
  return walk(stylesRoot).filter(file => file.endsWith('.css'))
}

function stripCssComments(css) {
  return css.replace(/\/\*[\s\S]*?\*\//g, '')
}

function extractRules(css, file) {
  const clean = stripCssComments(css)
  const rules = []
  const re = /(^|})\s*([^@{}][^{}]*)\{([^{}]*)\}/g
  for (const match of clean.matchAll(re)) {
    const selectorText = match[2].trim()
    const body = match[3].trim()
    for (const selector of selectorText.split(',').map(s => s.trim()).filter(Boolean)) {
      const declarations = body.split(';').map(s => s.trim()).filter(Boolean).map(d => d.split(':')[0].trim()).filter(Boolean)
      rules.push({ file: path.relative(root, file), selector, declarations })
    }
  }
  return rules
}

function extractMarkupTokens(html) {
  const classes = new Set()
  const ids = new Set()
  for (const m of html.matchAll(/\bclass(?:Name)?=(?:"([^"]*)"|'([^']*)')/g)) {
    const value = m[1] || m[2] || ''
    value.split(/\s+/).filter(Boolean).forEach(v => classes.add(v))
  }
  for (const m of html.matchAll(/\bid=(?:"([^"]*)"|'([^']*)')/g)) {
    const value = m[1] || m[2]
    if (value) ids.add(value)
  }
  return { classes, ids }
}

function selectorReferenced(selector, tokens) {
  const classNames = [...selector.matchAll(/\.([A-Za-z0-9_-]+)/g)].map(m => m[1])
  const ids = [...selector.matchAll(/#([A-Za-z0-9_-]+)/g)].map(m => m[1])
  if (classNames.some(c => tokens.classes.has(c))) return true
  if (ids.some(i => tokens.ids.has(i))) return true
  if (!classNames.length && !ids.length) return true
  return false
}

async function fetchPage(pathname) {
  const url = new URL(pathname, baseUrl).toString()
  const response = await fetch(url, { redirect: 'follow' })
  if (!response.ok) throw new Error(`HTTP ${response.status} for ${url}`)
  return { url, html: await response.text() }
}

async function main() {
  const pages = []
  for (const pathname of urls) {
    try {
      pages.push({ pathname, ...(await fetchPage(pathname)) })
    } catch (error) {
      pages.push({ pathname, error: error.message })
    }
  }

  const globalTokens = { classes: new Set(), ids: new Set() }
  for (const page of pages) {
    if (!page.html) continue
    const tokens = extractMarkupTokens(page.html)
    tokens.classes.forEach(v => globalTokens.classes.add(v))
    tokens.ids.forEach(v => globalTokens.ids.add(v))
  }

  const inventory = []
  for (const file of cssFiles()) {
    const css = fs.readFileSync(file, 'utf8')
    for (const rule of extractRules(css, file)) {
      const referenced = selectorReferenced(rule.selector, globalTokens)
      inventory.push({
        ...rule,
        renderedReference: referenced ? 'MATCHED_RENDERED_MARKUP' : 'NO_MATCH_IN_RENDERED_SNAPSHOTS'
      })
    }
  }

  const summary = {
    baseUrl,
    routesRequested: urls,
    routesFetched: pages.filter(p => p.html).length,
    routeFetchFailures: pages.filter(p => p.error).length,
    cssFiles: new Set(inventory.map(r => r.file)).size,
    selectors: inventory.length,
    matchedSelectors: inventory.filter(r => r.renderedReference === 'MATCHED_RENDERED_MARKUP').length,
    unmatchedSelectors: inventory.filter(r => r.renderedReference === 'NO_MATCH_IN_RENDERED_SNAPSHOTS').length,
    deletionPolicy: 'NO_MATCH_IN_RENDERED_SNAPSHOTS is NOT safe-to-delete; verify dynamic selectors, pseudo/selectors, media queries, imports, and cascade ownership before deletion.'
  }

  console.log(JSON.stringify({ summary, pages: pages.map(p => ({ pathname: p.pathname, url: p.url, error: p.error || null })), inventory }, null, 2))
}

main().catch(error => {
  console.error(error.stack || error.message)
  process.exitCode = 1
})
