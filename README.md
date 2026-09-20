# R2 NUSANTARA — Gudang Distributor R2 & Resmi

Website e-commerce katalog distributor R2 NUSANTARA. Aplikasi menggunakan Next.js Pages Router, React, Supabase, dan Vercel.

## Status

- Production: https://r2nusantara-shop.vercel.app/
- Repository: https://github.com/cigarettetobaccoshop/id.com
- Framework: Next.js 14 + React 18
- Runtime Node: 22.x
- Database/backend: Supabase
- Analytics: Vercel Analytics
- UI icons: lucide-react

## Fitur utama

- Homepage storefront
- Dua katalog produk: R2 dan Resmi
- Katalog produk live dari API/Supabase
- Pencarian dan filter katalog
- Keranjang dan checkout
- Pembuatan pesanan melalui API
- Halaman login dan dashboard admin
- Monitoring aktivitas aplikasi
- Widget AI/chat
- SEO metadata, canonical, Open Graph, dan structured data pada halaman utama
- Responsive/mobile experience
- Smoke test dan audit CSS otomatis melalui scripts

## Arsitektur ringkas

Browser → Next.js pages/components → API routes → Supabase

Alur transaksi dan data production dipisahkan dari pekerjaan visual/repository cleanup. Perubahan cleanup tidak dimaksudkan untuk mengubah schema, RLS, data produk, kontrak API, checkout, atau autentikasi.

## Route penting

- `/` — homepage
- `/products` — katalog produk
- `/katalog` — route katalog kompatibilitas
- `/checkout` — checkout
- `/login` — login
- `/admin/dashboard` — dashboard admin
- `/lokasi` — informasi lokasi
- `/api/products` — API katalog produk

## Struktur utama

```
pages/
  _app.js
  index.js
  products.js
  katalog.js
  checkout.js
  login.js
  admin/
  api/

components/
  homepage/
  catalog/
  monitoring/

lib/
styles/
scripts/
docs/
public/
assets/
```

## Quality gates

Jalankan:

```bash
npm install
npm run lint
npm test
npm run build
```

`npm test` menjalankan production smoke test yang juga memeriksa struktur CSS dan cascade audit yang tersedia di repository.

## Cleanup policy

Repository menggunakan pendekatan cleanup bertahap:

1. Hapus hanya file/dependency yang telah diverifikasi tidak digunakan.
2. Pertahankan file yang masih berada dalam dependency chain atau global import.
3. Jangan menghapus CSS hanya berdasarkan nama versi atau prefix lama.
4. Jangan mengubah Supabase, API, checkout, authentication, atau environment configuration selama cleanup visual.
5. Setiap kelompok perubahan harus melewati CI/Vercel preview sebelum masuk ke `main`.
6. Setelah merge, verifikasi deployment production dan runtime errors.

## CSS architecture

`pages/_app.js` masih memuat beberapa global stylesheet karena sebagian merupakan lapisan cascade historis yang saling berinteraksi. Pengurangan CSS dilakukan pada level deklarasi, bukan penghapusan massal.

Dokumen audit:

- `docs/CSS_ACTIVE_LAYER_AUDIT_2026-09-19.md`
- `docs/CSS_DEPENDENCY_MAP.md`

## Deployment

Repository terhubung ke Vercel untuk deployment berbasis Git. Production hanya dipromosikan setelah perubahan melewati pemeriksaan CI dan preview.

## Catatan pengembangan

Jangan menambahkan kembali demo/template lama yang sudah dipensiunkan ke route production. Dokumentasi harus mencerminkan aplikasi R2 NUSANTARA yang benar-benar ada di repository.
