# OAuth Integration Guide

## Overview

R2 NUSANTARA menggunakan Supabase Auth untuk login OAuth Google dan GitHub. Client ID/Client Secret provider disimpan **di Supabase Dashboard**, bukan di frontend dan bukan di `NEXT_PUBLIC_*` environment variable.

## Production callback

Production application:
- `https://r2nusantara-shop.vercel.app`
- Callback: `https://r2nusantara-shop.vercel.app/auth/callback`

Development callback:
- `http://localhost:3000/auth/callback`

Di Supabase Dashboard, tambahkan callback production dan development pada konfigurasi URL/Auth sesuai kebutuhan. Jangan gunakan `https://id.com/auth/callback` karena domain tersebut bukan domain Production aplikasi saat ini.

## 1. Google OAuth

### Google Cloud Console

1. Buka Google Cloud Console.
2. Buat atau pilih project.
3. Configure OAuth consent screen jika belum tersedia.
4. Buat OAuth Client ID dengan tipe **Web application**.
5. Pada Authorized redirect URIs, gunakan **Supabase Auth callback URL** yang ditampilkan di Supabase Dashboard untuk project R2 NUSANTARA, bukan callback aplikasi `/auth/callback` secara langsung.
6. Simpan Client ID dan Client Secret.

### Supabase Dashboard

1. Buka project Supabase R2 NUSANTARA.
2. Authentication → Providers → Google.
3. Aktifkan Google.
4. Masukkan Google Client ID dan Client Secret.
5. Simpan.

## 2. GitHub OAuth

### GitHub OAuth App

1. GitHub → Settings → Developer settings → OAuth Apps → New OAuth App.
2. Application name: `R2 Nusantara`.
3. Homepage URL: `https://r2nusantara-shop.vercel.app`.
4. Authorization callback URL: gunakan **Supabase Auth callback URL** yang ditampilkan di Supabase Dashboard untuk project R2 NUSANTARA.
5. Simpan Client ID dan Client Secret.

### Supabase Dashboard

1. Authentication → Providers → GitHub.
2. Aktifkan GitHub.
3. Masukkan Client ID dan Client Secret.
4. Simpan.

## 3. Environment Variables di Vercel

Environment yang dibutuhkan aplikasi Production:

```env
NEXT_PUBLIC_SUPABASE_URL=https://zgsbtexngystdmakqjyi.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-supabase-publishable-key
NEXT_PUBLIC_APP_URL=https://r2nusantara-shop.vercel.app
NEXT_PUBLIC_OAUTH_REDIRECT_URL=https://r2nusantara-shop.vercel.app/auth/callback
NEXT_PUBLIC_GOOGLE_OAUTH_ENABLED=true
NEXT_PUBLIC_GITHUB_OAUTH_ENABLED=true
NODE_ENV=production
```

**Penting:** Google/GitHub Client Secret tidak boleh ditempatkan pada `NEXT_PUBLIC_*` variable atau committed ke repository. Supabase menyimpan credential OAuth provider tersebut.

Jika project menggunakan nama environment lama `NEXT_PUBLIC_SUPABASE_ANON_KEY`, pertahankan hanya bila kode yang mengonsumsinya memang masih membutuhkan nama tersebut. Jangan menambahkan service-role key ke browser/client bundle.

## 4. Supabase Auth URL Configuration

Set:
- Site URL: `https://r2nusantara-shop.vercel.app`
- Redirect URL: `https://r2nusantara-shop.vercel.app/auth/callback`
- Development: `http://localhost:3000/auth/callback`

Gunakan exact URL yang sesuai dengan environment. Hindari wildcard redirect URL yang tidak diperlukan.

## 5. Testing

1. Buka `/auth`.
2. Klik **Sign in with Google**.
3. Selesaikan login.
4. Pastikan kembali ke `/auth` dalam keadaan authenticated.
5. Ulangi untuk GitHub.
6. Uji Sign Out.
7. Uji langsung membuka `/auth/callback` tanpa code: aplikasi harus menangani sesi yang tersedia atau mengembalikan pengguna ke `/auth` dengan pesan error yang jelas.

## 6. Security

- Never expose OAuth Client Secret in frontend code.
- Never commit Client Secret ke GitHub.
- Jangan gunakan `NEXT_PUBLIC_GOOGLE_CLIENT_SECRET` atau `NEXT_PUBLIC_GITHUB_CLIENT_SECRET`.
- Gunakan PKCE untuk flow browser.
- Batasi redirect URL ke domain yang memang digunakan.
- Service-role key hanya untuk server-side code dan tidak boleh masuk ke browser bundle.

## 7. Implementation

OAuth provider login tersedia melalui `lib/supabaseOAuth.js` dan callback ditangani oleh `pages/auth/callback.js`. Callback menukar authorization code menjadi session dan mengarahkan pengguna kembali ke `/auth`.
