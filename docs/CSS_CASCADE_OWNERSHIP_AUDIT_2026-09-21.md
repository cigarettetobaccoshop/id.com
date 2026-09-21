# CSS Cascade Ownership Audit

This audit is intentionally conservative. It inventories repeated CSS declarations and records them as review candidates only; it does not delete declarations automatically.

## Safety policy
- Do not delete based on filename/version suffix.
- Do not treat identical property/value as redundant when selector specificity, !important, media/container queries, or import order can change the cascade.
- Preserve dynamic/runtime selectors, pseudo-elements, accessibility states, and compatibility layers.
- Any future deletion must be isolated to a one-declaration change followed by CI, production deployment, and runtime validation.

## Current protected ownership
- Global box sizing: styles/r2-premium.css
- Global viewport/overflow guardrails: styles/mobile-lock.css
- Catalog mobile layout: styles/catalog-mobile-grid.css and its imported layers
- Homepage structure: components/HomepageExperience.js and homepage CSS layers

## Reviewed patterns
- box-sizing: border-box: prior safe duplicates have been removed in PRs #79, #81, and #83. Remaining scoped/important/component-owned instances are retained.
- overflow-x: hidden: remaining instances have route/mobile-specific ownership and are retained.
- !important resets: retained unless exact cascade equivalence is proven.
- Inline component CSS: retained as component-local ownership.

## Result
No additional declaration is promoted to an automatic deletion candidate in this pass. The repository is intentionally left functionally unchanged by this audit.
