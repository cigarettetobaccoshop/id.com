# R2 NUSANTARA production-readiness gate — 2026-10-12

## Decision

**NO-GO for a claim of 100% production readiness.** Keep the current release gate open. This branch is an audit/reconciliation branch, not a production fix. No database, migration history, integration target, checkout implementation, production data, or `main` branch was changed by this audit.

## Git state

- Repository: `cigarettetobaccoshop/id.com`
- Base: `main` at `55ebdf26e85eb436523ae8671af96531b463d20c`
- Audit branch: `fix/separate-finance-inventory-migrations-2026-10`
- Branch delta at time of check: one documentation commit only.
- Documentation commit: `03a5486dd6126a5631b377cadffd9618dc77953e`
- No application or migration SQL changes are included.

## Supabase target and migration evidence

Live read-only project metadata and migration listings were queried on 2026-10-12:

| Environment | Project ref | Project name | Migration versions |
|---|---|---|---:|
| Preview check target | `zgsbtexngystdmakqjyi` | `r2.com` | 23 |
| Production | `nwrqdcrknipnfvhogjyg` | `cigarettetobaccoshop's r2nusantara` | 14 |

The R2 repository's `main` has 16 SQL files under `supabase/migrations` according to the existing repository audit. The Preview history is not simply the same as Production plus two finance migrations: the Preview migration names/versions show a different lineage, including R2-specific versions that do not match the current Production lineage, plus:

- `20261002015702_create_finance_inventory_app_schema_v1`
- `20261002015743_allow_authenticated_audit_log_insert_v1`

The two finance migration SQL files are absent from the R2 repository at the expected paths. The separate finance/inventory repository has similar table definitions in `supabase/schema.sql`, but that schema file is not an authoritative copy of the missing historical migration bodies.

### Schema footprint observed

Preview tables and row counts include:

- `products`: 233
- `orders`: 13
- `inventory_reservations`: 32
- `audit_log`: 34
- `form_submissions`: 3
- `presence_sessions`: 0
- `inventory_items`, `inventory_opening_balances`, `cash_transactions`, `inventory_movements`, `audit_logs`: 0 each

Production table list includes `products` (233), `orders` (11), `newsletter_subscribers` (1), `conversations`, `conversation_participants`, `messages`, `product_images` (233), and `contact_messages` (5). These are materially different schemas. Row counts are observations at audit time, not guarantees about future state.

## Current release blockers

1. **Supabase Preview check failure** — Issue #155 / check run 113916284820 reports `Remote migration versions not found in local migrations directory`. Deployment `READY` is not equivalent to all GitHub checks passing.
2. **Preview ownership/mapping is unconfirmed** — verify Supabase Project Settings → Integrations → GitHub Integration for `zgsbtexngystdmakqjyi`: repository, working directory, branch, and branching/deployment behavior. Do not change the target based on the project name alone.
3. **Missing original migration SQL** — recover exact SQL from a trusted commit/backup/source, or formally approve a new forward migration after schema ownership is confirmed. Never recreate historical migrations by guessing from the current schema.
4. **Production RPC security needs a controlled review** — Supabase Security Advisor reported that `public.create_order_atomic(...)` is a `SECURITY DEFINER` function executable by `anon`. This may be intentional for guest checkout, but it is a high-impact security boundary and must be reconciled with the intended checkout design and least-privilege policy in isolated Preview before any Production change. Do not revoke or regrant privileges blindly because guest checkout currently calls this path.
5. **Admin and visual QA are incomplete** — an unauthenticated HTTP 403 is evidence that access is denied, not evidence that a valid admin session can use the dashboard. Authenticated admin checks and desktop/mobile browser QA remain required.
6. **CI evidence must be current for the candidate commit** — previously recorded CI/build checks on older commits do not prove this branch or a future fix passes. Rerun checks after the real remediation.

## Additional advisor observations (not auto-remediated)

- Preview Security Advisor: leaked-password protection is disabled.
- Preview Performance Advisor: missing indexes on five foreign-key columns across the finance/inventory tables; additional RLS initialization-plan and duplicate/unused-index notices.
- Production Security Advisor: `contact_messages` has RLS enabled without policies; `create_order_atomic` is executable by `anon` as SECURITY DEFINER.
- Production Performance Advisor: RLS policy and duplicate/unused index notices were also returned.

These are advisory findings requiring context-aware triage. Do not run generic advisor “fixes” directly against Production.

## Safe execution plan

1. Confirm the Preview GitHub Integration target and working directory.
2. Compare all 23 Preview migration versions against the 16 local migration files and Production's 14 versions; classify every version as expected, missing source, wrong target, or legacy state.
3. Recover authentic SQL for any expected migration, verify checksums/effects and compare to live Preview schema. If the Preview target is wrong, correct only the integration mapping after confirming the intended isolated Preview project.
4. Keep finance/inventory migrations in their intended application/repository. Do not copy the finance schema into R2 merely to silence the check.
5. Review the guest-checkout RPC boundary in a disposable/isolated Preview with explicit tests for valid guest checkout, invalid product/price, stock/reservation behavior, and unauthorized execution. Do not create Production test orders.
6. Run the complete CI, Supabase Preview check, Vercel native checks, deployment checks, smoke tests, and CSS audits on the candidate commit. Confirm all required statuses, not only deployment READY.
7. Test authenticated admin workflows and desktop/mobile visual QA. Verify health/product/catalog/checkout routes without mutating Production data.
8. Open a PR only when it contains a real, validated remediation. Merge/release only after review and all required checks pass.

## Safety record

At this audit, the Supabase calls were read-only (project metadata, migration listings, table summaries, advisor reports). No SQL was executed, no migration was applied or repaired, no project was reset, no integration was changed, and no Production data was modified.
