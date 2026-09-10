import Head from 'next/head'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import {
  signInWithGoogle,
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

  const handleSignOut = async () => {
    setLoading(true)
    try { await signOut(); setUser(null); setProfile(null); setMessage('Akun telah dilepas dari perangkat ini.') }
    catch (err) { setMessage(`Gagal keluar: ${err.message}`) }
    finally { setLoading(false) }
  }

  return (
    <>
      <Head>
        <title>Akun — R2 NUSANTARA</title>
        <meta name="description" content="Kelola akun R2 NUSANTARA. Login Google bersifat opsional; katalog dan checkout tetap dapat digunakan sebagai tamu." />
      </Head>
      <main className="account-page">
        <section className="account-shell" aria-labelledby="account-title">
          <div className="account-brand">
            <div className="brand-mark" aria-hidden="true">R2</div>
            <div className="brand-copy"><strong>R2 NUSANTARA</strong><span>Gudang Distributor · Resmi</span></div>
            <span className="verified" aria-label="Terverifikasi">✓</span>
          </div>

          <div className="account-card">
            <div className="eyebrow">AKUN & LOGIN</div>
            <h1 id="account-title">Selamat datang kembali.</h1>
            <p className="lead">Login untuk pengalaman yang lebih personal. Akun tetap opsional dan tidak menghalangi katalog maupun checkout.</p>

            {!user ? (
              <>
                <div className="login-panel">
                  <div className="panel-icon" aria-hidden="true">G</div>
                  <div className="panel-copy"><strong>Masuk dengan Google</strong><span>Gunakan akun Google Anda untuk melanjutkan dengan aman.</span></div>
                  <span className="secure-pill">AMAN</span>
                </div>

                <button onClick={handleGoogleSignIn} disabled={loading} className="google-button" aria-label="Lanjut dengan Google">
                  <span className="google-logo" aria-hidden="true">G</span>
                  <span>{loading ? 'Menghubungkan...' : 'Lanjut dengan Google'}</span>
                  {!loading && <span className="arrow" aria-hidden="true">→</span>}
                </button>

                <div className="trust-row"><span>✓ OAuth Google</span><span>✓ Login opsional</span><span>✓ Aman</span></div>
                <div className="divider"><span>atau</span></div>
                <Link href="/products" className="guest">Lanjut sebagai Tamu <span>→</span></Link>
              </>
            ) : (
              <div className="profile">
                {profile?.avatar ? <img src={profile.avatar} alt="Foto profil" /> : <div className="avatar">R2</div>}
                <div className="profile-copy"><strong>{profile?.name || user.email || 'Akun R2'}</strong><span>{profile?.email || user.email}</span><small>Login Google · Akun terhubung</small></div>
                <button onClick={handleSignOut} disabled={loading} className="signout">Keluar</button>
              </div>
            )}

            {message && <p className="message" role="status">{message}</p>}
          </div>

          <nav className="account-links" aria-label="Navigasi akun"><Link href="/">Beranda</Link><Link href="/products">Katalog</Link><Link href="/checkout">Checkout</Link></nav>
          <p className="account-footnote">R2 NUSANTARA · Amanah untuk langganan jangka panjang</p>
        </section>
      </main>
      <style jsx>{`
        .account-page{min-height:100vh;display:grid;place-items:center;padding:28px 16px 96px;background:radial-gradient(circle at 50% -10%,rgba(38,103,196,.12),transparent 42%),linear-gradient(180deg,#f8fbff 0%,#eef3f9 100%);color:#0b1d41}
        .account-shell{width:min(520px,100%)}
        .account-brand{display:flex;align-items:center;gap:11px;padding:0 4px 16px}.brand-mark{width:42px;height:42px;border-radius:13px;display:grid;place-items:center;background:linear-gradient(145deg,#0a2b63,#1166c7);color:#fff;font-weight:950;font-size:13px;letter-spacing:-.04em;box-shadow:0 9px 24px rgba(10,58,125,.2);border:1px solid rgba(255,255,255,.7)}.brand-copy{display:grid;gap:2px;min-width:0}.brand-copy strong{font-size:11px;letter-spacing:.08em}.brand-copy span{font-size:8px;color:#718096}.verified{margin-left:auto;width:20px;height:20px;border-radius:50%;display:grid;place-items:center;background:#1769d2;color:#fff;font-size:11px;font-weight:900;box-shadow:0 0 0 4px rgba(23,105,210,.08)}
        .account-card{position:relative;overflow:hidden;background:rgba(255,255,255,.94);border:1px solid #dce5f0;border-radius:26px;padding:30px;box-shadow:0 24px 70px rgba(17,48,88,.11);backdrop-filter:blur(14px)}.account-card:before{content:'';position:absolute;inset:0 0 auto;height:3px;background:linear-gradient(90deg,#0a2b63,#1976d2,#8ebcf4)}
        .eyebrow{display:inline-flex;padding:6px 9px;border-radius:7px;background:#edf5ff;color:#1762b8;font-size:8px;font-weight:950;letter-spacing:.18em}h1{margin:15px 0 8px;font-size:clamp(27px,7vw,38px);line-height:1.04;letter-spacing:-.045em;color:#071a45}.lead{margin:0;color:#63748d;font-size:12px;line-height:1.65}
        .login-panel{display:grid;grid-template-columns:40px 1fr auto;gap:11px;align-items:center;margin:24px 0 12px;padding:13px;border:1px solid #e0e8f2;border-radius:15px;background:#f8fbff}.panel-icon{width:40px;height:40px;border-radius:11px;display:grid;place-items:center;background:#fff;border:1px solid #e1e7ef;font-weight:950;font-size:16px;color:#4285f4}.panel-copy{display:grid;gap:3px;min-width:0}.panel-copy strong{font-size:11px}.panel-copy span{font-size:8px;line-height:1.45;color:#728199}.secure-pill{font-size:7px;font-weight:950;letter-spacing:.08em;color:#19733e;background:#eaf8ef;border:1px solid #d0eedb;border-radius:999px;padding:5px 7px}
        .google-button{width:100%;min-height:52px;border:1px solid #cfd9e6;border-radius:14px;background:#fff;color:#142541;display:flex;align-items:center;justify-content:center;gap:10px;padding:0 14px;font-size:11px;font-weight:900;cursor:pointer;box-shadow:0 7px 18px rgba(24,54,92,.06);transition:transform .18s ease,box-shadow .18s ease,border-color .18s ease}.google-button:hover:not(:disabled){transform:translateY(-1px);border-color:#9db9da;box-shadow:0 12px 25px rgba(24,54,92,.1)}.google-button:focus-visible,.guest:focus-visible,.signout:focus-visible{outline:3px solid rgba(25,118,210,.2);outline-offset:2px}.google-button:disabled{opacity:.62;cursor:wait}.google-logo{width:24px;height:24px;border-radius:7px;display:grid;place-items:center;background:#fff;font-weight:950;font-size:15px;color:#4285f4}.arrow{margin-left:auto;color:#1769d2;font-size:16px}
        .trust-row{display:flex;justify-content:center;flex-wrap:wrap;gap:10px;margin:13px 0 0;color:#6b7b91;font-size:7.5px;font-weight:800}.trust-row span{padding:5px 7px;border-radius:999px;background:#f5f8fc}.divider{display:flex;align-items:center;gap:10px;margin:21px 0 13px;color:#9aa8ba;font-size:8px}.divider:before,.divider:after{content:'';height:1px;background:#e5eaf1;flex:1}.guest{min-height:46px;width:100%;display:flex;align-items:center;justify-content:center;gap:8px;border:1px solid #d8e1ec;border-radius:13px;background:#f7f9fc;color:#17365f;text-decoration:none;font-size:10px;font-weight:900;transition:background .18s ease,border-color .18s ease}.guest:hover{background:#eef5fd;border-color:#bfd2e8}.guest span{font-size:14px;color:#1769d2}
        .profile{display:grid;grid-template-columns:52px 1fr auto;gap:12px;align-items:center;margin-top:22px;padding:14px;border:1px solid #dfe7f1;border-radius:15px;background:#f8fbff}.profile img,.avatar{width:52px;height:52px;border-radius:50%;object-fit:cover}.avatar{display:grid;place-items:center;background:linear-gradient(145deg,#0a2b63,#1769d2);color:#fff;font-weight:950}.profile-copy{min-width:0;display:grid;gap:3px}.profile-copy strong{font-size:11px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.profile-copy span,.profile-copy small{font-size:8px;color:#6e7e94;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.profile-copy small{color:#19733e;font-weight:800}.signout{width:auto;min-height:38px;padding:0 12px;border:1px solid #d8e0e9;border-radius:10px;background:#fff;color:#8a3030;font-size:9px;font-weight:900;cursor:pointer}.signout:disabled{opacity:.6;cursor:wait}
        .message{margin:14px 0 0;padding:10px 12px;border-radius:10px;background:#f4f7fb;color:#53657d;font-size:8.5px;line-height:1.5;border:1px solid #e5eaf1}.account-links{display:flex;justify-content:center;gap:20px;margin-top:18px}.account-links a{color:#6b7b91;text-decoration:none;font-size:8.5px;font-weight:850}.account-links a:hover{color:#1769d2}.account-footnote{text-align:center;margin:13px 0 0;color:#9aa8ba;font-size:7px;letter-spacing:.03em}
        @media(max-width:520px){.account-page{padding:18px 13px 82px}.account-card{padding:23px 19px;border-radius:22px}.account-brand{padding-bottom:12px}.brand-mark{width:38px;height:38px;border-radius:11px}.login-panel{grid-template-columns:38px 1fr}.panel-icon{width:38px;height:38px}.secure-pill{grid-column:2;justify-self:start}.profile{grid-template-columns:44px 1fr}.profile img,.avatar{width:44px;height:44px}.signout{grid-column:1/-1;width:100%}.account-links{gap:16px}}@media(prefers-reduced-motion:reduce){.google-button,.guest{transition:none}}
      `}</style>
    </>
  )
}
