/**
 * Gate 3.8 · Pass 3.8.4 — administrator invitation / membership / role tests.
 *
 * A scripted fake client asserts the exact statements the service issues:
 * no database, no network. Focus areas: secret hygiene, idempotent replay,
 * warning-only pre-acceptance semantics, post-acceptance integrity, and
 * refusal to promote a non-administrative invitation.
 */
import { describe, expect, it } from "vitest";

import {
  ASSIGN_ADMIN_ROLE_RPC,
  INVITE_ADMIN_ATOMIC_RPC,
  RESEND_ADMIN_ATOMIC_RPC,
  RESOLVE_ADMIN_RPC,
  REVOKE_INVITATION_RPC,
  assignTenantAdministratorRoleCommand,
  inviteFirstTenantAdministratorCommand,
  isAdministrativeInvitationRole,
  observeTenantAdministratorMembershipCommand,
  resendFirstTenantAdministratorInvitationCommand,
} from "@/lib/tenant-onboarding/server/admin-service.server";
import {
  ONBOARDING_RECORD_STEP_RPC,
  ONBOARDING_START_RPC,
  type AnyClient,
} from "@/lib/tenant-onboarding/server/command-service.server";

const TENANT = "11111111-1111-4111-8111-111111111111";
const ORG = "22222222-2222-4222-8222-222222222222";
const INVITATION = "44444444-4444-4444-8444-444444444444";
const USER = "55555555-5555-4555-8555-555555555555";
const ACTOR = { userId: "33333333-3333-4333-8333-333333333333" };

type RpcCall = { name: string; args: Record<string, unknown> };

interface Resolve {
  organization_id: string | null;
  invitation: Record<string, unknown> | null;
  membership: Record<string, unknown> | null;
  role_granted: boolean;
}

function invitation(overrides: Record<string, unknown> = {}) {
  return {
    id: INVITATION,
    organization_id: ORG,
    email: "admin@example.com",
    role: "admin",
    status: "pending",
    expires_at: new Date(Date.now() + 3600_000).toISOString(),
    accepted_at: null,
    accepted_by: null,
    revoked_at: null,
    created_at: new Date().toISOString(),
    ...overrides,
  };
}

function membership(overrides: Record<string, unknown> = {}) {
  return {
    id: "66666666-6666-4666-8666-666666666666",
    organization_id: ORG,
    user_id: USER,
    role: "admin",
    status: "active",
    joined_at: new Date().toISOString(),
    ...overrides,
  };
}

function makeClient(
  resolve: Resolve,
  rpcOverrides: Record<string, unknown | (() => unknown)> = {},
) {
  const rpcCalls: RpcCall[] = [];
  const inserts: { table: string; payload: any }[] = [];

  const client: AnyClient = {
    rpc: async (name: string, args: Record<string, unknown>) => {
      rpcCalls.push({ name, args });
      const configured = rpcOverrides[name];
      if (typeof configured === "function") {
        return { data: null, error: (configured as () => unknown)() };
      }
      if (name === RESOLVE_ADMIN_RPC) return { data: resolve, error: null };
      if (name === ONBOARDING_START_RPC) {
        return { data: { state: "in_progress", version: 1 }, error: null };
      }
      if (name === ONBOARDING_RECORD_STEP_RPC) {
        return {
          data: { state: "in_progress", status: args._status, version: 2 },
          error: null,
        };
      }
      if (name === INVITE_ADMIN_ATOMIC_RPC) {
        // Mirrors the transactional routine: it resolves the default
        // organization itself, decides create vs replay, and records the
        // `tenant_admin_invitation` step inside the same transaction.
        const existing = resolve.invitation as Record<string, unknown> | null;
        const replay = existing !== null && existing.status === "pending";
        return {
          data: {
            organization_id: ORG,
            invitation_id: INVITATION,
            invitation_status: replay ? existing!.status : "pending",
            created: !replay,
            replayed: replay,
            membership_status: "pending_acceptance",
            role_granted: false,
            state: "in_progress",
            step_status: "completed",
            step_version: 2,
          },
          error: null,
        };
      }
      if (name === RESEND_ADMIN_ATOMIC_RPC) {
        return {
          data: {
            organization_id: ORG,
            invitation_id: "99999999-9999-4999-8999-999999999999",
            previous_invitation_id: INVITATION,
            invitation_status: "pending",
            created: true,
            replayed: false,
            state: "in_progress",
            step_status: "completed",
            step_version: 3,
          },
          error: null,
        };
      }
      if (name === ASSIGN_ADMIN_ROLE_RPC) {
        return { data: { created: true, role_key: "administrator" }, error: null };
      }
      return { data: configured ?? null, error: null };
    },
    from: (table: string) => {
      const builder: any = {
        insert: async (payload: unknown) => {
          inserts.push({ table, payload });
          return { data: null, error: null };
        },
        select: () => builder,
        eq: () => builder,
        maybeSingle: async () => ({ data: null, error: null }),
      };
      return builder;
    },
  } as unknown as AnyClient;

  return { client, rpcCalls, inserts };
}

