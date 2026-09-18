import Head from 'next/head'
import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/router'
import { getAdminSupabase } from '../../lib/supabaseAdminBrowser'

const ADMIN_UUID = '60c5525a-d68a-4b0f-b7fd-b9bd2371bf4a'
const STATUSES = ['pending','confirmed','shipped','completed','cancelled']
const LABELS = { pending:'Pending', confirmed:'Confirmed', shipped:'Shipped', completed:'Completed', cancelled:'Cancelled' }
const money = (v) => new Intl.NumberFormat('id-ID',{style:'currency',currency:'IDR',maximumFractionDigits:0}).format(Number(v)||0)
const dateTime = (v) => new Date(v).toLocaleString('id-ID',{dateStyle:'medium',timeStyle:'short'})

async function verifyAdminSession(session) {
  if (!session?.access_token) return false
  const response = await fetch('/api/admin/session', { headers:{ Authorization:`Bearer ${session.access_token}` }, cache:'no-store' })
  if (!response.ok) return false
  const body = await response.json().catch(() => ({}))
  return body.user?.id === ADMIN_UUID
}

export default function AdminDashboard() {
  const router = useRouter()
  const [session, setSession] = useState(null)
  const [orders, setOrders] = useState([])
  const [stats, setStats] = useState(null)
  const [reservations, setReservations] = useState([])
  const [audit, setAudit] = useState([])
  const [system, setSystem] = useState({ status:'checking', database:'checking' })
  const [filter, setFilter] = useState('all')
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState('')
  const [lastSync, setLastSync] = useState(null)

  async function load(currentSession = session) {
    if (!currentSession?.access_token) return
    setLoading(true); setError('')
    try {
      const qs = filter !== 'all' ? `?status=${encodeURIComponent(filter)}` : ''
      const [ordersResponse, healthResponse] = await Promise.all([
        fetch(`/api/admin/orders${qs}`, { headers:{ Authorization:`Bearer ${currentSession.access_token}` }, cache:'no-store' }),
        fetch('/api/health', { cache:'no-store' }),
      ])
      const body = await ordersResponse.json().catch(() => ({}))
      const health = await healthResponse.json().catch(() => ({}))
      if (!ordersResponse.ok) throw new Error(body.error || 'Gagal memuat dashboard')
      setOrders(body.orders || []); setStats(body.stats || null); setReservations(body.reservations || []); setAudit(body.audit_log || [])
      setSystem({ status:health.ok ? 'online' : 'degraded', database:health.database || 'unavailable', catalog:health.catalog?.active_products ?? 0, checkedAt:health.checked_at })
      setLastSync(new Date())
    } catch (err) { setError(err.message || 'Gagal memuat data'); setSystem((current) => ({ ...current, status:'degraded' })) }
    finally { setLoading(false) }
  }

  useEffect(() => {
    let active = true
    const client = getAdminSupabase()
    if (!client) return undefined
    client.auth.getSession().then(async ({ data }) => {
      if (!active) return
      if (!data.session) return router.replace('/login?next=/admin/dashboard')
      const verified = data.session.user?.id === ADMIN_UUID && await verifyAdminSession(data.session)
      if (!verified) { await client.auth.signOut(); if (active) router.replace('/'); return }
      if (active) setSession(data.session)
    }).catch(() => active && router.replace('/login?next=/admin/dashboard'))
    const { data: listener } = client.auth.onAuthStateChange((_event, next) => { if (active) setSession(next) })
    return () => { active = false; listener.subscription.unsubscribe() }
  }, [router])

  useEffect(() => { if (session) load(session) }, [session, filter])

  useEffect(() => {
    if (!session) return undefined
    let timer
    const sync = () => {
      if (document.visibilityState === 'visible') load(session)
    }
    timer = window.setInterval(sync, 15000)
    const onFocus = () => load(session)
    window.addEventListener('focus', onFocus)
    document.addEventListener('visibilitychange', onFocus)
    return () => {
      window.clearInterval(timer)
      window.removeEventListener('focus', onFocus)
      document.removeEventListener('visibilitychange', onFocus)
    }
  }, [session, filter])

  async function changeStatus(orderId, status) {
    if (!session) return
    setBusy(orderId); setError('')
    try {
      const response = await fetch('/api/admin/orders',{method:'PATCH',headers:{'Content-Type':'application/json',Authorization:`Bearer ${session.access_token}`},body:JSON.stringify({id:orderId,status}),cache:'no-store'})
      const body = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(body.error || 'Status gagal diperbarui')
      await load(session)
    } catch (err) { setError(err.message || 'Status gagal diperbarui') }
    finally { setBusy('') }
  }

  async function logout() {
    const client = getAdminSupabase(); await client?.auth.signOut(); window.location.replace('/')
  }

  const filteredOrders = useMemo(() => {
    const term = query.trim().toLowerCase()
    if (!term) return orders
    return orders.filter((order) => [order.order_number, order.customer_name, order.whatsapp, order.city, order.address, order.courier].filter(Boolean).join(' ').toLowerCase().includes(term))
  }, [orders, query])

  const operational = stats ? [
    ['Pending', Number(stats.pending)||0, 'pending'],
    ['Confirmed', Number(stats.confirmed)||0, 'confirmed'],
    ['Shipped', Number(stats.shipped)||0, 'shipped'],
    ['Completed', Number(stats.completed)||0, 'completed'],
  ] : []
  const operationalMax = Math.max(1, ...operational.map(([,value]) => value))

  return <>
    <Head><title>Admin Control Center — R2 NUSANTARA</title><meta name="robots" content="noindex,nofollow" /></Head>
    <main className="admin-page">
      <div className="ambient ambient-a"/><div className="ambient ambient-b"/>
      <header className="admin-header">
        <div className="brand"><div className="mark"><span>R2</span><i/></div><div><strong>R2 NUSANTARA</strong><span>ADMIN CONTROL CENTER · OPERATIONS</span></div></div>
        <div className="actions"><button onClick={()=>load()} disabled={loading} aria-label="Sinkronkan data"><span className={loading?'spin':''}>↻</span> Sinkronkan</button><button onClick={logout} className="logout">Keluar</button></div>
      </header>

      <section className="hero">
        <div className="hero-grid"><div><span className="eyebrow"><b className="live-dot"/> SECURE OPERATIONS · LIVE MONITORING</span><h1>Dashboard <em>Monitoring</em></h1><p>Command center untuk order, reservation, aktivitas audit, katalog, dan kesehatan sistem.</p></div><div className="hero-right"><div className={`system-pill ${system.status}`}><b>●</b><span>{system.status === 'online' ? 'SYSTEM ONLINE' : system.status === 'degraded' ? 'CHECK REQUIRED' : 'CHECKING'}</span><small>Production</small></div><a href="/" target="_blank" rel="noreferrer">Buka Website <b>↗</b></a></div></div>
        <div className="hero-meta"><span>ENV <b>PRODUCTION</b></span><span>DATABASE <b>{system.database === 'connected' ? 'CONNECTED' : String(system.database).toUpperCase()}</b></span><span>LAST SYNC <b>{lastSync ? lastSync.toLocaleTimeString('id-ID') : '—'}</b></span></div>
      </section>

      {stats && <section className="stats" aria-label="Ringkasan metrik"><div className="stat stat-primary"><span>Total Order</span><strong>{stats.total_orders}</strong><small>seluruh order tercatat</small><i>ORDERS</i></div><div className="stat"><span>Hari Ini</span><strong>{stats.today_orders}</strong><small>order masuk hari ini</small></div><div className="stat"><span>Pending</span><strong>{stats.pending}</strong><small>perlu perhatian</small></div><div className="stat"><span>Shipped</span><strong>{stats.shipped}</strong><small>dalam pengiriman</small></div><div className="stat"><span>Completed</span><strong>{stats.completed}</strong><small>selesai</small></div><div className="stat"><span>Cancelled</span><strong>{stats.cancelled}</strong><small>dibatalkan</small></div><div className="stat sales"><span>Total Penjualan</span><strong>{money(stats.total_sales)}</strong><small>akumulasi data order</small></div></section>}

      <section className="overview-grid">
        <div className="panel operations-panel"><div className="panel-head"><div><span className="section-kicker">OPERATIONS FLOW</span><h2>Alur Operasional</h2><p>Distribusi status order yang sedang terpantau.</p></div><span className="panel-badge">LIVE DATA</span></div><div className="flow-list">{operational.map(([label,value,status])=><div className="flow-row" key={status}><div className="flow-label"><span className={`status-mark ${status}`}/><b>{label}</b><strong>{value}</strong></div><div className="bar"><i style={{width:`${Math.max(4,(value/operationalMax)*100)}%`}}/></div></div>)}</div></div>
        <div className="panel system-panel"><div className="panel-head"><div><span className="section-kicker">SYSTEM PULSE</span><h2>Health Monitor</h2><p>Snapshot konektivitas production.</p></div><span className="pulse-ring"/></div><div className="system-list"><div><span>Database</span><b className={system.database==='connected'?'ok':''}>● {system.database === 'connected' ? 'Connected' : system.database}</b><small>Supabase production</small></div><div><span>Catalog</span><b>{system.catalog ?? '—'} produk</b><small>active + published</small></div><div><span>Reservation</span><b>{stats?.active_reservations ?? '—'} aktif</b><small>{stats?.released_reservations ?? 0} released</small></div><div><span>Monitoring</span><b>ACTIVE</b><small>auth · form · guest activity</small></div></div></div>
      </section>

      <section className="panel orders-panel"><div className="panel-head orders-head"><div><span className="section-kicker">TRANSACTION CONTROL</span><h2>Order Terbaru</h2><p>{filteredOrders.length} order ditampilkan · ubah status langsung dari panel.</p></div><div className="toolbar"><label className="search"><span>⌕</span><input value={query} onChange={(e)=>setQuery(e.target.value)} placeholder="Cari order, pelanggan, kota…" aria-label="Cari order"/></label><select value={filter} onChange={(e)=>setFilter(e.target.value)} aria-label="Filter status"><option value="all">Semua status</option>{STATUSES.map(s=><option key={s} value={s}>{LABELS[s]}</option>)}</select></div></div>
        {error && <div className="error" role="alert"><b>Perhatian</b><span>{error}</span></div>}
        {loading ? <div className="state"><span className="loader"/>Memuat dan sinkronisasi data…</div> : filteredOrders.length === 0 ? <div className="state"><b>Tidak ada order</b><span>Coba ubah filter atau kata pencarian.</span></div> : <div className="table-wrap"><table><thead><tr><th>Order</th><th>Pelanggan</th><th>Total</th><th>Kurir</th><th>Waktu</th><th>Status</th></tr></thead><tbody>{filteredOrders.map(order=><tr key={order.id}><td><strong>{order.order_number}</strong><small>{order.whatsapp}</small></td><td><strong>{order.customer_name}</strong><small>{order.city || order.address}</small></td><td><strong>{money(order.total)}</strong></td><td><span className="courier">{order.courier}</span></td><td><span className="time">{dateTime(order.created_at)}</span></td><td><select value={order.status} disabled={busy===order.id} onChange={(e)=>changeStatus(order.id,e.target.value)} aria-label={`Status ${order.order_number}`}>{STATUSES.map(s=><option key={s} value={s}>{LABELS[s]}</option>)}</select></td></tr>)}</tbody></table></div>}
      </section>

      <section className="lower-grid"><div className="panel compact"><div className="panel-head"><div><span className="section-kicker">ORDER DETAIL</span><h2>Informasi Order</h2><p>Data diambil langsung dari tabel orders production.</p></div><span className="panel-icon">◈</span></div><div className="info-grid"><div><span>Sinkronisasi</span><b>Otomatis · 15 detik</b></div><div><span>Status aktif</span><b>{stats ? Object.entries(stats).filter(([k])=>STATUSES.includes(k)).reduce((s,[,v])=>s+Number(v||0),0) : 0} order</b></div><div><span>Reservasi</span><b>Dikelola transaksi order</b></div><div><span>Audit</span><b>Status change tercatat di order</b></div></div></div><div className="panel compact"><div className="panel-head"><div><span className="section-kicker">DATA INTEGRITY</span><h2>Sinkronisasi Production</h2><p>Validasi endpoint admin dan database.</p></div><span className="panel-icon">✓</span></div><div className="info-grid"><div><span>Database</span><b>{system.database === 'connected' ? 'Connected' : system.database}</b></div><div><span>Catalog</span><b>{system.catalog ?? '—'} produk aktif</b></div><div><span>Last sync</span><b>{lastSync ? lastSync.toLocaleString('id-ID',{dateStyle:'medium',timeStyle:'short'}) : '—'}</b></div><div><span>Mode</span><b>Private · No Cache</b></div></div></div></section>

      <footer className="admin-footer"><span>R2 NUSANTARA · ADMIN CONTROL CENTER</span><span>Secure production monitoring</span></footer>
    </main>
    <style jsx>{`
      :global(html){background:#f4f7fb}.admin-page{min-height:100vh;background:radial-gradient(circle at 15% 0%,rgba(27,105,190,.06),transparent 28%),radial-gradient(circle at 90% 10%,rgba(13,49,98,.06),transparent 25%),#f4f7fb;color:#10243f;padding:20px clamp(12px,3vw,42px) 42px;position:relative;overflow:hidden}.ambient{position:absolute;border-radius:50%;filter:blur(1px);pointer-events:none;border:1px solid rgba(24,91,161,.08)}.ambient-a{width:360px;height:360px;right:-170px;top:190px}.ambient-b{width:250px;height:250px;left:-150px;bottom:130px}.admin-header,.hero,.stats,.overview-grid,.orders-panel,.lower-grid,.admin-footer{max-width:1240px;margin-left:auto;margin-right:auto}.admin-header{display:flex;align-items:center;justify-content:space-between;gap:15px;position:relative;z-index:2}.brand{display:flex;align-items:center;gap:11px}.mark{width:43px;height:43px;border-radius:13px;display:grid;place-items:center;background:linear-gradient(145deg,#061f48,#1768c7);color:#fff;font-weight:950;box-shadow:0 9px 24px rgba(12,61,121,.2);position:relative;overflow:hidden}.mark span{position:relative;z-index:2;font-size:12px;letter-spacing:-.08em}.mark i{position:absolute;width:90px;height:10px;background:rgba(255,255,255,.12);transform:rotate(-45deg);top:2px;left:-28px}.brand div:last-child{display:grid;gap:3px}.brand strong{font-size:11px;letter-spacing:.1em}.brand span{font-size:7px;color:#77879a;letter-spacing:.13em;font-weight:800}.actions{display:flex;gap:7px}.actions button,.hero a{border:1px solid #d6e1ec;background:rgba(255,255,255,.88);color:#29445f;border-radius:10px;min-height:38px;padding:0 13px;font-size:9px;font-weight:900;cursor:pointer;display:inline-flex;align-items:center;gap:6px;text-decoration:none;backdrop-filter:blur(10px)}.actions button:disabled{opacity:.55;cursor:wait}.actions .logout{color:#963c42}.spin{display:inline-block;animation:spin 1s linear infinite}@keyframes spin{to{transform:rotate(360deg)}}.hero{margin-top:22px;border-radius:23px;background:linear-gradient(135deg,#061f48 0%,#0c3c7d 52%,#1766bd 100%);color:#fff;box-shadow:0 24px 65px rgba(7,46,98,.19);overflow:hidden;position:relative}.hero:after{content:'';position:absolute;width:430px;height:430px;border:1px solid rgba(255,255,255,.09);border-radius:50%;right:-220px;top:-230px;box-shadow:0 0 0 45px rgba(255,255,255,.025),0 0 0 90px rgba(255,255,255,.018)}.hero-grid{display:flex;align-items:center;justify-content:space-between;gap:28px;padding:28px 30px 25px;position:relative;z-index:1}.eyebrow{font-size:8px;letter-spacing:.16em;font-weight:950;opacity:.78;display:flex;align-items:center;gap:7px}.live-dot{width:6px;height:6px;border-radius:50%;background:#77f0a7;box-shadow:0 0 0 4px rgba(119,240,167,.1),0 0 13px rgba(119,240,167,.8);animation:pulse 1.8s ease-in-out infinite}@keyframes pulse{50%{opacity:.45;transform:scale(.8)}}.hero h1{font-size:31px;letter-spacing:-.045em;margin:8px 0 5px}.hero h1 em{font-style:normal;font-weight:500;color:#d7e8ff}.hero p{margin:0;max-width:650px;font-size:10px;line-height:1.65;color:rgba(255,255,255,.7)}.hero-right{display:flex;align-items:center;gap:8px;position:relative;z-index:2}.system-pill{display:grid;grid-template-columns:auto 1fr;column-gap:7px;align-items:center;padding:9px 12px;border:1px solid rgba(255,255,255,.14);border-radius:12px;background:rgba(255,255,255,.08);min-width:122px}.system-pill b{grid-row:span 2;font-size:10px}.system-pill.online b{color:#76efaa}.system-pill.degraded b{color:#ffc77d}.system-pill span{font-size:7px;font-weight:950;letter-spacing:.1em}.system-pill small{font-size:6.5px;color:rgba(255,255,255,.52);margin-top:2px}.hero a{background:rgba(255,255,255,.1);border-color:rgba(255,255,255,.18);color:#fff;white-space:nowrap}.hero-meta{border-top:1px solid rgba(255,255,255,.1);display:flex;gap:30px;padding:11px 30px;font-size:6.5px;letter-spacing:.12em;color:rgba(255,255,255,.45);position:relative;z-index:2}.hero-meta b{color:rgba(255,255,255,.8);margin-left:4px}.stats{display:grid;grid-template-columns:repeat(8,1fr);gap:8px;margin-top:12px;position:relative;z-index:2}.stat{min-width:0;background:rgba(255,255,255,.9);border:1px solid #dde6ef;border-radius:14px;padding:13px 12px;box-shadow:0 7px 22px rgba(23,56,91,.035);position:relative;overflow:hidden}.stat span{display:block;font-size:7px;color:#7b8b9e;font-weight:900;text-transform:uppercase;letter-spacing:.09em}.stat strong{display:block;font-size:18px;letter-spacing:-.04em;margin-top:6px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.stat small{display:block;font-size:6.5px;color:#91a0b0;margin-top:4px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.stat i{font-style:normal;position:absolute;right:9px;top:8px;font-size:5.5px;letter-spacing:.08em;color:#b2c0cf}.stat-primary{background:linear-gradient(145deg,#fff,#eef6ff);border-color:#cfe0f1}.stat-primary strong{color:#0c4c96}.sales strong{font-size:13px}.overview-grid{display:grid;grid-template-columns:1.45fr .9fr;gap:12px;margin-top:12px;position:relative;z-index:2}.panel{background:rgba(255,255,255,.94);border:1px solid #dce5ee;border-radius:18px;box-shadow:0 9px 30px rgba(26,60,94,.045);overflow:hidden}.panel-head{display:flex;align-items:center;justify-content:space-between;gap:15px;padding:17px 18px;border-bottom:1px solid #e8eef4}.section-kicker{display:block;color:#6d8299;font-size:6.5px;font-weight:950;letter-spacing:.15em;margin-bottom:4px}.panel-head h2{margin:0;font-size:14px;letter-spacing:-.02em}.panel-head p{margin:3px 0 0;color:#8a98a9;font-size:7.5px}.panel-badge{font-size:6px;font-weight:950;letter-spacing:.12em;border:1px solid #d7e5f2;border-radius:999px;padding:6px 8px;color:#3770a7;background:#f5faff}.flow-list{padding:13px 18px 16px}.flow-row{display:grid;grid-template-columns:150px 1fr;gap:12px;align-items:center;margin:11px 0}.flow-label{display:grid;grid-template-columns:9px 1fr auto;gap:7px;align-items:center}.flow-label b{font-size:8px}.flow-label strong{font-size:9px}.status-mark{width:7px;height:7px;border-radius:50%;background:#b5c1cc}.status-mark.pending{background:#e5aa53}.status-mark.confirmed{background:#6796ca}.status-mark.shipped{background:#3b9cbe}.status-mark.completed{background:#42a86d}.bar{height:7px;background:#edf2f6;border-radius:999px;overflow:hidden}.bar i{display:block;height:100%;border-radius:999px;background:linear-gradient(90deg,#1d67b9,#73b7f0);transition:width .5s ease}.system-panel .panel-head{min-height:72px}.pulse-ring{width:19px;height:19px;border-radius:50%;border:1px solid #83b9e8;box-shadow:0 0 0 5px rgba(79,151,214,.08),0 0 0 10px rgba(79,151,214,.04);margin-right:5px}.system-list{padding:3px 18px 9px}.info-grid{display:grid;grid-template-columns:1fr 1fr;padding:4px 18px 12px;gap:0 18px}.info-grid>div{padding:11px 0;border-bottom:1px solid #eef2f6;display:grid;gap:4px}.info-grid span{font-size:7px;color:#7b8ea2}.info-grid b{font-size:8px}.system-list>div{display:grid;grid-template-columns:1fr auto;gap:2px 10px;padding:9px 0;border-bottom:1px solid #eef2f6}.system-list>div:last-child{border-bottom:0}.system-list span{font-size:7.5px;color:#72869a}.system-list b{font-size:8px;text-align:right}.system-list b.ok{color:#24814d}.system-list small{grid-column:1/-1;font-size:6.5px;color:#9aa7b5}.orders-panel{margin-top:12px;position:relative;z-index:2}.orders-head{align-items:end}.toolbar{display:flex;gap:7px;align-items:center}.toolbar select,.search{height:34px;border:1px solid #d6e1eb;background:#fbfdff;border-radius:9px;color:#29435e;font-size:8px}.toolbar select{padding:0 9px}.search{display:flex;align-items:center;padding:0 9px;min-width:230px}.search span{font-size:14px;color:#8293a6;margin-right:5px}.search input{border:0;outline:0;background:transparent;width:100%;font:inherit;color:#29435e}.search input::placeholder{color:#a0adba}table{width:100%;border-collapse:collapse}th,td{text-align:left;padding:11px 13px;border-bottom:1px solid #edf1f5;font-size:8px;vertical-align:middle}th{font-size:6.5px;color:#78899c;text-transform:uppercase;letter-spacing:.1em;background:#fafcfe}tbody tr{transition:background .18s ease}tbody tr:hover{background:#f8fbff}td strong,td small{display:block}td strong{font-size:8.5px}td small{margin-top:3px;color:#8a98a8;font-size:6.7px;max-width:180px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.courier,.time{color:#506981;font-size:7.5px}.time{white-space:nowrap}td select{border:1px solid #d3e0eb;background:#fff;border-radius:8px;padding:7px 8px;font-size:7.5px;color:#203c58;cursor:pointer}.table-wrap{overflow:auto}.error{margin:12px 14px 0;padding:10px 12px;border:1px solid #efd1d1;background:#fff5f5;color:#9b3c42;border-radius:10px;display:flex;gap:9px;align-items:center;font-size:8px}.error b{text-transform:uppercase;letter-spacing:.08em;font-size:6.5px}.state{min-height:155px;padding:35px 20px;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:6px;color:#8292a4;font-size:8px}.state b{color:#50657c;font-size:10px}.loader{width:18px;height:18px;border:2px solid #d9e4ee;border-top-color:#1765b8;border-radius:50%;animation:spin .8s linear infinite}.lower-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:12px;position:relative;z-index:2}.compact{margin:0}.panel-icon{width:25px;height:25px;display:grid;place-items:center;border-radius:8px;background:#f1f6fb;color:#4b79a6;font-size:12px}.activity-list{max-height:300px;overflow:auto}.activity{display:grid;grid-template-columns:27px 1fr;gap:10px;padding:11px 16px;border-bottom:1px solid #edf1f5}.activity:last-child{border-bottom:0}.activity-icon{width:27px;height:27px;border-radius:8px;display:grid;place-items:center;background:#f1f6fb;color:#4276a8;font-size:9px}.activity>div:last-child{display:grid;grid-template-columns:1fr auto;gap:2px 10px}.activity b{font-size:8px}.activity span{font-size:7px;color:#657b91;text-align:right}.activity small{grid-column:1/-1;font-size:6.5px;color:#929eab}.admin-footer{display:flex;justify-content:space-between;padding:17px 3px 0;color:#8b99a8;font-size:6.5px;letter-spacing:.08em;position:relative;z-index:2}@media(max-width:1050px){.stats{grid-template-columns:repeat(4,1fr)}.overview-grid{grid-template-columns:1fr}.system-list{display:grid;grid-template-columns:repeat(2,1fr);gap:0 16px}.system-list>div{border-bottom:1px solid #eef2f6}.flow-row{grid-template-columns:135px 1fr}}@media(max-width:760px){.admin-page{padding:14px 10px 35px}.admin-header .actions button:first-child{padding:0 10px}.admin-header .actions button:first-child{font-size:0}.admin-header .actions button:first-child span{font-size:14px}.hero{border-radius:18px;margin-top:16px}.hero-grid{padding:22px 20px 20px;display:block}.hero h1{font-size:26px}.hero-right{margin-top:17px;justify-content:space-between}.hero a{flex:1;justify-content:center}.hero-meta{padding:10px 20px;gap:14px;flex-wrap:wrap}.stats{grid-template-columns:repeat(2,1fr);gap:7px}.stat{padding:11px}.stat strong{font-size:17px}.sales strong{font-size:12px}.orders-head{align-items:stretch}.toolbar{display:grid;grid-template-columns:1fr}.search{min-width:0}.toolbar select{height:34px}.lower-grid{grid-template-columns:1fr}.system-list{grid-template-columns:1fr}.info-grid{grid-template-columns:1fr}.flow-row{grid-template-columns:112px 1fr}.admin-footer{gap:8px;line-height:1.5}.admin-footer span:last-child{text-align:right}}@media(max-width:430px){.brand span{max-width:150px}.hero-right{flex-direction:column;align-items:stretch}.system-pill{width:100%;box-sizing:border-box}.hero a{width:100%;box-sizing:border-box}.flow-row{grid-template-columns:105px 1fr}.flow-label{gap:5px}.flow-label b{font-size:7px}.panel-head{padding:15px}.table-wrap{margin:0}.admin-footer{font-size:5.8px}}
    `}</style>
  </>
}
