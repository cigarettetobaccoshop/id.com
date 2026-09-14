import Head from 'next/head'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { getAdminSupabase } from '../../lib/supabaseAdminBrowser'

const ADMIN_UUID = '76a6d92e-6de1-45e3-a5d0-90d7905c0d52'
const STATUSES = ['pending','confirmed','processing','shipped','completed','cancelled']
const LABELS = { pending:'Pending', confirmed:'Confirmed', processing:'Processing', shipped:'Shipped', completed:'Completed', cancelled:'Cancelled' }
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

  return <>
    <Head><title>Admin Dashboard — R2 NUSANTARA</title><meta name="robots" content="noindex,nofollow" /></Head>
    <main className="admin-page">
      <header className="admin-header"><div className="brand"><div className="mark">R2</div><div><strong>R2 NUSANTARA</strong><span>Admin Control Center</span></div></div><div className="actions"><button onClick={()=>load()} disabled={loading}>↻ Sinkronkan</button><button onClick={logout} className="logout">Keluar</button></div></header>
      <section className="hero"><div><span className="eyebrow">SECURE OPERATIONS · LIVE MONITORING</span><h1>Dashboard Monitoring</h1><p>Kontrol order, stok reservation, audit aktivitas, dan kesehatan koneksi dari satu panel.</p></div><div className="hero-actions"><span className={`system-pill ${system.status}`}>● {system.status === 'online' ? 'SYSTEM ONLINE' : system.status === 'degraded' ? 'CHECK REQUIRED' : 'CHECKING'}</span><a href="/" target="_blank" rel="noreferrer">Buka Website ↗</a></div></section>
      {stats && <section className="stats">{[['Total Order',stats.total_orders],['Hari Ini',stats.today_orders],['Pending',stats.pending],['Processing',stats.processing],['Shipped',stats.shipped],['Completed',stats.completed],['Cancelled',stats.cancelled],['Penjualan',money(stats.total_sales)]].map(([label,value])=><div className="stat" key={label}><span>{label}</span><strong>{value}</strong></div>)}</section>}
      <section className="health-grid"><div className="health-card"><span>DATABASE</span><strong>● {system.database === 'connected' ? 'Connected' : system.database}</strong><small>Supabase production</small></div><div className="health-card"><span>CATALOG</span><strong>{system.catalog ?? '—'} produk</strong><small>public.products · active + published</small></div><div className="health-card"><span>RESERVATION</span><strong>{stats?.active_reservations ?? '—'} aktif</strong><small>{stats?.released_reservations ?? 0} released</small></div><div className="health-card"><span>SYNC TERAKHIR</span><strong>{lastSync ? lastSync.toLocaleTimeString('id-ID') : '—'}</strong><small>Data diambil tanpa cache</small></div></section>
      <section className="panel"><div className="panel-head"><div><h2>Order Terbaru</h2><span>{orders.length} order ditampilkan</span></div><select value={filter} onChange={(e)=>setFilter(e.target.value)} aria-label="Filter status"><option value="all">Semua status</option>{STATUSES.map(s=><option key={s} value={s}>{LABELS[s]}</option>)}</select></div>
        {error && <div className="error" role="alert">{error}</div>}
        {loading ? <div className="state">Memuat dan sinkronisasi data…</div> : orders.length === 0 ? <div className="state">Belum ada order untuk filter ini.</div> : <div className="table-wrap"><table><thead><tr><th>Order</th><th>Pelanggan</th><th>Total</th><th>Kurir</th><th>Waktu</th><th>Status</th></tr></thead><tbody>{orders.map(order=><tr key={order.id}><td><strong>{order.order_number}</strong><small>{order.whatsapp}</small></td><td>{order.customer_name}<small>{order.city || order.address}</small></td><td>{money(order.total)}</td><td>{order.courier}</td><td>{dateTime(order.created_at)}</td><td><select value={order.status} disabled={busy===order.id} onChange={(e)=>changeStatus(order.id,e.target.value)}>{STATUSES.map(s=><option key={s} value={s}>{LABELS[s]}</option>)}</select></td></tr>)}</tbody></table></div>}
      </section>
      <section className="lower-grid"><div className="panel compact"><div className="panel-head"><div><h2>Inventory Reservation</h2><span>20 aktivitas terbaru</span></div></div><div className="activity-list">{reservations.length ? reservations.map(r=><div className="activity" key={r.id}><b>{r.sku}</b><span>{r.qty} unit · {r.status}</span><small>{dateTime(r.created_at)}</small></div>) : <div className="state">Belum ada data.</div>}</div></div><div className="panel compact"><div className="panel-head"><div><h2>Audit Aktivitas</h2><span>12 aktivitas terbaru</span></div></div><div className="activity-list">{audit.length ? audit.map(item=><div className="activity" key={item.id}><b>{item.event_type}</b><span>{item.metadata?.order_number || item.metadata?.order_id || 'System event'}</span><small>{dateTime(item.created_at)}</small></div>) : <div className="state">Belum ada audit.</div>}</div></div></section>
    </main>
    <style jsx>{`
      .admin-page{min-height:100vh;background:#f4f7fb;color:#11233f;padding:22px clamp(14px,4vw,42px) 60px}.admin-header,.hero,.panel,.health-grid,.lower-grid{max-width:1200px;margin:0 auto}.admin-header{display:flex;align-items:center;justify-content:space-between;gap:16px}.brand{display:flex;align-items:center;gap:10px}.mark{width:40px;height:40px;border-radius:11px;display:grid;place-items:center;background:linear-gradient(145deg,#082b61,#176bd1);color:#fff;font-weight:950}.brand div:last-child{display:grid;gap:2px}.brand strong{font-size:11px;letter-spacing:.08em}.brand span{font-size:8px;color:#75859a}.actions,.hero-actions{display:flex;gap:7px;align-items:center}.actions button,.hero a{border:1px solid #d4dfeb;background:#fff;color:#23405f;border-radius:10px;min-height:38px;padding:0 12px;font-size:9px;font-weight:900;cursor:pointer;text-decoration:none;display:inline-flex;align-items:center}.actions .logout{color:#9a3737}.hero{margin-top:26px;display:flex;align-items:end;justify-content:space-between;gap:20px;padding:26px;border-radius:20px;background:linear-gradient(135deg,#082b61,#145cae);color:#fff;box-shadow:0 20px 50px rgba(9,48,99,.18)}.eyebrow{font-size:8px;letter-spacing:.16em;font-weight:950;opacity:.75}.hero h1{font-size:30px;letter-spacing:-.04em;margin:8px 0 5px}.hero p{margin:0;font-size:11px;opacity:.8}.hero a{background:rgba(255,255,255,.12);border-color:rgba(255,255,255,.25);color:#fff}.system-pill{font-size:8px;font-weight:950;letter-spacing:.08em;padding:9px 11px;border-radius:999px;background:rgba(255,255,255,.12)}.system-pill.online{color:#d9ffe8}.system-pill.degraded{color:#ffe0e0}.stats{max-width:1200px;margin:14px auto;display:grid;grid-template-columns:repeat(4,1fr);gap:10px}.stat,.health-card{background:#fff;border:1px solid #dfe7f0;border-radius:15px;padding:14px}.stat span,.health-card span{display:block;color:#74849a;font-size:8px;font-weight:800}.stat strong{display:block;margin-top:5px;font-size:19px;letter-spacing:-.03em}.health-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:14px}.health-card strong{display:block;margin-top:6px;font-size:13px}.health-card small{display:block;margin-top:4px;color:#8290a2;font-size:7.5px}.panel{margin-top:14px;background:#fff;border:1px solid #dfe7f0;border-radius:18px;overflow:hidden}.panel-head{display:flex;align-items:center;justify-content:space-between;padding:17px 18px;border-bottom:1px solid #e7edf3;gap:15px}.panel-head h2{margin:0;font-size:15px}.panel-head span{font-size:8px;color:#7a899d}.panel-head select,td select{border:1px solid #d4dfeb;background:#fff;border-radius:9px;padding:8px 10px;font-size:9px;color:#203650}table{width:100%;border-collapse:collapse}th,td{text-align:left;padding:12px 14px;border-bottom:1px solid #edf1f5;font-size:9px;vertical-align:middle}th{font-size:8px;color:#77869a;text-transform:uppercase;letter-spacing:.08em;background:#fbfcfe}td strong,td small{display:block}td small{margin-top:3px;color:#8391a4;font-size:7.5px;max-width:180px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.state{padding:45px;text-align:center;color:#7b8a9f;font-size:10px}.error{margin:12px 14px 0;padding:10px;border:1px solid #f0cccc;background:#fff2f2;color:#9c3434;border-radius:9px;font-size:9px}.table-wrap{overflow:auto}.lower-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px}.compact{margin-top:14px}.activity-list{max-height:350px;overflow:auto}.activity{display:grid;grid-template-columns:1fr auto;gap:3px 10px;padding:11px 15px;border-bottom:1px solid #edf1f5}.activity b{font-size:8.5px}.activity span{font-size:8px;color:#61758d;text-align:right}.activity small{font-size:7.5px;color:#8a97a8}@media(max-width:800px){.stats,.health-grid{grid-template-columns:repeat(2,1fr)}.hero{align-items:start;flex-direction:column}.hero-actions{width:100%;justify-content:space-between}.hero a{flex:1;justify-content:center}.panel-head{align-items:stretch;flex-direction:column}.panel-head select{width:100%}.lower-grid{grid-template-columns:1fr}th,td{white-space:nowrap}}@media(max-width:480px){.admin-page{padding:15px 10px 50px}.admin-header .actions button:first-child{display:none}.hero{padding:21px;border-radius:17px}.hero h1{font-size:25px}.stats,.health-grid{gap:7px}.stat,.health-card{padding:11px}.stat strong{font-size:16px}.hero-actions{align-items:stretch;flex-direction:column}.hero a{min-height:38px}}
    `}</style>
  </>
}
