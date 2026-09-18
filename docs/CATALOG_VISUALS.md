# R2 NUSANTARA — Catalog Visual Layer

This layer is presentation-only.

- Product IDs/SKU, price, inventory, category and order payloads are unchanged.
- Supabase product/order integration is unchanged.
- Product cards now receive deterministic premium catalog artwork derived from the existing product name/category.
- A real source URL remains supported through the existing `sourceUrl` prop.
- Broken external artwork falls back to the deterministic local visual, then the existing safe fallback asset.
- No checkout, cart, API contract, or transaction flow is modified.
