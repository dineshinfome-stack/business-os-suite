---
id: MIG-20260726-GATE38-PASS382-HISTORY-REPAIR
title: "Migration-History Repair Exception — Gate 3.8 / Pass 3.8.2 Certification Harness"
type: governance-exception
status: Pending Approval
owner: "Architecture Office"
created: "2026-07-26"
last_updated: "2026-07-26"
tags: ["governance", "migration", "exception", "gate-3.8", "pass-3.8.2"]
---

# Migration-History Repair Exception — Gate 3.8 / Pass 3.8.2

**Repository status while this document is `Pending Approval`:**
`Pass 3.8.2 — COMPLETE, REMEDIATION REQUIRED`.
**Pass 3.8.3 — NOT STARTED.**

No migration file has been modified. Execution is halted at Step 0B pending
explicit authority approval of the strategy discovered in Step 0C.

---

## 1. Subject migration

| Property | Value |
| --- | --- |
| Path | `supabase/migrations/20260726114237_3ca5092b-b2b6-41c3-a54e-2490f4093466.sql` |
| Git blob SHA | `12ce3d2bea99733a79f4ddd7d1ca64a5dd62bae2` |
| SHA-256 (exact bytes) | `584269e1bd01e0a85fc4801dfd941459cb08e8b429f71b9835163037069373c3` |
| Line count | 254 |
| Byte count | 11460 |
| Commit introducing the executable form | `1907718` (only commit touching this path) |
| Repository HEAD at investigation | `3fa3657b4945cf8d074ba8142207cccece7e5cdb` |

Retrieval of the original executable content (never copied into the active tree,
because doing so would reintroduce the live user UUIDs):

```bash
git show 1907718:supabase/migrations/20260726114237_3ca5092b-b2b6-41c3-a54e-2490f4093466.sql
```

## 2. Why repair is requested

The file is a **certification harness**, not a schema migration. It is
environment-dependent and therefore cannot participate in a clean replay:

- it hard-codes two live user UUIDs
  (`9773aa51-…4489` authorized, `87569669-…e290` denied) that exist only in the
  current development database;
- it impersonates one of them with
  `set_config('request.jwt.claims', …)` + `SET LOCAL ROLE authenticated`;
- it seeds 1,205 `REM382 Tenant …` fixtures inside the migration chain.

A fresh database has neither user, so replay fails for environmental reasons
rather than for any defect in the remediation itself.

The **remediation** migration
`20260726113455_f79b36fd-9178-4def-91a8-cbc298d95e21.sql` — which owns the
grants, permission-based RLS, `public.fn_tenant_onboarding_queue`, parameter
validation, the non-persisted ordering mirror, and server-side pagination —
is **not** in scope and must remain byte-identical.

## 3. Step 0C — Migration runner / history investigation (executed)

Executed against the connected project before requesting approval.

| Question | Finding |
| --- | --- |
| Database engine | PostgreSQL 17.6 |
| Migration runner | Lovable-managed Supabase migration runner (no local `supabase` CLI in the toolchain) |
| Migration history table | `supabase_migrations.schema_migrations` |
| Stored columns | `version` (text), `statements` (text[]), `name` (text), `created_by` (text), `idempotency_key` (text), `rollback` (text[]) |
| Checksum / hash column | **None.** No content hash is stored or compared. |
| Content tracking | `statements[]` retains the full executed SQL text of each applied migration. |
| Version semantics | `version` is the **apply timestamp**, not the filename prefix. The subject file is recorded as version `20260726114243`, name `20260726114237_3ca5092b-b2b6-41c3-a54e-2490f4093466`. |
| Effect of editing an applied migration file | None on existing databases: the runner keys on recorded versions and stores no checksum, so no drift is detected and no replay or sync is refused. |
| Is a history/checksum repair record required? | **No.** There is no checksum record to repair. |
| Recorded evidence of the original executable form | Retained in the database: for version `20260726114243`, `statements` embeds the admin UUID (`true`) and the `REM382 Tenant` fixture text (`true`), 11,457 bytes, 0 rollback statements. |
| Live residue from the original run | `tenants` 0, `tenant_onboarding` 0, `tenant_onboarding_steps` 0 for all `rem382-%` / `REM382 Tenant%` keys. |

**Material consequence for the approver:** the tombstone changes only the
repository file. The historical executable content — including the live UUIDs —
remains immutably recorded in `supabase_migrations.schema_migrations.statements`
for already-applied databases. The repair reduces *future* replay exposure and
removes environment-dependent content from the active tree; it does not, and is
not intended to, rewrite applied history.

## 4. Environment reconciliation

| Environment | Migration version status | Runtime action after repair |
| --- | --- | --- |
| Existing development DB | Already applied (version `20260726114243`) | No new SQL executed; historical statements retained in history |
| Clean replay DB | Recorded as applied during replay | Comment-only; no runtime effect |
| DB created from an older commit | Original harness may have run | Verify historical residue (currently 0) |
| DB created from the repaired commit | Tombstone runs | No fixtures, no impersonation, no seeded tenants |

