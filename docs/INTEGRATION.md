# R2 Nusantara — Current Integration Architecture

## Stack
- Next.js Pages Router
- React
- Vercel
- Supabase
- GitHub-based deployment

## Production API
Route yang diperlakukan sebagai production surface:
```text
GET/POST /api/products
GET      /api/products/[handle]
POST     /api/orders
POST     /api/contact
POST/GET /api/chat
GET      /api/health
GET      /api/admin/session
GET/POST /api/admin/orders
GET      /api/thumbnails/*
```

Method aktual tetap mengikuti implementasi route masing-masing.

## Core integration ownership
- Catalog: `lib/supabaseCatalogServer.js` + catalog components/pages.
- Orders/contact: `lib/supabaseServer.js`.
- Admin authorization: `lib/admin/authorization.js`.
- Auth/OAuth: `lib/supabaseOAuth.js`.
- AI/chat: `lib/aiAgentTools.js`.
- Audit/monitoring: `lib/audit.js`.
- Storage helper: `lib/supabaseStorage.js`, dipertahankan untuk compatibility.

## Routes yang bukan production reference
Dokumentasi lama berisi demo/legacy surface seperti:
- `/supabase-demo`
- `/realtime-demo`
- `/storage-demo`
- `/analytics-demo`
- `/api/todos`
- `/api/upload`
- `/api/files`
- `/api/analytics/*`

Jangan menghidupkan kembali route tersebut hanya karena masih muncul pada dokumen lama.

## Deployment quality gate
Sebelum merge:
1. GitHub checks harus lulus.
2. Preview Vercel harus READY.
3. Tidak ada runtime error baru.
4. Production smoke test untuk halaman utama, katalog, lokasi, checkout, login/admin, dan API penting.
5. Pastikan Supabase/order flow tidak berubah.

## Cleanup policy
- API route tidak dihapus hanya karena tidak di-import frontend; route bersifat externally addressable.
- Modul Supabase tidak dihapus hanya karena static import tidak ditemukan.
- File/dependency hanya dihapus setelah bukti penggunaan tidak ada dan perubahan diuji terisolasi.
- Dokumentasi harus mengikuti source production, bukan sebaliknya.
