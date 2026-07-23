/**
 * Sprint 1.0 — MOD-001 Workspace Foundation: server functions.
 *
 * Every mutation runs under `requireSupabaseAuth`; RLS scopes rows to the
 * caller's organization. Invitation tokens are 32 random bytes returned
 * ONCE to the inviter (as a base64url string) and stored as SHA-256 hashes.
 */
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { randomBytes, createHash } from "node:crypto";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { getOrgContext } from "@/lib/organizations.functions";
import type {
  InvitationRow,
  InvitationStatus,
  OrgMemberDirectoryRow,
  OrganizationBrandingRow,
  OrganizationProfileRow,
  OrgRole,
  UserProfileRow,
} from "./types";

const INVITE_TTL_HOURS = 168; // 7 days

function tokenHashHex(token: string): string {
  return createHash("sha256").update(token, "utf8").digest("hex");
}

function generateInviteToken(): string {
  return randomBytes(32).toString("base64url");
}

async function resolveOrgId(explicit?: string | null): Promise<string> {
  if (explicit) return explicit;
  const ctx = await getOrgContext();
  if (!ctx.organizationId) throw new Error("No active organization");
  return ctx.organizationId;
}

// ─── Organization profile ────────────────────────────────────────────────
const OrgIdInput = z.object({
  organizationId: z.string().uuid().nullable().optional(),
});

export const getOrganizationProfile = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => OrgIdInput.parse(data ?? {}))
  .handler(async ({ data, context }): Promise<OrganizationProfileRow | null> => {
    const orgId = await resolveOrgId(data.organizationId ?? null);
    const { data: row, error } = await context.supabase
      .from("organization_profiles")
      .select("*")
      .eq("organization_id", orgId)
      .maybeSingle();
    if (error) throw error;
    if (!row) return null;
    return {
      organizationId: row.organization_id,
      legalName: row.legal_name,
      displayName: row.display_name,
      businessType: row.business_type,
      industry: row.industry,
      taxId: row.tax_id,
      registrationNumber: row.registration_number,
      email: row.email,
      phone: row.phone,
      website: row.website,
      addressLine1: row.address_line1,
      addressLine2: row.address_line2,
      city: row.city,
      state: row.state,
      postalCode: row.postal_code,
      country: row.country,
      currency: row.currency,
      timezone: row.timezone,
      language: row.language,
    };
  });

const OrgProfileInput = z.object({
  organizationId: z.string().uuid().nullable().optional(),
  legalName: z.string().max(200).nullable().optional(),
  displayName: z.string().max(200).nullable().optional(),
  businessType: z.string().max(80).nullable().optional(),
  industry: z.string().max(80).nullable().optional(),
  taxId: z.string().max(80).nullable().optional(),
  registrationNumber: z.string().max(80).nullable().optional(),
  email: z.string().email().nullable().optional().or(z.literal("")),
  phone: z.string().max(40).nullable().optional(),
  website: z.string().max(400).nullable().optional(),
  addressLine1: z.string().max(200).nullable().optional(),
  addressLine2: z.string().max(200).nullable().optional(),
  city: z.string().max(120).nullable().optional(),
  state: z.string().max(120).nullable().optional(),
  postalCode: z.string().max(40).nullable().optional(),
  country: z.string().max(80).nullable().optional(),
  currency: z.string().min(3).max(3).optional(),
  timezone: z.string().max(80).optional(),
  language: z.string().max(20).optional(),
});