The tombstone does **not** retroactively undo the historical execution against
existing databases; this is explicitly acknowledged and accepted.

## 5. Proposed repair (requires approval before execution)

1. Replace the file content with a **comment-only tombstone** at the same
   filename and version: original commit SHA, original blob SHA and SHA-256,
   this document's ID, the replacement harness path, Git recoverability, and a
   statement that the remediation migration `20260726113455_…` remains solely
   responsible for schema, grants, RLS, and the queue routine. No SQL, no
   `DO`/`BEGIN`, no JWT impersonation, no live UUIDs, no `REM382 Tenant` text.
2. Relocate certification to a deterministic, discovery-excluded harness:
   - `supabase/tests/pass_3_8_2_queue_certification.sql`
   - `supabase/tests/pass_3_8_2_queue_certification_postcheck.sql`
   - `supabase/tests/README.md`
   with synthetic shared fixture constants, read-only RBAC preconditions
   (`permissions` / `roles` / `role_permissions` are asserted, never mutated),
   a 16-entry numbered assertion register emitting
   `PASS382-CERT-001 PASS` … `PASS382-CERT-016 PASS`, an in-transaction
   `ROLLBACK`, and a fresh-session residue postcheck executed even when the
   harness aborts.
3. Correct the onboarding matrix, canonical completion report, and closure
   report; then emit the manifest, terminal audit, and additive registry row.

## 6. Runtime-immutability baseline (Step 0D, captured)

These files MUST remain byte-identical through the terminal governance commit:

| Path | Git blob SHA | SHA-256 |
| --- | --- | --- |
| `supabase/migrations/20260726113455_f79b36fd-9178-4def-91a8-cbc298d95e21.sql` | `7c9f31ff73e5ba8acd882d24c3b3e245b31cfd91` | `70c9aefbfff2bdc3fb40fda5129f9d09c938f8cd55e8a91acc50aa005a5b0b8f` |
| `src/lib/tenant-onboarding/server/query-service.server.ts` | `eaa83f012e548276a275b703ac51e38106bf34c7` | `19791e6e72c765b793067091f8c811cca7edf423a1dbb9a08ca1346830e97a89` |
| `src/lib/tenant-onboarding/server/mappers.server.ts` | `cacfdcda92e32bcc3532809a72eb5569f5722070` | `9ca9718d1f778d6d4b4e1c75655f3262949fe9a0d539bb69954a376536a17d62` |
| `src/lib/tenant-onboarding/queries.functions.ts` | `e39863457a352ce6b9070f308eac120d0044adf1` | `df7662d0fdd1625d5111eb4ab5921889e909ddd28697fdbb5875afe071ccbc55` |
| `src/integrations/supabase/types.ts` | `e0587be8539bb6c9176b962812b44f45aad8876f` | `2a5cf853f3c8ae8df21a036809716004b2b705831453c2a29528b69a24bcf064` |

## 7. Rollback / recovery

The original executable content is recoverable at any time from Git
(`git show 1907718:<path>`) and is additionally retained in
`supabase_migrations.schema_migrations.statements`. Reverting the tombstone
restores the file byte-for-byte; no database action is required or implied.

## 8. Known execution constraints (disclosed before approval)

1. **Commit authorship.** Git state is managed by the platform; the executing
   agent cannot create the three evidence commits itself. Commit SHAs for the
   technical-repair, verified-closure, and terminal-governance stages must be
   supplied by the platform and recorded in the terminal audit. Any stage whose
   SHA cannot be pinned is reported as unpinned rather than asserted.
2. **Clean replay environment.** The migration chain assumes Supabase-managed
   `auth`, `private`, and role infrastructure. Whether a fresh replay can be
   stood up is verified as a binding gate before the tombstone is trusted; if it
   cannot start, the status remains `COMPLETE, REMEDIATION REQUIRED` and the
   failing gate is named.

## 9. Approval

Lovable MUST NOT complete this section. It is filled in only by the designated
authority, and the commit carrying the completed section is the durable
approval record whose SHA is cited in the terminal audit.

| Field | Value |
| --- | --- |
| Approval authority | Architecture Office (migration authority) |
| Approver identity | _pending_ |
| Decision | _pending_ |
| Decision timestamp (UTC) | _pending_ |
| Repair document ID | `MIG-20260726-GATE38-PASS382-HISTORY-REPAIR` |
| Original path | `supabase/migrations/20260726114237_3ca5092b-b2b6-41c3-a54e-2490f4093466.sql` |
| Original blob SHA | `12ce3d2bea99733a79f4ddd7d1ca64a5dd62bae2` |
| Step 0C findings incorporated | Yes — §3 above |
| Approved checksum-repair action | Not applicable (no checksum tracking; see §3) |
| Approved tombstone strategy | _pending_ |
| Approval commit SHA | _pending_ |
