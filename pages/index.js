import Head from 'next/head'
import Link from 'next/link'

export default function HomePage() {
  return (
    <>
      <Head>
        <title>R2 NUSANTARA — Wholesale Trading Partner</title>
        <meta name="description" content="Portal wholesale R2 Nusantara untuk mitra distribusi terverifikasi dengan katalog dan stok terhubung." />
        <meta name="theme-color" content="#080A0D" />
      </Head>

      <main className="site-shell">
        <header className="topbar">
          <Link href="/" className="brand" aria-label="R2 Nusantara — Beranda">
            <img src="/assets/logo/logo.png" alt="R2 Nusantara" className="brand-logo" width="42" height="42" />
            <span><strong>R2 NUSANTARA</strong><small>WHOLESALE TRADING PARTNER</small></span>
          </Link>
          <nav className="desktop-nav" aria-label="Navigasi utama">
            <Link href="/products">CATALOG</Link>
            <a href="#partner">PARTNER</a>
            <a href="#about">ABOUT</a>
            <Link href="/contact">CONTACT</Link>
          </nav>
          <Link href="/products" className="portal-button">ACCESS PORTAL <span>↗</span></Link>
        </header>

        <section className="hero" id="about">
          <div className="ambient ambient-one" />
          <div className="ambient ambient-two" />
          <div className="grain" />
          <div className="hero-copy">
            <p className="eyebrow"><span className="status-dot" /> WHOLESALE TRADING PARTNER</p>
            <h1>R2<br /><em>NUSANTARA.</em></h1>
            <p className="lead">Akses katalog distributor yang dirancang untuk mitra serius — presisi, transparan, dan siap mendukung skala distribusi Anda.</p>
            <div className="actions">
              <Link href="/products" className="button button-primary">EXPLORE CATALOG <span>↗</span></Link>
              <Link href="/contact" className="button button-ghost">CONTACT PARTNER</Link>
            </div>
            <div className="trust-line"><span>LIVE CATALOG</span><i /> <span>VERIFIED DATA</span><i /> <span>B2B ACCESS</span></div>
          </div>

          <aside className="live-panel" aria-label="Status katalog">
            <div className="panel-head"><span>R2 / LIVE SYSTEM</span><span className="online"><b /> ONLINE</span></div>
            <div className="metric"><strong>233</strong><span>PRODUCTS</span></div>
            <div className="metric-row"><span>CATALOG STATUS</span><strong>ACTIVE</strong></div>
            <div className="metric-row"><span>DATA SOURCE</span><strong>LIVE DB</strong></div>
            <div className="signal"><span /><span /><span /><span /><span /><span /><span /><span /></div>
            <p>Inventory interface for verified wholesale partners.</p>
          </aside>
        </section>

        <section className="statement" id="partner">
          <span>01 / PARTNER PLATFORM</span>
          <h2>Built for distribution.<br /><em>Designed for trust.</em></h2>
          <p>R2 Nusantara menyatukan katalog, informasi operasional, dan akses partner dalam satu pengalaman digital yang ringkas.</p>
        </section>

        <section className="feature-grid">
          <article><span>01</span><h3>LIVE CATALOG</h3><p>Informasi produk terhubung langsung dengan sumber data produksi.</p></article>
          <article><span>02</span><h3>WHOLESALE FIRST</h3><p>Hierarki informasi diprioritaskan untuk kebutuhan pengadaan dan distribusi.</p></article>
          <article><span>03</span><h3>PARTNER ACCESS</h3><p>Jalur komunikasi langsung untuk kebutuhan mitra dan operasional.</p></article>
        </section>

        <footer className="footer">
          <span>© {new Date().getFullYear()} R2 NUSANTARA</span>
          <span>WHOLESALE TRADING PARTNER</span>
        </footer>
      </main>

      <nav className="bottom-nav" aria-label="Navigasi mobile">
        <Link href="/" className="active"><span>⌂</span>HOME</Link>
        <Link href="/products"><span>▦</span>CATALOG</Link>
        <a href="#partner"><span>◉</span>PARTNER</a>
        <Link href="/contact"><span>◌</span>CONTACT</Link>
      </nav>

      <style jsx global>{`
        :root{--bg:#080A0D;--surface:rgba(255,255,255,.045);--surface-strong:rgba(255,255,255,.075);--text:#F4F1E8;--muted:#8E96A3;--accent:#C9A86A;--border:rgba(255,255,255,.10);--radius-sm:12px;--radius-md:18px;--radius-lg:28px;--shadow-soft:0 20px 60px rgba(0,0,0,.30)}
        *{box-sizing:border-box}html{scroll-behavior:smooth}body{margin:0;background:var(--bg);color:var(--text);font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;-webkit-font-smoothing:antialiased}a{color:inherit}.site-shell{min-height:100vh;overflow:hidden;background:radial-gradient(circle at 75% 18%,rgba(201,168,106,.09),transparent 25%),radial-gradient(circle at 8% 55%,rgba(255,255,255,.035),transparent 30%),var(--bg)}
        .topbar{position:sticky;top:0;z-index:20;height:76px;padding:0 clamp(18px,4vw,56px);display:flex;align-items:center;justify-content:space-between;gap:24px;background:rgba(8,10,13,.72);backdrop-filter:blur(22px);-webkit-backdrop-filter:blur(22px);border-bottom:1px solid var(--border)}.brand{display:flex;align-items:center;gap:11px;text-decoration:none;min-width:max-content}.brand-logo{width:42px;height:42px;border-radius:12px;object-fit:contain}.brand strong{display:block;font-size:12px;letter-spacing:.14em}.brand small{display:block;margin-top:3px;color:var(--muted);font-size:8px;letter-spacing:.14em}.desktop-nav{display:flex;align-items:center;gap:clamp(18px,3vw,38px);font-size:10px;letter-spacing:.16em;color:#aeb4bc}.desktop-nav a{text-decoration:none;transition:color .2s ease}.desktop-nav a:hover{color:var(--text)}.portal-button{padding:11px 15px;border:1px solid var(--border);border-radius:999px;text-decoration:none;font-size:9px;letter-spacing:.12em;background:var(--surface);transition:transform .2s ease,background .2s ease}.portal-button:hover{transform:translateY(-2px);background:var(--surface-strong)}.portal-button span{color:var(--accent);margin-left:6px}
        .hero{position:relative;isolation:isolate;min-height:calc(100vh - 76px);display:grid;grid-template-columns:minmax(0,1.4fr) minmax(280px,.6fr);align-items:center;gap:clamp(36px,7vw,100px);padding:clamp(64px,10vw,120px) clamp(20px,7vw,100px)}.hero-copy{position:relative;z-index:2;max-width:850px}.eyebrow{margin:0 0 18px;color:var(--muted);font-size:10px;font-weight:800;letter-spacing:.2em}.status-dot{display:inline-block;width:6px;height:6px;margin-right:8px;border-radius:50%;background:var(--accent);box-shadow:0 0 16px rgba(201,168,106,.65)}h1{margin:0;font-size:clamp(72px,13vw,172px);line-height:.79;letter-spacing:-.075em;font-weight:850}h1 em{font-family:Georgia,"Times New Roman",serif;font-weight:400;font-style:italic;letter-spacing:-.065em;color:#ded9cd}.lead{max-width:590px;margin:34px 0 0;color:#a4abb4;font-size:clamp(16px,1.8vw,20px);line-height:1.65}.actions{display:flex;flex-wrap:wrap;gap:10px;margin-top:34px}.button{display:inline-flex;align-items:center;gap:10px;min-height:48px;padding:0 19px;border-radius:var(--radius-sm);text-decoration:none;font-size:10px;font-weight:800;letter-spacing:.12em;transition:transform .2s ease,background .2s ease,border-color .2s ease}.button:hover{transform:translateY(-3px)}.button-primary{background:var(--text);color:#101216}.button-primary span{color:#6f5b31}.button-ghost{border:1px solid var(--border);background:var(--surface);color:var(--text)}.trust-line{display:flex;align-items:center;gap:11px;margin-top:42px;color:#69717c;font-size:8px;letter-spacing:.16em}.trust-line i{width:3px;height:3px;border-radius:50%;background:var(--accent)}
        .live-panel{position:relative;z-index:2;padding:24px;border:1px solid var(--border);border-radius:var(--radius-lg);background:linear-gradient(145deg,rgba(255,255,255,.075),rgba(255,255,255,.025));backdrop-filter:blur(26px);-webkit-backdrop-filter:blur(26px);box-shadow:var(--shadow-soft);overflow:hidden}.live-panel:before{content:"";position:absolute;inset:0;background:linear-gradient(115deg,transparent 20%,rgba(255,255,255,.07) 50%,transparent 80%);transform:translateX(-120%);animation:sweep 8s ease-in-out infinite}.panel-head,.metric-row{position:relative;display:flex;justify-content:space-between;gap:12px;align-items:center}.panel-head{padding-bottom:20px;border-bottom:1px solid var(--border);font-size:8px;letter-spacing:.16em;color:#737b86}.online{color:#aeb4bc}.online b{display:inline-block;width:5px;height:5px;border-radius:50%;background:var(--accent);margin-right:6px}.metric{position:relative;padding:34px 0 30px}.metric strong{display:block;font-size:76px;line-height:.8;letter-spacing:-.07em;font-weight:850}.metric span{display:block;margin-top:14px;color:var(--muted);font-size:9px;letter-spacing:.2em}.metric-row{padding:12px 0;border-top:1px solid rgba(255,255,255,.06);font-size:8px;letter-spacing:.12em;color:#747d88}.metric-row strong{color:#c9cdd2;font-size:9px}.signal{position:relative;display:flex;align-items:end;gap:4px;height:36px;margin-top:16px}.signal span{width:8px;height:10px;border-radius:2px;background:rgba(201,168,106,.35);animation:pulse 1.8s ease-in-out infinite}.signal span:nth-child(2){height:18px;animation-delay:.12s}.signal span:nth-child(3){height:13px;animation-delay:.24s}.signal span:nth-child(4){height:27px;animation-delay:.36s}.signal span:nth-child(5){height:20px;animation-delay:.48s}.signal span:nth-child(6){height:31px;animation-delay:.6s}.signal span:nth-child(7){height:23px;animation-delay:.72s}.signal span:nth-child(8){height:34px;animation-delay:.84s}.live-panel p{position:relative;margin:17px 0 0;color:#69717b;font-size:10px;line-height:1.6}
        .ambient{position:absolute;z-index:-1;border-radius:50%;filter:blur(2px);pointer-events:none}.ambient-one{width:520px;height:520px;right:-160px;top:2%;background:radial-gradient(circle,rgba(201,168,106,.12),transparent 68%);animation:drift 16s ease-in-out infinite}.ambient-two{width:430px;height:430px;left:-220px;bottom:-130px;background:radial-gradient(circle,rgba(255,255,255,.045),transparent 70%);animation:drift 20s ease-in-out infinite reverse}.grain{position:absolute;inset:0;z-index:1;opacity:.035;pointer-events:none;background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 180 180' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.55'/%3E%3C/svg%3E")}.statement{max-width:1100px;margin:0 auto;padding:clamp(90px,12vw,170px) 20px}.statement>span{color:var(--accent);font-size:9px;letter-spacing:.2em}.statement h2{margin:18px 0;font-size:clamp(42px,7vw,88px);line-height:.98;letter-spacing:-.055em}.statement h2 em{font-family:Georgia,serif;font-weight:400;color:#aaa69c}.statement p{max-width:500px;margin:0;color:var(--muted);line-height:1.7}.feature-grid{max-width:1100px;margin:0 auto;padding:0 20px 110px;display:grid;grid-template-columns:repeat(3,1fr);border-top:1px solid var(--border)}.feature-grid article{padding:28px 24px 0 0;border-right:1px solid var(--border)}.feature-grid article:not(:first-child){padding-left:24px}.feature-grid article:last-child{border-right:0}.feature-grid span{color:var(--accent);font-size:9px;letter-spacing:.18em}.feature-grid h3{margin:42px 0 12px;font-size:12px;letter-spacing:.16em}.feature-grid p{max-width:260px;color:var(--muted);font-size:13px;line-height:1.65}.footer{display:flex;justify-content:space-between;gap:20px;padding:24px clamp(20px,7vw,100px) 40px;color:#5f6670;font-size:8px;letter-spacing:.16em;border-top:1px solid var(--border)}.bottom-nav{display:none}
        @keyframes sweep{0%,55%{transform:translateX(-120%)}75%,100%{transform:translateX(120%)}}@keyframes pulse{0%,100%{opacity:.35;transform:scaleY(.82)}50%{opacity:.9;transform:scaleY(1)}}@keyframes drift{0%,100%{transform:translate3d(0,0,0)}50%{transform:translate3d(24px,-18px,0)}}
        @media(max-width:820px){.topbar{height:68px}.desktop-nav{display:none}.portal-button{padding:10px 12px}.hero{min-height:auto;grid-template-columns:1fr;padding:70px 20px 90px;gap:46px}.live-panel{max-width:460px;width:100%;justify-self:center}.statement{padding-top:100px}.feature-grid{grid-template-columns:1fr;padding-bottom:90px}.feature-grid article,.feature-grid article:not(:first-child){padding:26px 0;border-right:0;border-bottom:1px solid var(--border)}.feature-grid article:last-child{border-bottom:0}.footer{padding-bottom:100px}.bottom-nav{position:fixed;display:grid;grid-template-columns:repeat(4,1fr);left:10px;right:10px;bottom:10px;z-index:50;padding:8px;border:1px solid var(--border);border-radius:18px;background:rgba(10,12,15,.86);backdrop-filter:blur(22px);-webkit-backdrop-filter:blur(22px);box-shadow:var(--shadow-soft);padding-bottom:calc(8px + env(safe-area-inset-bottom))}.bottom-nav a{display:flex;flex-direction:column;align-items:center;gap:4px;padding:7px 2px;color:#727a85;text-decoration:none;font-size:7px;letter-spacing:.1em}.bottom-nav a span{font-size:17px;line-height:1;color:#9da3ab}.bottom-nav a.active,.bottom-nav a:hover{color:var(--text)}.bottom-nav a.active span{color:var(--accent)}}
        @media(prefers-reduced-motion:reduce){*,*:before,*:after{scroll-behavior:auto!important;animation:none!important;transition:none!important}}
      `}</style>
    </>
  )
}
