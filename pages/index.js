import Link from 'next/link'

export default function HomePage() {
  return (
    <main style={styles.page}>
      <section style={styles.hero}>
        <div style={styles.mark}>R2</div>
        <p style={styles.eyebrow}>R2 NUSANTARA · WHOLESALE PARTNER</p>
        <h1 style={styles.title}>Skala Bisnis Anda,<br />Gudang Kami Siap Penuhi.</h1>
        <p style={styles.copy}>Portal katalog distributor dengan stok yang terhubung langsung ke sistem data R2 Nusantara.</p>
        <div style={styles.actions}>
          <Link href="/products" style={styles.primary}>Lihat Katalog</Link>
          <Link href="/contact" style={styles.secondary}>Hubungi Kami</Link>
        </div>
      </section>
    </main>
  )
}

const styles = {
  page: { minHeight: '100vh', padding: 20, display: 'grid', placeItems: 'center', background: 'radial-gradient(circle at 15% 10%, #1c2938 0, transparent 35%), radial-gradient(circle at 90% 90%, #18212b 0, transparent 32%), #090b0e', color: '#f5f7fa', fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' },
  hero: { width: 'min(100%, 920px)', padding: 'clamp(30px, 8vw, 80px)', border: '1px solid #27303b', borderRadius: 32, background: 'rgba(18,22,28,.86)', boxShadow: '0 30px 100px rgba(0,0,0,.38)', backdropFilter: 'blur(20px)' },
  mark: { width: 56, height: 56, display: 'grid', placeItems: 'center', marginBottom: 30, border: '1px solid #435267', borderRadius: 18, color: '#d8e6fb', fontWeight: 900, letterSpacing: '-.08em' },
  eyebrow: { margin: 0, color: '#7fbaff', letterSpacing: '.18em', fontSize: 11, fontWeight: 800 },
  title: { margin: '14px 0 22px', fontSize: 'clamp(42px, 9vw, 82px)', lineHeight: .98, letterSpacing: '-.055em', maxWidth: 850 },
  copy: { maxWidth: 650, color: '#9da8b6', fontSize: 'clamp(16px, 2vw, 20px)', lineHeight: 1.6 },
  actions: { display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 34 },
  primary: { display: 'inline-block', padding: '14px 20px', borderRadius: 15, background: '#d8e6fb', color: '#101419', textDecoration: 'none', fontWeight: 800 },
  secondary: { display: 'inline-block', padding: '14px 20px', borderRadius: 15, border: '1px solid #354252', color: '#d4dbe5', textDecoration: 'none', fontWeight: 700 },
}
