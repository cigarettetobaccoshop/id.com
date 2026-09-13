import { Html, Head, Main, NextScript } from 'next/document'

const SITE_URL = 'https://r2nusantara-shop.vercel.app'
const SOCIAL_IMAGE = `${SITE_URL}/assets/logo/preview.jpg`
const SITE_TITLE = 'R2 NUSANTARA - Gudang Distributor R2 & Resmi'
const SITE_DESCRIPTION = 'R2 Nusantara, gudang distributor di Malang dengan katalog produk live, stok aktif, dan pengiriman ke seluruh Indonesia.'

export default function Document() {
  return (
    <Html lang="id">
      <Head>
        <meta name="application-name" content="R2 NUSANTARA" />
        <meta name="apple-mobile-web-app-title" content="R2 NUSANTARA" />
        <meta name="theme-color" content="#F7F6F2" />
        <meta name="format-detection" content="telephone=no" />
        <meta property="og:locale" content="id_ID" />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="R2 NUSANTARA" />
        <meta property="og:title" content={SITE_TITLE} />
        <meta property="og:description" content={SITE_DESCRIPTION} />
        <meta property="og:url" content={SITE_URL} />
        <meta property="og:image" content={SOCIAL_IMAGE} />
        <meta property="og:image:secure_url" content={SOCIAL_IMAGE} />
        <meta property="og:image:type" content="image/jpeg" />
        <meta property="og:image:alt" content={SITE_TITLE} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={SITE_TITLE} />
        <meta name="twitter:description" content={SITE_DESCRIPTION} />
        <meta name="twitter:image" content={SOCIAL_IMAGE} />
        <link rel="canonical" href={SITE_URL} />
        <script dangerouslySetInnerHTML={{__html:`(function(){try{document.querySelectorAll('meta[name="theme-color"]').forEach(function(m){m.remove()});var m=document.createElement('meta');m.name='theme-color';m.content='#F7F6F2';document.head.appendChild(m)}catch(e){}})()`}} />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
