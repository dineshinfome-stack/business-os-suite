---
id: PHASE3_GATE37_DISCOVERY
title: Phase 3 — Gate 3.7 Repository Discovery
sprint: SPR-MOD-001-003
status: COMPLETE
last_updated: 2026-07-26
---

# Gate 3.7 — Repository Discovery

Read-only inspection performed **before** any production code. Every planned
capability is classified **Reuse / Extend / Add / Defer**.

## 1. Existing platform surfaces

| Area | Location | Notes |
|---|---|---|
| Platform shell + nav | `src/components/platform/nav-items.ts` | `PLATFORM_NAV` with children; Provisioning + Companies wired |
| Platform dashboard | `src/routes/_authenticated/platform/dashboard.tsx` | Enterprise dashboard template |
| Provisioning console | `src/routes/_authenticated/platform/provisioning/*` | Overview, history, queue, failed, health, `$jobId` |
| Tenant registry | `src/routes/_authenticated/platform/tenants/index.tsx` | Gate 3.2 |
| Tenant lifecycle console | `src/routes/_authenticated/platform/tenants/lifecycle.tsx` | Gate 3.6 |

## 2. Application boundaries already available

| Boundary | Location | Reusable for 3.7 |
|---|---|---|
| Provisioning query facade | `src/lib/provisioning-admin/queries.functions.ts` + `query-service.server.ts` | Yes — summary, jobs, failures, queue, provider health |
| Provisioning command facade | `src/lib/provisioning-admin/commands.functions.ts` | Yes — deep-link only, not re-exposed |
| Provider runtime resolution | `src/lib/provisioning-admin/provider-resolver.server.ts` | Yes — **environment-backed**, read-only |
| Tenant lifecycle | `src/lib/tenant-lifecycle/lifecycle.ts`, `timeline.ts`, `lifecycle.functions.ts` | Yes — states, operations, timeline |
| Settings framework | `src/lib/settings.functions.ts`, `settings-validation.ts` | Yes — `setting_definitions` / `setting_values`, platform + org scope, redaction |
| Feature flags | `src/lib/feature-flags.functions.ts` | Yes — `feature_flags`, platform row + org override |
| Audit | `public.audit_logs` + per-module writers | Yes — append-only source |
| Notifications | `src/lib/notifications/{registry,service.functions,constants}` | Partial — see §5 |
| RBAC | `src/lib/authorization.server.ts`, `src/lib/generated/permission-keys.ts` | Yes |
| CSV export pattern | `EXPORT_ROW_LIMIT` + `toCsv` in `src/lib/provisioning-admin/mappers.server.ts` | Yes |

## 3. Answers to the mandated discovery questions

1. **Is there a platform settings table/service?** Yes. `setting_definitions` +
   `setting_values`, scope enum includes `platform`, `is_system` marks
   framework-owned (migration-only) definitions and `is_sensitive` drives
   redaction. Existing reads are org-context bound; Gate 3.7 adds a
   **platform-scope** read/write path only. No new table.
2. **Do feature flags exist?** Yes. `feature_flags(key, enabled, rollout_stage,
   organization_id)`; `organization_id IS NULL` is the platform row. RLS write
   policy already requires `platform.settings.manage` for platform rows.
3. **Can notification delivery status be queried?** Partially. `notifications`
   has a `status` column, but RLS scopes SELECT to
   `recipient_user_id = auth.uid()`. There is **no per-channel delivery-attempt
   store**. Delivery *outcome* and *retry* are therefore **deferred**;
   the gate exposes the type registry plus the operator's own persisted rows.
4. **Is provider configuration database- or environment-backed?**
   Environment-backed (`SUPABASE_MANAGEMENT_API_TOKEN`,
   `SUPABASE_ORGANIZATION_ID`, `SUPABASE_DEFAULT_REGION`). Mutation from the
   browser is therefore **deferred**; the surface is read-only.
5. **Which platform metrics are genuinely persisted?** Tenant counts by
   `lifecycle_state` / `provisioning_status`, maintenance and deletion markers
   (`maintenance_started_at`, `deletion_scheduled_at`, `purge_after`),
   provisioning job states, attempt counts, timestamps, correlation ids, and
   audit rows. **Not persisted:** uptime, usage, capacity, billing, incidents.
6. **Which platform-admin permissions already exist?** `platform.dashboard.view`,
   `platform.tenant.read`, `platform.settings.manage`, `platform.audit.view`,
   `platform.policies.view`, `platform.policies.manage`,
   `notifications.inbox.read`. **No new permission keys are required.**
7. **Is there a global audit query?** No. Writers exist per module; a
   platform-wide filtered/paginated reader is **new** in this gate.
8. **Can attention items be derived from durable data?** Yes — from
   `provisioning_jobs` (state, attempt_count, timestamps) and `tenants`
   (maintenance/deletion columns). Notification-delivery attention is deferred.

## 4. RLS verification (read under caller JWT)

| Table | Platform-admin SELECT | Result |
|---|---|---|
| `tenants` | `tenants_select_platform_admin` | Full read |
| `provisioning_jobs` | `provisioning_jobs_select_platform_admin` | Full read |
| `audit_logs` | `audit_logs_admin_select_all` | Full read |
| `setting_definitions` | `select_all` | Full read |
| `setting_values` | `organization_id IS NULL` allowed | Platform values readable |
| `feature_flags` | `organization_id IS NULL` allowed | Platform flags readable |
| `notifications` | recipient-scoped only | **Limited** — see §5 |

No `supabaseAdmin` / service-role usage is required anywhere in this gate.

## 5. Classification

| Capability | Class | Justification |
|---|---|---|
| Operations overview | Add (composition) | Aggregates existing persisted reads |
| Tenant operations directory | Add (composition) | Server-side query over `tenants` + jobs |
| Attention queue | Add (derivation) | Derived server-side from durable rows |
| Provider & region visibility | Extend | Env-backed config → read-only |
| Platform settings | Reuse + extend | Platform-scope path over existing service |
| Feature controls | Reuse + extend | Platform-scope only |
| Global audit explorer | Add (query) | No global reader existed |
| Notification operations | Reuse (read-only) | Delivery outcomes not persisted |
| Operational policies | Extend | Rendered from the settings registry |
| Attention acknowledgement | Add (audit-backed) | Persisted as append-only audit rows — no new table |
| Billing / usage / uptime / incidents / live provider probes | **Defer** | No authoritative source |
| Provider mutation, purge execution, auto-remediation | **Defer** | Out of gate scope |

## 6. Migration decision

**No database migration is introduced by Gate 3.7.** No new permission keys, no
new tables, no new columns. Attention acknowledgement reuses the append-only
`audit_logs` table with the action `platform.attention.acknowledged`.
