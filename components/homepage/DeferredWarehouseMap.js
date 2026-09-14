import { useEffect, useState } from 'react'

const MAP_SRC = 'https://maps.google.com/maps?q=Malang%2C%20Jawa%20Timur%2C%20Indonesia&z=12&output=embed&hl=id'

export default function DeferredWarehouseMap() {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const start = () => setReady(true)
    if ('requestIdleCallback' in window) {
      const id = window.requestIdleCallback(start, { timeout: 1800 })
      return () => window.cancelIdleCallback?.(id)
    }
    const id = window.setTimeout(start, 900)
    return () => window.clearTimeout(id)
  }, [])

  return (
    <div className="r2-home-final-map-wrap">
      {!ready ? (
        <button type="button" className="r2-home-final-map-placeholder" onClick={() => setReady(true)}>
          <span>LOKASI GUDANG</span>
          <strong>Malang, Jawa Timur</strong>
          <small>Memuat peta saat browser idle · ketuk untuk buka sekarang</small>
        </button>
      ) : (
        <iframe
          src={MAP_SRC}
          className="r2-home-final-map"
          loading="lazy"
          allowFullScreen
          referrerPolicy="no-referrer-when-downgrade"
          title="Peta Lokasi Gudang R2 Nusantara Malang"
        />
      )}
    </div>
  )
}
