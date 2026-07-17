---
title: "MOB-001 — Analytics Mobile Solution Design Specification"
summary: "Phase 3 Mobile Solution Design specification for MOD-017 Analytics. Derived exclusively from the Analytics Module Publication (with WEB-001 referenced only for journey and terminology consistency). Defines mobile personas, journeys, navigation, screen inventory, forms, offline & synchronization, device capabilities, accessibility, and user-facing security expectations. Introduces no new business requirements."
spec_id: "MOB-001"
family: "MOB"
source_module: "MOD-017"
source_module_name: "Analytics"
source_publication: "MOD-017_MODULE_PUBLICATION"
source_baseline: "MOD017_ANALYTICS_BASELINE_v1"
source_module_prd: "docs/20-module-prds/analytics/MODULE_PRD.md"
source_sprint_plan: "docs/30-sprint-prds/analytics/MOD-017_SPRINT_PLAN.md"
source_sprints: ["SPR-MOD-017-001", "SPR-MOD-017-002", "SPR-MOD-017-003", "SPR-MOD-017-004", "SPR-MOD-017-005"]
related_web_spec: "WEB-001"
version: "1.0"
status: "Active"
lifecycle_state: "Active"
owner: "Insights"
layer: "platform"
updated: "2026-07-18"
tags: ["solution-design", "mobile", "phase-3", "MOB-001", "MOD-017", "analytics", "SD-003"]
document_type: "Mobile Solution Design Specification"
template: "SD-003"
template_version: "v1.0"
governance_specification: "v1.0"
related_engines: ["ENG-001", "ENG-002", "ENG-003", "ENG-004", "ENG-005", "ENG-006", "ENG-010", "ENG-011", "ENG-012", "ENG-014", "ENG-017", "ENG-020", "ENG-021", "ENG-022", "ENG-023", "ENG-024", "ENG-025", "ENG-026", "ENG-027", "ENG-028"]
related_adrs: ["ADR-011", "ADR-014", "ADR-032", "ADR-081"]
---

# MOB-001 — Analytics Mobile Solution Design Specification

> **Reference derivation only.** MOB-001 is a Mobile-surface projection of the Analytics Module Publication [`MOD-017_MODULE_PUBLICATION`](../../45-module-publications/analytics/MOD-017_MODULE_PUBLICATION.md). It introduces no new business requirements, authorities, master data, transactions, events, engines, or ADRs. [`WEB-001`](../web/WEB-001_ANALYTICS.md) is referenced only to maintain consistency of journeys and terminology; it is not a business source. On any conflict with the Module Publication or its parent Module Baseline, the upstream artifact wins and MOB-001 is corrected in the same change.

## A. Overview

### A.1 Purpose

Define the Mobile-surface user experience through which authorized business users consume the Analytics capabilities published in `MOD-017_MODULE_PUBLICATION` — curated data marts, KPI catalog, dashboards, scheduled report distribution, bulk exports, and analytical models — over the Analytics read model, without mutating any source-module transaction, on mobile-native devices.

### A.2 Scope

Mobile-native surface (phone and tablet form factors) covering:

- Consumption of Dashboards, KPI Catalog, and Cross-Module Analytical Views on the go.
- Review of Report Runs and Model Runs, including download of permitted artifacts.
- Subscription management for scheduled distributions where permitted.
- Anomaly Highlights review and drill-down.
- Compliance / retention audit-readiness review (audit persona) — read-only.
- Notification handling for `DashboardShared`, `ReportPublished`, and `ModelRunCompleted` signals per the Distribution Authority and Notification Engine (`ENG-025`).
- Offline availability limited strictly to what the Published Module supports (cached read-only viewing and queued read-only requests).

Out of scope for MOB-001: Web surfaces (belongs to WEB-001), API contracts (belongs to API-001), UI mockups, framework decisions, and any business-rule authoring.

### A.3 Source Published Module

- **Module ID / Name:** MOD-017 Analytics
- **Publication:** [`MOD-017_MODULE_PUBLICATION`](../../45-module-publications/analytics/MOD-017_MODULE_PUBLICATION.md)
- **Baseline:** [`MOD017_ANALYTICS_BASELINE_v1`](../../40-module-baselines/MOD017_ANALYTICS_BASELINE_v1.md)
- **Module PRD:** [`docs/20-module-prds/analytics/MODULE_PRD.md`](../../20-module-prds/analytics/MODULE_PRD.md)
- **Sprint Plan:** [`docs/30-sprint-prds/analytics/MOD-017_SPRINT_PLAN.md`](../../30-sprint-prds/analytics/MOD-017_SPRINT_PLAN.md)
- **Sprint PRDs:** `SPR-MOD-017-001` … `SPR-MOD-017-005`
- **Related Web Specification:** [`WEB-001`](../web/WEB-001_ANALYTICS.md) — consistency reference only.

### A.4 Version

- **Specification Version:** 1.0
- **Aligned to Publication Version:** MOD-017 v1.0

### A.5 Traceability References

