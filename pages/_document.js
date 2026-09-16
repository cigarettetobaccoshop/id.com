import { Html, Head, Main, NextScript } from 'next/document'

const SITE_TITLE = 'R2 NUSANTARA - Gudang Distributor R2 & Resmi'
const SITE_DESCRIPTION = 'R2 Nusantara, gudang distributor di Malang dengan katalog produk live, stok aktif, dan pengiriman ke seluruh Indonesia.'

export default function Document() {
  return (
    <Html lang="id">
      <Head>
        <meta name="application-name" content="R2 NUSANTARA" />
        <meta name="apple-mobile-web-app-title" content="R2 NUSANTARA" />
        <meta name="theme-color" content="#0F3D6E" />
        <meta name="format-detection" content="telephone=no" />
        <meta property="og:locale" content="id_ID" />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="R2 NUSANTARA" />
        <meta property="og:title" content={SITE_TITLE} />
        <meta property="og:description" content={SITE_DESCRIPTION} />
        <meta property="og:image:alt" content={SITE_TITLE} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={SITE_TITLE} />
        <meta name="twitter:description" content={SITE_DESCRIPTION} />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
