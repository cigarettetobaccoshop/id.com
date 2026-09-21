# Protected Dependency Audit — 2026-09-22

## Purpose

This audit records modules that must not be removed solely because a repository-wide static text search reports no direct importer.

## Regression evidence

The production cleanup sequence exposed a dependency-resolution gap:

- PR #93 removed `components/homepage/DeferredWarehouseMap.js`.
- The following production deployment entered `ERROR`.
- The module is loaded through a dynamic import chain from `pages/_app.js` → `components/HomepageExperience.js` → `components/homepage/DeferredWarehouseMap.js`.
- The production recovery restored the last known-good tree at commit `4e47bbd1810db9c1dab598f79328e539d4d57a9a`.

Therefore, dynamic imports and runtime composition are treated as first-class dependency edges.

## Protected modules

The following files remain protected pending a build-aware dependency graph:

- `components/homepage/DeferredWarehouseMap.js`
- `lib/curatedBadges.js`
- `components/BentoGrid.jsx`
- `components/BentoItem.jsx`
- `components/thumbnails/ThumbnailProvider.tsx`
- `utils/supabase-server.ts`

Static search currently does not provide sufficient evidence to classify all of these as safe deletion candidates. They are therefore retained.

## Cleanup gate

A future deletion is allowed only when all of these conditions are satisfied:

1. No direct import exists.
2. No dynamic import exists.
3. No route/page/build-time reference exists.
4. No generated or runtime integration depends on the module.
5. A single-file change passes the production build/preview.
6. Production deployment reaches READY.
7. Canonical smoke tests remain healthy.
8. Runtime errors remain zero in the validation window.

Never delete multiple uncertain modules in the same cleanup change.

## Current production baseline

Recovery commit:

`9e0a1dc18dec8162b7c86f6cf56fd8637d2bb70f`

Last known-good pre-regression tree:

`4e47bbd1810db9c1dab598f79328e539d4d57a9a`

This document is audit metadata only. It does not change Supabase, authentication, checkout, order processing, catalog data, or production transaction logic.
