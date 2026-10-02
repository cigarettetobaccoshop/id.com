# Repository Cleanup Audit — 2026-10-03

## Scope

Static repository hygiene and dead-code cleanup for `cigarettetobaccoshop/id.com`.

Production behavior is intentionally out of scope. No Supabase schema/data, API route behavior, authentication, catalog data, inventory, cart, checkout, order processing, transaction flow, or protected runtime hooks were changed.

## Findings

### Confirmed unused application modules removed

Repository-wide code search found no importer, dynamic import, route reference, or consumer for:

- `components/BentoGrid.jsx`
- `components/BentoItem.jsx`
- `components/thumbnails/ThumbnailProvider.tsx`
- `utils/supabase-server.ts`

These were previously protected because an earlier cleanup regression showed that static deletion without dependency verification could break production. The current audit re-checked the modules individually before removal.

### Confirmed stale repository artifacts removed

The following files were not part of the active Next.js/Vercel production surface:

- `env.example` — stale duplicate environment template; `.env.example` remains the canonical template.
- `robots.txt` — obsolete GitHub Pages reference; `public/robots.txt` is the production file.
- `sitemap.xml` — obsolete GitHub Pages sitemap; `pages/sitemap.xml.js` is the active Next.js sitemap route.
- `cookie-consent.css` — no repository import/reference found.
- `sw.js` — retired service worker with no registration/reference found.

## Explicitly retained

The following were **not** removed because they remain part of the protected/runtime surface or require build-aware verification:

- `components/homepage/DeferredWarehouseMap.js`
- `lib/curatedBadges.js`
- `lib/supabaseStorage.js`
- `hooks/useAuthMonitor.js`
- `hooks/useFormTracker.js`
- `hooks/useOnlineGuests.js`
- `lib/aiAgentTools.js`
- Supabase/API modules and production routes

## CSS

The repository still contains a large layered global CSS stack. These files are imported by `pages/_app.js` directly or through documented CSS dependencies, so they were **not** mass-deleted based only on filename/version naming.

CSS consolidation remains a separate controlled task requiring rendered-selector inventory, cascade ownership analysis, build verification, and visual regression checks.

## Validation gate

Before merging this cleanup:

1. Verify the deletion diff contains only audited files.
2. Run the protected dependency audit.
3. Run the project build.
4. Run the smoke test.
5. Validate Vercel Preview reaches READY.
6. Check production runtime errors after promotion.
7. Confirm production routes remain healthy.

## Result

The cleanup removes confirmed dead/stale files while preserving uncertain dependencies and all production integrations.
