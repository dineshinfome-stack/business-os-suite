# Gate 3.7 — Platform Administration & Operations

## What I verified in the repository first

- **Provisioning admin facade already exists**: `src/lib/provisioning-admin/` (`queries.functions.ts`, `commands.functions.ts`, `query-service.server.ts`, `mappers.server.ts`, `events.server.ts`, `provider-resolver.server.ts`) plus the dashboard at `/platform/provisioning/*` and module `src/modules/platform/provisioning/`.
- **Tenant lifecycle already exists**: `src/lib/tenant-lifecycle/` (state machine, timeline, `lifecycle.functions.ts`) and the console at `/platform/tenants/lifecycle`.
- **Settings framework exists**: `src/lib/settings.functions.ts` + `settings-validation.ts` over `setting_definitions` / `setting_values`, with `platform` and `organization` scopes, system/sensitive flags and redaction. Reads currently run through `requireOrgContext`.
- **Feature flags exist**: `src/lib/feature-flags.functions.ts` over `feature_flags` (platform row + org override, `rollout_stage`), also org-context bound.
- **Audit exists**: `public.audit_logs` written by module-specific writers (`src/lib/tenants/audit.ts`, `organizations/`, `branches/`, `financial-years/`, `auth.functions.ts`). No global platform-wide audit query yet.
- **Notifications exist**: `src/lib/notifications/` (registry, service, providers) over `notifications` / `notification_preferences`.
- **Permissions**: a large `platform.*` catalog already exists including `platform.audit.view`, `platform.settings.manage`, `platform.policies.view/manage`, `platform.dashboard.view`, `platform.tenant.*`. No `platform.admin.*` namespace.
- **Query keys** are centralized in `src/lib/query-keys.ts`; nav in `src/components/platform/nav-items.ts`.

## Scope classification (drives what gets built)

| Capability | Class | Note |
|---|---|---|
| Operations overview / summary | Add (composition) | Aggregates existing provisioning + tenant reads |
| Tenant operations directory | Add (composition) | Server-side search/filter over `tenants` + job status |
| Attention queue | Add (derivation) | Derived server-side from jobs + tenant lifecycle columns + audit |
| Provider & region visibility | Extend | Reuses `provider-resolver.server.ts` + historical job stats; config is code/env-based → read-only, mutation deferred |
| Platform settings | Reuse + extend | Reuse settings service; add platform-scope read/write path that does not require org context. No new table |
| Feature controls | Reuse + extend | Reuse `feature_flags`; platform-scope only in this gate. No percentage rollout/targeting |
| Global audit explorer | Extend | New platform-wide query over existing `audit_logs`, paginated + CSV export |
| Notification operations | Reuse (read-only) | Show persisted rows only; delivery-state and retry deferred unless a persisted delivery column exists |
| Operational policies | Extend | Rendered from settings registry entries; engine-owned values displayed read-only |
| Billing / usage / live telemetry / remediation | Defer | No authoritative source |

## Technical plan

**Discovery doc first** — `docs/60-engineering/PHASE3_GATE37_DISCOVERY.md` and `PHASE3_GATE37_OPERATIONS_MATRIX.md`, before production code.

**Application layer** `src/lib/platform-admin/`
- `queries.functions.ts`, `commands.functions.ts` (thin server-fn wrappers only)
- `query-service.server.ts`, `command-service.server.ts`, `mappers.server.ts`
- `validation.ts` (allow-listed setting/feature keys; rejects unknown keys)
- `query-keys.ts` (`['platform-admin', ...]`, documented invalidation sets)
- `types/v1/index.ts` — the 14 DTOs in the spec, sanitized (no rows, no provider objects, no credentials, no SQL, no stack traces)

**Permissions** — reuse existing keys rather than adding a `platform.admin.*` namespace: `platform.dashboard.view` (overview), `platform.tenant.read` (directory/attention), `platform.settings.manage`, `platform.audit.view`, `platform.policies.view/manage`. One addition only if discovery proves a gap: `platform.features.manage`. Any addition goes into the manifest, migration seed, role grants, generated keys, guards and tests together.

**Routes** — `src/routes/_authenticated/platform/admin/route.tsx` guarded layout with sub-nav, plus `index` (Overview), `operations`, `tenants`, `attention`, `providers`, `settings`, `features`, `audit`, `notifications`, `policies`. Nav entry added to `PLATFORM_NAV`. Row actions deep-link to the existing provisioning/lifecycle consoles — no duplicated workflows.

**UI** — `src/modules/platform/administration/` with the components listed in the spec, reusing the existing `States` (Loading/Empty/Error) and badge patterns from the provisioning module. Every card handles loading/empty/error/success; severity and status are server-computed and rendered verbatim.

**Commands** — `updatePlatformSetting`, `updateFeatureControl`, `acknowledgeAttentionItem`, `updateOperationalPolicy`; `retryNotificationDelivery` only if delivery state is persisted. Each: authenticate → authorize → allow-list key validation → typed value validation → execute → audit row (previous value, new value, actor, timestamp, correlation id, reason) → typed result → documented invalidation.

