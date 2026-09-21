# Supabase — Production Integration

Dokumen ini adalah referensi arsitektur Supabase yang saat ini dipakai R2 Nusantara.

## Prinsip
- Next.js Pages Router + Vercel.
- Supabase tetap menjadi backend data utama.
- Perubahan audit/cleanup tidak mengubah transaksi, checkout, katalog, autentikasi, atau API production.
- Jangan menaruh service-role key di client atau repository.

## Modul aktif
- `lib/supabaseServer.js` — akses server untuk alur contact/order.
- `lib/supabaseCatalogServer.js` — akses katalog dan health/sitemap.
- `lib/supabaseOAuth.js` — autentikasi/OAuth.
- `lib/admin/authorization.js` — otorisasi admin.
- `lib/audit.js` — audit/monitoring.
- `lib/supabaseStorage.js` — helper Storage; dipertahankan karena penggunaan dinamis/eksternal belum dapat dieliminasi secara aman.

## API production yang dipertahankan
- `/api/products`
- `/api/products/[handle]`
- `/api/orders`
- `/api/contact`
- `/api/chat`
- `/api/health`
- `/api/admin/session`
- `/api/admin/orders`
- `/api/thumbnails/*`

## Environment
Set variabel Supabase pada Vercel sesuai environment yang digunakan. Nilai rahasia tidak boleh masuk ke source control.

## Security
- RLS tetap menjadi lapisan kontrol database.
- Service-role key hanya untuk server-side privileged operations.
- Jangan membuat policy publik baru tanpa kebutuhan bisnis yang jelas.
- Setelah perubahan Supabase, validasi API, checkout, admin, dan katalog.

## Catatan cleanup
Dokumentasi lama yang merujuk demo `todos`, `supabase-demo`, atau route API demo tidak lagi dianggap sebagai arsitektur production. Referensi tersebut telah dinormalisasi pada audit dokumentasi 21 September 2026.
