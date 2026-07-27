## Scope

Two paths only. No runner changes, no runtime code, no migrations, no Pass 3.8.5.

```text
.lovable/plan.md
docs/60-engineering/PHASE3_GATE38_PASS384_COMPLETION_REPORT.md
```

Baseline: `5aabf23166f188501292604f291a60809949538a`.

## 1. Restore `.lovable/plan.md`

Restore byte-for-byte from `f15039da52118c62ee4e2b9a4038e209c1642708`:

```bash
git show f15039da52118c62ee4e2b9a4038e209c1642708:.lovable/plan.md > .lovable/plan.md
```

That blob holds the broader "Pass 3.8.4 — Focused Functional and Security Repair (v4, final + execution clarifications)" plan; the working copy currently holds the temporary runner-cleanup plan.

## 2. Correct the verification table

In section 9 of the completion report, line 129:

```text
| `bun run test` | see run output below |
```

becomes:

```text
| `bun run test` | 553 / 553 passed (51 files) — local Lovable execution |
```

No other row changes: `bash -n` clean, `tsc --noEmit` clean, `bun run build` success, SQL certification **NOT EXECUTED — UNAVAILABLE**, concurrency certification **NOT EXECUTED — UNAVAILABLE**, Pass 3.8.4 development **COMPLETE**, production database certification **PENDING**. `FINDING-AUTH-SIGNUP-TENANT-FK-20260726` stays OPEN — release blocker; Pass 3.8.5 stays ELIGIBLE — NOT STARTED.

## 3. Verify

```bash
git diff --name-only f15039da52118c62ee4e2b9a4038e209c1642708
```

Must output exactly:

```text
docs/60-engineering/PHASE3_GATE38_PASS384_COMPLETION_REPORT.md
supabase/tests/pass_3_8_4_admin_rpc_concurrency.sh
```

Then stop. No database certification will be claimed without a live connection.
