const fs = require('fs')
const path = require('path')

const requiredFiles = [
  'pages/index.js',
  'pages/products.js',
  'pages/contact.js',
  'pages/_app.js',
  'lib/supabaseClient.js',
  'styles/mobile-lock.css',
  'next.config.js',
  'vercel.json',
]

for (const file of requiredFiles) {
  const absolute = path.join(process.cwd(), file)
  if (!fs.existsSync(absolute)) throw new Error(`Missing required file: ${file}`)
}

const products = fs.readFileSync(path.join(process.cwd(), 'pages/products.js'), 'utf8')
const app = fs.readFileSync(path.join(process.cwd(), 'pages/_app.js'), 'utf8')
const mobile = fs.readFileSync(path.join(process.cwd(), 'styles/mobile-lock.css'), 'utf8')

for (const marker of ["getServerSideProps", "from('R2 NUSANTARA')", "eq('Published', true)"]) {
  if (!products.includes(marker)) throw new Error(`Catalog SSR marker missing: ${marker}`)
}
if (!app.includes("mobile-lock.css")) throw new Error('Global mobile lock is not registered')
if (!mobile.includes('@media (max-width:620px)')) throw new Error('Mobile breakpoint missing')

console.log('R2 NUSANTARA smoke test: PASS')
