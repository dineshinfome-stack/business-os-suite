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
import { Can } from "@/components/auth/Can";
import { toast } from "sonner";

import {
  listTenants,
  createTenant,
} from "@/lib/tenants/tenants.functions";

export const Route = createFileRoute("/_authenticated/platform/tenants/")({
  component: PlatformTenantsPage,
  head: () => ({
    meta: [
      { title: "Tenants — Platform Administration" },
      {
        name: "description",
        content:
          "Provision, activate, suspend, and archive platform tenants for the Business OS.",
      },
    ],
  }),
});

type TenantRow = Awaited<ReturnType<typeof listTenants>>[number];

function PlatformTenantsPage() {
  const list = useServerFn(listTenants);
  const create = useServerFn(createTenant);
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["platform", "tenants"],
    queryFn: () => list(),
  });

  const [open, setOpen] = React.useState(false);
  const [slug, setSlug] = React.useState("");
  const [displayName, setDisplayName] = React.useState("");

  const createMut = useMutation({
    mutationFn: (input: { slug: string; displayName: string }) =>
      create({ data: input }),
    onSuccess: () => {
      toast.success("Tenant created");
      qc.invalidateQueries({ queryKey: ["platform", "tenants"] });
      setOpen(false);
      setSlug("");
      setDisplayName("");
    },
    onError: (e) => toast.error((e as Error).message),
  });

  const columns = React.useMemo<ColumnDef<TenantRow, unknown>[]>(
    () => [
      {
        accessorKey: "slug",
        header: "Slug",
        cell: ({ row }) => (
          <Link
            to="/platform/tenants/$tenantId"
            params={{ tenantId: row.original.id }}
            className="font-mono text-sm text-primary hover:underline"
          >
            {row.original.slug}
          </Link>
        ),
      },
      { accessorKey: "display_name", header: "Name" },
      { accessorKey: "region", header: "Region" },
      { accessorKey: "plan_tier", header: "Plan" },
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
    [],
  );

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Tenants</h1>
          <p className="text-sm text-muted-foreground">
            Platform-level tenant isolation and lifecycle.
          </p>
        </div>
        <Can permission="platform.tenant.create">
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>New tenant</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create tenant</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <div className="space-y-2">
                  <Label htmlFor="slug">Slug</Label>
                  <Input
                    id="slug"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="acme-holdings"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">Display name</Label>
                  <Input
                    id="name"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Acme Holdings"
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
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : (
        <DataGrid data={data ?? []} columns={columns} />
      )}
    </div>
  );
}

function LifecycleBadge({ state }: { state: string }) {
  const variant =
    state === "active"
      ? "default"
      : state === "suspended"
        ? "secondary"
        : state === "archived"
          ? "outline"
          : "secondary";
  return <Badge variant={variant as never}>{state}</Badge>;
}
