# Environment Setup — R2 Nusantara

## Production
Konfigurasi environment dikelola melalui Vercel. Jangan commit file rahasia.

Variabel Supabase yang digunakan aplikasi harus tersedia pada environment yang memang membutuhkan aksesnya, dengan service-role credential tetap server-only.

## Authentication
Alur autentikasi production menggunakan implementasi repository saat ini. Jangan menggunakan URL demo lama seperti `id.com/auth/callback` sebagai asumsi konfigurasi tanpa memeriksa route dan domain production terbaru.

## Verification
Setelah perubahan environment:
1. Build/deployment Vercel harus READY.
2. `/api/health` harus merespons normal.
3. `/api/products` harus dapat membaca katalog.
4. Login/admin harus tetap dapat diakses.
5. Checkout/order tidak boleh mengalami regresi.

## Local development
Gunakan `.env.local` yang tidak di-commit. Jalankan:

```bash
npm install
npm run dev
```

Gunakan route production yang benar sebagai referensi, bukan demo Supabase lama.
