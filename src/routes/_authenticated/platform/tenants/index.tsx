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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { useAuth } from "@/contexts/auth-context";

import {
  searchTenants,
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

type SearchResult = Awaited<ReturnType<typeof searchTenants>>;
type TenantRow = SearchResult["rows"][number];

const LIFECYCLE_OPTIONS = ["created", "active", "suspended", "archived"] as const;
const PROVISIONING_OPTIONS = [
  "not_started",
  "in_progress",
  "provisioned",
  "failed",
] as const;

const ANY = "__any__";

function PlatformTenantsPage() {
  const auth = useAuth();
  const search = useServerFn(searchTenants);
  const create = useServerFn(createTenant);
  const qc = useQueryClient();

  const [query, setQuery] = React.useState("");
  const [debouncedQuery, setDebouncedQuery] = React.useState("");
  const [lifecycleState, setLifecycleState] = React.useState<string>(ANY);
  const [provisioningStatus, setProvisioningStatus] =
    React.useState<string>(ANY);

  React.useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query.trim()), 250);
    return () => clearTimeout(t);
  }, [query]);

  const queryInput = React.useMemo(
    () => ({
      query: debouncedQuery || undefined,
      lifecycleState:
        lifecycleState === ANY
          ? undefined
          : (lifecycleState as (typeof LIFECYCLE_OPTIONS)[number]),
      provisioningStatus:
        provisioningStatus === ANY
          ? undefined
          : (provisioningStatus as (typeof PROVISIONING_OPTIONS)[number]),
    }),
    [debouncedQuery, lifecycleState, provisioningStatus],
  );

  const { data, isLoading } = useQuery({
    queryKey: ["platform", "tenants", "search", queryInput],
    queryFn: () => search({ data: queryInput }),
    enabled: auth.status === "authenticated",
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
      {
        accessorKey: "code",
        header: "Code",
        cell: ({ row }) =>
          row.original.code ? (
            <span className="font-mono text-xs">{row.original.code}</span>
          ) : (
            <span className="text-muted-foreground">—</span>
          ),
      },
      { accessorKey: "region", header: "Region" },
      { accessorKey: "plan_tier", header: "Plan" },
      {
        accessorKey: "lifecycle_state",
        header: "State",
        cell: ({ row }) => <LifecycleBadge state={row.original.lifecycle_state} />,
      },
      {
        accessorKey: "provisioning_status",
        header: "Provisioning",
        cell: ({ row }) => (
          <ProvisioningBadge status={row.original.provisioning_status} />
        ),
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
            Platform-level tenant registry and lifecycle.
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

      <div className="flex flex-wrap items-end gap-3">
        <div className="min-w-64 flex-1 space-y-1">
          <Label htmlFor="search" className="text-xs">
            Search
          </Label>
          <Input
            id="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Name, slug, or exact code"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Lifecycle</Label>
          <Select value={lifecycleState} onValueChange={setLifecycleState}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ANY}>Any</SelectItem>
              {LIFECYCLE_OPTIONS.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Provisioning</Label>
          <Select
            value={provisioningStatus}
            onValueChange={setProvisioningStatus}
          >
            <SelectTrigger className="w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ANY}>Any</SelectItem>
              {PROVISIONING_OPTIONS.map((s) => (
                <SelectItem key={s} value={s}>
                  {s.replace(/_/g, " ")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {(debouncedQuery ||
          lifecycleState !== ANY ||
          provisioningStatus !== ANY) && (
          <Button
            variant="ghost"
            onClick={() => {
              setQuery("");
              setLifecycleState(ANY);
              setProvisioningStatus(ANY);
            }}
          >
            Clear
          </Button>
        )}
        <div className="ml-auto text-xs text-muted-foreground">
          {data ? `${data.total} tenant${data.total === 1 ? "" : "s"}` : null}
        </div>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : (
        <DataGrid data={data?.rows ?? []} columns={columns} />
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

function ProvisioningBadge({ status }: { status: string | null }) {
  const s = status ?? "not_started";
  const variant =
    s === "provisioned"
      ? "default"
      : s === "failed"
        ? "destructive"
        : s === "in_progress"
          ? "secondary"
          : "outline";
  return (
    <Badge variant={variant as never} className="whitespace-nowrap">
      {s.replace(/_/g, " ")}
    </Badge>
  );
}
