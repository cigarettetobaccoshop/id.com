import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function StorageDemoPage() {
  const [files, setFiles] = useState([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')

  useEffect(() => {
    let active = true
    async function loadFiles() {
      const { data, error } = await supabase.storage.from('public').list('', { limit: 50, offset: 0, sortBy: { column: 'created_at', order: 'desc' } })
      if (!active) return
      if (error) setMessage(`Storage belum tersedia: ${error.message}`)
      else setFiles(data || [])
      setLoading(false)
    }
    loadFiles()
    return () => { active = false }
  }, [])

  return (
    <main style={styles.page}>
      <section style={styles.card}>
        <a href="/" style={styles.back}>← Beranda</a>
        <p style={styles.eyebrow}>R2 NUSANTARA</p>
        <h1 style={styles.title}>Storage</h1>
        <p style={styles.copy}>Halaman diagnostik Supabase Storage tanpa akses ke tabel aplikasi yang tidak digunakan.</p>
        {loading && <p style={styles.muted}>Memuat bucket...</p>}
        {!loading && message && <p style={styles.error}>{message}</p>}
        {!loading && !message && <p style={styles.muted}>{files.length} file ditemukan pada bucket public.</p>}
      </section>
    </main>
  )
}

const styles = {
  page: { minHeight: '100vh', padding: 20, display: 'grid', placeItems: 'center', background: '#0b0d10', color: '#f4f5f7', fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' },
  card: { width: 'min(100%, 680px)', padding: 'clamp(24px, 6vw, 48px)', border: '1px solid #27303b', borderRadius: 28, background: '#15191f', boxShadow: '0 25px 80px rgba(0,0,0,.35)' },
  back: { display: 'inline-block', marginBottom: 30, color: '#b9c7db', textDecoration: 'none' },
  eyebrow: { margin: 0, color: '#79b8ff', letterSpacing: '.18em', fontSize: 12, fontWeight: 700 },
  title: { margin: '8px 0', fontSize: 'clamp(38px, 8vw, 64px)', letterSpacing: '-.045em' },
  copy: { color: '#9aa5b3', lineHeight: 1.6 },
  muted: { color: '#7e8998' },
  error: { color: '#ff9d9d' },
}