export const upsertOrganizationProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => OrgProfileInput.parse(data))
  .handler(async ({ data, context }) => {
    const orgId = await resolveOrgId(data.organizationId ?? null);
    const payload = {
      organization_id: orgId,
      legal_name: data.legalName ?? null,
      display_name: data.displayName ?? null,
      business_type: data.businessType ?? null,
      industry: data.industry ?? null,
      tax_id: data.taxId ?? null,
      registration_number: data.registrationNumber ?? null,
      email: data.email || null,
      phone: data.phone ?? null,
      website: data.website ?? null,
      address_line1: data.addressLine1 ?? null,
      address_line2: data.addressLine2 ?? null,
      city: data.city ?? null,
      state: data.state ?? null,
      postal_code: data.postalCode ?? null,
      country: data.country ?? null,
      currency: data.currency ?? "USD",
      timezone: data.timezone ?? "UTC",
      language: data.language ?? "en",
      updated_by: context.userId,
    };
    const { error } = await context.supabase
      .from("organization_profiles")
      .upsert({ ...payload, created_by: context.userId }, { onConflict: "organization_id" });
    if (error) throw error;
    await context.supabase.from("audit_logs").insert({
      organization_id: orgId,
      actor_user_id: context.userId,
      action: "organization_profile_updated",
      entity_type: "organization_profile",
      entity_id: orgId,
    });
    return { ok: true as const };
  });

// ─── Branding ────────────────────────────────────────────────────────────
export const getOrganizationBranding = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => OrgIdInput.parse(data ?? {}))
  .handler(async ({ data, context }): Promise<OrganizationBrandingRow | null> => {
    const orgId = await resolveOrgId(data.organizationId ?? null);
    const { data: row, error } = await context.supabase
      .from("organization_branding")
      .select("*")
      .eq("organization_id", orgId)
      .maybeSingle();
    if (error) throw error;
    if (!row) return null;
    return {
      organizationId: row.organization_id,
      logoUrl: row.logo_url,
      faviconUrl: row.favicon_url,
      primaryColor: row.primary_color,
      secondaryColor: row.secondary_color,
      theme: row.theme as OrganizationBrandingRow["theme"],
    };
  });

const BrandingInput = z.object({
  organizationId: z.string().uuid().nullable().optional(),
  logoUrl: z.string().max(1000).nullable().optional(),
  faviconUrl: z.string().max(1000).nullable().optional(),
  primaryColor: z.string().max(40).nullable().optional(),
  secondaryColor: z.string().max(40).nullable().optional(),
  theme: z.enum(["light", "dark", "system"]).optional(),
});

export const upsertOrganizationBranding = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => BrandingInput.parse(data))
  .handler(async ({ data, context }) => {
    const orgId = await resolveOrgId(data.organizationId ?? null);
    const { error } = await context.supabase
      .from("organization_branding")
      .upsert(
        {
          organization_id: orgId,
          logo_url: data.logoUrl ?? null,
          favicon_url: data.faviconUrl ?? null,
          primary_color: data.primaryColor ?? null,
          secondary_color: data.secondaryColor ?? null,
          theme: data.theme ?? "system",
          created_by: context.userId,
          updated_by: context.userId,
        },
        { onConflict: "organization_id" },
      );
    if (error) throw error;
    await context.supabase.from("audit_logs").insert({
      organization_id: orgId,
      actor_user_id: context.userId,
      action: "organization_branding_updated",
      entity_type: "organization_branding",
      entity_id: orgId,
    });
    return { ok: true as const };
  });

// ─── User profile ────────────────────────────────────────────────────────
export const getMyProfile = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => OrgIdInput.parse(data ?? {}))
  .handler(async ({ data, context }): Promise<UserProfileRow | null> => {
    const orgId = await resolveOrgId(data.organizationId ?? null);
    const { data: row, error } = await context.supabase
      .from("user_profiles")
      .select("*")
      .eq("organization_id", orgId)
      .eq("user_id", context.userId)
      .maybeSingle();
    if (error) throw error;
    if (!row) return null;
    return {
      id: row.id,
      organizationId: row.organization_id,
      userId: row.user_id,
      displayName: row.display_name,
      jobTitle: row.job_title,
      department: row.department,
      avatarUrl: row.avatar_url,
      phone: row.phone,
      timezone: row.timezone,
      language: row.language,
    };
  });

const ProfileInput = z.object({
  organizationId: z.string().uuid().nullable().optional(),
  displayName: z.string().max(120).nullable().optional(),
  jobTitle: z.string().max(120).nullable().optional(),
  department: z.string().max(120).nullable().optional(),
  avatarUrl: z.string().max(1000).nullable().optional(),
  phone: z.string().max(40).nullable().optional(),
  timezone: z.string().max(80).nullable().optional(),
  language: z.string().max(20).nullable().optional(),
});