const call = (calls: RpcCall[], name: string) => calls.filter((c) => c.name === name);
const step = (calls: RpcCall[], key: string) =>
  calls.filter((c) => c.name === ONBOARDING_RECORD_STEP_RPC && c.args._step_key === key);

describe("Pass 3.8.4 — administrator invitation", () => {
  it("only accepts administrative invitation roles", () => {
    expect(isAdministrativeInvitationRole("owner")).toBe(true);
    expect(isAdministrativeInvitationRole("admin")).toBe(true);
    expect(isAdministrativeInvitationRole("member")).toBe(false);
  });

  it("creates an invitation and never returns or logs the secret", async () => {
    const { client, rpcCalls, inserts } = makeClient({
      organization_id: ORG,
      invitation: null,
      membership: null,
      role_granted: false,
    });

    const res = await inviteFirstTenantAdministratorCommand(client, ACTOR, {
      tenantId: TENANT,
      email: "admin@example.com",
      invitedRole: "admin",
    });

    expect(res.ok).toBe(true);
    expect(res.invitationId).toBe(INVITATION);
    expect(res.invitationStatus).toBe("pending");
    expect(res.membershipStatus).toBe("pending_acceptance");
    expect(res.roleGrantStatus).toBe("pending_acceptance");
    expect(res.notificationQueued).toBe(false);

    // No plaintext secret anywhere on the DTO or in the audit payload.
    const serialized = JSON.stringify({ res, inserts });
    expect(serialized).not.toMatch(/token(?!_hash)/i);
    expect(serialized).not.toMatch(/secret/i);

    // Only the hash reaches the database, and it is a sha256 hex digest.
    const [invite] = call(rpcCalls, INVITE_ADMIN_RPC);
    expect(String(invite.args._token_hash)).toMatch(/^[0-9a-f]{64}$/);
    expect(invite.args._invited_role).toBe("admin");
  });

  it("issues a distinct secret on every creation", async () => {
    const base: Resolve = {
      organization_id: ORG,
      invitation: null,
      membership: null,
      role_granted: false,
    };
    const a = makeClient(base);
    const b = makeClient(base);
    const input = { tenantId: TENANT, email: "a@b.com", invitedRole: "admin" as const };
    await inviteFirstTenantAdministratorCommand(a.client, ACTOR, input);
    await inviteFirstTenantAdministratorCommand(b.client, ACTOR, input);
    expect(call(a.rpcCalls, INVITE_ADMIN_RPC)[0].args._token_hash).not.toBe(
      call(b.rpcCalls, INVITE_ADMIN_RPC)[0].args._token_hash,
    );
  });

  it("replays idempotently when an equivalent pending invitation exists", async () => {
    const { client, rpcCalls } = makeClient({
      organization_id: ORG,
      invitation: invitation(),
      membership: null,
      role_granted: false,
    });

    const res = await inviteFirstTenantAdministratorCommand(client, ACTOR, {
      tenantId: TENANT,
      email: "admin@example.com",
      invitedRole: "admin",
    });

    expect(res.ok).toBe(true);
    expect(res.idempotentReplay).toBe(true);
    expect(call(rpcCalls, INVITE_ADMIN_RPC)).toHaveLength(0);
  });

  it("blocks when the tenant has no organization yet", async () => {
    const { client } = makeClient({
      organization_id: null,
      invitation: null,
      membership: null,
      role_granted: false,
    });
    const res = await inviteFirstTenantAdministratorCommand(client, ACTOR, {
      tenantId: TENANT,
      email: "admin@example.com",
      invitedRole: "admin",
    });
    expect(res.ok).toBe(false);
    expect(res.reasonCode).toBe("not_found");
  });

  it("maps a permission denial to a sanitized reason code", async () => {
    const { client } = makeClient(
      { organization_id: ORG, invitation: null, membership: null, role_granted: false },
      { [ONBOARDING_START_RPC]: () => ({ code: "42501" }) },
    );
    const res = await inviteFirstTenantAdministratorCommand(client, ACTOR, {
      tenantId: TENANT,
      email: "admin@example.com",
      invitedRole: "admin",
    });
    expect(res.ok).toBe(false);
    expect(res.reasonCode).toBe("permission_denied");
    expect(res.message).not.toMatch(/42501/);
  });
});

