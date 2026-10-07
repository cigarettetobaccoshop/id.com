# CSS / Code Duplication Consolidation — 2026-10-07

## Status
Controlled refactor prepared on branch `chore/consolidate-global-css-layer`, based on production-good commit `8edd6fee415310bc274f6f570588d2f7f30cf945`.

## What was consolidated
- `pages/_app.js` previously contained 54 direct global stylesheet imports.
- The direct imports are now represented by one entrypoint: `styles/r2-global-entry.css`.
- The entrypoint preserves the exact original stylesheet order, including the documented transitive imports from `catalog-mobile-grid.css`.
- No selector, declaration, component markup, API, Supabase integration, authentication, cart, checkout, order, transaction, environment variable, or Vercel configuration was changed.
- Route-local checkout/login/admin styles remain route-owned.

## Why this is safe
This phase is an **entrypoint/layer consolidation**, not a mass CSS deletion. Historical audit records show that several versioned CSS files contain mixed active and legacy selector families. Deleting them by filename would risk visual regression.

The canonical production dependencies remain protected:
- `styles/mobile-lock.css`
- `styles/r2-premium.css`
- `styles/catalog-modern.css`
- `styles/catalog-mobile-grid.css`
- `styles/r2-cross-page-theme-final.css`
- `components/HomepageExperience.js`
- `components/homepage/HomepageExperience.module.css`

## Remaining duplication
The underlying CSS still contains repeated selector/declaration generations. Those require declaration-level AST/rendered-selector verification before deletion. This refactor deliberately does not claim that compiled CSS size or duplicate declarations have already been reduced.

## Verification gate
Before merge/promotion:
1. GitHub CI / smoke test.
2. Next.js production build.
3. Vercel Preview READY.
4. Route regression: `/`, `/products`, `/katalog`, `/checkout`, `/login`, `/admin/dashboard`.
5. Confirm `/api/health` and product count remain healthy.
6. Confirm no production data or transaction changes.
7. Only after those checks, continue declaration-level consolidation in small groups.
