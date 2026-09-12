# R2 Nusantara — Performance & Responsive Upgrade Report

Date: 2026-09-10
Branch: `perf/responsive-upgrade`
Production baseline commit: `93dac57caf370193e82ba19147edd5ab90d98e4b`
Validated preview commit: `914eb1aaf16f8c6c414fd801bc39d6130af61ffb`

## Scope

Presentation/performance only. No changes were made to Supabase schema, API routes, data fetching logic, business logic, routing behavior, cart state, search behavior, checkout flow, or third-party integration behavior.

## Changes

### 1. Responsive layer

- Added `styles/performance-responsive-v1.css`.
- Fluid typography via `clamp()` for hero/catalog headings and lead text.
- Added scoped overflow protection to page shells instead of global `overflow-x:hidden`.
- Added `min-width:0` to key flex/grid children.
- Normalized mobile touch targets to a minimum 44px effective height.
- Added safe-area handling for the mobile bottom navigation.
- Preserved reduced-motion behavior.
- Added small-screen tuning for 375px and below.
- Reserved the Google Maps iframe footprint using `aspect-ratio:16/9` to reduce layout instability.

### 2. Static asset caching

`next.config.js` now applies immutable one-year caching to:

- `/assets/:path*`
- `/_next/static/:path*`

No HTML/API caching behavior was changed.

### 3. Homepage code splitting

`HomepageExperience` is now loaded with `next/dynamic` using SSR enabled. This moves the homepage-only presentation code out of the shared `_app` bundle while preserving server rendering, routing, markup, and application behavior.

## Build verification

Vercel preview build: **READY**

Preview branch:
`perf/responsive-upgrade`

Preview deployment:
`dpl_CTuLDz2ZQvfgyPsnRJBW6v9UYAgB`

Next.js build completed successfully with all 8 static pages generated.

### Bundle comparison from Vercel build output

| Metric | Baseline | Optimized | Change |
|---|---:|---:|---:|
| Home First Load JS | 163 kB | 97.9 kB | **-65.1 kB / -39.9%** |
| Shared First Load JS | 197 kB | 132 kB | **-65 kB / -33.0%** |
| Shared `_app` chunk | 77.9 kB | 11.8 kB | **-66.1 kB / -84.9%** |
| Shared CSS | 39.0 kB | 39.6 kB | +0.6 kB |
| Build result | successful | successful | no regression |

The CSS increase is intentional and limited to the new scoped responsive/performance layer; the major win comes from moving homepage-only JavaScript out of the shared application bundle.

## Lighthouse / Core Web Vitals

A direct local Lighthouse/Chrome DevTools run could not be executed in this environment because browser/package installation and direct Git clone/network access are unavailable. Therefore **no Lighthouse score is fabricated**.

The repository and Vercel build outputs were used for deterministic verification. A live PageSpeed/Lighthouse run should be performed after production promotion to obtain current mobile/desktop Performance, Accessibility, Best Practices, SEO, LCP, CLS and INP values.

## Runtime safety

Vercel production runtime-error aggregation for the preceding 24 hours reported **no runtime errors** before this performance branch was promoted.

The preview build itself completed successfully without compilation or type-check failures.

## Deployment policy

This branch has **not** been merged into `main` or promoted to Production by this upgrade pass. The validated preview is READY and production remains on the previous known-good deployment until the branch is reviewed/promoted.

## Rollback

Because all changes are isolated to the `perf/responsive-upgrade` branch, production can remain untouched until approval. The existing production commit remains the rollback baseline.