export const upsertMyProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => ProfileInput.parse(data))
  .handler(async ({ data, context }) => {
    const orgId = await resolveOrgId(data.organizationId ?? null);
    const { error } = await context.supabase
      .from("user_profiles")
      .upsert(
        {
          organization_id: orgId,
          user_id: context.userId,
          display_name: data.displayName ?? null,
          job_title: data.jobTitle ?? null,
          department: data.department ?? null,
          avatar_url: data.avatarUrl ?? null,
          phone: data.phone ?? null,
          timezone: data.timezone ?? null,
          language: data.language ?? null,
        },
        { onConflict: "organization_id,user_id" },
      );
    if (error) throw error;
    await context.supabase.from("audit_logs").insert({
      organization_id: orgId,
      actor_user_id: context.userId,
      action: "user_profile_updated",
      entity_type: "user_profile",
      entity_id: context.userId,
    });
    return { ok: true as const };
  });

// ─── Team directory ──────────────────────────────────────────────────────
export const listOrgMembers = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => OrgIdInput.parse(data ?? {}))
  .handler(async ({ data, context }): Promise<OrgMemberDirectoryRow[]> => {
    const orgId = await resolveOrgId(data.organizationId ?? null);
    const { data: members, error } = await context.supabase
      .from("organization_members")
      .select("user_id, role, status, joined_at")
      .eq("organization_id", orgId)
      .is("deleted_at", null);
    if (error) throw error;
    const userIds = (members ?? []).map((m) => m.user_id);
    let profiles: Record<
      string,
      Pick<UserProfileRow, "displayName" | "jobTitle" | "department" | "avatarUrl">
    > = {};
    if (userIds.length > 0) {
      const { data: profRows, error: pErr } = await context.supabase
        .from("user_profiles")
        .select("user_id, display_name, job_title, department, avatar_url")
        .eq("organization_id", orgId)
        .in("user_id", userIds);
      if (pErr) throw pErr;
      profiles = Object.fromEntries(
        (profRows ?? []).map((p) => [
          p.user_id,
          {
            displayName: p.display_name,
            jobTitle: p.job_title,
            department: p.department,
            avatarUrl: p.avatar_url,
          },
        ]),
      );
    }
    return (members ?? []).map((m) => ({
      userId: m.user_id,
      role: m.role as OrgRole,
      status: m.status as OrgMemberDirectoryRow["status"],
      joinedAt: m.joined_at,
      displayName: profiles[m.user_id]?.displayName ?? null,
      jobTitle: profiles[m.user_id]?.jobTitle ?? null,
      department: profiles[m.user_id]?.department ?? null,
      avatarUrl: profiles[m.user_id]?.avatarUrl ?? null,
    }));
  });

// ─── Invitations ─────────────────────────────────────────────────────────
export const listInvitations = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => OrgIdInput.parse(data ?? {}))
  .handler(async ({ data, context }): Promise<InvitationRow[]> => {
    const orgId = await resolveOrgId(data.organizationId ?? null);
    const { data: rows, error } = await context.supabase
      .from("organization_invitations")
      .select(
        "id, organization_id, email, role, status, invited_by, expires_at, accepted_at, created_at",
      )
      .eq("organization_id", orgId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (rows ?? []).map((r) => ({
      id: r.id,
      organizationId: r.organization_id,
      email: r.email as string,
      role: r.role as OrgRole,
      status: r.status as InvitationStatus,
      invitedBy: r.invited_by,
      expiresAt: r.expires_at,
      acceptedAt: r.accepted_at,
      createdAt: r.created_at,
    }));
  });

const CreateInviteInput = z.object({
  organizationId: z.string().uuid().nullable().optional(),
  email: z.string().email().max(320),
  role: z.enum(["owner", "admin", "member"]).default("member"),
});

export const createInvitation = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => CreateInviteInput.parse(data))
  .handler(async ({ data, context }): Promise<{ id: string; token: string }> => {
    const orgId = await resolveOrgId(data.organizationId ?? null);
    const token = generateInviteToken();
    const expiresAt = new Date(Date.now() + INVITE_TTL_HOURS * 3600 * 1000).toISOString();
    const { data: row, error } = await context.supabase
      .from("organization_invitations")
      .insert({
        organization_id: orgId,
        email: data.email.toLowerCase(),
        role: data.role,
        invited_by: context.userId,
        token_hash: tokenHashHex(token),
        expires_at: expiresAt,
      })
      .select("id")
      .single();
    if (error) throw error;
    await context.supabase.from("audit_logs").insert({
      organization_id: orgId,
      actor_user_id: context.userId,
      action: "member_invited",
      entity_type: "organization_invitation",
      entity_id: row.id,
      metadata: { email: data.email, role: data.role },
    });
    // Token is returned ONCE to the inviter; it is never persisted in plaintext.
    return { id: row.id, token };
  });

