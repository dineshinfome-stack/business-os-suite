/**
 * Platform Tenant Administration Dashboard.
 *
 * Unified operational view over every tenant, composed by the backend
 * directory read model (`getPlatformTenantOperations`). Filters, sorting and
 * pagination live in the URL so any view is bookmarkable and shareable.
 */
import * as React from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";

import { Button } from "@/components/ui/button";
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
import { usePermissions } from "@/contexts/permissions-context";
import { PERMISSIONS } from "@/lib/generated/permission-keys";

import { createTenant } from "@/lib/tenants/tenants.functions";
import { getPlatformTenantOperations } from "@/lib/platform-admin/queries.functions";
import { administrationKeys } from "@/modules/platform/administration/hooks/query-keys";
import {
  TenantAdminSummary,
  TenantAdminSummarySkeleton,
} from "@/modules/platform/administration/components/TenantAdminSummary";
import {
  TenantAdminTable,
  type TenantAdminSortBy,
} from "@/modules/platform/administration/components/TenantAdminTable";
import {
  ErrorState,
  LoadingState,
} from "@/modules/platform/provisioning/components/States";

const ANY = "all";

const LIFECYCLE_OPTIONS = ["created", "active", "suspended", "archived"] as const;
const PROVISIONING_OPTIONS = [
  "not_started",
  "in_progress",
  "provisioned",
  "failed",
] as const;
const ONBOARDING_OPTIONS = [
  "not_started",
  "in_progress",
  "blocked",
  "ready",
  "activated",
  "cancelled",
] as const;
const READINESS_OPTIONS = ["not_evaluated", "ready", "warning", "blocked"] as const;
const INVITATION_OPTIONS = ["none", "pending", "accepted", "expired", "revoked"] as const;
const SORT_OPTIONS: TenantAdminSortBy[] = [
  "displayName",
  "createdAt",
  "updatedAt",
  "lifecycleState",
  "onboardingProgress",
  "readinessBlockers",
];

export interface TenantAdminSearch {
  q: string;
  lifecycle: string;
  provisioning: string;
  onboarding: string;
  readiness: string;
  invitation: string;
  blocked: boolean;
  sortBy: TenantAdminSortBy;
  sortDir: "asc" | "desc";
  page: number;
  pageSize: number;
}

function str(value: unknown, fallback: string): string {
  return typeof value === "string" && value.length > 0 ? value : fallback;
}

function num(value: unknown, fallback: number): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : fallback;
}

