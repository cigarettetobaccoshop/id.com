import { SpeedInsights } from '@vercel/speed-insights/next'
import { Analytics } from '@vercel/analytics/react'
import type { Metadata, Viewport } from 'next'

export const metadata: Metadata = {
  title: 'R2 Nusantara | Distributor Rokok Grosir Premium Malang',
  description: 'Portal katalog R2 Nusantara dengan 233+ produk aktif, katalog live, pencarian cepat, dan pengalaman mobile-first.',
  applicationName: 'R2 Nusantara',
  manifest: '/manifest.json',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#080c10',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="id"><body>{children}<Analytics /><SpeedInsights /></body></html>
}
