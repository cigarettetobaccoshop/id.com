const fs = require('fs')
const path = require('path')

const requiredFiles = [
  'pages/index.js',
  'pages/products.js',
  'pages/contact.js',
  'pages/checkout.js',
  'pages/api/products.js',
  'pages/api/orders.js',
  'pages/api/health.js',
  'pages/_app.js',
  'lib/supabaseClient.js',
  'styles/mobile-lock.css',
  'styles/r2-canva-system.css',
  'next.config.js',
  'vercel.json',
]

for (const file of requiredFiles) {
  const absolute = path.join(process.cwd(), file)
  if (!fs.existsSync(absolute)) throw new Error(`Missing required file: ${file}`)
}

const products = fs.readFileSync(path.join(process.cwd(), 'pages/products.js'), 'utf8')
const apiProducts = fs.readFileSync(path.join(process.cwd(), 'pages/api/products.js'), 'utf8')
const orders = fs.readFileSync(path.join(process.cwd(), 'pages/api/orders.js'), 'utf8')
const checkout = fs.readFileSync(path.join(process.cwd(), 'pages/checkout.js'), 'utf8')
const health = fs.readFileSync(path.join(process.cwd(), 'pages/api/health.js'), 'utf8')
const app = fs.readFileSync(path.join(process.cwd(), 'pages/_app.js'), 'utf8')
const mobile = fs.readFileSync(path.join(process.cwd(), 'styles/mobile-lock.css'), 'utf8')
const canva = fs.readFileSync(path.join(process.cwd(), 'styles/r2-canva-system.css'), 'utf8')

for (const marker of ["getServerSideProps", "from('R2 NUSANTARA')", "eq('Published',true)"]) {
  if (!products.includes(marker)) throw new Error(`Catalog SSR marker missing: ${marker}`)
}
if (!products.includes("eq('Status','active')")) throw new Error('Catalog active-status marker missing')
if (!apiProducts.includes(".limit(limit)")) throw new Error('Products API limit handling missing')
if (!apiProducts.includes("count: 'exact'")) throw new Error('Products API exact count missing')
if (!orders.includes("PAYMENT_METHODS")) throw new Error('Order payment validation missing')
if (!orders.includes("Variant Inventory Qty")) throw new Error('Server-side stock validation missing')
if (!checkout.includes("fetch('/api/orders'")) throw new Error('Checkout order API integration missing')
if (!health.includes("active_products")) throw new Error('Production health catalog check missing')
if (!app.includes("mobile-lock.css")) throw new Error('Global mobile lock is not registered')
if (!app.includes("r2-canva-system.css")) throw new Error('Canva design system is not registered')
if (!mobile.includes('@media (max-width:620px)')) throw new Error('Mobile breakpoint missing')
if (!canva.includes('--r2-gold')) throw new Error('Canva visual token system missing')

console.log('R2 NUSANTARA production smoke test: PASS')
