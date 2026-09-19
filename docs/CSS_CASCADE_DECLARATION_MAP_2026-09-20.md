# CSS Cascade Declaration Map — 2026-09-20

## Scope

This map is declaration-level. It does not classify a stylesheet as legacy because of filename, version suffix, or age.

A declaration is a safe exact-duplicate candidate only when selector text, at-rule context, selector specificity, property name, and property value are identical, and the matching declaration occurs later in registered CSS source order. Under those conditions, the later declaration has the same cascade inputs and shadows the earlier identical declaration whenever the same context applies.

The analyzer follows transitive CSS @import dependencies.

## First controlled consolidation

- Earlier file: `styles/homepage-experience.css`
- Later file: `styles/canva-layout-polish.css`
- Selector: `.hx-header`
- Context: global
- Removed from the earlier rule: `position: sticky`, `top: 0`, `z-index: 80`, `align-items: center`.
- No stylesheet was deleted.
- No Supabase schema, data, RLS, API, checkout, or transaction logic was changed.

## Verification gate

1. `npm test`
2. `npm run build`
3. route regression: `/`, `/products`, `/katalog`, `/checkout`, `/login`, `/admin/dashboard`
4. Vercel deployment/build/runtime evidence
5. review diff
6. only then consider the next consolidation group.

The analyzer remains conservative: unknown dynamic selectors are not treated as safe-to-delete.