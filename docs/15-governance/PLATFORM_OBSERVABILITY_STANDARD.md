# Platform Observability Standard

Status: **PUBLISHED (v1.0)** — Sprint 0.3
Owner: Platform Team
Applies to: every module under `src/`, every server function, and every audit
write into `public.audit_logs`.

This standard codifies how the platform names auditable events and how a
correlation id flows through a request. It supersedes any ad-hoc conventions
introduced in earlier sprints; conflicting patterns in later sprints are
corrections against this document.

---

## 1. Audit Action Naming (Past-Tense Verb Form)

Every value written to `audit_logs.action` MUST match:

```
<subject>(_<subject>)*_<verb>
```

- `<subject>` — lowercase snake segments describing the actor or domain
  (`user`, `password`, `role`, `project_member`).
- `<verb>` — past tense from the closed set:
  `in`, `out`, `requested`, `completed`, `created`, `updated`, `deleted`,
  `failed`, `granted`, `revoked`.

Canonical Sprint 0.3 actions:

| Action                        | Fires when                                                 |
| ----------------------------- | ---------------------------------------------------------- |
| `user_logged_in`              | Session established via password or OAuth callback.        |
| `user_logged_out`             | Local sign-out issued (successful or partial).             |
| `password_reset_requested`    | `resetPasswordForEmail` accepted by server.                |
| `password_reset_completed`    | `updateUser({ password })` succeeded on `/reset-password`. |

New actions in later sprints MUST extend this list — never rename existing
values (audit records are immutable history).

## 2. Correlation ID Precedence

A correlation id is generated once per flow and reused across every log line,
audit row, and downstream server call within that flow. Precedence, highest
first:

1. **Inbound HTTP request id** — `x-request-id` header on the incoming
   request, when the code is running inside a request-scoped server context.
2. **Ambient request-scoped id** — the value already assigned to this call
   chain by a middleware or an earlier helper.
3. **Caller-provided id** — an explicit argument passed by the caller (used
   when a client-side flow wants to correlate multiple server calls).
4. **Newly generated id** — `crypto.randomUUID()` with a WebCrypto fallback.

`src/lib/correlation.ts` is the sole implementation.

## 3. Reuse Rules

- A single user flow (sign-in submission → server call → audit write) reuses
  ONE id end-to-end.
- Independent user actions (two clicks on different buttons) MUST get
  distinct ids even if they overlap in time.
- Background/deferred work spawned from a flow inherits the flow's id.

## 4. Audit Payload Discipline

- Never store credentials, tokens, session material, cookies, or full request
  bodies.
- `old_values` / `new_values` — structured JSON only. For auth events they
  are `null` except for the `{ correlation_id }` marker on `new_values`.
- `actor_id`, `created_by`, `updated_by` derive from the authenticated
  session — never from caller input.
- Audit writes are fire-and-forget: an audit failure MUST NOT fail the
  originating flow. Failures are logged at `warn` with the correlation id.

## 5. Extensibility

This standard is append-only. To introduce a new verb, a new precedence
source, or a new payload field, open an ADR under `docs/11-adrs/` referencing
this document, then extend the whitelists in code.
