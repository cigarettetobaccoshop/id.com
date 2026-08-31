import { SpeedInsights } from '@vercel/speed-insights/next';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'R2 Nusantara | Distributor Rokok Grosir Premium Malang',
  description: 'Distributor rokok grosir resmi Malang. 233 merek ready stock, gratis ongkir min 1 bal, bayar setelah resi keluar, gudang fisik terverifikasi.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body>
        {children}
        <SpeedInsights />
      </body>
    </html>
  );
}
