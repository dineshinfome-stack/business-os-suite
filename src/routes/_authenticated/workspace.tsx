import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Users, Building2, Palette, UserCircle, Mail, Copy, Trash2 } from "lucide-react";

import { PageContainer } from "@/components/layout/AppShell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/common/EmptyState";
import { notify } from "@/lib/notify";
import { APP_NAME } from "@/constants/app";
import { useOrg } from "@/contexts/org-context";
import { workspaceKeys } from "@/lib/workspace/query-keys";
import {
  createInvitation,
  getMyProfile,
  getOrganizationBranding,
  getOrganizationProfile,
  listInvitations,
  listOrgMembers,
  revokeInvitation,
  upsertMyProfile,
  upsertOrganizationBranding,
  upsertOrganizationProfile,
} from "@/lib/workspace/functions";
import type { OrgRole } from "@/lib/workspace/types";

export const Route = createFileRoute("/_authenticated/workspace")({
  head: () => ({
    meta: [
      { title: `Workspace — ${APP_NAME}` },
      {
        name: "description",
        content: `${APP_NAME} — organization profile, branding, team directory, and invitations.`,
      },
    ],
  }),
  component: WorkspacePage,
});

function WorkspacePage() {
  const { organizationId, name } = useOrg();

  return (
    <PageContainer
      title={name ? `${name} · Workspace` : "Workspace"}
      description="Manage your organization's identity, branding, team, and invitations."
    >
      {!organizationId ? (
        <EmptyState
          title="No active organization"
          description="Select an organization from the top bar to manage workspace settings."
        />
      ) : (
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">
              <Building2 className="mr-1 h-4 w-4" /> Overview
            </TabsTrigger>
            <TabsTrigger value="profile">Business profile</TabsTrigger>
            <TabsTrigger value="branding">
              <Palette className="mr-1 h-4 w-4" /> Branding
            </TabsTrigger>
            <TabsTrigger value="me">
              <UserCircle className="mr-1 h-4 w-4" /> My profile
            </TabsTrigger>
            <TabsTrigger value="team">
              <Users className="mr-1 h-4 w-4" /> Team
            </TabsTrigger>
            <TabsTrigger value="invites">
              <Mail className="mr-1 h-4 w-4" /> Invitations
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <OverviewTab />
          </TabsContent>
          <TabsContent value="profile">
            <OrgProfileTab />
          </TabsContent>
          <TabsContent value="branding">
            <BrandingTab />
          </TabsContent>
          <TabsContent value="me">
            <MyProfileTab />
          </TabsContent>
          <TabsContent value="team">
            <TeamTab />
          </TabsContent>
          <TabsContent value="invites">
            <InvitationsTab />
          </TabsContent>
        </Tabs>
      )}
    </PageContainer>
  );
}

