# R2 NUSANTARA — CSS Dependency & Cascade Map

Status: structural audit of `main`.

## Scope

Routes audited:

- `/` — `components/HomepageExperience.js` + `HomeHeader`/global shell
- `/products` — `pages/products.js` + `components/catalog/ProductCard`
- `/katalog` — `pages/katalog.js` compatibility redirect to canonical `/products`; no separate catalog component/CSS module
- `/checkout` — `pages/checkout.js` with route-local global JSX styles
- `/login` and `/admin/dashboard` — route-local/admin UI styles and authentication shell

Protected from this audit: Supabase, API handlers, transaction flow, Vercel configuration, package scripts, `tsconfig`, `next.config`, and `pages-build-deployment`.

## Route ownership

| Route | Primary visual selectors | CSS ownership | Decision |
|---|---|---|---|
| `/` | `.r2-hp-final-*` | `HomepageExperience.js` inline styles + late homepage refinement layers in `_app.js` | ACTIVE |
| `/products` | `.r2-clean-*`, `.r2-filter-*`, `.r2-view`, `.r2-load-more` | `r2-catalog-clean-v37.css`, `r2-accessibility-contrast-v38.css`, related catalog layers | ACTIVE |
| `/katalog` | redirect/compatibility route; no page-specific visual selectors | `pages/katalog.js` → `/products` | ACTIVE / LEGACY ROUTE, DO NOT DELETE |
| `/checkout` | `.checkout-*`, `.panel`, `.steps`, `.summary`, etc. | route-local `<style jsx global>` in `pages/checkout.js` | ACTIVE; no external checkout CSS required |
| `/login` | login-specific JSX classes | route-local/component styles | ACTIVE |
| `/admin/dashboard` | admin-specific JSX classes | route-local `<style jsx global>` in dashboard | ACTIVE |

## Canonical global layers that must remain

These are explicitly required by the production smoke test or are directly registered as the current global foundation:

- `styles/mobile-lock.css`
- `styles/r2-premium.css`
- `styles/catalog-modern.css`
- `styles/catalog-mobile-grid.css`
- `styles/homepage-experience.css`
- `styles/r2-cross-page-theme-final.css`

The smoke test also rejects duplicate imports in `_app.js` and checks the canonical theme token `--r2-gold`.

## Cascade findings

### 1. Legacy `src-*` cluster

The repository contains an older selector family based on `.src-*` (`.src-shell`, `.src-header`, `.src-hero`, `.src-product`, `.src-footer`, etc.) across multiple historical files such as:

- `r2-visual-upgrade-v2.css`
- `r2-modern-visual-v3.css`
- `r2-reference-precision.css`
- `r2-visual-consolidated-v6.css`
- `r2-brand-visual-correction-v19.css`
- `r2-final-apple-grade-v20.css`
- `r2-global-theme-sync-v21.css`
- `r2-stable-visual-baseline-v32.css`
- `r2-luxury-brand-system-v34.css`
- `r2-home-type-refinement-v35.css`
- `r2-hero-luxury-typography-v36.css`

Current homepage markup uses `.r2-hp-final-*`, not `.src-*`. However, several historical files also contain non-`src-*` selectors and catalog compatibility rules. Therefore the entire files cannot be deleted safely from filename evidence alone.

### 2. Duplicate cascade is real

The same selector family is restyled repeatedly across versioned files. Example: `.src-logo-r2` is defined in v2, v19, v20, v34 and further adjusted by responsive layers. Footer selectors such as `.src-footer` are also repeatedly overridden.

This is a cascade duplication problem, but not yet proof that every declaration in those files is dead code.

### 3. Catalog mobile chain

`catalog-mobile-grid.css` imports:

- `r2-catalog-mobile-cart-final.css`
- `catalog-bento-grid.css`

This is an intentional dependency chain and must remain intact until all catalog selectors are consolidated.

### 4. `/products` is a newer selector system

`pages/products.js` uses `.r2-clean-*` selectors. The route is therefore visually separated from the older `.src-*` system. Its data source and filtering/cart logic remain untouched by this CSS audit.

### 5. `/checkout` and admin are isolated

Checkout and admin dashboards contain their own route-local style systems. Global CSS cleanup must not be allowed to override or remove these styles without a rendered regression test.

## Safe cleanup decision

**No legacy CSS file is deleted in this pass.**

Reason: repository-level text search proves heavy selector duplication, but the available source index does not provide a complete, AST-level selector consumer graph for every declaration. Deleting a mixed file that contains both legacy `.src-*` rules and still-relevant `r2-*`/catalog rules would violate the no-downgrade requirement.

## Next safe consolidation strategy

1. Keep canonical global files and route-local styles.
2. Build a declaration-level selector inventory for the remaining versioned CSS files.
3. For each selector, classify: `ACTIVE`, `LEGACY`, `SHARED`, or `UNKNOWN`.
4. Move only `ACTIVE`/`SHARED` declarations into the canonical owner file.
5. Remove the now-empty legacy file/import.
6. Run production build/smoke test before and after each consolidation group.
7. Verify `/`, `/products`, `/katalog`, `/checkout`, `/login`, and `/admin/dashboard` before accepting the cleanup.

## No-go list

Do not modify during CSS cleanup:

- Supabase schema/data/RLS
- `/api/*`
- order/checkout logic
- authentication/session logic
- Vercel configuration or environment variables
- `package.json` scripts
- `tsconfig.json`
- `next.config.*`
- `pages-build-deployment`
- product data/API contracts