export const Route = createFileRoute("/_authenticated/platform/tenants/")({
  validateSearch: (search: Record<string, unknown>): TenantAdminSearch => ({
    q: str(search.q, ""),
    lifecycle: str(search.lifecycle, ANY),
    provisioning: str(search.provisioning, ANY),
    onboarding: str(search.onboarding, ANY),
    readiness: str(search.readiness, ANY),
    invitation: str(search.invitation, ANY),
    blocked: search.blocked === true || search.blocked === "true",
    sortBy: SORT_OPTIONS.includes(search.sortBy as TenantAdminSortBy)
      ? (search.sortBy as TenantAdminSortBy)
      : "createdAt",
    sortDir: search.sortDir === "asc" ? "asc" : "desc",
    page: num(search.page, 1),
    pageSize: Math.min(100, Math.max(5, num(search.pageSize, 25))),
  }),
  component: PlatformTenantsPage,
  head: () => ({
    meta: [
      { title: "Tenant Administration — Business OS Platform" },
      {
        name: "description",
        content:
          "Unified operational view of every tenant: lifecycle, provisioning, onboarding progress, readiness and blockers.",
      },
      { property: "og:title", content: "Tenant Administration — Business OS Platform" },
      {
        property: "og:description",
        content:
          "Monitor tenant lifecycle, provisioning, onboarding and activation readiness across the platform.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
});

function PlatformTenantsPage() {
  const auth = useAuth();
  const permissions = usePermissions();
  const navigate = useNavigate({ from: Route.fullPath });
  const search = Route.useSearch();
  const listFn = useServerFn(getPlatformTenantOperations);
  const create = useServerFn(createTenant);
  const qc = useQueryClient();

  const canRead = permissions.has(PERMISSIONS.PLATFORM_TENANT_READ);

  const [searchInput, setSearchInput] = React.useState(search.q);
  React.useEffect(() => setSearchInput(search.q), [search.q]);

  const setSearch = React.useCallback(
    (patch: Partial<TenantAdminSearch>) => {
      navigate({
        search: (prev: TenantAdminSearch) => ({ ...prev, page: 1, ...patch }),
        replace: true,
      });
    },
    [navigate],
  );

  React.useEffect(() => {
    if (searchInput === search.q) return;
    const timer = setTimeout(() => setSearch({ q: searchInput }), 300);
    return () => clearTimeout(timer);
  }, [searchInput, search.q, setSearch]);

  const queryInput = React.useMemo(
    () => ({
      search: search.q || undefined,
      lifecycleState: search.lifecycle,
      provisioningStatus: search.provisioning,
      onboardingState: search.onboarding,
      readinessStatus: search.readiness,
      invitationStatus: search.invitation,
      blockedOnly: search.blocked || undefined,
      sortBy: search.sortBy,
      sortDir: search.sortDir,
      page: search.page,
      pageSize: search.pageSize,
    }),
    [search],
  );

  const query = useQuery({
    queryKey: administrationKeys.tenants(queryInput),
    queryFn: () => listFn({ data: queryInput }),
    enabled: auth.status === "authenticated" && permissions.ready && canRead,
    staleTime: 15_000,
  });

  const [open, setOpen] = React.useState(false);
  const [slug, setSlug] = React.useState("");
  const [displayName, setDisplayName] = React.useState("");

  const createMut = useMutation({
    mutationFn: (input: { slug: string; displayName: string }) =>
      create({ data: input }),
    onSuccess: () => {
      toast.success("Tenant created");
      qc.invalidateQueries({ queryKey: administrationKeys.all });
      setOpen(false);
      setSlug("");
      setDisplayName("");
    },
    onError: (e) => toast.error((e as Error).message),
  });

  const onSort = (column: TenantAdminSortBy) => {
    setSearch({
      sortBy: column,
      sortDir: search.sortBy === column && search.sortDir === "desc" ? "asc" : "desc",
      page: search.page,
    });
  };

  if (permissions.ready && !canRead) {
    return (
      <div className="p-6">
        <ErrorState
          error={
            new Error(
              "You do not have permission to view platform tenant administration.",
            )
          }
        />
      </div>
    );
  }

  const total = query.data?.total ?? 0;
  const pageCount = Math.max(1, Math.ceil(total / search.pageSize));
  const filtersActive =
    Boolean(search.q) ||
    search.lifecycle !== ANY ||
    search.provisioning !== ANY ||
    search.onboarding !== ANY ||
    search.readiness !== ANY ||
    search.invitation !== ANY ||
    search.blocked;

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Tenant Administration
          </h1>
          <p className="text-sm text-muted-foreground">
            Lifecycle, provisioning, onboarding and activation readiness across every
            tenant.
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

      {query.isLoading || !query.data ? (
        <TenantAdminSummarySkeleton />
      ) : (
        <TenantAdminSummary summary={query.data.summary} />
      )}

      <div className="flex flex-wrap items-end gap-3">
        <div className="min-w-56 flex-1 space-y-1">
          <Label htmlFor="tenant-search" className="text-xs">
            Search
          </Label>
          <Input
            id="tenant-search"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Name, slug, code, region"
          />
        </div>
        <FilterSelect
          label="Lifecycle"
          value={search.lifecycle}
          options={LIFECYCLE_OPTIONS}
          onChange={(v) => setSearch({ lifecycle: v })}
        />
        <FilterSelect
          label="Provisioning"
          value={search.provisioning}
          options={PROVISIONING_OPTIONS}
          onChange={(v) => setSearch({ provisioning: v })}
        />
        <FilterSelect
          label="Onboarding"
          value={search.onboarding}
          options={ONBOARDING_OPTIONS}
          onChange={(v) => setSearch({ onboarding: v })}
        />
        <FilterSelect
          label="Readiness"
          value={search.readiness}
          options={READINESS_OPTIONS}
          onChange={(v) => setSearch({ readiness: v })}
        />
        <FilterSelect
          label="Invitation"
          value={search.invitation}
          options={INVITATION_OPTIONS}
          onChange={(v) => setSearch({ invitation: v })}
        />
        <Button
          variant={search.blocked ? "default" : "outline"}
          onClick={() => setSearch({ blocked: !search.blocked })}
        >
          Blocked only
        </Button>
        {filtersActive && (
          <Button
            variant="ghost"
            onClick={() =>
              setSearch({
                q: "",
                lifecycle: ANY,
                provisioning: ANY,
                onboarding: ANY,
                readiness: ANY,
                invitation: ANY,
                blocked: false,
              })
            }
          >
            Clear
          </Button>
        )}
      </div>

      {query.isError ? (
        <ErrorState error={query.error} />
      ) : query.isLoading || !query.data ? (
        <LoadingState label="Loading tenants" />
      ) : (
        <>
          <TenantAdminTable
            rows={query.data.rows}
            sortBy={search.sortBy}
            sortDir={search.sortDir}
            onSort={onSort}
          />
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs text-muted-foreground">
              {total} tenant{total === 1 ? "" : "s"} · page {search.page} of {pageCount}
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={search.page <= 1}
                onClick={() =>
                  navigate({
                    search: (prev: TenantAdminSearch) => ({ ...prev, page: prev.page - 1 }),
                    replace: true,
                  })
                }
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={search.page >= pageCount}
                onClick={() =>
                  navigate({
                    search: (prev: TenantAdminSearch) => ({ ...prev, page: prev.page + 1 }),
                    replace: true,
                  })
                }
              >
                Next
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function FilterSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: readonly string[];
  onChange: (value: string) => void;
}) {
  return (
    <div className="space-y-1">
      <Label className="text-xs">{label}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-40">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ANY}>Any</SelectItem>
          {options.map((option) => (
            <SelectItem key={option} value={option}>
              {option.replace(/_/g, " ")}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