// ─────────────────────────────────────────────────────────────────────────
function OverviewTab() {
  const { organizationId } = useOrg();
  const members = useQuery({
    queryKey: workspaceKeys.members(organizationId),
    queryFn: () => listOrgMembers({ data: {} }),
    enabled: !!organizationId,
  });
  const invites = useQuery({
    queryKey: workspaceKeys.invitations(organizationId),
    queryFn: () => listInvitations({ data: {} }),
    enabled: !!organizationId,
  });
  const pendingCount = (invites.data ?? []).filter((i) => i.status === "pending").length;

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Members</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-semibold">{members.data?.length ?? "—"}</div>
          <CardDescription>Active organization members</CardDescription>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Pending invitations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-semibold">{pendingCount}</div>
          <CardDescription>Waiting to be accepted</CardDescription>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Quick links</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2 text-sm">
          <Link className="text-primary hover:underline" to="/settings">
            Workspace settings
          </Link>
          <Link className="text-primary hover:underline" to="/dashboard">
            Dashboard
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
function OrgProfileTab() {
  const { organizationId } = useOrg();
  const qc = useQueryClient();
  const upsert = useServerFn(upsertOrganizationProfile);
  const { data, isLoading } = useQuery({
    queryKey: workspaceKeys.profile(organizationId),
    queryFn: () => getOrganizationProfile({ data: {} }),
    enabled: !!organizationId,
  });
  const [form, setForm] = useState<Record<string, string>>({});
  const merged = {
    legalName: form.legalName ?? data?.legalName ?? "",
    displayName: form.displayName ?? data?.displayName ?? "",
    businessType: form.businessType ?? data?.businessType ?? "",
    industry: form.industry ?? data?.industry ?? "",
    taxId: form.taxId ?? data?.taxId ?? "",
    email: form.email ?? data?.email ?? "",
    phone: form.phone ?? data?.phone ?? "",
    website: form.website ?? data?.website ?? "",
    addressLine1: form.addressLine1 ?? data?.addressLine1 ?? "",
    city: form.city ?? data?.city ?? "",
    country: form.country ?? data?.country ?? "",
    currency: form.currency ?? data?.currency ?? "USD",
    timezone: form.timezone ?? data?.timezone ?? "UTC",
    language: form.language ?? data?.language ?? "en",
  };
  const mutation = useMutation({
    mutationFn: () => upsert({ data: { ...merged } }),
    onSuccess: () => {
      notify.success("Organization profile saved");
      void qc.invalidateQueries({ queryKey: workspaceKeys.profile(organizationId) });
    },
    onError: (e) => notify.error(e instanceof Error ? e.message : "Save failed"),
  });

  if (isLoading) return <Skeleton className="h-64 w-full" />;

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Business profile</CardTitle>
        <CardDescription>Legal identity, contact and locale defaults.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-2">
        <Field label="Legal name" value={merged.legalName} onChange={set("legalName")} />
        <Field label="Display name" value={merged.displayName} onChange={set("displayName")} />
        <Field label="Business type" value={merged.businessType} onChange={set("businessType")} />
        <Field label="Industry" value={merged.industry} onChange={set("industry")} />
        <Field label="Tax ID" value={merged.taxId} onChange={set("taxId")} />
        <Field label="Email" value={merged.email} onChange={set("email")} type="email" />
        <Field label="Phone" value={merged.phone} onChange={set("phone")} />
        <Field label="Website" value={merged.website} onChange={set("website")} />
        <div className="md:col-span-2">
          <Label>Address</Label>
          <Textarea
            value={merged.addressLine1}
            onChange={set("addressLine1")}
            rows={2}
          />
        </div>
        <Field label="City" value={merged.city} onChange={set("city")} />
        <Field label="Country" value={merged.country} onChange={set("country")} />
        <Field label="Currency" value={merged.currency} onChange={set("currency")} />
        <Field label="Timezone" value={merged.timezone} onChange={set("timezone")} />
        <Field label="Language" value={merged.language} onChange={set("language")} />
        <div className="md:col-span-2 flex justify-end">
          <Button onClick={() => mutation.mutate()} disabled={mutation.isPending}>
            {mutation.isPending ? "Saving…" : "Save changes"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ─────────────────────────────────────────────────────────────────────────
function BrandingTab() {
  const { organizationId } = useOrg();
  const qc = useQueryClient();
  const upsert = useServerFn(upsertOrganizationBranding);
  const { data, isLoading } = useQuery({
    queryKey: workspaceKeys.branding(organizationId),
    queryFn: () => getOrganizationBranding({ data: {} }),
    enabled: !!organizationId,
  });
  const [form, setForm] = useState<Record<string, string>>({});
  const merged = {
    logoUrl: form.logoUrl ?? data?.logoUrl ?? "",
    faviconUrl: form.faviconUrl ?? data?.faviconUrl ?? "",
    primaryColor: form.primaryColor ?? data?.primaryColor ?? "",
    secondaryColor: form.secondaryColor ?? data?.secondaryColor ?? "",
    theme: (form.theme ?? data?.theme ?? "system") as "light" | "dark" | "system",
  };
  const mutation = useMutation({
    mutationFn: () => upsert({ data: { ...merged } }),
    onSuccess: () => {
      notify.success("Branding saved");
      void qc.invalidateQueries({ queryKey: workspaceKeys.branding(organizationId) });
    },
    onError: (e) => notify.error(e instanceof Error ? e.message : "Save failed"),
  });

  if (isLoading) return <Skeleton className="h-64 w-full" />;

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Branding</CardTitle>
        <CardDescription>Logo, colors, and theme preference.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-2">
        <Field label="Logo URL" value={merged.logoUrl} onChange={set("logoUrl")} />
        <Field label="Favicon URL" value={merged.faviconUrl} onChange={set("faviconUrl")} />
        <Field label="Primary color" value={merged.primaryColor} onChange={set("primaryColor")} />
        <Field
          label="Secondary color"
          value={merged.secondaryColor}
          onChange={set("secondaryColor")}
        />
        <div>
          <Label>Theme</Label>
          <Select
            value={merged.theme}
            onValueChange={(v) => setForm((f) => ({ ...f, theme: v }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="system">System</SelectItem>
              <SelectItem value="light">Light</SelectItem>
              <SelectItem value="dark">Dark</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="md:col-span-2 flex justify-end">
          <Button onClick={() => mutation.mutate()} disabled={mutation.isPending}>
            {mutation.isPending ? "Saving…" : "Save changes"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ─────────────────────────────────────────────────────────────────────────
function MyProfileTab() {
  const { organizationId } = useOrg();
  const qc = useQueryClient();
  const upsert = useServerFn(upsertMyProfile);
  const { data, isLoading } = useQuery({
    queryKey: workspaceKeys.myProfile(organizationId),
    queryFn: () => getMyProfile({ data: {} }),
    enabled: !!organizationId,
  });
  const [form, setForm] = useState<Record<string, string>>({});
  const merged = {
    displayName: form.displayName ?? data?.displayName ?? "",
    jobTitle: form.jobTitle ?? data?.jobTitle ?? "",
    department: form.department ?? data?.department ?? "",
    phone: form.phone ?? data?.phone ?? "",
    avatarUrl: form.avatarUrl ?? data?.avatarUrl ?? "",
    timezone: form.timezone ?? data?.timezone ?? "",
    language: form.language ?? data?.language ?? "",
  };
  const mutation = useMutation({
    mutationFn: () => upsert({ data: { ...merged } }),
    onSuccess: () => {
      notify.success("Profile saved");
      void qc.invalidateQueries({ queryKey: workspaceKeys.myProfile(organizationId) });
      void qc.invalidateQueries({ queryKey: workspaceKeys.members(organizationId) });
    },
    onError: (e) => notify.error(e instanceof Error ? e.message : "Save failed"),
  });
  if (isLoading) return <Skeleton className="h-64 w-full" />;
  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));
  return (
    <Card>
      <CardHeader>
        <CardTitle>My profile</CardTitle>
        <CardDescription>How you appear inside this organization.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-2">
        <Field label="Display name" value={merged.displayName} onChange={set("displayName")} />
        <Field label="Job title" value={merged.jobTitle} onChange={set("jobTitle")} />
        <Field label="Department" value={merged.department} onChange={set("department")} />
        <Field label="Phone" value={merged.phone} onChange={set("phone")} />
        <Field label="Avatar URL" value={merged.avatarUrl} onChange={set("avatarUrl")} />
        <Field label="Timezone" value={merged.timezone} onChange={set("timezone")} />
        <Field label="Language" value={merged.language} onChange={set("language")} />
        <div className="md:col-span-2 flex justify-end">
          <Button onClick={() => mutation.mutate()} disabled={mutation.isPending}>
            {mutation.isPending ? "Saving…" : "Save changes"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ─────────────────────────────────────────────────────────────────────────
function TeamTab() {
  const { organizationId } = useOrg();
  const { data, isLoading } = useQuery({
    queryKey: workspaceKeys.members(organizationId),
    queryFn: () => listOrgMembers({ data: {} }),
    enabled: !!organizationId,
  });
  if (isLoading) return <Skeleton className="h-64 w-full" />;
  if (!data || data.length === 0)
    return <EmptyState title="No members" description="Invite teammates to get started." />;
  return (
    <Card>
      <CardContent className="p-0">
        <table className="w-full text-sm">
          <thead className="border-b bg-muted/40">
            <tr>
              <th className="p-3 text-left font-medium">Member</th>
              <th className="p-3 text-left font-medium">Role</th>
              <th className="p-3 text-left font-medium">Status</th>
              <th className="p-3 text-left font-medium">Joined</th>
            </tr>
          </thead>
          <tbody>
            {data.map((m) => (
              <tr key={m.userId} className="border-b last:border-0">
                <td className="p-3">
                  <div className="font-medium">{m.displayName ?? m.userId.slice(0, 8)}</div>
                  <div className="text-xs text-muted-foreground">
                    {[m.jobTitle, m.department].filter(Boolean).join(" · ")}
                  </div>
                </td>
                <td className="p-3 capitalize">{m.role}</td>
                <td className="p-3">
                  <Badge variant={m.status === "active" ? "default" : "secondary"}>
                    {m.status}
                  </Badge>
                </td>
                <td className="p-3 text-muted-foreground">
                  {m.joinedAt ? new Date(m.joinedAt).toLocaleDateString() : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}

// ─────────────────────────────────────────────────────────────────────────
function InvitationsTab() {
  const { organizationId } = useOrg();
  const qc = useQueryClient();
  const create = useServerFn(createInvitation);
  const revoke = useServerFn(revokeInvitation);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<OrgRole>("member");
  const [lastLink, setLastLink] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: workspaceKeys.invitations(organizationId),
    queryFn: () => listInvitations({ data: {} }),
    enabled: !!organizationId,
  });

  const createM = useMutation({
    mutationFn: () => create({ data: { email, role } }),
    onSuccess: (res) => {
      const url = `${window.location.origin}/workspace/accept?token=${encodeURIComponent(res.token)}`;
      setLastLink(url);
      setEmail("");
      notify.success("Invitation created — copy the link below to share it.");
      void qc.invalidateQueries({ queryKey: workspaceKeys.invitations(organizationId) });
    },
    onError: (e) => notify.error(e instanceof Error ? e.message : "Failed to create invitation"),
  });

  const revokeM = useMutation({
    mutationFn: (id: string) => revoke({ data: { id } }),
    onSuccess: () => {
      notify.success("Invitation revoked");
      void qc.invalidateQueries({ queryKey: workspaceKeys.invitations(organizationId) });
    },
    onError: (e) => notify.error(e instanceof Error ? e.message : "Revoke failed"),
  });

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Invite a member</CardTitle>
          <CardDescription>
            The one-time invitation link is shown once — share it securely.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 md:flex-row md:items-end">
          <div className="flex-1">
            <Label>Email</Label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="teammate@company.com"
            />
          </div>
          <div className="w-40">
            <Label>Role</Label>
            <Select value={role} onValueChange={(v) => setRole(v as OrgRole)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="member">Member</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="owner">Owner</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button
            onClick={() => createM.mutate()}
            disabled={!email || createM.isPending}
          >
            {createM.isPending ? "Creating…" : "Create invitation"}
          </Button>
        </CardContent>
        {lastLink && (
          <CardContent className="border-t pt-4">
            <Label>One-time invitation link</Label>
            <div className="mt-1 flex gap-2">
              <Input readOnly value={lastLink} />
              <Button
                variant="outline"
                onClick={() => {
                  void navigator.clipboard.writeText(lastLink);
                  notify.success("Link copied");
                }}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        )}
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Invitations</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-4">
              <Skeleton className="h-24 w-full" />
            </div>
          ) : !data || data.length === 0 ? (
            <div className="p-6">
              <EmptyState title="No invitations yet" description="Create one above." />
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/40">
                <tr>
                  <th className="p-3 text-left font-medium">Email</th>
                  <th className="p-3 text-left font-medium">Role</th>
                  <th className="p-3 text-left font-medium">Status</th>
                  <th className="p-3 text-left font-medium">Expires</th>
                  <th className="p-3" />
                </tr>
              </thead>
              <tbody>
                {data.map((i) => (
                  <tr key={i.id} className="border-b last:border-0">
                    <td className="p-3">{i.email}</td>
                    <td className="p-3 capitalize">{i.role}</td>
                    <td className="p-3">
                      <Badge variant={i.status === "pending" ? "default" : "secondary"}>
                        {i.status}
                      </Badge>
                    </td>
                    <td className="p-3 text-muted-foreground">
                      {new Date(i.expiresAt).toLocaleString()}
                    </td>
                    <td className="p-3 text-right">
                      {i.status === "pending" && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => revokeM.mutate(i.id)}
                          disabled={revokeM.isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
function Field({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
}) {
  return (
    <div>
      <Label>{label}</Label>
      <Input type={type} value={value} onChange={onChange} />
    </div>
  );
}
