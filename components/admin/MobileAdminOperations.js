import { useCallback, useEffect, useMemo, useState } from 'react'

const currency = (value) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(Number(value) || 0)
const statusLabels = { pending: 'Menunggu konfirmasi', confirmed: 'Diproses', processing: 'Diproses', shipped: 'Dikirim', completed: 'Selesai', cancelled: 'Dibatalkan' }

export default function MobileAdminOperations({ session, orders = [], stats, database, onRefresh }) {
  const [products, setProducts] = useState([])
  const [metrics, setMetrics] = useState(null)
  const [loadingProducts, setLoadingProducts] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')
  const [showInactive, setShowInactive] = useState(false)
  const [formOpen, setFormOpen] = useState(false)
  const [form, setForm] = useState({ name: '', price: '', category: 'r2', segment: '', description: '' })
  const [trackingOrder, setTrackingOrder] = useState('')
  const [trackingNumber, setTrackingNumber] = useState('')

  const loadProducts = useCallback(async () => {
    if (!session?.access_token) return
    try {
      const response = await fetch('/api/admin/products', { headers: { Authorization: `Bearer ${session.access_token}` }, cache: 'no-store' })
      const body = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(body.error || 'Katalog admin gagal dimuat.')
      setProducts(body.products || [])
      setMetrics(body.metrics || null)
    } catch (err) {
      setError(err.message || 'Katalog admin gagal dimuat.')
    } finally {
      setLoadingProducts(false)
    }
  }, [session?.access_token])

  useEffect(() => { loadProducts() }, [loadProducts])

  const visibleProducts = useMemo(() => {
    const term = search.trim().toLowerCase()
    return products.filter((product) =>
      (showInactive || product.is_active) &&
      (category === 'all' || product.category === category) &&
      (!term || [product.name, product.id, product.segment, product.segment_name].filter(Boolean).join(' ').toLowerCase().includes(term))
    ).slice(0, 60)
  }, [products, search, category, showInactive])

  async function saveProduct(event) {
    event.preventDefault()
    if (!session?.access_token) return
    setSaving(true); setError(''); setNotice('')
    try {
      const response = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({ ...form, price: Number(form.price) }),
      })
      const body = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(body.error || 'Produk gagal ditambahkan.')
      setForm({ name: '', price: '', category: 'r2', segment: '', description: '' })
      setFormOpen(false)
      setNotice('Produk baru berhasil ditambahkan.')
      await loadProducts()
      onRefresh?.()
    } catch (err) { setError(err.message || 'Produk gagal ditambahkan.') }
    finally { setSaving(false) }
  }

  async function patchProduct(product, patch) {
    if (!session?.access_token) return
    setSaving(true); setError(''); setNotice('')
    try {
      const response = await fetch('/api/admin/products', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({ id: product.id, ...patch }),
      })
      const body = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(body.error || 'Produk gagal diperbarui.')
      setProducts((current) => current.map((item) => item.id === product.id ? body.product : item))
      setNotice(patch.is_active === undefined ? 'Produk berhasil diperbarui.' : (patch.is_active ? 'Produk diaktifkan kembali.' : 'Produk ditandai habis dan disembunyikan dari katalog publik.'))
      if (patch.is_active !== undefined) setMetrics((current) => current ? { ...current, active_skus: current.active_skus + (patch.is_active ? 1 : -1) } : current)
      onRefresh?.()
    } catch (err) { setError(err.message || 'Produk gagal diperbarui.') }
    finally { setSaving(false) }
  }

  function sendTracking(order) {
    const tracking = trackingNumber.trim()
    if (!tracking) { setError('Masukkan nomor resi terlebih dahulu.'); return }
    const phone = String(order.whatsapp || order.customer_phone || '').replace(/\D/g, '')
    if (!phone) { setError('Nomor WhatsApp pelanggan tidak tersedia untuk pesanan ini.'); return }
    const message = [
      'Halo, ini informasi pengiriman dari R2 NUSANTARA.',
      `Nomor pesanan: ${order.order_number || order.order_code || '-'}`,
      `Kurir: ${order.courier || order.ekspedisi || '-'}`,
      `Nomor resi: ${tracking}`,
      'Terima kasih telah berbelanja. Semoga paket diterima dengan baik.',
    ].join('\n')
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer')
    setTrackingOrder(''); setTrackingNumber(''); setNotice('WhatsApp dibuka dengan pesan resi siap dikirim. Pesan belum dikirim otomatis.')
  }

  const todayOrders = metrics?.today_orders ?? stats?.today_orders ?? 0
  const activeSkus = metrics?.active_skus ?? database?.active_products ?? '—'
  const todayRevenue = metrics ? currency(metrics.today_revenue) : '—'
  const recentOrders = orders.slice(0, 5)

  return <section className="mobile-ops" aria-label="Operasional admin mobile">
    <div className="ops-title">
      <div><span className="ops-kicker">PANEL OPERASIONAL</span><h2>Ringkasan Hari Ini</h2><p>Metrik utama dan aksi cepat untuk layar ponsel.</p></div>
      <button className="refresh" onClick={() => { loadProducts(); onRefresh?.() }} disabled={loadingProducts}>↻ Segarkan</button>
    </div>
    <div className="metric-grid">
      <article className="metric-card"><span>Pesanan masuk hari ini</span><strong>{todayOrders}</strong><small>Zona waktu WIB</small></article>
      <article className="metric-card"><span>SKU aktif</span><strong>{activeSkus}</strong><small>Produk siap tampil</small></article>
      <article className="metric-card revenue"><span>Omzet hari ini</span><strong>{todayRevenue}</strong><small>{metrics ? 'Order selain dibatalkan' : 'Menunggu data ringkasan'}</small></article>
    </div>

    {(error || notice) && <div className={error ? 'feedback error' : 'feedback success'} role={error ? 'alert' : 'status'}><span>{error || notice}</span><button onClick={() => { setError(''); setNotice('') }} aria-label="Tutup pesan">×</button></div>}

    <section className="ops-panel catalog-panel">
      <div className="panel-title"><div><span className="ops-kicker">MANAJEMEN KATALOG</span><h3>Produk</h3><p>Aktifkan atau tandai habis dengan satu sentuhan.</p></div><button className="primary" onClick={() => setFormOpen((value) => !value)}>{formOpen ? 'Tutup' : '+ Produk'}</button></div>
      {formOpen && <form className="product-form" onSubmit={saveProduct}>
        <label>Nama produk<input required maxLength={160} value={form.name} onChange={(e) => setForm((current) => ({ ...current, name: e.target.value }))} placeholder="Nama produk" /></label>
        <div className="form-row"><label>Harga (Rp)<input required type="number" min="1" max="100000000" step="1" inputMode="numeric" value={form.price} onChange={(e) => setForm((current) => ({ ...current, price: e.target.value }))} placeholder="65000" /></label><label>Kategori<select value={form.category} onChange={(e) => setForm((current) => ({ ...current, category: e.target.value }))}><option value="r2">R2</option><option value="resmi">Resmi</option></select></label></div>
        <label>Segmen (opsional)<input maxLength={120} value={form.segment} onChange={(e) => setForm((current) => ({ ...current, segment: e.target.value }))} placeholder="Segmen produk" /></label>
        <label>Deskripsi (opsional)<textarea maxLength={2000} rows={2} value={form.description} onChange={(e) => setForm((current) => ({ ...current, description: e.target.value }))} placeholder="Deskripsi singkat" /></label>
        <button className="primary save" type="submit" disabled={saving}>{saving ? 'Menyimpan…' : 'Simpan produk'}</button>
      </form>}
      <div className="catalog-tools"><input aria-label="Cari produk" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari nama atau ID produk…" /><select aria-label="Filter kategori" value={category} onChange={(e) => setCategory(e.target.value)}><option value="all">Semua kategori</option><option value="r2">R2</option><option value="resmi">Resmi</option></select><label className="inactive-toggle"><input type="checkbox" checked={showInactive} onChange={(e) => setShowInactive(e.target.checked)} /> Tampilkan habis</label></div>
      {loadingProducts ? <div className="empty">Memuat katalog…</div> : products.length === 0 ? <div className="empty">Katalog belum tersedia. Periksa konfigurasi API admin.</div> : visibleProducts.length === 0 ? <div className="empty">Tidak ada produk yang cocok.</div> : <div className="product-list">{visibleProducts.map((product) => <article className="product-row" key={product.id}>
        <div className="product-info"><strong>{product.name}</strong><small>{product.id} · {String(product.category || '').toUpperCase()}{product.segment ? ` · ${product.segment}` : ''}</small><b>{currency(product.price)}</b></div>
        <div className="product-actions"><span className={product.is_active ? 'stock active' : 'stock inactive'}>{product.is_active ? 'AKTIF' : 'HABIS'}</span><button className={product.is_active ? 'toggle on' : 'toggle'} disabled={saving} onClick={() => patchProduct(product, { is_active: !product.is_active })} aria-label={product.is_active ? `Tandai ${product.name} habis` : `Aktifkan ${product.name}`}><i /></button><button className="edit-price" disabled={saving} onClick={() => { const value = window.prompt(`Harga baru untuk ${product.name}`, String(product.price)); if (value !== null && value.trim() !== '') patchProduct(product, { price: Number(value) }) }}>Ubah harga</button></div>
      </article>)}</div>}
      {products.length > 60 && <p className="list-note">Menampilkan maksimal 60 produk sesuai filter. Gunakan pencarian untuk menemukan produk lain.</p>}
    </section>

    <section className="ops-panel quick-orders">
      <div className="panel-title"><div><span className="ops-kicker">MANAJEMEN PESANAN</span><h3>Aksi pesanan terbaru</h3><p>Perbarui status pada tabel pesanan di bawah; siapkan resi via WhatsApp di sini.</p></div><span className="count-pill">{orders.length} dimuat</span></div>
      {recentOrders.length === 0 ? <div className="empty">Belum ada pesanan yang dapat ditampilkan.</div> : <div className="order-cards">{recentOrders.map((order) => <article className="order-card" key={order.id}>
        <div className="order-top"><strong>{order.order_number || order.order_code}</strong><span className={`order-status ${order.status}`}>{statusLabels[order.status] || order.status}</span></div>
        <div className="order-meta"><strong>{order.customer_name}</strong><span>{currency(order.total)}</span><small>{order.courier || order.ekspedisi || 'Kurir belum ditentukan'} · {order.whatsapp || order.customer_phone || 'WhatsApp tidak tersedia'}</small></div>
        {trackingOrder === order.id ? <div className="tracking-form"><input aria-label="Nomor resi" value={trackingNumber} onChange={(e) => setTrackingNumber(e.target.value)} placeholder="Masukkan nomor resi" autoComplete="off" /><button className="primary" onClick={() => sendTracking(order)}>Buka WhatsApp</button><button className="cancel" onClick={() => { setTrackingOrder(''); setTrackingNumber('') }}>Batal</button></div> : <button className="whatsapp-action" onClick={() => { setTrackingOrder(order.id); setTrackingNumber(''); setError('') }}>↗ Siapkan notifikasi resi</button>}
      </article>)}</div>}
    </section>

    <style jsx>{`
      .mobile-ops{max-width:1240px;margin:14px auto 0;position:relative;z-index:2;color:#10243f}.ops-title,.panel-title{display:flex;justify-content:space-between;align-items:center;gap:12px}.ops-title{margin:0 0 10px}.ops-kicker{font-size:9px;font-weight:900;letter-spacing:.13em;color:#3975ad}.ops-title h2,.panel-title h3{margin:4px 0 0;font-size:20px;letter-spacing:-.035em;color:#102b4b}.ops-title p,.panel-title p{margin:5px 0 0;font-size:11px;color:#7c8da0;line-height:1.5}.refresh,.primary,.cancel,.edit-price,.whatsapp-action{border:1px solid #d8e3ef;background:#fff;border-radius:10px;min-height:38px;padding:0 12px;font-size:11px;font-weight:800;color:#244563;cursor:pointer}.refresh:disabled,.primary:disabled,.edit-price:disabled,.toggle:disabled{opacity:.55;cursor:wait}.primary{background:#0d4e91;color:#fff;border-color:#0d4e91}.metric-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;margin-bottom:12px}.metric-card{min-width:0;border:1px solid #e0e8f1;border-radius:14px;background:linear-gradient(145deg,#fff,#f8fbff);padding:15px;box-shadow:0 8px 24px rgba(24,58,94,.045)}.metric-card span,.metric-card small{display:block;color:#6f8499;font-size:10px;line-height:1.45}.metric-card strong{display:block;margin:8px 0 5px;font-size:clamp(18px,2vw,26px);letter-spacing:-.045em;color:#102d4f;overflow-wrap:anywhere}.metric-card.revenue strong{font-size:clamp(15px,1.6vw,22px)}.ops-panel{background:#fff;border:1px solid #e1e8f0;border-radius:16px;box-shadow:0 10px 28px rgba(21,55,91,.05);overflow:hidden;margin-top:12px}.panel-title{padding:17px 18px;border-bottom:1px solid #edf2f7}.panel-title h3{font-size:17px}.product-form{display:grid;gap:11px;padding:15px 18px;background:#f7faff;border-bottom:1px solid #e8eff7}.product-form label{display:grid;gap:5px;color:#536b82;font-size:11px;font-weight:800}.product-form input,.product-form select,.product-form textarea,.catalog-tools>input,.catalog-tools>select,.tracking-form input{box-sizing:border-box;width:100%;min-width:0;border:1px solid #d8e2ed;border-radius:9px;padding:11px 12px;background:#fff;color:#163552;font:inherit;font-size:12px;outline:none}.product-form input:focus,.product-form select:focus,.product-form textarea:focus,.catalog-tools>input:focus,.tracking-form input:focus{border-color:#4b8ac7;box-shadow:0 0 0 3px rgba(75,138,199,.12)}.form-row{display:grid;grid-template-columns:1fr 1fr;gap:10px}.save{justify-self:start;padding:0 18px}.catalog-tools{display:grid;grid-template-columns:minmax(0,1fr) 150px auto;align-items:center;gap:8px;padding:13px 18px;border-bottom:1px solid #edf2f7}.catalog-tools>input,.catalog-tools>select{height:38px}.inactive-toggle{display:flex;align-items:center;gap:6px;font-size:10px;color:#627991;white-space:nowrap}.inactive-toggle input{accent-color:#0d4e91}.product-row{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:13px 18px;border-bottom:1px solid #eef3f7}.product-row:last-child{border-bottom:0}.product-info{min-width:0;display:grid;gap:5px}.product-info strong{font-size:12px;line-height:1.4;color:#183654;overflow-wrap:anywhere}.product-info small{font-size:9px;color:#8797a8;overflow-wrap:anywhere}.product-info>b{font-size:12px;color:#174b80}.product-actions{display:flex;align-items:center;gap:8px;flex-shrink:0}.stock{font-size:8px;font-weight:900;letter-spacing:.05em;border-radius:999px;padding:6px 8px}.stock.active{color:#21784a;background:#e8f7ee}.stock.inactive{color:#a14d36;background:#fff0e9}.toggle{width:39px;height:23px;border:0;border-radius:999px;background:#c6d1dc;padding:3px;cursor:pointer;transition:background .18s ease}.toggle i{display:block;width:17px;height:17px;border-radius:50%;background:white;box-shadow:0 1px 4px #0002;transition:transform .18s ease}.toggle.on{background:#17834e}.toggle.on i{transform:translateX(16px)}.edit-price{min-height:31px;padding:0 9px;font-size:9px}.list-note{padding:0 18px 13px;color:#8192a4;font-size:10px}.empty{padding:24px 18px;color:#8495a7;font-size:12px;text-align:center}.feedback{display:flex;justify-content:space-between;align-items:center;gap:10px;padding:11px 13px;border-radius:10px;margin:10px 0;font-size:11px;line-height:1.5}.feedback button{border:0;background:transparent;font-size:18px;cursor:pointer;color:inherit}.feedback.error{background:#fff3f2;border:1px solid #f0d1ce;color:#963d39}.feedback.success{background:#effaf3;border:1px solid #cdebd7;color:#267044}.count-pill{border-radius:999px;padding:7px 10px;background:#eef5fc;color:#396d9e;font-size:9px;font-weight:900;white-space:nowrap}.order-cards{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;padding:13px}.order-card{border:1px solid #e7edf4;border-radius:12px;padding:13px;min-width:0}.order-top{display:flex;justify-content:space-between;align-items:center;gap:8px}.order-top>strong{font-size:11px;color:#183b5d;overflow-wrap:anywhere}.order-status{font-size:8px;font-weight:800;padding:5px 7px;border-radius:999px;background:#fff3db;color:#8b641d}.order-status.shipped{background:#e8f2ff;color:#2b64a0}.order-status.completed{background:#e8f7ee;color:#24754a}.order-status.cancelled{background:#fff0ee;color:#a33f37}.order-meta{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:5px;margin:11px 0}.order-meta strong{font-size:11px;overflow-wrap:anywhere}.order-meta>span{font-size:11px;font-weight:900;color:#174b80}.order-meta small{grid-column:1/-1;font-size:9px;color:#8796a7;overflow-wrap:anywhere}.whatsapp-action{width:100%;min-height:35px;color:#176b43;background:#f0faf4;border-color:#d1ecdc}.tracking-form{display:grid;grid-template-columns:1fr auto auto;gap:6px;margin-top:9px}.tracking-form input{min-height:36px;padding:8px;font-size:11px}.tracking-form .primary,.tracking-form .cancel{min-height:36px;padding:0 9px;font-size:10px}.cancel{background:#fff;color:#64788c}.refresh:focus-visible,.primary:focus-visible,.toggle:focus-visible,.edit-price:focus-visible,.whatsapp-action:focus-visible{outline:3px solid #8ec2f2;outline-offset:2px}@media(max-width:760px){.mobile-ops{margin-top:12px}.ops-title h2{font-size:18px}.ops-title p,.panel-title p{font-size:10px}.metric-grid{gap:7px}.metric-card{padding:11px 10px;border-radius:12px}.metric-card span,.metric-card small{font-size:9px}.metric-card strong{font-size:20px}.metric-card.revenue strong{font-size:14px}.catalog-tools{grid-template-columns:1fr 1fr;padding:11px 12px}.catalog-tools>input{grid-column:1/-1}.inactive-toggle{grid-column:1/-1}.product-row{padding:12px;align-items:flex-start}.product-actions{gap:6px;flex-wrap:wrap;justify-content:flex-end;max-width:145px}.edit-price{width:100%}.product-info strong{font-size:11px}.panel-title{padding:14px 12px}.product-form{padding:13px 12px}.order-cards{grid-template-columns:1fr;padding:10px}.tracking-form{grid-template-columns:1fr 1fr}.tracking-form input{grid-column:1/-1}.tracking-form .primary,.tracking-form .cancel{width:100%}}@media(max-width:390px){.ops-title{align-items:flex-start}.refresh{font-size:9px;padding:0 9px;min-height:34px}.metric-card{padding:10px 8px}.metric-card strong{font-size:17px}.metric-card.revenue strong{font-size:12px}.product-row{gap:7px}.product-actions{max-width:125px}.stock{font-size:7px;padding:5px 6px}.toggle{width:35px}.toggle.on i{transform:translateX(12px)}.form-row{grid-template-columns:1fr}.tracking-form{grid-template-columns:1fr}.tracking-form input{grid-column:auto}}
    `}</style>
  </section>
}