describe("Pass 3.8.4 — resend", () => {
  it("revokes the previous invitation before issuing a fresh secret", async () => {
    const { client, rpcCalls } = makeClient({
      organization_id: ORG,
      invitation: invitation(),
      membership: null,
      role_granted: false,
    });

    const res = await resendFirstTenantAdministratorInvitationCommand(client, ACTOR, {
      tenantId: TENANT,
      invitationId: INVITATION,
    });

    expect(res.ok).toBe(true);
    expect(res.invitationStatus).toBe("pending");
    const order = rpcCalls.map((c) => c.name);
    expect(order.indexOf(REVOKE_INVITATION_RPC)).toBeLessThan(
      order.indexOf(INVITE_ADMIN_RPC),
    );
  });

  it("refuses to resend an accepted invitation", async () => {
    const { client, rpcCalls } = makeClient({
      organization_id: ORG,
      invitation: invitation({ status: "accepted", accepted_at: new Date().toISOString() }),
      membership: membership(),
      role_granted: true,
    });
    const res = await resendFirstTenantAdministratorInvitationCommand(client, ACTOR, {
      tenantId: TENANT,
      invitationId: INVITATION,
    });
    expect(res.ok).toBe(false);
    expect(res.reasonCode).toBe("invitation_conflict");
    expect(call(rpcCalls, REVOKE_INVITATION_RPC)).toHaveLength(0);
  });

  it("rejects an invitation id that is not the tenant's authoritative one", async () => {
    const { client } = makeClient({
      organization_id: ORG,
      invitation: invitation(),
      membership: null,
      role_granted: false,
    });
    const res = await resendFirstTenantAdministratorInvitationCommand(client, ACTOR, {
      tenantId: TENANT,
      invitationId: "77777777-7777-4777-8777-777777777777",
    });
    expect(res.ok).toBe(false);
    expect(res.reasonCode).toBe("invitation_missing");
  });
});

describe("Pass 3.8.4 — membership observation", () => {
  it("is warning-only while acceptance is pending and never writes a membership", async () => {
    const { client, rpcCalls, inserts } = makeClient({
      organization_id: ORG,
      invitation: invitation(),
      membership: null,
      role_granted: false,
    });

    const res = await observeTenantAdministratorMembershipCommand(client, ACTOR, {
      tenantId: TENANT,
    });

    expect(res.ok).toBe(true);
    expect(res.membershipStatus).toBe("pending_acceptance");
    expect(step(rpcCalls, "tenant_admin_membership")[0].args._status).toBe("skipped");
    expect(inserts.every((i) => i.table === "audit_logs")).toBe(true);
  });

  it("completes the step once an active membership exists", async () => {
    const { client, rpcCalls } = makeClient({
      organization_id: ORG,
      invitation: invitation({ status: "accepted", accepted_by: USER }),
      membership: membership(),
      role_granted: true,
    });
    const res = await observeTenantAdministratorMembershipCommand(client, ACTOR, {
      tenantId: TENANT,
    });
    expect(res.ok).toBe(true);
    expect(res.membershipStatus).toBe("active");
    expect(step(rpcCalls, "tenant_admin_membership")[0].args._status).toBe("completed");
  });

  it("treats a missing membership after acceptance as an integrity blocker", async () => {
    const { client, rpcCalls } = makeClient({
      organization_id: ORG,
      invitation: invitation({ status: "accepted", accepted_by: USER }),
      membership: null,
      role_granted: false,
    });
    const res = await observeTenantAdministratorMembershipCommand(client, ACTOR, {
      tenantId: TENANT,
    });
    expect(res.ok).toBe(false);
    expect(res.membershipStatus).toBe("missing_after_acceptance");
    expect(step(rpcCalls, "tenant_admin_membership")[0].args._status).toBe("blocked");
  });

  it("blocks the invitation step when the invitation expired", async () => {
    const { client, rpcCalls } = makeClient({
      organization_id: ORG,
      invitation: invitation({
        expires_at: new Date(Date.now() - 3600_000).toISOString(),
      }),
      membership: null,
      role_granted: false,
    });
    const res = await observeTenantAdministratorMembershipCommand(client, ACTOR, {
      tenantId: TENANT,
    });
    expect(res.ok).toBe(false);
    expect(res.reasonCode).toBe("invitation_expired");
    expect(step(rpcCalls, "tenant_admin_invitation")[0].args._status).toBe("blocked");
  });
});

