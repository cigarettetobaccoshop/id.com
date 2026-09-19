const fs = require('fs')
const path = require('path')

const requiredFiles = [
  'pages/index.js',
  'pages/products.js',
  'pages/contact.js',
  'pages/checkout.js',
  'pages/auth.js',
  'pages/auth/callback.js',
  'pages/login.js',
  'pages/admin/dashboard.js',
  'pages/api/admin/session.js',
  'pages/api/admin/orders.js',
  'pages/api/products.js',
  'pages/api/orders.js',
  'pages/api/health.js',
  'pages/_app.js',
  'lib/supabaseClient.js',
  'lib/supabaseAdminBrowser.js',
  'middleware.ts',
  'styles/mobile-lock.css',
  'styles/r2-premium.css',
  'styles/catalog-modern.css',
  'styles/catalog-mobile-grid.css',
  'styles/homepage-experience.css',
  'styles/r2-cross-page-theme-final.css',
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
const auth = fs.readFileSync(path.join(process.cwd(), 'pages/auth.js'), 'utf8')
const callback = fs.readFileSync(path.join(process.cwd(), 'pages/auth/callback.js'), 'utf8')
const health = fs.readFileSync(path.join(process.cwd(), 'pages/api/health.js'), 'utf8')
const adminLogin = fs.readFileSync(path.join(process.cwd(), 'pages/login.js'), 'utf8')
const adminDashboard = fs.readFileSync(path.join(process.cwd(), 'pages/admin/dashboard.js'), 'utf8')
const adminSession = fs.readFileSync(path.join(process.cwd(), 'pages/api/admin/session.js'), 'utf8')
const adminOrders = fs.readFileSync(path.join(process.cwd(), 'pages/api/admin/orders.js'), 'utf8')
const adminBrowser = fs.readFileSync(path.join(process.cwd(), 'lib/supabaseAdminBrowser.js'), 'utf8')
const adminAuthorization = fs.readFileSync(path.join(process.cwd(), 'lib/admin/authorization.js'), 'utf8')
const middleware = fs.readFileSync(path.join(process.cwd(), 'middleware.ts'), 'utf8')
const homepage = fs.readFileSync(path.join(process.cwd(), 'components/HomepageExperience.js'), 'utf8')
const app = fs.readFileSync(path.join(process.cwd(), 'pages/_app.js'), 'utf8')
const mobile = fs.readFileSync(path.join(process.cwd(), 'styles/mobile-lock.css'), 'utf8')
const theme = fs.readFileSync(path.join(process.cwd(), 'styles/r2-cross-page-theme-final.css'), 'utf8')

if (!products.includes(".from('products')")) throw new Error('Catalog must use public.products source of truth')
if (!products.includes(".eq('is_active', true)")) throw new Error('Catalog active-status filter missing')
if (!products.includes("select(COLUMNS")) throw new Error('Catalog schema mapping missing')
if (!apiProducts.includes('.limit(limit)')) throw new Error('Products API limit handling missing')
if (!apiProducts.includes("count: 'exact'")) throw new Error('Products API exact count missing')
if (!orders.includes('PAYMENT_METHODS')) throw new Error('Order payment validation missing')
if (!orders.includes(".select('id,name,price,category,is_active')")) throw new Error('Checkout catalog schema mapping missing')
if (!orders.includes('create_order_atomic')) throw new Error('Atomic order RPC integration missing')
if (!checkout.includes("fetch('/api/orders'")) throw new Error('Checkout order API integration missing')
if (!checkout.includes("localStorage.getItem('r2-cart')")) throw new Error('Guest cart persistence missing')
if (!auth.includes('Akun tetap opsional')) throw new Error('Optional account messaging missing')
if (!auth.includes('Lanjut sebagai Tamu')) throw new Error('Guest account bypass missing')
if (!callback.includes('exchangeCodeForSession')) throw new Error('OAuth callback exchange missing')
if (!health.includes(".from('products')")) throw new Error('Health check is not tied to public.products')
if (!adminLogin.includes('signInWithPassword')) throw new Error('Admin password authentication missing')
if (!adminLogin.includes('/api/admin/session')) throw new Error('Admin server verification missing')
if (!adminDashboard.includes('/api/admin/orders')) throw new Error('Admin dashboard order API integration missing')
if (!adminDashboard.includes('/api/admin/session')) throw new Error('Admin dashboard session verification missing')
if (!adminSession.includes('requireAdmin')) throw new Error('Admin session authorization guard missing')
if (!adminSession.includes('ADMIN_UUID')) throw new Error('Admin UUID verification missing')
if (!adminOrders.includes('SUPABASE_SERVICE_ROLE_KEY')) throw new Error('Admin order server credential guard missing')
if (!adminOrders.includes('requireAdmin')) throw new Error('Admin order authorization guard missing')
if (!adminBrowser.includes('createBrowserSupabaseClient')) throw new Error('Cookie-based admin browser client missing')
if (!adminAuthorization.includes('verifyAdminToken')) throw new Error('Central admin authorization guard missing')
if (!middleware.includes('supabase.auth.getUser()')) throw new Error('Admin middleware Auth validation missing')
if (!homepage.includes('Login Admin')) throw new Error('Admin login navigation missing from site drawer')
if (!app.includes('mobile-lock.css')) throw new Error('Global mobile lock is not registered')
if (!app.includes('r2-cross-page-theme-final.css')) throw new Error('Canonical visual system is not registered')
if (!mobile.includes('@media (max-width:620px)')) throw new Error('Mobile breakpoint missing')
if (!theme.includes('--r2-gold')) throw new Error('Canonical visual token system missing')

const cssImports = [...app.matchAll(/import ['"]\.\.\/styles\/([^'"]+\.css)['"]/g)].map(m => m[1])
const duplicateImports = cssImports.filter((name, index) => cssImports.indexOf(name) !== index)
if (duplicateImports.length) throw new Error(`Duplicate global CSS import: ${duplicateImports.join(', ')}`)

console.log('R2 NUSANTARA production smoke test: PASS')
