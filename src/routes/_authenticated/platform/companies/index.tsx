import * as React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import type { ColumnDef } from "@tanstack/react-table";

import { DataGrid } from "@/components/tables/DataGrid";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Can } from "@/components/auth/Can";
import { toast } from "sonner";
import { useAuth } from "@/contexts/auth-context";

import { listTenants } from "@/lib/tenants/tenants.functions";
import {
  listCompanies,
  createCompany,
} from "@/lib/organizations/company.functions";

export const Route = createFileRoute("/_authenticated/platform/companies/")({
  component: PlatformCompaniesPage,
  head: () => ({
    meta: [
      { title: "Companies — Platform Administration" },
      {
        name: "description",
        content:
          "Provision and manage companies across every tenant in the Business OS platform.",
      },
    ],
  }),
});

type CompanyRow = Awaited<ReturnType<typeof listCompanies>>[number];
type TenantRow = Awaited<ReturnType<typeof listTenants>>[number];

function PlatformCompaniesPage() {
  const auth = useAuth();
  const listCompaniesFn = useServerFn(listCompanies);
  const listTenantsFn = useServerFn(listTenants);
  const createFn = useServerFn(createCompany);
  const qc = useQueryClient();

  const companiesQ = useQuery({
    queryKey: ["platform", "companies"],
    queryFn: () => listCompaniesFn(),
    enabled: auth.status === "authenticated",
  });

  const tenantsQ = useQuery({
    queryKey: ["platform", "tenants"],
    queryFn: () => listTenantsFn(),
    enabled: auth.status === "authenticated",
  });

  const tenantById = React.useMemo(() => {
    const map = new Map<string, TenantRow>();
    (tenantsQ.data ?? []).forEach((t) => map.set(t.id, t));
    return map;
  }, [tenantsQ.data]);

  const [open, setOpen] = React.useState(false);
  const [tenantId, setTenantId] = React.useState("");
  const [slug, setSlug] = React.useState("");
  const [displayName, setDisplayName] = React.useState("");

  const createMut = useMutation({
    mutationFn: (input: { tenantId: string; slug: string; displayName: string }) =>
      createFn({ data: input }),
    onSuccess: () => {
      toast.success("Company created");
      qc.invalidateQueries({ queryKey: ["platform", "companies"] });
      setOpen(false);
      setTenantId("");
      setSlug("");
      setDisplayName("");
    },
    onError: (e) => toast.error((e as Error).message),
  });

  const columns = React.useMemo<ColumnDef<CompanyRow, unknown>[]>(
    () => [
      {
        accessorKey: "slug",
        header: "Slug",
        cell: ({ row }) => (
          <Link
            to="/platform/companies/$companyId"
            params={{ companyId: row.original.id }}
            className="font-mono text-sm text-primary hover:underline"
          >
            {row.original.slug}
          </Link>
        ),
      },
      { accessorKey: "name", header: "Name" },
      {
        id: "tenant",
        header: "Tenant",
        cell: ({ row }) => {
          const t = tenantById.get(row.original.tenant_id);
          return (
            <span className="text-sm text-muted-foreground">
              {t?.display_name ?? t?.slug ?? row.original.tenant_id}
            </span>
          );
        },
      },
      { accessorKey: "region", header: "Region" },
      {
        accessorKey: "lifecycle_state",
        header: "State",
        cell: ({ row }) => <LifecycleBadge state={row.original.lifecycle_state} />,
      },
      {
        accessorKey: "created_at",
        header: "Created",
        cell: ({ row }) =>
          new Date(row.original.created_at).toLocaleDateString(),
      },
    ],
    [tenantById],
  );

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Companies</h1>
          <p className="text-sm text-muted-foreground">
            Platform-wide list of companies across every tenant.
          </p>
        </div>
        <Can permission="platform.company.create">
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
                  <Label htmlFor="tenant">Tenant</Label>
                  <Select value={tenantId} onValueChange={setTenantId}>
                    <SelectTrigger id="tenant">
                      <SelectValue placeholder="Select a tenant" />
                    </SelectTrigger>
                    <SelectContent>
                      {(tenantsQ.data ?? []).map((t) => (
                        <SelectItem key={t.id} value={t.id}>
                          {t.display_name}{" "}
                          <span className="text-muted-foreground">({t.slug})</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slug">Slug</Label>
                  <Input
                    id="slug"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="acme-manufacturing"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">Display name</Label>
                  <Input
                    id="name"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Acme Manufacturing"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  disabled={
                    !tenantId || !slug || !displayName || createMut.isPending
                  }
                  onClick={() =>
                    createMut.mutate({ tenantId, slug, displayName })
                  }
                >
                  {createMut.isPending ? "Creating…" : "Create"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </Can>
      </div>

      {companiesQ.isLoading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : (
        <DataGrid data={companiesQ.data ?? []} columns={columns} />
      )}
    </div>
  );
}

function LifecycleBadge({ state }: { state: string }) {
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