describe("Pass 3.8.4 — role assignment", () => {
  it("records intent only before acceptance", async () => {
    const { client, rpcCalls } = makeClient({
      organization_id: ORG,
      invitation: invitation(),
      membership: null,
      role_granted: false,
    });
    const res = await assignTenantAdministratorRoleCommand(client, ACTOR, {
      tenantId: TENANT,
    });
    expect(res.ok).toBe(true);
    expect(res.roleIntentStatus).toBe("satisfied");
    expect(res.roleGrantStatus).toBe("pending_acceptance");
    expect(call(rpcCalls, ASSIGN_ADMIN_ROLE_RPC)).toHaveLength(0);
    expect(step(rpcCalls, "roles_assigned")[0].args._status).toBe("skipped");
  });

  it("assigns a seeded role after acceptance with an active membership", async () => {
    const { client, rpcCalls } = makeClient({
      organization_id: ORG,
      invitation: invitation({ status: "accepted", accepted_by: USER }),
      membership: membership(),
      role_granted: false,
    });
    const res = await assignTenantAdministratorRoleCommand(client, ACTOR, {
      tenantId: TENANT,
    });
    expect(res.ok).toBe(true);
    expect(res.roleGrantStatus).toBe("granted");
    expect(res.idempotentReplay).toBe(false);
    expect(call(rpcCalls, ASSIGN_ADMIN_ROLE_RPC)).toHaveLength(1);
  });

  it("reports an idempotent replay when the grant already existed", async () => {
    const { client } = makeClient(
      {
        organization_id: ORG,
        invitation: invitation({ status: "accepted", accepted_by: USER }),
        membership: membership(),
        role_granted: true,
      },
      { [ASSIGN_ADMIN_ROLE_RPC]: undefined },
    );
    const res = await assignTenantAdministratorRoleCommand(client, ACTOR, {
      tenantId: TENANT,
    });
    expect(res.ok).toBe(true);
    expect(res.roleGrantStatus).toBe("granted");
  });

  it("refuses to grant without an active membership after acceptance", async () => {
    const { client, rpcCalls } = makeClient({
      organization_id: ORG,
      invitation: invitation({ status: "accepted", accepted_by: USER }),
      membership: membership({ status: "inactive" }),
      role_granted: false,
    });
    const res = await assignTenantAdministratorRoleCommand(client, ACTOR, {
      tenantId: TENANT,
    });
    expect(res.ok).toBe(false);
    expect(res.reasonCode).toBe("membership_inactive_after_acceptance");
    expect(call(rpcCalls, ASSIGN_ADMIN_ROLE_RPC)).toHaveLength(0);
  });

  it("never promotes a non-administrative invitation", async () => {
    const { client, rpcCalls } = makeClient({
      organization_id: ORG,
      invitation: invitation({ role: "member", status: "accepted", accepted_by: USER }),
      membership: membership(),
      role_granted: false,
    });
    const res = await assignTenantAdministratorRoleCommand(client, ACTOR, {
      tenantId: TENANT,
    });
    expect(res.ok).toBe(false);
    expect(res.reasonCode).toBe("invitation_role_not_administrative");
    expect(res.roleIntentStatus).toBe("not_administrative");
    expect(call(rpcCalls, ASSIGN_ADMIN_ROLE_RPC)).toHaveLength(0);
  });
});
