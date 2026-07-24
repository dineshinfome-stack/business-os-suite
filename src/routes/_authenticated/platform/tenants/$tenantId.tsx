import * as React from "react";
import { createFileRoute, useParams, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import type { ColumnDef } from "@tanstack/react-table";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import { DataGrid } from "@/components/tables/DataGrid";
import { Can } from "@/components/auth/Can";
import { PERMISSIONS } from "@/lib/generated/permission-keys";

import {
  getTenant,
  activateTenant,
  suspendTenant,
  archiveTenant,
} from "@/lib/tenants/tenants.functions";
import { canTransition, type TenantLifecycleState } from "@/lib/tenants/lifecycle";
import {
  listCompanies,
  createCompany,
  activateCompany,
  deactivateCompany,
  archiveCompany,
  setDefaultCompany,
} from "@/lib/organizations/company.functions";
import {
  canTransition as canCompanyTransition,
  type CompanyLifecycleState,
} from "@/lib/organizations/lifecycle";

export const Route = createFileRoute("/_authenticated/platform/tenants/$tenantId")({
  component: TenantDetailPage,
  head: () => ({
    meta: [
      { title: "Tenant — Platform Administration" },
      { name: "description", content: "Manage a tenant's lifecycle and companies." },
    ],
  }),
});

type CompanyRow = Awaited<ReturnType<typeof listCompanies>>[number];

function TenantDetailPage() {
  const { tenantId } = useParams({ from: "/_authenticated/platform/tenants/$tenantId" });
  const get = useServerFn(getTenant);
  const activate = useServerFn(activateTenant);
  const suspend = useServerFn(suspendTenant);
  const archive = useServerFn(archiveTenant);
  const qc = useQueryClient();

  const { data: tenant, isLoading } = useQuery({
    queryKey: ["platform", "tenant", tenantId],
    queryFn: () => get({ data: { tenantId } }),
  });

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["platform", "tenants"] });
    qc.invalidateQueries({ queryKey: ["platform", "tenant", tenantId] });
  };

  const activateMut = useMutation({
    mutationFn: () => activate({ data: { tenantId } }),
    onSuccess: (r) => {
      toast.success(r.already_active ? "Already active" : "Tenant activated");
      invalidate();
    },
    onError: (e) => toast.error((e as Error).message),
  });
  const suspendMut = useMutation({
    mutationFn: () => suspend({ data: { tenantId } }),
    onSuccess: (r) => {
      toast.success(r.already_suspended ? "Already suspended" : "Tenant suspended");
      invalidate();
    },
    onError: (e) => toast.error((e as Error).message),
  });
  const archiveMut = useMutation({
    mutationFn: () => archive({ data: { tenantId } }),
    onSuccess: (r) => {
      toast.success(r.already_archived ? "Already archived" : "Tenant archived");
      invalidate();
    },
    onError: (e) => toast.error((e as Error).message),
  });

  if (isLoading) return <div className="p-6 text-sm text-muted-foreground">Loading…</div>;
  if (!tenant) return <div className="p-6 text-sm">Not found.</div>;

  const state = tenant.lifecycle_state as TenantLifecycleState;

  return (
    <div className="space-y-6 p-6">
      <div>
        <Link
          to="/platform/tenants"
          className="text-sm text-muted-foreground hover:underline"
        >
          ← Tenants
        </Link>
        <div className="mt-2 flex items-center gap-3">
          <h1 className="text-2xl font-semibold tracking-tight">
            {tenant.display_name}
          </h1>
          <Badge variant="outline" className="font-mono">
            {tenant.slug}
          </Badge>
          <Badge>{state}</Badge>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="companies">Companies</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Overview</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
              <Field label="Region" value={tenant.region} />
              <Field label="Locale" value={tenant.default_locale} />
              <Field label="Timezone" value={tenant.timezone} />
              <Field label="Plan" value={tenant.plan_tier} />
              <Field
                label="Created"
                value={new Date(tenant.created_at).toLocaleString()}
              />
              {tenant.activated_at && (
                <Field
                  label="Activated"
                  value={new Date(tenant.activated_at).toLocaleString()}
                />
              )}
              {tenant.suspended_at && (
                <Field
                  label="Suspended"
                  value={new Date(tenant.suspended_at).toLocaleString()}
                />
              )}
              {tenant.archived_at && (
                <Field
                  label="Archived"
                  value={new Date(tenant.archived_at).toLocaleString()}
                />
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Lifecycle actions</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-3">
              <Can permission={PERMISSIONS.PLATFORM_TENANT_ACTIVATE}>
                <Button
                  onClick={() => activateMut.mutate()}
                  disabled={
                    !canTransition(state, "active") || activateMut.isPending
                  }
                >
                  Activate
                </Button>
              </Can>
              <Can permission={PERMISSIONS.PLATFORM_TENANT_SUSPEND}>
                <Button
                  variant="secondary"
                  onClick={() => suspendMut.mutate()}
                  disabled={
                    !canTransition(state, "suspended") || suspendMut.isPending
                  }
                >
                  Suspend
                </Button>
              </Can>
              <Can permission={PERMISSIONS.PLATFORM_TENANT_ARCHIVE}>
                <Button
                  variant="destructive"
                  onClick={() => archiveMut.mutate()}
                  disabled={
                    !canTransition(state, "archived") || archiveMut.isPending
                  }
                >
                  Archive
                </Button>
              </Can>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="companies" className="space-y-4">
          <CompaniesPanel tenantId={tenantId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wide text-muted-foreground">
        {label}
      </div>
      <div className="mt-1">{value}</div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────
// Companies panel — SIP-015
// ────────────────────────────────────────────────────────────────────────

function CompaniesPanel({ tenantId }: { tenantId: string }) {
  const list = useServerFn(listCompanies);
  const create = useServerFn(createCompany);
  const activate = useServerFn(activateCompany);
  const deactivate = useServerFn(deactivateCompany);
  const archive = useServerFn(archiveCompany);
  const setDefault = useServerFn(setDefaultCompany);
  const qc = useQueryClient();

  const companiesKey = ["platform", "tenant", tenantId, "companies"] as const;
  const { data, isLoading } = useQuery({
    queryKey: companiesKey,
    queryFn: () => list({ data: { tenantId } }),
  });

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: companiesKey });
  };

  const [open, setOpen] = React.useState(false);
  const [slug, setSlug] = React.useState("");
  const [displayName, setDisplayName] = React.useState("");

  const createMut = useMutation({
    mutationFn: (input: { slug: string; displayName: string }) =>
      create({ data: { tenantId, slug: input.slug, displayName: input.displayName } }),
    onSuccess: () => {
      toast.success("Company created");
      invalidate();
      setOpen(false);
      setSlug("");
      setDisplayName("");
    },
    onError: (e) => toast.error((e as Error).message),
  });

  const activateMut = useMutation({
    mutationFn: (companyId: string) => activate({ data: { companyId } }),
    onSuccess: (r) => {
      toast.success(r.already_active ? "Already active" : "Company activated");
      invalidate();
    },
    onError: (e) => toast.error((e as Error).message),
  });
  const deactivateMut = useMutation({
    mutationFn: (companyId: string) => deactivate({ data: { companyId } }),
    onSuccess: (r) => {
      toast.success(r.already_inactive ? "Already inactive" : "Company deactivated");
      invalidate();
    },
    onError: (e) => toast.error((e as Error).message),
  });
  const archiveMut = useMutation({
    mutationFn: (companyId: string) => archive({ data: { companyId } }),
    onSuccess: (r) => {
      toast.success(r.already_archived ? "Already archived" : "Company archived");
      invalidate();
    },
    onError: (e) => toast.error((e as Error).message),
  });
  const defaultMut = useMutation({
    mutationFn: (companyId: string) => setDefault({ data: { companyId } }),
    onSuccess: (r) => {
      toast.success(r.already_default ? "Already default" : "Default company set");
      invalidate();
    },
    onError: (e) => toast.error((e as Error).message),
  });

  const columns = React.useMemo<ColumnDef<CompanyRow, unknown>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Name",
        cell: ({ row }) => (
          <Link
            to="/platform/companies/$companyId"
            params={{ companyId: row.original.id }}
            className="font-medium text-primary hover:underline"
          >
            {row.original.name}
          </Link>
        ),
      },
      {
        accessorKey: "slug",
        header: "Slug",
        cell: ({ row }) => (
          <span className="font-mono text-sm">{row.original.slug}</span>
        ),
      },
      {
        accessorKey: "is_default",
        header: "Default",
        cell: ({ row }) =>
          row.original.is_default ? <Badge variant="secondary">Default</Badge> : null,
      },
      {
        accessorKey: "lifecycle_state",
        header: "State",
        cell: ({ row }) => (
          <CompanyLifecycleBadge state={row.original.lifecycle_state as CompanyLifecycleState} />
        ),
      },
      {
        accessorKey: "created_at",
        header: "Created",
        cell: ({ row }) =>
          new Date(row.original.created_at).toLocaleDateString(),
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => {
          const c = row.original;
          const state = c.lifecycle_state as CompanyLifecycleState;
          const pending =
            activateMut.isPending ||
            deactivateMut.isPending ||
            archiveMut.isPending ||
            defaultMut.isPending;
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" disabled={pending}>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <Can permission={PERMISSIONS.PLATFORM_COMPANY_ACTIVATE}>
                  <DropdownMenuItem
                    disabled={!canCompanyTransition(state, "active")}
                    onClick={() => activateMut.mutate(c.id)}
                  >
                    Activate
                  </DropdownMenuItem>
                </Can>
                <Can permission={PERMISSIONS.PLATFORM_COMPANY_DEACTIVATE}>
                  <DropdownMenuItem
                    disabled={!canCompanyTransition(state, "inactive")}
                    onClick={() => deactivateMut.mutate(c.id)}
                  >
                    Deactivate
                  </DropdownMenuItem>
                </Can>
                <Can permission={PERMISSIONS.PLATFORM_COMPANY_SET_DEFAULT}>
                  <DropdownMenuItem
                    disabled={c.is_default}
                    onClick={() => defaultMut.mutate(c.id)}
                  >
                    Set default
                  </DropdownMenuItem>
                </Can>
                <Can permission={PERMISSIONS.PLATFORM_COMPANY_ARCHIVE}>
                  <DropdownMenuItem
                    disabled={!canCompanyTransition(state, "archived")}
                    onClick={() => archiveMut.mutate(c.id)}
                    className="text-destructive"
                  >
                    Archive
                  </DropdownMenuItem>
                </Can>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    [activateMut, deactivateMut, archiveMut, defaultMut],
  );

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Companies</CardTitle>
        <Can permission={PERMISSIONS.PLATFORM_COMPANY_CREATE}>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>New company</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create company</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <div className="space-y-2">
                  <Label htmlFor="company-slug">Slug</Label>
                  <Input
                    id="company-slug"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="acme-us"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company-name">Display name</Label>
                  <Input
                    id="company-name"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Acme US"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  disabled={!slug || !displayName || createMut.isPending}
                  onClick={() => createMut.mutate({ slug, displayName })}
                >
                  {createMut.isPending ? "Creating…" : "Create"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </Can>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : (
          <DataGrid data={data ?? []} columns={columns} />
        )}
      </CardContent>
    </Card>
  );
}

function CompanyLifecycleBadge({ state }: { state: CompanyLifecycleState }) {
  const variant =
    state === "active"
      ? "default"
      : state === "inactive"
        ? "secondary"
        : state === "archived"
          ? "outline"
          : "secondary";
  return <Badge variant={variant as never}>{state}</Badge>;
}