See §K for the complete feature-to-capability-to-sprint-to-WEB-001 traceability matrix. Frontmatter records the full chain (Module PRD → Sprint Plan → Sprint PRDs → Module Baseline → Module Publication → MOB-001; WEB-001 referenced for consistency).

## B. Mobile Personas

Personas are inherited from the Module PRD §3 and the Sprint PRD family; MOB-001 introduces no new roles. Concrete grants remain enforced by `ENG-002` / `ENG-003` per `ADR-032` (RBAC + ABAC). This section describes mobile-specific responsibilities, permissions, and scenarios only.

### B.1 Business User (all modules)

- **Mobile Responsibilities:** Consume permitted dashboards, KPIs, and operational reports on the go; review report deliveries; act on notifications.
- **Permissions (business-level):** Same read scope as web surface (tenant, company, row-scoped). Sensitive-KPI redaction applies identically.
- **Primary Mobile Scenarios:** View dashboard between meetings; open a `ReportPublished` notification; download a permitted export to device; drill from a KPI tile to a KPI Trend.

### B.2 Analyst

- **Mobile Responsibilities:** Read-first review of KPI Catalog, Dashboards, and recent Report / Model Runs while away from a workstation.
- **Permissions (business-level):** Read access on mobile as scoped; authoring surfaces (KPI, Dashboard, Report Definition, Analytical Model) are not primary mobile scenarios and remain reachable on Web.
- **Primary Mobile Scenarios:** Review a KPI's version history; open a Model Run notification; verify a shared dashboard.

### B.3 Data Steward

- **Mobile Responsibilities:** Monitor ingestion health indicators and Analytics Foundation configuration state; react to distribution notifications.
- **Permissions (business-level):** Read access on mobile as scoped; Data Mart and Foundation Configuration authoring remain Web-primary.
- **Primary Mobile Scenarios:** Check a Data Mart's lifecycle state; verify a refresh cadence indicator; respond to an ingestion-related notification.

### B.4 Executive

- **Mobile Responsibilities:** Consume Executive Overview and Domain-specific dashboards; monitor Anomaly Highlights.
- **Permissions (business-level):** Read access as scoped; sensitive-KPI redaction applies.
- **Primary Mobile Scenarios:** Morning glance at Executive Overview; open a `DashboardShared` notification; drill into an Anomaly Highlight.

### B.5 Auditor

- **Mobile Responsibilities:** Read-only inspection of the compliance / retention audit-readiness surface within the retention window.
- **Permissions (business-level):** Read access to audit-visible history within tenant scope; no mutation rights.
- **Primary Mobile Scenarios:** Review KPI catalog version history from a mobile device; inspect Report / Model Run history filtered by time range.

### B.6 System Administrator

- **Mobile Responsibilities:** Act on approval notifications where the approval policy is configured (KPI activation, report publication, model activation) via `ENG-011`.
- **Permissions (business-level):** Approve / reject where policy requires; distribution channel and delivery configuration authoring remain Web-primary.
- **Primary Mobile Scenarios:** Open an approval notification, review the pending item, and take an approve / reject action.

## C. Mobile User Journeys

Every journey is derived from a capability in Module Publication §3 and the transaction lifecycles in Module Publication §8. MOB-001 defines Mobile-surface flows only; business rules, state legality, and authorization are owned by the Module Publication and enforced by platform engines. Where a Web equivalent exists, the corresponding WEB-001 journey is noted parenthetically for consistency.

### C.1 Journey — View Dashboard and Drill-down (WEB-001 §C.1)

- **Entry Points:** Mobile Home; direct deep link to a dashboard; `DashboardShared` notification; embedded card on a persona home surface.
- **Primary Flow:** User opens Dashboards → selects dashboard → dashboard renders with declared freshness indicator → user applies filter / grouping → user drills down from a widget to the underlying KPI or Analytical View.
- **Alternate Flows:** Open from shared-link notification; switch between Executive Overview and Domain-specific dashboards; save personalised filter selection where permitted; view most recently visited dashboards.
- **Interruption / Resume:** Application backgrounded during dashboard viewing resumes to the last dashboard, freshness re-evaluated on foreground.
- **Offline / Online Transitions:** If offline, most-recently-viewed dashboards render from cache with an offline indicator; freshness expectation is displayed as of the cached snapshot. Drill-down targets that require live data show an offline-not-available state until reconnected.
- **Exception Flows:** Insufficient permission → access-denied state; freshness expectation not met → stale-data indicator; sensitive-KPI redaction where row-level access is not granted.

### C.2 Journey — Browse KPI Catalog (WEB-001 §C.2)

