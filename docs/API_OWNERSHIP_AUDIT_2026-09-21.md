# API & Source Ownership Audit — 2026-09-21

## Scope

Conservative audit of the Next.js Pages Router API surface before any further dead-code deletion.

Production target: `https://r2nusantara-shop.vercel.app`

## Current API surface

| Route | Ownership / reason retained |
|---|---|
| `/api/products` | Public catalog data; used by storefront/data flows. |
| `/api/products/[handle]` | Product detail API; dynamic route must remain addressable. |
| `/api/orders` | Order/checkout transaction path; protected from deletion. |
| `/api/contact` | Contact/form submission path; uses server-side Supabase. |
| `/api/chat` | AI assistant endpoint; uses `lib/aiAgentTools`. |
| `/api/health` | Health/monitoring endpoint; uses catalog server client. |
| `/api/admin/session` | Admin authentication/session gate. |
| `/api/admin/orders` | Admin order monitoring/update path. |
| `/api/thumbnails/*` | Product thumbnail/proxy/resolve/batch processing; retained because external/browser calls can exist without static imports. |

## Supabase ownership

The following modules are proven active or intentionally retained:

- `lib/supabaseServer.js`: used by contact and order APIs.
- `lib/supabaseCatalogServer.js`: used by catalog APIs, sitemap, health, and products.
- `lib/admin/authorization.js`: used by admin APIs.
- `lib/aiAgentTools.js`: used by chat API.
- `lib/audit.js`: used by authentication/form monitoring hooks.
- `lib/supabaseOAuth.js`: used by authentication.
- `lib/supabaseStorage.js`: no production import was proven in this static pass, but it remains a documented Storage utility. It is NOT deleted because Storage helpers may be invoked dynamically or externally.

## Retired documentation references

Several documentation files still describe demo routes that were previously removed from production:

- `/supabase-demo`
- `/realtime-demo`
- `/storage-demo`
- `/analytics-demo`
- legacy `/api/todos`, `/api/upload`, `/api/files`, and `/api/analytics/*` examples

These references are documentation drift, not evidence that the production routes should be recreated or that Supabase modules should be deleted.

## Deletion policy

An API route is never considered safe to delete solely because no frontend import references it. Next.js API routes are externally addressable and may be called by browsers, automation, webhooks, monitoring, or other systems.

A deletion candidate requires:

1. No active application references.
2. No documented production dependency.
3. No webhook/external contract.
4. No monitoring/health dependency.
5. No auth, order, catalog, storage, or admin dependency.
6. Explicit route-level smoke/regression evidence.

Until all six conditions are proven, classify the route as REVIEW/RETAIN.

## Result

No API route is promoted to automatic deletion in this audit. This is intentional: preserving transaction and Supabase integrity is more important than reducing file count by uncertain deletion.
