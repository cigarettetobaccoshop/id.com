# R2 Nusantara — Performance & Responsive Audit

Audit date: 2026-09-10
Branch: `perf/responsive-upgrade`
Production: `https://r2nusantara-shop.vercel.app/`

## Stack detected

- Next.js 14 + React 18
- Plain/global CSS (not Tailwind)
- Supabase client integration exists and is intentionally out of scope
- Vercel Git integration / Next.js production deployment
- `lucide-react`, `swiper`, Vercel Analytics and Speed Insights are installed

Evidence: `package.json`, `pages/_app.js`, `next.config.js`.

## Baseline observations

### HIGH

1. **Global stylesheet fan-out** — `_app.js` imports a large number of global CSS layers. This can increase CSS transfer/parsing work and makes responsive rules harder to reason about. We will not remove existing layers in this pass because that could cause visual regression; optimization will be additive and scoped.
2. **Hero/footer/background assets are loaded through CSS background-image rules.** This makes browser priority less explicit and can delay important visual assets. We will preserve the existing assets and avoid changing their visual treatment.
3. **Global interaction guard uses a 700 ms polling interval for cart count.** This is existing application behavior and is explicitly out of scope; it will not be changed in this performance pass.

### MEDIUM

4. **Several fixed typography values exist across the main design system.** Mobile overrides exist, but a fluid layer can reduce breakpoint jumps without changing the content hierarchy.
5. **Some mobile controls are smaller than the recommended 44px touch target.** The optimization layer will increase effective hit areas without changing their visual footprint materially.
6. **Fixed bottom navigation and checkout prompt require safe-area-aware spacing.** Existing CSS partially handles safe areas; this will be normalized.
7. **Large background assets are reused by multiple CSS selectors.** We will avoid duplicate visual fetches and reserve layout space where applicable.

### LOW

8. **`backdrop-filter` is used extensively.** It is visually intentional, so it will remain; fallbacks will be retained for devices without support.
9. **Reduced-motion handling exists in the project and should be retained for all new performance CSS.**

## Lighthouse / Core Web Vitals limitation

A direct local Lighthouse/Chrome DevTools run is not available in the current execution environment because outbound package/browser installation and Git clone access are unavailable. Vercel deployment/build telemetry is available and will be used as the build verification gate. We will not invent Lighthouse scores.

The production deployment currently associated with `main` is READY on Vercel, but this audit branch has not yet been promoted to production.

## Optimization priorities

1. Add a scoped responsive/performance CSS layer using `clamp()`, safe-area variables, touch-target normalization, and overflow guards.
2. Add immutable cache headers for versioned/static assets through `next.config.js` without changing application routes or APIs.
3. Preserve all existing UI, catalog, search, cart, Supabase, routing, and business logic.
4. Validate through Vercel preview build before any merge to `main`.
5. Only promote to production after the preview build is READY and no build/runtime regression is detected.