- **Entry Points:** KPI Catalog tab; KPI reference from a dashboard widget; cross-module KPI reference from another module's mobile surface.
- **Primary Flow:** User opens KPI Catalog → searches / filters by classification, ownership, or lifecycle state → opens a KPI Master → views definition, version history (single Active version indicated), sensitive classification, and current value.
- **Alternate Flows:** Open KPI Trends from KPI detail; navigate to dashboards referencing this KPI.
- **Interruption / Resume:** Search / filter state is preserved when the user returns from a drill-down.
- **Offline / Online Transitions:** Recently opened KPI details are available read-only from cache with a "cached at" indicator; live value refresh requires connectivity.
- **Exception Flows:** Sensitive-KPI classification hides value pending row-level access; archived / inactive versions are read-only; access-denied where policy prohibits.

### C.3 Journey — Review a Report Run and Download an Artifact (WEB-001 §C.8, §C.9)

- **Entry Points:** `ReportPublished` notification; Reports tab → Report Runs; direct deep link.
- **Primary Flow:** User opens Report Run detail → inspects lifecycle state, distribution outcomes, and artifact reference → downloads the permitted artifact to device via the platform file-handling surface.
- **Alternate Flows:** Retry download; open the underlying Report Definition (read-only on mobile).
- **Interruption / Resume:** Download continuation across app foreground / background per platform capability.
- **Offline / Online Transitions:** Downloaded artifacts remain available offline in the device's file handling surface; opening Run detail while offline shows cached metadata with an offline indicator; new downloads require connectivity.
- **Exception Flows:** Delivery failure state surfaced with reviewer notes; sensitive-KPI redaction applies to any exported payload; permission denied on the payload.

### C.4 Journey — Manage Subscriptions to Distributions (WEB-001 §C.7)

- **Entry Points:** Reports tab → Subscriptions; Report Definition detail → Subscribe.
- **Primary Flow:** User selects a Distribution List for which subscription is permitted → confirms subscription preferences (channel selection where the Distribution Authority permits self-service) → saves.
- **Alternate Flows:** Unsubscribe; adjust delivery channel preference within permitted options.
- **Interruption / Resume:** In-flight subscription action is preserved and re-presented on resume before submission.
- **Offline / Online Transitions:** Subscribe / unsubscribe requests are queued while offline; on reconnect the queued action is submitted; conflict resolution follows §G.
- **Exception Flows:** Distribution List not subscribable per policy; approval required per policy → surfaces the pending-approval state.

### C.5 Journey — Handle an Approval Notification (WEB-001 §C.3, §C.7, §C.10)

- **Entry Points:** Push notification for a pending approval (KPI activation, Report publication, Model activation).
- **Primary Flow:** User opens the approval notification → reviews the pending item read-only on mobile → approves or rejects with reviewer notes via `ENG-011`.
- **Alternate Flows:** Defer decision (leave pending); open on Web for full authoring context.
- **Interruption / Resume:** In-flight decision preserves reviewer notes until submission.
- **Offline / Online Transitions:** Approve / reject actions are not submitted offline; the action is retained locally and clearly indicated as pending submission until reconnected.
- **Exception Flows:** Item no longer eligible (state changed elsewhere) → surfaces a conflict state; access denied.

### C.6 Journey — View Anomaly Highlights and Cross-Module Views (WEB-001 §C.11)

- **Entry Points:** Anomaly Highlights tab / entry; deep link from a `ModelRunCompleted` notification.
- **Primary Flow:** User opens the view → freshness indicator displays → user filters cross-module aggregations → drills down to the source module reference where the source-module surface is authorized on mobile.
- **Alternate Flows:** Save filter selection; share view (subject to permission).
- **Interruption / Resume:** Filter state is preserved across foreground / background transitions.
- **Offline / Online Transitions:** Cached snapshot renders offline with a "cached at" indicator; drill-down to source-module surfaces requires connectivity and the target module's authorization.
- **Exception Flows:** Source-module drill-down denied; freshness expectation not met.

### C.7 Journey — Field-User Consumption Between Locations

- **Entry Points:** Mobile Home while in transit; a `ReportPublished` or `DashboardShared` notification received while away from a workstation.
- **Primary Flow:** Field user opens the notification → views the dashboard or report artifact → returns to prior activity.
- **Alternate Flows:** Save artifact for offline review; add a permitted note (only where the underlying capability supports it in the Module Publication — otherwise omitted).
- **Interruption / Resume:** Full app resume returns the user to the last viewed dashboard or report artifact.
- **Offline / Online Transitions:** Same cached-viewing rules as §C.1 and §C.3 apply.
- **Exception Flows:** Same as §C.1 and §C.3.

### C.8 Journey — Compliance & Retention Audit-Readiness on Mobile (WEB-001 §C.12)

- **Entry Points:** Audit-Readiness entry (audit persona only).
- **Primary Flow:** Auditor opens the audit-readiness surface → filters by time range / entity / actor within tenant scope → inspects KPI catalog version history, dashboard freshness declarations, and Report / Model Run history — read-only.
- **Alternate Flows:** Deep link from an audit notification (if configured via `ENG-025`).
- **Interruption / Resume:** Filter state is preserved.
- **Offline / Online Transitions:** Most recently inspected records are available read-only from cache; new queries require connectivity.
- **Exception Flows:** Records outside retention window are surfaced as archived; access denied where policy prohibits.

