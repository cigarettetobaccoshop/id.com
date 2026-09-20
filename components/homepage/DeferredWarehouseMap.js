import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

const MAP_SRC = 'https://maps.google.com/maps?q=Malang%2C%20Jawa%20Timur%2C%20Indonesia&z=12&output=embed&hl=id'
const GOOGLE_MAPS_LINK = 'https://maps.app.goo.gl/2Ga3N9ov1Zpyiqq59'

export default function DeferredWarehouseMap() {
  const [ready, setReady] = useState(false)
  const [footerSlot, setFooterSlot] = useState(null)

  useEffect(() => {
    const start = () => setReady(true)
    if ('requestIdleCallback' in window) {
      const id = window.requestIdleCallback(start, { timeout: 1800 })
      return () => window.cancelIdleCallback?.(id)
    }
    const id = window.setTimeout(start, 900)
    return () => window.clearTimeout(id)
  }, [])

  useEffect(() => {
    const footerGrid = document.querySelector('.r2-hp-final-footer-grid')
    const sourceSection = document.querySelector('.r2-hp-final-location')
    if (!footerGrid) return undefined

    sourceSection?.classList.add('is-relocated-to-footer')

    const slot = document.createElement('div')
    slot.className = 'r2-hp-final-footer-map-slot'
    slot.setAttribute('data-r2-footer-map', 'true')
    footerGrid.appendChild(slot)
    setFooterSlot(slot)

    return () => {
      sourceSection?.classList.remove('is-relocated-to-footer')
      setFooterSlot(null)
      slot.remove()
    }
  }, [])

  const warehouseCard = (
    <section className="r2-hp-final-footer-warehouse" aria-label="Warehouse location R2 NUSANTARA">
      <div className="r2-hp-final-footer-warehouse-copy">
        <span className="r2-hp-final-footer-kicker">WAREHOUSE LOCATION</span>
        <h2>Gudang R2 NUSANTARA<br /><em>Malang, Jawa Timur.</em></h2>
        <p>Lokasi fisik distributor untuk kebutuhan operasional dan konfirmasi kunjungan.</p>
        <div className="r2-hp-final-footer-hours">
          <span aria-hidden="true">◷</span>
          <strong>Senin—Sabtu <b>08.00—17.00 WIB</b></strong>
        </div>
        <a className="r2-hp-final-footer-location-link" href={GOOGLE_MAPS_LINK} target="_blank" rel="noreferrer">
          BUKA GOOGLE MAPS ↗
        </a>
      </div>

      <div className="r2-hp-final-footer-map-wrap">
        <div className="r2-hp-final-footer-map-head">
          <div>
            <span>LIVE WAREHOUSE MAP</span>
            <strong>Lokasi Gudang</strong>
          </div>
          <i aria-hidden="true"><b /></i>
        </div>
        <div className="r2-hp-final-footer-map-frame">
          {!ready ? (
            <button type="button" className="r2-hp-final-map-placeholder" onClick={() => setReady(true)}>
              <span>LOKASI GUDANG</span>
              <strong>Malang, Jawa Timur</strong>
              <small>Memuat peta saat browser idle · ketuk untuk buka sekarang</small>
            </button>
          ) : (
            <iframe
              src={MAP_SRC}
              className="r2-hp-final-map"
              loading="lazy"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
              title="Peta Lokasi Gudang R2 Nusantara Malang"
            />
          )}
          <a
            className="r2-hp-final-footer-map-open"
            href={GOOGLE_MAPS_LINK}
            target="_blank"
            rel="noreferrer"
          >
            BUKA MAPS ↗
          </a>
        </div>
        <p className="r2-hp-final-footer-map-meta">Malang · Jawa Timur <span>•</span> Distribusi nasional</p>
      </div>
      <style jsx global>{warehouseFooterStyles}</style>
    </section>
  )

  return footerSlot && typeof document !== 'undefined' ? createPortal(warehouseCard, footerSlot) : null
}

