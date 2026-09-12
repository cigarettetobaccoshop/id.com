# AUDIT REPORT — R2 NUSANTARA Bento Grid Catalog

Date: 2026-09-13
Target: `/products`
Base: `main`
Working branch: `feat/bento-grid-catalog`

## 1. Styling Method Detected

**Next.js 14 + Pages Router + React 18 + plain/global CSS.**

- `pages/products.js` is the active catalog route.
- Global CSS is imported from `pages/_app.js` through the `styles/*.css` stack.
- No CSS Modules (`*.module.css`) are used by the active catalog flow.
- No SCSS/Sass dependency is installed.
- No styled-components or Emotion dependency is installed.
- `tailwind.config.js` exists as a legacy configuration for the older static/index flow, but `tailwindcss` is not a package dependency and the active `/products` implementation does not use Tailwind utility classes.
- No `postcss.config.js` is present.
- Existing catalog classes use global kebab-case selectors such as `.catalog-grid`, `.product-card`, `.product-body`, `.catalog-meta`, `.card-actions` rather than a strict BEM system.

**Required convention:** continue with plain/global CSS and existing kebab-case catalog selectors. Do not introduce Tailwind, CSS Modules, SCSS, or a new styling library.

## 2. Active Page / Data Flow

`pages/products.js` is a Pages Router page using `getServerSideProps`.

Data flow:

`Supabase client -> getServerSideProps -> R2 NUSANTARA table -> products/count props -> catalogProducts -> filtered/sorted -> shown -> inline product-card render`

The existing Supabase query selects the current production fields and filters `Published=true` and `Status=active`, with the existing 250-row limit. The existing SSR cache header is preserved.

Client state already handles catalog selection, search, category, price range, stock-only, brand, variant, sort, visible count, cart, selected product, favorites, view mode, filters and loading. The visual refactor must not alter these state transitions.

## 3. Active Components / Dependency Graph

`pages/_app.js`
- imports the global catalog CSS stack
- mounts shared `BrandAssetLoader`
- mounts shared `RouteIconNav`
- mounts global checkout/interaction/monitoring components

`pages/products.js`
- imports `Head`, `Link`, React hooks, `useRouter`, Supabase client, `RouteIcon`
- defines the product artwork inline (`Artwork`)
- defines the loading presentation inline (`SkeletonGrid`)
- renders product cards inline as `.product-card`
- uses existing cart/favorite handlers and selected-product state

Legacy `components/ProductCardVisual.jsx` exists elsewhere in the repository, but it is not imported by the active `pages/products.js` flow. It will not be removed or modified in this visual refactor.

## 4. Existing Design Tokens

Primary catalog tokens are already available through the global theme layer:

- `--r2-ui-bg: #f6f8fb`
- `--r2-ui-surface: #ffffff`
- `--r2-ui-surface-2: #f9fbfe`
- `--r2-ui-ink: #0b1d41`
- `--r2-ui-muted: #66768d`
- `--r2-ui-line: #dce5ef`
- `--r2-ui-blue: #1769e0`
- `--r2-ui-navy: #071a45`
- `--r2-ui-radius: 18px`
- `--r2-ui-shadow: 0 16px 42px rgba(10,38,78,.075)`

The new Bento/neo-minimal layer will reuse these existing brand tokens rather than inventing a second color system.

## 5. Existing Responsive Rules

The current catalog has several legacy CSS layers that override `.catalog-grid` and `.product-card`. The latest mobile layer explicitly maintains a two-column catalog at <=620px and <=420px. Existing global CSS also contains desktop/tablet grid rules.

Because CSS precedence is distributed across many imported files, the Bento layer must be loaded last or use a narrowly scoped catalog namespace so it becomes deterministic without modifying unrelated pages.

## 6. Planned Files

### Allowed / intended modifications
- `pages/products.js` — presentation-only wrapper/variant integration; preserve all data/state handlers.
- `styles/catalog-bento-grid.css` — new, scoped global catalog layout/polish layer.
- `AUDIT_REPORT.md` — this audit record.
- `BENTO_GRID_CHANGELOG.md` — final change record after implementation.

### Explicitly protected
- `pages/_app.js` — shared/global; do not modify unless absolutely required and reported first.
- `components/BrandAssetLoader.js` — shared/global; do not modify.
- `lib/**` — data layer.
- `app/api/**` / API routes.
- `pages/checkout*` / checkout flow.
- auth pages and middleware.
- Supabase configuration and environment variables.
- Existing cart/favorite/storage logic.
- Existing routing/query schema.
- `next.config.js`.
- Existing legacy product components not used by the target route.

## 7. Risk Assessment + Mitigation

### High risk: CSS cascade conflicts
Many historical global CSS files target the same catalog selectors.
**Mitigation:** add one scoped final catalog layer and avoid broad global selectors outside `.premium-catalog` / `.catalog-app`.

### Medium risk: product-card DOM is inline in `pages/products.js`
There is no standalone active ProductCard component to safely wrap without touching the page.
**Mitigation:** preserve the existing card markup and add only a presentation wrapper/variant class; do not change prop/state contracts because none exists for the active inline card.

### Medium risk: mobile layout regression
Legacy mobile CSS currently forces two columns and contains compact sizing rules.
**Mitigation:** define explicit Bento responsive spans and retain 2-column mobile behavior; validate 375px, 768px and 1280px.

### Low risk: image handling
Current active catalog artwork is CSS/HTML artwork rather than `next/image`. No data image source or image component is being replaced in this phase.

### Low risk: data count/order
Bento span assignment will be derived after the existing `shown` array is produced, without sorting, filtering, slicing or mutating the product data.

## 8. Guardrails

- Presentation-only refactor.
- No API/query/data-layer changes.
- No cart/checkout/auth changes.
- No new dependency.
- No Tailwind adoption.
- No routing or URL schema changes.
- Existing product order remains unchanged.
- Existing product count must remain unchanged.
- Existing interactive controls must retain their handlers.
- Shared components remain untouched.
- Production `main` remains untouched until explicit final approval.