## D. Mobile Navigation

Navigation groups are derived from Module Publication §3 (Approved Scope) and §7–§8 (Master Data / Transaction Authorities). MOB-001 does not prescribe an information architecture beyond what the Published Module supports. Behaviour only — no visual designs.

### D.1 Bottom Navigation (Primary)

Primary mobile navigation exposes a compact set of tabs derived from the Published Module capability groupings. For MOD-017 the derived set is:

- **Home** — persona-appropriate landing surface (Executive Overview or Domain-specific dashboards).
- **Dashboards** — Dashboard master consumption and drill-down.
- **KPIs** — KPI Catalog and KPI Trends.
- **Reports** — Report Runs, Subscriptions, and permitted downloads.
- **More** — Analytical Models & Cross-Module Views, Analytics Foundation (read-only where applicable), and Audit-Readiness (audit persona only).

Tabs are populated only when the corresponding capability is authorized for the current persona. Tabs the user cannot access are omitted rather than disabled.

### D.2 Side / Overflow Navigation

Where a device form factor exposes a side navigation (tablet) or overflow menu, the same capability groupings are surfaced with the same authorization rules. No new navigation targets are introduced.

### D.3 Screen Hierarchy

Every mobile screen belongs to a single primary tab. Within a tab, screens follow a shallow hierarchy: catalog → detail → drill-down. Drill-down to a source-module surface leaves the Analytics area and is surfaced as outbound navigation.

### D.4 Deep-Link Entry Points

Deep links are supported for:

- A specific Dashboard.
- A specific KPI Master.
- A specific Report Run.
- A specific Model Run.
- The Anomaly Highlights view (with optional filter parameters).
- The Audit-Readiness surface (audit persona only).

Deep links resolve authorization before displaying content; unauthorized deep links surface an access-denied state and do not leak the target's existence beyond what the Sensitive-KPI Classification Authority permits.

### D.5 Back-Navigation Behaviour

- Back-navigation follows the platform-native pattern (system back on Android; navigation-bar back and swipe on iOS).
- Back from a detail returns to its catalog with prior scroll / filter state preserved.
- Back from a drill-down that crossed into a source-module surface returns to the originating Analytics screen.
- Back from a notification-launched screen returns to the app's most recent primary tab (not to the notification).

## E. Mobile Screen Inventory

Each row: purpose, business capability, primary actions, displayed business information, navigation relationships. Derived from the capabilities, master data, and transactions declared in the Module Publication. Visual layouts are out of scope.

### E.1 Mobile Home

- **Purpose:** Persona-appropriate mobile landing.
- **Business Capability:** Dashboards; KPI catalog consumption.
- **Primary Actions:** Open dashboard, open KPI Catalog, open recent Report Run.
- **Displayed Business Information:** Persona-appropriate dashboards, most-viewed KPIs, recent shared items, unread notifications summary.
- **Relationships:** Entry to Dashboards, KPIs, Reports.

### E.2 Dashboards Catalog

- **Purpose:** Browse Dashboard master.
- **Business Capability:** Dashboards and drill-downs.
- **Primary Actions:** Open, share (where permitted), pin as favourite.
- **Displayed Business Information:** Dashboard name, ownership, lifecycle state indicator, freshness declaration, last-shared indicator.
- **Relationships:** Opens Dashboard Viewer.

### E.3 Dashboard Viewer

- **Purpose:** Render a Dashboard View transaction and enable drill-down on mobile.
- **Business Capability:** Dashboards and drill-downs.
- **Primary Actions:** Filter, group, drill-down, share, download permitted export.
- **Displayed Business Information:** Widget content bound to the Analytics read model; freshness indicator; offline / cached-at indicator when applicable; sensitive-KPI redaction where applicable.
- **Relationships:** Drill-down to KPI Detail, Analytical Views, or source-module surfaces.

### E.4 KPI Catalog Browse

- **Purpose:** Browse KPI Master and Metric Catalog on mobile.
- **Business Capability:** KPI catalog and definitions.
- **Primary Actions:** Search, filter, open KPI Detail.
- **Displayed Business Information:** KPI identifier, definition summary, classification, ownership, lifecycle state, sensitive flag.
- **Relationships:** Opens KPI Detail.

### E.5 KPI Detail

- **Purpose:** Inspect a KPI Master on mobile.
- **Business Capability:** KPI catalog and definitions.
- **Primary Actions:** View current value, view version history, open KPI Trends.
- **Displayed Business Information:** Definition, metadata, classification, ownership, version history, Active version indicator.
- **Relationships:** KPI Trends; dashboards referencing this KPI.

### E.6 KPI Trends

- **Purpose:** KPI trend over time.
- **Business Capability:** KPI Trends operational report.
- **Primary Actions:** Filter by time range, entity, and scope.
- **Displayed Business Information:** KPI value series; sensitive-KPI redaction applies.
- **Relationships:** Back-link to KPI Detail.