**Migration** — expected to be needed only for: new audit action values for admin actions, an `acknowledged_at`/`acknowledged_by` marker if attention acknowledgement is kept persistent, and any seed rows for new permission/setting definitions. Nothing added purely to fill dashboard cards.

## Adopted refinements

**1. Settings registry ownership contract.** Every platform setting surfaced by this gate is declared in one registry (`src/lib/platform-admin/validation.ts`, mirrored in the operations matrix) with six mandatory attributes: **owner**, **validation rule** (type + bounds/enum, enforced server-side), **default**, **mutability** (`editable` | `read-only-system` | `read-only-environment` | `engine-owned`), **audit requirement** (always `required` for editable entries), and **source of truth**. A setting absent from the registry is rejected by the command layer. Engine-owned values (retry, rollback, concurrency) are registered as display-only.

**2. Attention queue priority policy.** Severity and ordering are computed server-side. Deterministic precedence when several conditions apply to one tenant: `provisioning_rollback_failed` > `provisioning_retry_exhausted` > `provisioning_failed` > `deletion_purge_overdue` > `pending_deletion` > `job_exceeds_expected_duration` > `maintenance_beyond_threshold` > `configuration_validation_issue` > `notification_delivery_issue`. Ties break by `severity`, then oldest `created_at`, then tenant id. Deduplicated by `tenant_id + type`, so ordering is stable across refreshes.

**3. Export redaction parity.** CSV export is generated server-side from the **same mapper functions** as the screen DTOs — never from raw rows — so redaction, sensitive-field exclusion and the existing export row limit apply identically. A test asserts field-set equality between the audit DTO and the exported CSV, and that secret-shaped fields (token, password, key, secret, connection string, provider payload, stack trace) appear in neither.

**4. Operations matrix "Owning Module" column.** `PHASE3_GATE37_OPERATIONS_MATRIX.md` gains an **Owning Module** column identifying the responsible subsystem for each surface (Provisioning, Tenant Lifecycle, Settings, Feature Flags, Audit, Notifications, RBAC, Platform Admin composition). Columns become: Surface | Owning Module | Data source | Authoritative owner | Permission | Query | Command | Audit event | Cache invalidation | Known limitation. Surfaces owned by another module are marked *composed, read-only* so ownership reviews can tell aggregation from authorship at a glance.

**5. Attention item explainability.** `PlatformAttentionItemDTO` carries an optional server-generated `explanation` string (plus the structured `reasonCode` and `reasonParams` it renders from) — e.g. *"Provisioning retry exhausted after 5 attempts; last failure 2h ago"*, *"In maintenance for 9 days, beyond the 7-day display threshold"*. The string is composed server-side from persisted values only (never fabricated), sanitized like every other DTO field, and shown inline on the queue row so operators understand the item without navigating away. The deep link remains the action; the explanation is context.

**6. Breadcrumb consistency for composed vs. deep-linked views.** Every `/platform/admin/*` route declares breadcrumb metadata rooted at *Platform › Administration › {Section}*, marking it as a **composed administrative overview**. When a row action deep-links into an owning console (`/platform/provisioning/*`, `/platform/tenants/*`), navigation carries an origin marker so those pages show *Platform › Administration › {Section} › {Workflow}* with a back affordance to the admin surface, while direct visits keep their native breadcrumb trail. This makes the aggregation boundary visible in the UI and is covered by a navigation test.

## Architecture boundary (unchanged, enforced by test)

```text
Platform Administration UI
        │
        ▼
Platform Admin Facade (queries / commands)
        │
        ├── Provisioning Query Facade
        ├── Tenant Lifecycle Query Facade
        ├── Settings Framework
        ├── Feature Flags
        ├── Audit
        └── Notifications
```

The browser bundle must not reach repositories, providers, orchestrators, retry/rollback engines, migration/seed runners, SQL, or the Supabase SDK — asserted by an executable architecture-integrity test over the client import graph.

**Testing** — query tests (aggregation, directory search/filter/pagination, attention classification/dedupe/ordering/explanation, provider history, audit filtering, DTO sanitization), command tests (registry allow-list, validation, permission denial, audit creation, invalidation, duplicate submission), UI tests (states, filters, dialogs, keyboard, ARIA, deep links, breadcrumb origin), security tests (unauthorized route/server-fn, unknown keys, secret-shaped field exclusion, export redaction parity), and the architecture-integrity test. All 428 existing tests remain unmodified and green.

**Closure** — typecheck, production build, full suite, then `docs/60-engineering/PHASE3_GATE37_COMPLETION_REPORT.md`. Stop; Gate 3.8 not started.

## Known limitations that will be reported honestly

Provider health is historical, not live. No infrastructure usage/uptime metrics. Notification delivery outcomes shown only if persisted. Feature controls are platform-wide only. Environment-managed configuration is read-only. Attention items require manual resolution — no automatic remediation, no purge execution, no billing.

## Delivery

Final response will be the structured inventory only (files, routes, components, DTOs, queries, commands, permissions, tests, counts, build/integrity status, limitations, deferrals, gate status) — the narrative lives in the completion report.
