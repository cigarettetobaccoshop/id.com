# Supabase Preview migration reconciliation — 2026-10-12

## Status

**Release blocker remains open.** This branch is an isolation/reconciliation work branch only. No Supabase project target, remote schema, migration history, production data, or application integration has been changed.

## Verified evidence

- Repository: `cigarettetobaccoshop/id.com`; base branch: `main`.
- Preview project used by the failing check: `zgsbtexngystdmakqjyi` (`r2.com`).
- Production R2 project: `nwrqdcrknipnfvhogjyg`.
- Issue #155 reports 23 migration versions in Preview versus 16 SQL migration files in the R2 repository at the time of the audit.
- The known Preview-only migration versions include:
  - `20261002015702_create_finance_inventory_app_schema_v1`
  - `20261002015743_allow_authenticated_audit_log_insert_v1`
- The finance/inventory schema has overlapping table definitions in the separate `laporan-harian-keuangan-inventory` repository, but its `supabase/schema.sql` is **not** the original SQL migration history and must not be substituted for those missing historical migration files.
- The failing check is recorded in [Issue #155](https://github.com/cigarettetobaccoshop/id.com/issues/155) and [check run 113916284820](https://github.com/cigarettetobaccoshop/id.com/runs/113916284820).

## Safety decision

Do **not** add reconstructed SQL under the missing historical timestamps, run `supabase migration repair`, reset a remote database, or push migrations to either project merely to make the check green. A schema file is not proof of the exact historical migration body, order, grants, policies, or side effects.

Do **not** change the GitHub/Supabase integration target until the owner confirms whether Preview project `r2.com` is intentionally the R2 repository's Preview target. Its additional finance/inventory tables are a concrete reason to validate ownership and mapping first, but are not sufficient by themselves to conclude the target is wrong.

## Required reconciliation sequence

1. In Supabase Dashboard, inspect Project Settings → Integrations → GitHub Integration for project `zgsbtexngystdmakqjyi`. Record the connected repository, working directory, branch, and branching/deployment behavior.
2. If the target mapping is unintended, correct it only after confirming the intended Preview project and preserving an isolated Preview environment.
3. If the target mapping is intentional, recover the exact missing migration SQL from a trusted commit, backup, or other authoritative source. Compare each recovered migration with the current Preview schema and history before adding it to Git.
4. Run the migration status comparison against the confirmed Preview target; do not connect this reconciliation to Production.
5. Run CI, Preview checks, smoke tests, and review the resulting deployment/check statuses. Keep release blocked until required checks pass.
6. Separately validate authenticated admin behavior and desktop/mobile visual QA. Do not treat unauthenticated 403 responses as a successful authenticated admin test.

## Scope of this branch

This document records the safety decision and verification sequence only. It does not claim to repair the remote migration mismatch. No SQL is executed by this change.