const InviteIdInput = z.object({ id: z.string().uuid() });

export const revokeInvitation = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => InviteIdInput.parse(data))
  .handler(async ({ data, context }) => {
    const { data: row, error } = await context.supabase
      .from("organization_invitations")
      .update({
        status: "revoked",
        revoked_at: new Date().toISOString(),
        revoked_by: context.userId,
      })
      .eq("id", data.id)
      .eq("status", "pending")
      .select("organization_id")
      .maybeSingle();
    if (error) throw error;
    if (!row) throw new Error("Invitation not found or not pending");
    await context.supabase.from("audit_logs").insert({
      organization_id: row.organization_id,
      actor_user_id: context.userId,
      action: "invitation_revoked",
      entity_type: "organization_invitation",
      entity_id: data.id,
    });
    return { ok: true as const };
  });

const AcceptInput = z.object({ token: z.string().min(20).max(200) });

export const acceptInvitation = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => AcceptInput.parse(data))
  .handler(async ({ data, context }): Promise<{ organizationId: string }> => {
    const tokenHash = tokenHashHex(data.token);
    // Read via RLS (invitee can see own pending by JWT email).
    const { data: invite, error: iErr } = await context.supabase
      .from("organization_invitations")
      .select("id, organization_id, email, role, status, expires_at")
      .eq("token_hash", tokenHash)
      .maybeSingle();
    if (iErr) throw iErr;
    if (!invite) throw new Error("Invalid invitation token");
    if (invite.status !== "pending") throw new Error(`Invitation is ${invite.status}`);
    if (new Date(invite.expires_at).getTime() < Date.now()) {
      await context.supabase
        .from("organization_invitations")
        .update({ status: "expired" })
        .eq("id", invite.id);
      throw new Error("Invitation has expired");
    }
    const callerEmail = ((context.claims as { email?: string }).email ?? "").toLowerCase();
    if (callerEmail && callerEmail !== (invite.email as string).toLowerCase()) {
      throw new Error("This invitation is for a different email address");
    }

    // Upsert membership. If the caller is already an active member the
    // unique (org, user) constraint short-circuits; treat as success.
    const nowIso = new Date().toISOString();
    const { error: mErr } = await context.supabase
      .from("organization_members")
      .upsert(
        {
          organization_id: invite.organization_id,
          user_id: context.userId,
          role: invite.role,
          status: "active",
          invited_by: null,
          joined_at: nowIso,
        },
        { onConflict: "organization_id,user_id" },
      );
    if (mErr) throw mErr;

    const { error: uErr } = await context.supabase
      .from("organization_invitations")
      .update({
        status: "accepted",
        accepted_at: nowIso,
        accepted_by: context.userId,
      })
      .eq("id", invite.id);
    if (uErr) throw uErr;

    await context.supabase.from("audit_logs").insert({
      organization_id: invite.organization_id,
      actor_user_id: context.userId,
      action: "member_joined",
      entity_type: "organization_member",
      entity_id: context.userId,
      metadata: { invitation_id: invite.id },
    });

    return { organizationId: invite.organization_id };
  });