### E.7 Reports — Runs List

- **Purpose:** List and inspect Report Run transactions on mobile.
- **Business Capability:** Scheduled report distribution and reporting.
- **Primary Actions:** Open Run Detail, download permitted artifact.
- **Displayed Business Information:** Run identifier (numbered via `ENG-017`), state, timestamps, distribution outcome.
- **Relationships:** Opens Report Run Detail.

### E.8 Report Run Detail

- **Purpose:** Inspect a single Report Run on mobile.
- **Business Capability:** Scheduled report distribution and reporting.
- **Primary Actions:** Download artifact, view delivery outcomes, view audit-visible history.
- **Displayed Business Information:** Run identifier, lifecycle state, distribution results, artifact reference.
- **Relationships:** Back-link to Report Definition (read-only).

### E.9 Subscriptions

- **Purpose:** Manage subscription preferences for Distribution Lists (where self-service subscription is permitted by the Distribution Authority).
- **Business Capability:** Scheduled report distribution.
- **Primary Actions:** Subscribe, unsubscribe, adjust channel preference.
- **Displayed Business Information:** Subscribed lists, current channel preferences, pending-approval indicator.
- **Relationships:** Back-link to Report Definition where subscription initiated.

### E.10 Analytical Model Runs

- **Purpose:** List and inspect Model Run transactions on mobile.
- **Business Capability:** Analytical models and forecasts.
- **Primary Actions:** Open Run Detail.
- **Displayed Business Information:** Run identifier (numbered via `ENG-017`), state, timestamps, model version reference.
- **Relationships:** Opens Model Run Detail.

### E.11 Model Run Detail

- **Purpose:** Inspect a single Model Run.
- **Business Capability:** Analytical models and forecasts.
- **Primary Actions:** View outcome summary; view audit-visible history.
- **Displayed Business Information:** Run identifier, lifecycle state, model version reference, outcome.
- **Relationships:** Back-link to the Analytical Model (read-only).

### E.12 Anomaly Highlights

- **Purpose:** Cross-module anomaly view on mobile.
- **Business Capability:** Cross-Module Analytics.
- **Primary Actions:** Filter, drill-down.
- **Displayed Business Information:** Highlighted anomalies over the Analytics read model.
- **Relationships:** Drill-down into source-module surfaces (subject to target authorization).

### E.13 Trend & Comparative Views

- **Purpose:** Cross-module trend / comparative views on mobile.
- **Business Capability:** Cross-Module Analytics.
- **Primary Actions:** Filter, drill-down, download permitted export.
- **Displayed Business Information:** Aggregated trend / comparative content.
- **Relationships:** KPI Detail; source-module surfaces.

### E.14 Analytics Foundation (Read-Only)

- **Purpose:** Read-only mobile view of Data Marts and Analytics Foundation Configuration.
- **Business Capability:** Analytics foundations.
- **Primary Actions:** Inspect Data Mart entries; inspect current Analytics Foundation Configuration state.
- **Displayed Business Information:** Mart identifier, source registration, refresh cadence, retention, lifecycle state; configuration values by tenant / company / context.
- **Relationships:** None outbound; authoring remains on Web.

### E.15 Notifications

- **Purpose:** Aggregate Analytics-originated notifications for the user (`DashboardShared`, `ReportPublished`, `ModelRunCompleted`, pending-approval).
- **Business Capability:** Notification-driven consumption of Analytics events.
- **Primary Actions:** Open target; mark read; dismiss.
- **Displayed Business Information:** Notification type, target reference, timestamp, read state.
- **Relationships:** Opens the linked target screen.

### E.16 Audit-Readiness (Audit Persona)

- **Purpose:** Read-only compliance / retention audit-readiness on mobile.
- **Business Capability:** Compliance & Retention Audit-Readiness.
- **Primary Actions:** Filter, inspect history.
- **Displayed Business Information:** KPI catalog version history, dashboard freshness declarations, Report / Model Run history within retention window.
- **Relationships:** Back-links into originating entity read-only details.

### E.17 Settings & Session

- **Purpose:** Session, scope, notification preferences, and offline settings.
- **Business Capability:** Cross-cutting user surface for Analytics consumption on mobile.
- **Primary Actions:** Sign out, switch tenant / company / context (where the platform allows), review notification preferences, review offline cache status.
- **Displayed Business Information:** Authenticated identity, active tenant / company / context, notification permissions, offline cache summary.
- **Relationships:** None outbound.

## F. Mobile Forms

Forms on mobile are limited to actions supported by the Published Module and appropriate for a mobile form factor. Field lists derive from the Master Data and Transaction Authorities in Module Publication §7–§8. Validation is business-level (declarative rules resolved via `ENG-012`); technical validation is out of scope. Authoring of KPI, Dashboard, Report Definition, Distribution List / Channel, Export Configuration, Analytical Model, Model Execution Configuration, Data Mart, and Analytics Foundation Configuration remains Web-primary and is not surfaced as mobile forms in MOB-001.

