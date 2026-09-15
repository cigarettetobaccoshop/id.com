import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

const MAP_SRC = 'https://maps.google.com/maps?q=Malang%2C%20Jawa%20Timur%2C%20Indonesia&z=12&output=embed&hl=id'

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
    if (!footerGrid) return undefined

    const slot = document.createElement('div')
    slot.className = 'r2-hp-final-footer-map-slot'
    slot.setAttribute('data-r2-footer-map', 'true')
    footerGrid.appendChild(slot)
    setFooterSlot(slot)

    return () => {
      setFooterSlot(null)
      slot.remove()
    }
  }, [])

  const mapCard = (
    <section className="r2-hp-final-footer-map" aria-label="Mini peta lokasi gudang R2 NUSANTARA">
      <div className="r2-hp-final-footer-map-head">
        <div>
          <span>WAREHOUSE MAP</span>
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
          href="https://maps.google.com/?q=Malang%2C%20Jawa%20Timur%2C%20Indonesia"
          target="_blank"
          rel="noreferrer"
        >
          BUKA MAPS ↗
        </a>
      </div>
      <p>Malang · Jawa Timur <span>•</span> Distribusi nasional</p>
      <style jsx global>{`
        .r2-hp-final-footer-grid{grid-template-columns:minmax(0,1.35fr) minmax(120px,.7fr) minmax(150px,.85fr) minmax(230px,1fr)!important;align-items:start}
        .r2-hp-final-footer-map-slot{min-width:0;display:block}
        .r2-hp-final-footer-map{min-width:0;border:1px solid rgba(148,163,184,.18);border-radius:20px;background:linear-gradient(145deg,rgba(255,255,255,.085),rgba(255,255,255,.035));box-shadow:0 18px 45px rgba(0,0,0,.16);overflow:hidden}
        .r2-hp-final-footer-map-head{display:flex;align-items:center;justify-content:space-between;gap:14px;padding:14px 15px 11px;color:#fff}
        .r2-hp-final-footer-map-head div{display:grid;gap:4px}
        .r2-hp-final-footer-map-head span{font-size:7px;letter-spacing:.19em;font-weight:900;color:#9fc5ff}
        .r2-hp-final-footer-map-head strong{font-size:13px;line-height:1.15;letter-spacing:-.01em}
        .r2-hp-final-footer-map-head i{width:26px;height:26px;border:1px solid rgba(255,255,255,.16);border-radius:50%;display:grid;place-items:center;position:relative}
        .r2-hp-final-footer-map-head i:before{content:"";width:8px;height:8px;border-radius:50%;background:#6ee7b7;box-shadow:0 0 0 5px rgba(110,231,183,.09)}
        .r2-hp-final-footer-map-head i b{position:absolute;inset:7px;border:1px solid rgba(110,231,183,.45);border-radius:50%;animation:r2FooterMapPulse 2.2s ease-out infinite}
        .r2-hp-final-footer-map-frame{position:relative;margin:0 9px;height:150px;border-radius:14px;overflow:hidden;background:#dce7f3}
        .r2-hp-final-footer-map .r2-hp-final-map,.r2-hp-final-footer-map .r2-home-final-map{display:block;width:100%;height:100%;border:0}
        .r2-hp-final-footer-map .r2-hp-final-map-placeholder{display:grid;width:100%;height:100%;place-content:center;gap:7px;padding:18px;border:0;background:linear-gradient(135deg,#e8f1fa,#cddceb);color:#0b2444;text-align:center;cursor:pointer}
        .r2-hp-final-footer-map .r2-hp-final-map-placeholder span{font-size:7px;letter-spacing:.2em;font-weight:950;color:#51708f}
        .r2-hp-final-footer-map .r2-hp-final-map-placeholder strong{font-size:15px}
        .r2-hp-final-footer-map .r2-hp-final-map-placeholder small{font-size:8px;line-height:1.4;color:#637991}
        .r2-hp-final-footer-map-open{position:absolute;right:9px;bottom:9px;padding:7px 9px;border:1px solid rgba(255,255,255,.34);border-radius:9px;background:rgba(7,26,53,.82);backdrop-filter:blur(10px);color:#fff!important;font-size:7px!important;letter-spacing:.12em;font-weight:900;transition:transform .2s ease,background .2s ease}
        .r2-hp-final-footer-map-open:hover{transform:translateY(-2px);background:rgba(7,26,53,.95)}
        .r2-hp-final-footer-map>p{margin:9px 14px 13px!important;font-size:8px!important;color:rgba(226,232,240,.72)!important;letter-spacing:.03em}
        .r2-hp-final-footer-map>p span{margin:0 5px;color:#6ee7b7}
        .r2-hp-final-location{grid-template-columns:1fr!important}
        .r2-hp-final-location>div:first-child{max-width:780px}
        @keyframes r2FooterMapPulse{0%{transform:scale(.6);opacity:.9}70%,100%{transform:scale(1.5);opacity:0}}
        @media (max-width:900px){
          .r2-hp-final-footer-grid{grid-template-columns:minmax(0,1.35fr) minmax(120px,.8fr) minmax(170px,1fr)!important}
          .r2-hp-final-footer-map-slot{grid-column:1/-1;max-width:430px;width:100%;justify-self:end}
        }
        @media (max-width:620px){
          .r2-hp-final-footer-grid{grid-template-columns:1fr 1fr!important}
          .r2-hp-final-footer-map-slot{grid-column:1/-1;max-width:none;justify-self:stretch}
          .r2-hp-final-footer-map-frame{height:145px}
        }
        @media (prefers-reduced-motion:reduce){.r2-hp-final-footer-map-head i b{animation:none}}
      `}</style>
    </section>
  )

  return footerSlot && typeof document !== 'undefined' ? createPortal(mapCard, footerSlot) : null
}
