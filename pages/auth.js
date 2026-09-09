import Head from 'next/head'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import {
  signInWithGoogle,
  signInWithGitHub,
  signOut,
  onAuthStateChange,
  getUserProfile,
} from '../lib/supabaseOAuth'

export default function AuthPage() {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    const unsubscribe = onAuthStateChange(async (_event, authUser) => {
      setUser(authUser)
      if (!authUser) {
        setProfile(null)
        return
      }
      try {
        const userProfile = await getUserProfile()
        setProfile(userProfile)
        setMessage('Akun berhasil terhubung.')
      } catch (err) {
        setMessage(`Profil tidak dapat dimuat: ${err.message}`)
      }
    })
    return unsubscribe
  }, [])

  const handleGoogleSignIn = async () => {
    setLoading(true)
    setMessage('Menghubungkan ke Google...')
    try { await signInWithGoogle() } catch (err) { setMessage(`Google: ${err.message}`); setLoading(false) }
  }

  const handleGitHubSignIn = async () => {
    setLoading(true)
    setMessage('Menghubungkan ke GitHub...')
    try { await signInWithGitHub() } catch (err) { setMessage(`GitHub: ${err.message}`); setLoading(false) }
  }

  const handleSignOut = async () => {
    setLoading(true)
    try { await signOut(); setUser(null); setProfile(null); setMessage('Akun telah dilepas dari perangkat ini.') }
    catch (err) { setMessage(`Gagal keluar: ${err.message}`) }
    finally { setLoading(false) }
  }

  return (
    <>
      <Head>
        <title>Akun Mitra — R2 NUSANTARA</title>
        <meta name="description" content="Akun opsional untuk mitra R2 Nusantara. Katalog dan checkout tetap dapat digunakan tanpa login." />
      </Head>
      <main className="account-page">
        <section className="account-card">
          <span className="eyebrow">R2 NUSANTARA · MITRA</span>
          <h1>Akun bersifat opsional.</h1>
          <p className="lead">Anda tetap dapat melihat katalog, memasukkan produk ke keranjang, dan melakukan checkout tanpa login.</p>

          {!user ? (
            <>
              <div className="optional-note"><b>Login hanya untuk kemudahan.</b><span>Gunakan akun untuk pengalaman yang lebih personal. Tidak ada pemaksaan login pada alur pemesanan.</span></div>
              <div className="actions">
                <button onClick={handleGoogleSignIn} disabled={loading} className="oauth google">{loading ? 'Menghubungkan...' : 'Lanjut dengan Google'}</button>
                <button onClick={handleGitHubSignIn} disabled={loading} className="oauth github">{loading ? 'Menghubungkan...' : 'Lanjut dengan GitHub'}</button>
              </div>
              <div className="divider"><span>atau</span></div>
              <Link href="/products" className="guest">Lanjut sebagai Tamu →</Link>
            </>
          ) : (
            <div className="profile">
              {profile?.avatar ? <img src={profile.avatar} alt="Profil" /> : <div className="avatar">R2</div>}
              <div><strong>{profile?.name || user.email || 'Mitra R2'}</strong><span>{profile?.email || user.email}</span><small>Login opsional · {profile?.provider || 'OAuth'}</small></div>
              <button onClick={handleSignOut} disabled={loading} className="signout">Keluar</button>
            </div>
          )}

          {message && <p className="message" role="status">{message}</p>}
          <div className="links"><Link href="/">Beranda</Link><Link href="/products">Katalog</Link><Link href="/checkout">Checkout</Link></div>
        </section>
      </main>
      <style jsx>{`
        .account-page{min-height:calc(100vh - 120px);display:grid;place-items:center;padding:34px 18px 110px;background:linear-gradient(180deg,#fafaf8 0%,#f4f6fa 100%)}
        .account-card{width:min(560px,100%);background:#fff;border:1px solid #e2e6ed;border-radius:24px;padding:30px;box-shadow:0 18px 55px rgba(17,35,68,.08)}
        .eyebrow{font-size:9px;font-weight:900;letter-spacing:.18em;color:#a77b18}.account-card h1{margin:10px 0 8px;color:#071a45;font-size:clamp(28px,7vw,42px);letter-spacing:-.04em}.lead{margin:0;color:#64748b;font-size:13px;line-height:1.65}.optional-note{display:grid;gap:5px;margin:22px 0;padding:15px;border:1px solid #ead9a7;background:#fffaf0;border-radius:13px;color:#475569;font-size:10px;line-height:1.55}.optional-note b{color:#071a45}.actions{display:grid;gap:10px}.oauth,.guest,.signout{width:100%;min-height:46px;border-radius:11px;font-size:11px;font-weight:900;cursor:pointer;text-decoration:none;display:flex;align-items:center;justify-content:center}.oauth{border:1px solid #dfe4eb}.oauth.google{background:#fff;color:#172033}.oauth.github{background:#071a45;color:#fff;border-color:#071a45}.oauth:disabled,.signout:disabled{opacity:.6;cursor:wait}.divider{display:flex;align-items:center;gap:10px;margin:18px 0;color:#94a3b8;font-size:9px}.divider:before,.divider:after{content:'';height:1px;background:#e7eaf0;flex:1}.guest{background:#f6f7fa;color:#071a45;border:1px solid #e1e5ec}.profile{display:grid;grid-template-columns:52px 1fr auto;gap:12px;align-items:center;margin-top:22px;padding:14px;border:1px solid #e2e6ed;border-radius:14px}.profile img,.avatar{width:52px;height:52px;border-radius:50%;object-fit:cover}.avatar{display:grid;place-items:center;background:#071a45;color:#f3c94f;font-weight:900}.profile div:nth-child(2){min-width:0;display:grid;gap:3px}.profile strong{font-size:11px;color:#101a31;overflow:hidden;text-overflow:ellipsis}.profile span,.profile small{font-size:8px;color:#64748b;overflow:hidden;text-overflow:ellipsis}.signout{width:auto;padding:0 13px;background:#fff;border:1px solid #e1e5ec;color:#8b2d2d}.message{margin:15px 0 0;padding:10px 12px;border-radius:9px;background:#f6f7fa;color:#526078;font-size:9px;line-height:1.5}.links{display:flex;justify-content:center;gap:18px;margin-top:24px;padding-top:17px;border-top:1px solid #edf0f4}.links a{color:#64748b;text-decoration:none;font-size:9px;font-weight:800}.links a:hover{color:#071a45}@media(max-width:520px){.account-card{padding:23px;border-radius:20px}.profile{grid-template-columns:44px 1fr}.profile img,.avatar{width:44px;height:44px}.signout{grid-column:1/-1;width:100%;min-height:40px}.links{gap:13px}}
      `}</style>
    </>
  )
}