### F.1 Subscription Preference Form

- **Purpose:** Subscribe / unsubscribe to a permitted Distribution List; adjust channel preference within permitted options.
- **Business Fields:** Distribution List reference, subscription state, channel preference (from the permitted set).
- **Required:** Distribution List reference, subscription state.
- **Optional:** Channel preference (defaults to Distribution List's default channel).
- **Business Validation Rules:** Distribution List must be subscribable per policy; channel preference must be within the permitted set; approval-required state respected where policy applies.
- **Save Outcome:** Subscription preference persisted; downstream deliveries reflect the change.
- **Submit Outcome:** Same as Save (single-step form).
- **Cancel Outcome:** No change; local draft discarded.
- **Retry Outcome:** On transient failure the form remains in the same state and the user may retry; queued while offline per §G.

### F.2 Approval Decision Form

- **Purpose:** Approve or reject a pending approval item referenced from a notification (KPI activation, Report publication, Model activation) via `ENG-011`.
- **Business Fields:** Approval item reference, decision (approve / reject), reviewer notes.
- **Required:** Approval item reference, decision.
- **Optional:** Reviewer notes (required by policy for rejection where policy declares it).
- **Business Validation Rules:** Item must still be eligible for the decision at submission time; policy-required notes must be present for rejection; user must be authorized as an approver per `ENG-002` / `ENG-003`.
- **Save Outcome:** Not applicable (single-step decision).
- **Submit Outcome:** Decision recorded via `ENG-011`; downstream lifecycle transitions occur per the originating Sprint PRD.
- **Cancel Outcome:** Decision discarded; item remains pending.
- **Retry Outcome:** On transient failure the decision remains locally pending submission until reconnected or resubmitted.

### F.3 Notification Preferences Form

- **Purpose:** Manage per-user notification preferences for Analytics-originated notifications, within the permitted set exposed by `ENG-025`.
- **Business Fields:** Category (`DashboardShared`, `ReportPublished`, `ModelRunCompleted`, approval), delivery preference (as exposed by `ENG-025`).
- **Required:** Category, delivery preference.
- **Optional:** None.
- **Business Validation Rules:** Category and delivery preference must be within the permitted set.
- **Save Outcome:** Preference persisted; future notifications honour the change.
- **Submit Outcome:** Same as Save.
- **Cancel Outcome:** Local draft discarded.
- **Retry Outcome:** Queued while offline per §G.

### F.4 Filter / Scope Form (Dashboards, KPI Trends, Anomaly Highlights, Trend & Comparative, Audit-Readiness)

- **Purpose:** Apply filter / scope to a read-only viewing surface.
- **Business Fields:** Time range, entity scope, actor scope (audit only), classification filter (where applicable).
- **Required:** As dictated by the specific surface (typically time range for time-based views).
- **Optional:** Additional filter facets exposed by the surface.
- **Business Validation Rules:** Selections must be within the user's tenant / company / row-scope; sensitive-KPI classification filters respect the Sensitive-KPI Classification Authority.
- **Save Outcome:** Filter state applied and persisted for the current session (and per persona where the surface supports personalisation).
- **Submit Outcome:** Not applicable — filters apply immediately.
- **Cancel Outcome:** Reverts to prior filter state.
- **Retry Outcome:** Filters that require a live query re-attempt on reconnect when offline.

## G. Offline & Synchronization

Offline capabilities are strictly limited to what the Published Module supports. MOD-017 is a **read-model-only consumer** (Publication §2, §4, §13) and mutates no source-module transaction. MOB-001 therefore constrains offline behaviour to read-only consumption and to user-preference actions the module already supports.

### G.1 Offline Availability

- Most-recently-viewed Dashboards, KPI details, Report Run detail metadata, Model Run detail metadata, Anomaly Highlights, and the Audit-Readiness surface remain viewable from cache with an offline / cached-at indicator.
- Previously downloaded Report / Export artifacts remain available offline via the platform file-handling surface.
- Sensitive-KPI redaction rules apply to the cached content identically to the online rules.

### G.2 Queued Actions

Only the following user actions may be queued offline:

- Subscription preference changes (§F.1).
- Notification preference changes (§F.3).
- Filter / scope selections that will re-query on reconnect (§F.4).

Actions **not** queued offline: Approval decisions (§F.2 — held locally as clearly pending submission and never applied until reconnected), report / model execution requests (server-side transactions), and any action that would mutate a source-module transaction (never permitted).

### G.3 Synchronization Expectations

- On reconnect, queued preference actions are submitted in the order captured.
- Cached read-only content is refreshed on next foreground when online; freshness indicators update to reflect the newer snapshot.
- Notifications received while offline are surfaced on next foreground per platform capability.

### G.4 Conflict Resolution (Business Perspective)

- **Preference conflicts:** Last-write-wins per user; the reconnected submission supersedes prior state.
- **Approval conflicts:** If the pending item is no longer eligible at submission time, the decision is rejected with a conflict indicator and the user is directed to the current state.
- **Cache staleness:** Where the cached snapshot's freshness declaration is exceeded, the offline indicator communicates staleness in addition to (not instead of) the surface's normal freshness indicator.

### G.5 Reconnect Behaviour

- On reconnect the app resumes at the user's most recent screen with an unobtrusive online indicator.
- Any queued action is submitted transparently; failures are surfaced as retryable states with reviewer notes preserved.
- Content that requires live data (drill-downs to source-module surfaces, live KPI values, new export downloads) becomes available immediately.

## H. Device Capabilities

Only device capabilities justified by the Published Module are surfaced. MOB-001 introduces no capability beyond those consumed by the Publication's engine set (§11).

- **Notifications** — Push notifications for `DashboardShared`, `ReportPublished`, `ModelRunCompleted`, and pending approvals, dispatched via `ENG-025` per the Distribution Authority. User preferences are captured in §F.3.
- **File Attachments** — Download of permitted Report / Export artifacts to the device's platform file-handling surface, produced via `ENG-021` / `ENG-027`. No upload capability is surfaced by MOD-017 and none is added by MOB-001.
- **Biometric Authentication Entry** — Biometric unlock is offered only as an entry point into the authenticated session established by `ENG-001` per `ADR-032`. MOB-001 does not define authentication mechanics; biometrics are an entry convenience only.
- **Device Storage** — Used exclusively for the cache described in §G and for downloaded artifacts. No persistent storage of Analytics master data is introduced by MOB-001.

Capabilities **not** surfaced (no published business requirement supports them): camera, barcode / QR scanning, GPS / location, contact / calendar access, microphone, and any hardware sensor. These MUST NOT be introduced by MOB-001.

## I. Accessibility

Aligned to `ADR-081` (Accessibility Standard). No implementation guidance; objectives only.

- **Screen-Reader Compatibility:** All interactive elements have accessible names; state changes (freshness update, download complete, approval submitted, subscription changed, offline / online) are announced. Data-heavy surfaces (KPI Trends, dashboards) provide summary-first announcements before detail traversal.
- **Touch-Target Sizing:** Every actionable target meets the platform accessibility baseline; hit areas remain generous on compact layouts.
- **Orientation Support:** Portrait is the primary orientation for phone form factors; landscape is supported for chart-heavy surfaces (KPI Trends, Dashboards, Trend & Comparative Views). Rotation preserves screen state.
- **Keyboard Accessibility (Where Applicable):** External keyboards on tablet form factors expose consistent focus order and reachable actions; focus indicators remain visible.
- **Color-Independent Communication:** Freshness state, sensitive-KPI redaction, lifecycle state, offline / online state, and error states are communicated by more than color alone (icon + text label).
- **Localization:** All labels resolvable via `ENG-006`; layout tolerates text expansion on mobile form factors.

## J. Security Considerations

User-facing mobile security expectations derived from Module Publication §4 authorities, §11 ADR consumption, and the Sensitive-KPI Classification Authority. No implementation mechanisms.

### J.1 Authentication Entry Points

- Access to Analytics on mobile requires authenticated identity per `ENG-001`. Unauthenticated launches direct to the platform-level sign-in surface owned by MOD-001; MOB-001 does not define authentication mechanics.
- Biometric unlock (§H) is an entry convenience only; it does not substitute for the platform authentication mechanism.

### J.2 Session Awareness

- The Mobile surface communicates authenticated identity, active tenant / company / context, and configuration scope in a persistent surface element.
- Session expiration is communicated before it interferes with an in-progress action (subscription change, approval decision, download).
- Backgrounding beyond the platform session envelope re-prompts for authentication on foreground per platform convention.

### J.3 Authorization Visibility

- Tabs, screens, actions, and detail fields are gated by `ENG-002` / `ENG-003` per `ADR-032` (RBAC + ABAC). Users see only entities within their tenant, company, and row-level scope.
- Sensitive-KPI values are redacted where the user lacks the classification-permitted access; presence of the KPI may still be visible where the catalog policy permits. Redaction applies identically to cached content (§G).
- Unauthorized deep links (§D.4) surface an access-denied state and never leak the target's existence beyond what the Sensitive-KPI Classification Authority permits.

### J.4 Secure Handling of Business Data

- On-device cache (§G) stores only content the user was authorized to view at capture time; sign-out clears the cache within the platform envelope.
- Downloaded artifacts are handed to the platform file-handling surface; MOB-001 does not define file-storage mechanics.
- Screenshots and screen-recording follow the platform convention for sensitive-KPI surfaces; no mechanism is defined by MOB-001.

### J.5 Audit Visibility

- Every state-changing action initiated on mobile (subscription change, approval decision, notification preference change) is audit-visible per `ENG-004` and `ADR-014` (Audit Strategy). Users can inspect audit-visible history for the entities they own on the Audit-Readiness surface (§E.16) within retention.

### J.6 Tenant Isolation

- Tenant, company, and context boundaries per `ADR-011` (Multi-Tenant Isolation) are honoured identically on mobile; cross-tenant navigation is not permitted, and the active tenant / company / context is always communicated (§J.2).

## K. Traceability Matrix

Every MOB-001 feature is traced to the Published Module capability, the originating Sprint(s), and the related WEB-001 section for consistency reference only. WEB-001 is not a business source.

| MOB-001 Feature | Publication Capability (§3) | Sprint(s) | Related WEB-001 Section |
| --- | --- | --- | --- |
| E.1 Mobile Home | Dashboards; KPI catalog | SPR-MOD-017-002, 003 | E.1 |
| E.2 Dashboards Catalog | Dashboards and drill-downs | SPR-MOD-017-003 | E.2 |
| E.3 Dashboard Viewer | Dashboards and drill-downs | SPR-MOD-017-003 | E.3 |
| E.4 KPI Catalog Browse | KPI catalog and definitions | SPR-MOD-017-002 | E.5 |
| E.5 KPI Detail | KPI catalog and definitions | SPR-MOD-017-002 | E.6 |
| E.6 KPI Trends | KPI Trends operational report | SPR-MOD-017-002 | E.7 |
| E.7 Reports — Runs List | Scheduled distribution & reporting | SPR-MOD-017-004 | E.13 |
| E.8 Report Run Detail | Scheduled distribution & reporting | SPR-MOD-017-004 | E.14 |
| E.9 Subscriptions | Scheduled report distribution | SPR-MOD-017-004 | E.11 |
| E.10 Analytical Model Runs | Analytical models and forecasts | SPR-MOD-017-005 | E.19 |
| E.11 Model Run Detail | Analytical models and forecasts | SPR-MOD-017-005 | E.19 |
| E.12 Anomaly Highlights | Cross-Module Analytics | SPR-MOD-017-005 | E.20 |
| E.13 Trend & Comparative Views | Cross-Module Analytics | SPR-MOD-017-005 | E.21 |
| E.14 Analytics Foundation (read-only) | Analytics foundations | SPR-MOD-017-001 | E.22, E.23 |
| E.15 Notifications | Distribution & event surface | SPR-MOD-017-003, 004, 005 | (Web notifications equivalent) |
| E.16 Audit-Readiness | Compliance & Retention Audit-Readiness | SPR-MOD-017-005 | E.24 |
| E.17 Settings & Session | Cross-cutting user surface | SPR-MOD-017-001 | J.3 |
| F.1 Subscription Preference Form | Distribution Authority (self-service subscription) | SPR-MOD-017-004 | F.6 |
| F.2 Approval Decision Form | Approval-gated lifecycle transitions | SPR-MOD-017-002, 004, 005 | C.3, C.7, C.10 |
| F.3 Notification Preferences Form | Notification Engine consumption | SPR-MOD-017-004 | (Web preferences equivalent) |
| F.4 Filter / Scope Form | Read-only viewing surfaces | SPR-MOD-017-002, 003, 005 | E.3, E.7, E.20, E.21, E.24 |
| G Offline & Synchronization | Read-model-only boundary | SPR-MOD-017-001, 005 | (No direct WEB-001 equivalent) |
| H.Notifications | Distribution Authority; `ENG-025` | SPR-MOD-017-003, 004, 005 | J.4 |
| H.File Attachments | Export Authority; `ENG-027` | SPR-MOD-017-004 | E.16, F.8 |
| H.Biometric Entry | Identity Engine entry per `ADR-032` | SPR-MOD-017-001 | J.1 |
| I Accessibility | Accessibility baseline per `ADR-081` | Applies to all sprints | I |
| J Security | Authorities §4 + `ADR-011`, `ADR-014`, `ADR-032` | Applies to all sprints | J |

## References

- [`docs/45-module-publications/analytics/MOD-017_MODULE_PUBLICATION.md`](../../45-module-publications/analytics/MOD-017_MODULE_PUBLICATION.md)
- [`docs/40-module-baselines/MOD017_ANALYTICS_BASELINE_v1.md`](../../40-module-baselines/MOD017_ANALYTICS_BASELINE_v1.md)
- [`docs/20-module-prds/analytics/MODULE_PRD.md`](../../20-module-prds/analytics/MODULE_PRD.md)
- [`docs/30-sprint-prds/analytics/MOD-017_SPRINT_PLAN.md`](../../30-sprint-prds/analytics/MOD-017_SPRINT_PLAN.md)
- [`docs/60-solution-design/web/WEB-001_ANALYTICS.md`](../web/WEB-001_ANALYTICS.md) — consistency reference only.
- [`docs/60-solution-design/README.md`](../README.md)
- [`docs/60-solution-design/SOLUTION_DESIGN_CATALOG.md`](../SOLUTION_DESIGN_CATALOG.md)
- [`docs/11-adrs/ADR_INDEX.md`](../../11-adrs/ADR_INDEX.md)
- [`docs/10-erp-core/ENGINE_CATALOG.md`](../../10-erp-core/ENGINE_CATALOG.md)
