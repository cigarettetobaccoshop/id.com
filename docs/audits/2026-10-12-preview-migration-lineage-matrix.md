# Supabase Preview migration lineage matrix — 2026-10-12

## Executive result

**The failing Preview check is a migration-lineage mismatch, not a two-file-only problem.** Read-only comparison of the current R2 repository `main`, Supabase Preview project `zgsbtexngystdmakqjyi` (`r2.com`), and Production project `nwrqdcrknipnfvhogjyg` found:

- R2 repository `main`: 16 migration SQL files.
- Preview migration history: 23 versions.
- Exact migration-version overlap between Preview and the R2 repository: **0 of 23**.
- Production migration history: 14 versions.
- Exact migration-version overlap between Production and the R2 repository: **14 of 14 Production versions**; the repository has two additional versions not present in Production.

This explains why the Preview check can report `Remote migration versions not found in local migrations directory`: the Preview's recorded history uses a different version lineage from the checked-in R2 migration directory. It does **not** prove the Preview project is the wrong target; the user has specified that Preview project is intentionally used for R2. The safe next step is source/history reconciliation, not changing the integration target or fabricating historical files.

## Preview versions missing exact local counterparts

All 23 remote Preview versions below have no exact-version SQL file in the current R2 repository's `supabase/migrations` directory:

| Preview version | Recorded migration name | Classification |
|---|---|---|
| `20260828040421` | `secure_r2_catalog_primary_key_and_policies` | Historical Preview lineage; recover authentic source |
| `20260828041605` | `r2_catalog_public_read_policy` | Historical Preview lineage; recover authentic source |
| `20260831012947` | `create_portfolio_messages` | Historical Preview lineage; establish ownership and recover source |
| `20260904073545` | `lock_public_rls_helper_execute` | Historical Preview lineage; recover authentic source |
| `20260904162702` | `consolidate_public_catalog_select_policy` | Historical Preview lineage; recover authentic source |
| `20260905011818` | `create_orders_checkout` | Historical Preview lineage; recover authentic source |
| `20260905221509` | `r2_nusantara_production_schema_v1` | Historical Preview lineage; recover authentic source |
| `20260905221542` | `r2_nusantara_compatibility_view_v1` | Historical Preview lineage; recover authentic source |
| `20260905221623` | `r2_nusantara_admin_rls_v1` | Historical Preview lineage; recover authentic source |
| `20260905221635` | `r2_nusantara_realtime_storage_v1` | Historical Preview lineage; recover authentic source |
| `20260906223525` | `harden_admin_role_function_v1` | Historical Preview lineage; recover authentic source |
| `20260906225516` | `r2_nusantara_rls_index_performance_v2` | Historical Preview lineage; recover authentic source |
| `20260906230942` | `r2_nusantara_secure_contact_rpc_v1` | Historical Preview lineage; recover authentic source |
| `20260906231034` | `r2_nusantara_contact_rls_invoker_v2` | Historical Preview lineage; recover authentic source |
| `20260908042702` | `add_atomic_inventory_and_whatsapp_order_flow` | Historical Preview lineage; recover authentic source |
| `20260908042803` | `harden_inventory_reservation_permissions` | Historical Preview lineage; recover authentic source |
| `20260908045954` | `fix_create_order_atomic_service_role_execute` | Historical Preview lineage; recover authentic source |
| `20260908133604` | `fix_inventory_reservation_expiry_order_status` | Historical Preview lineage; recover authentic source |
| `20260910200455` | `activity_monitoring` | Historical Preview lineage; recover authentic source |
| `20260914053823` | `20260914123000_secure_r2_catalog_admin_rls` | Historical Preview lineage; recover authentic source |
| `20260914054147` | `20260914125000_lock_checkout_rpc` | Historical Preview lineage; recover authentic source |
| `20261002015702` | `create_finance_inventory_app_schema_v1` | Finance/inventory ownership must be confirmed; do not copy to R2 blindly |
| `20261002015743` | `allow_authenticated_audit_log_insert_v1` | Finance/inventory ownership must be confirmed; do not copy to R2 blindly |

## Local versions absent from Preview by exact version

The following checked-in migration versions are not recorded in the current Preview history:

- `20260818230647_init_r2_nusantara_schema.sql`
- `20260828002731_fix_rls_auto_enable_security.sql`
- `20260828003039_fix_performance_indexes_and_duplicates.sql`
- `20260828003049_optimize_rls_policies.sql`
- `20260828003115_add_extensions_triggers_and_features.sql`
- `20260828003505_fix_extension_schema_and_duplicate_policies.sql`
- `20260828052156_harden_orders_and_optimize_product_catalog.sql`
- `20260908133500_fix_inventory_reservation_expiry_order_status.sql`
- `20260911000000_activity_monitoring.sql`
- `20260918052007_align_orders_with_storefront_checkout.sql`
- `20260918052032_lock_order_rpc_to_service_role.sql`
- `20260918053040_fix_create_order_atomic_required_order_fields.sql`
- `20260918143305_fix_guest_checkout_order_rpc_access.sql`
- `20260918145130_add_product_image_registry.sql`
- `20260920144628_admin_monitoring_rpc_hardening.sql`
- `20260921182033_restore_contact_submission_rpc.sql`

## Production comparison

The 14 Production migration versions match exact local versions. The two local versions absent from Production are:

- `20260908133500_fix_inventory_reservation_expiry_order_status.sql`
- `20260911000000_activity_monitoring.sql`

This indicates Preview and Production are on materially different migration histories. It is not safe to apply a bulk migration repair or reset to force them to match.

## Recommended execution sequence

1. Confirm the Supabase GitHub Integration settings for the intended Preview project: repository, branch, working directory, and whether the integration runs against this project or a Supabase development branch.
2. Recover the 21 non-finance Preview migration bodies from authentic Git history, prior branches, deployment artifacts, or approved backups. Current GitHub code/commit search did not locate these historical bodies in the accessible R2 repository history.
3. Establish the owner and intended repository for the two finance/inventory migrations. The separate finance/inventory repository currently exposes `supabase/schema.sql` and `supabase/production_hardening.sql`, not a `supabase/migrations` directory; those are not proof of the exact historical migration bodies.
4. Compare recovered SQL and checksums to the actual Preview schema before deciding whether the check should use a different local migration root or whether a forward-only migration is appropriate.
5. Do not insert fabricated historical migrations, alter `supabase_migrations.schema_migrations`, reset Preview, switch integration targets, or touch Production as a way to make the check green.
6. After a source-backed fix on a separate branch, run the Supabase Preview check, CI (`npm ci`, `npm test`, `npm run build`, CSS audits), Vercel checks, and browser QA. Merge only after required checks pass.

## Safety and evidence

All migration and project metadata used for this matrix was retrieved read-only on 2026-10-12. No SQL was executed and no database, integration, or Production data was changed. A missing status/check run is not treated as success.
