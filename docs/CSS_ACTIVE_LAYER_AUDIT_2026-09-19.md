# CSS Active Layer Audit — 2026-09-19

## Scope

pages/_app.js currently registers 54 global stylesheet imports. This audit does not delete or reorder them yet.

### Runtime-loaded global layers

All 54 imports are technically loaded for every storefront route because they are imported from _app.js. Therefore loaded is not equivalent to selector actively affecting rendered markup.

## Canonical foundation

The following layers are mandatory and are protected by the production smoke test:

- mobile-lock.css
- r2-premium.css
- catalog-modern.css
- catalog-mobile-grid.css
- homepage-experience.css
- r2-cross-page-theme-final.css

## Confirmed dependency chain

catalog-mobile-grid.css imports:
- r2-catalog-mobile-cart-final.css
- catalog-bento-grid.css

Those files are transitive dependencies even though they are not direct _app.js imports.

## Route ownership

### Homepage

Primary ownership: components/HomepageExperience.js and components/homepage/HomeHeader, plus homepage refinement layers imported by _app.js. Current homepage markup uses the .r2-hp-final-* selector family. Older .src-* families require declaration-level verification before removal.

### /products

Primary ownership: pages/products.js, components/catalog/ProductCard, r2-catalog-clean-v37.css, r2-accessibility-contrast-v38.css, and related catalog layers.

### /katalog

Primary ownership: pages/katalog.js as a compatibility redirect to canonical `/products`. The former `CatalogPage.jsx` demo component and CSS Module were removed in PR #88 after source-reference audit.

### /checkout

Checkout styling is primarily route-local through JSX/global styles in pages/checkout.js. Global CSS cleanup must not alter its selectors.

### /login and /admin/dashboard

Both pages own their primary styles locally. Global CSS changes require regression testing against these routes.

## Cascade risk

The repository contains multiple generations of the same selector families. The historical .src-* family is not sufficient evidence for deletion because some files containing it also contain active r2-* or catalog declarations.

Examples include r2-final-apple-grade-v20.css, r2-global-theme-sync-v21.css, r2-stable-visual-baseline-v32.css, r2-luxury-brand-system-v34.css, r2-hero-luxury-typography-v36.css, r2-catalog-clean-v37.css, r2-accessibility-contrast-v38.css, homepage-international-polish-v40.css, r2-home-international-v41.css, r2-home-precision-v42.css, r2-home-density-premium-v43.css, and r2-home-final-qa-v45.css.

## Restoration decision

No CSS file is deleted in this restoration commit.

The safe next phase is declaration-level consolidation:

1. Inventory selectors in each CSS file.
2. Match selectors against rendered component markup.
3. Classify each declaration as ACTIVE, SHARED, LEGACY, or UNKNOWN.
4. Move only ACTIVE/SHARED declarations into canonical owners.
5. Remove an old file only after its declaration inventory reaches zero.
6. Run build, smoke test, and route regression after each consolidation group.

This preserves the no-downgrade requirement and avoids changing checkout, catalog, or transaction behavior during architecture restoration.