const warehouseFooterStyles = `
  .r2-hp-final-location.is-relocated-to-footer{display:none!important}
  .r2-hp-final-footer-map-slot{grid-column:1/-1;min-width:0;width:100%}
  .r2-hp-final-footer-warehouse{display:grid;grid-template-columns:minmax(0,.78fr) minmax(0,1.22fr);gap:16px;align-items:stretch;width:100%;margin-top:4px;padding:14px;border:1px solid rgba(148,163,184,.18);border-radius:24px;background:linear-gradient(145deg,rgba(255,255,255,.09),rgba(255,255,255,.035));box-shadow:0 20px 55px rgba(0,0,0,.18),inset 0 1px 0 rgba(255,255,255,.07);overflow:hidden}
  .r2-hp-final-footer-warehouse-copy{min-width:0;display:flex;flex-direction:column;justify-content:center;padding:8px 4px 8px 2px}
  .r2-hp-final-footer-kicker{font-size:7px;letter-spacing:.2em;font-weight:950;color:#9fc5ff}
  .r2-hp-final-footer-warehouse-copy h2{margin:12px 0 12px;color:#fff;font-size:clamp(24px,3vw,38px);line-height:.98;letter-spacing:-.045em}
  .r2-hp-final-footer-warehouse-copy h2 em{color:#e4c27e;font-style:normal}
  .r2-hp-final-footer-warehouse-copy>p{margin:0;max-width:500px;color:rgba(226,232,240,.72);font-size:11px;line-height:1.65}
  .r2-hp-final-footer-hours{display:flex;align-items:center;gap:9px;margin-top:18px;color:#dbeafe}
  .r2-hp-final-footer-hours>span{width:28px;height:28px;display:grid;place-items:center;border:1px solid rgba(159,197,255,.2);border-radius:9px;background:rgba(159,197,255,.08);color:#9fc5ff;font-size:18px}
  .r2-hp-final-footer-hours strong{display:grid;gap:3px;font-size:9px;letter-spacing:.02em}
  .r2-hp-final-footer-hours b{color:#fff;font-size:10px}
  .r2-hp-final-footer-location-link{align-self:flex-start;margin-top:18px;padding:10px 13px;border:1px solid rgba(159,197,255,.22);border-radius:10px;background:rgba(31,120,232,.14);color:#dbeafe!important;font-size:7px!important;letter-spacing:.12em;font-weight:900;transition:transform .2s ease,background .2s ease,border-color .2s ease}
  .r2-hp-final-footer-location-link:hover{transform:translateY(-2px);background:rgba(31,120,232,.24);border-color:rgba(159,197,255,.4)}
  .r2-hp-final-footer-map-wrap{min-width:0;border:1px solid rgba(148,163,184,.18);border-radius:20px;background:rgba(4,17,36,.28);overflow:hidden}
  .r2-hp-final-footer-map-head{display:flex;align-items:center;justify-content:space-between;gap:14px;padding:13px 14px 10px;color:#fff}
  .r2-hp-final-footer-map-head div{display:grid;gap:4px}
  .r2-hp-final-footer-map-head span{font-size:7px;letter-spacing:.19em;font-weight:900;color:#9fc5ff}
  .r2-hp-final-footer-map-head strong{font-size:13px;line-height:1.15}
  .r2-hp-final-footer-map-head i{width:26px;height:26px;border:1px solid rgba(255,255,255,.16);border-radius:50%;display:grid;place-items:center;position:relative}
  .r2-hp-final-footer-map-head i:before{content:"";width:8px;height:8px;border-radius:50%;background:#6ee7b7;box-shadow:0 0 0 5px rgba(110,231,183,.09)}
  .r2-hp-final-footer-map-head i b{position:absolute;inset:7px;border:1px solid rgba(110,231,183,.45);border-radius:50%;animation:r2FooterMapPulse 2.2s ease-out infinite}
  .r2-hp-final-footer-map-frame{position:relative;margin:0 9px;height:112px;border-radius:12px;overflow:hidden;background:#dce7f3}
  .r2-hp-final-footer-map .r2-hp-final-map{display:block;width:100%;height:100%;border:0}
  .r2-hp-final-footer-map .r2-hp-final-map-placeholder{display:grid;width:100%;height:100%;place-content:center;gap:7px;padding:18px;border:0;background:linear-gradient(135deg,#e8f1fa,#cddceb);color:#0b2444;text-align:center;cursor:pointer}
  .r2-hp-final-footer-map .r2-hp-final-map-placeholder span{font-size:7px;letter-spacing:.2em;font-weight:950;color:#51708f}
  .r2-hp-final-footer-map .r2-hp-final-map-placeholder strong{font-size:15px}
  .r2-hp-final-footer-map .r2-hp-final-map-placeholder small{font-size:8px;line-height:1.4;color:#637991}
  .r2-hp-final-footer-map-open{position:absolute;right:9px;bottom:9px;padding:7px 9px;border:1px solid rgba(255,255,255,.34);border-radius:9px;background:rgba(7,26,53,.82);backdrop-filter:blur(10px);color:#fff!important;font-size:7px!important;letter-spacing:.12em;font-weight:900;transition:transform .2s ease,background .2s ease}
  .r2-hp-final-footer-map-open:hover{transform:translateY(-2px);background:rgba(7,26,53,.95)}
  .r2-hp-final-footer-map-meta{margin:8px 13px 11px!important;font-size:8px!important;color:rgba(226,232,240,.68)!important;letter-spacing:.03em}
  .r2-hp-final-footer-map-meta span{margin:0 5px;color:#6ee7b7}
  @keyframes r2FooterMapPulse{0%{transform:scale(.6);opacity:.9}70%,100%{transform:scale(1.5);opacity:0}}
  @media (max-width:900px){.r2-hp-final-footer-warehouse{grid-template-columns:1fr;gap:16px}.r2-hp-final-footer-map-slot{max-width:none;justify-self:stretch}.r2-hp-final-footer-map-frame{height:100px}}
  @media (max-width:620px){.r2-hp-final-footer-warehouse{grid-template-columns:1fr;padding:12px;border-radius:18px;gap:10px}.r2-hp-final-footer-warehouse-copy{padding:5px 3px 3px}.r2-hp-final-footer-warehouse-copy h2{font-size:24px;margin:8px 0 8px}.r2-hp-final-footer-warehouse-copy>p{font-size:10px;line-height:1.55}.r2-hp-final-footer-hours{margin-top:14px}.r2-hp-final-footer-location-link{margin-top:13px}.r2-hp-final-footer-map-frame{height:92px}}
  @media (prefers-reduced-motion:reduce){.r2-hp-final-footer-map-head i b,.r2-hp-final-footer-location-link,.r2-hp-final-footer-map-open{animation:none;transition:none}
  }
`