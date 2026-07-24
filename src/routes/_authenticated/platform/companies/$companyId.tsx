import * as React from "react";
import { createFileRoute, useParams, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import type { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";

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
import { DataGrid } from "@/components/tables/DataGrid";
import { Can } from "@/components/auth/Can";
import { PERMISSIONS } from "@/lib/generated/permission-keys";

import {
  listCompanies,
  activateCompany,
  deactivateCompany,
  archiveCompany,
  setDefaultCompany,
} from "@/lib/organizations/company.functions";
import {
  canTransition as canCompanyTransition,
  type CompanyLifecycleState,
} from "@/lib/organizations/lifecycle";
import {
  listBranches,
  createBranch,
  updateBranch,
  archiveBranch,
  setDefaultBranch,
} from "@/lib/branches/branch.functions";
import {
  canTransition as canBranchTransition,
  type BranchLifecycleState,
} from "@/lib/branches/lifecycle";
import {
  listFinancialYears,
  createFinancialYear,
  openFinancialYear,
  closeFinancialYear,
  archiveFinancialYear,
  setDefaultFinancialYear,
} from "@/lib/financial-years/financial-year.functions";
import {
  canTransition as canFyTransition,
  type FinancialYearLifecycleState,
} from "@/lib/financial-years/lifecycle";

export const Route = createFileRoute("/_authenticated/platform/companies/$companyId")({
  component: CompanyDetailPage,
  head: () => ({
    meta: [
      { title: "Company — Platform Administration" },
      {
        name: "description",
        content: "Manage a company's lifecycle, branches, and financial years.",
      },
    ],
  }),
});

type BranchRow = Awaited<ReturnType<typeof listBranches>>[number];
type FinancialYearRow = Awaited<ReturnType<typeof listFinancialYears>>[number];
type CompanyRow = Awaited<ReturnType<typeof listCompanies>>[number];

function CompanyDetailPage() {
  const { companyId } = useParams({
    from: "/_authenticated/platform/companies/$companyId",
  });
  const list = useServerFn(listCompanies);
  const activate = useServerFn(activateCompany);
  const deactivate = useServerFn(deactivateCompany);
  const archive = useServerFn(archiveCompany);
  const setDefault = useServerFn(setDefaultCompany);
  const qc = useQueryClient();

  // No dedicated getCompany server fn exists; derive from list. Filtering
  // on the client keeps this route consistent with the tenant-scoped Phase 2
  // read surface — no new backend needed.
  const companyKey = ["platform", "company", companyId] as const;
  const { data: company, isLoading } = useQuery({
    queryKey: companyKey,
    queryFn: async () => {
      const rows = await list({ data: {} });
      return (rows as CompanyRow[]).find((c) => c.id === companyId) ?? null;
    },
  });

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: companyKey });
    qc.invalidateQueries({ queryKey: ["platform", "tenant"] });
  };

  const activateMut = useMutation({
    mutationFn: () => activate({ data: { companyId } }),
    onSuccess: (r) => {
      toast.success(r.already_active ? "Already active" : "Company activated");
      invalidate();
    },
    onError: (e) => toast.error((e as Error).message),
  });
  const deactivateMut = useMutation({
    mutationFn: () => deactivate({ data: { companyId } }),
    onSuccess: (r) => {
      toast.success(r.already_inactive ? "Already inactive" : "Company deactivated");
      invalidate();
    },
    onError: (e) => toast.error((e as Error).message),
  });
  const archiveMut = useMutation({
    mutationFn: () => archive({ data: { companyId } }),
    onSuccess: (r) => {
      toast.success(r.already_archived ? "Already archived" : "Company archived");
      invalidate();
    },
    onError: (e) => toast.error((e as Error).message),
  });
  const defaultMut = useMutation({
    mutationFn: () => setDefault({ data: { companyId } }),
    onSuccess: (r) => {
      toast.success(r.already_default ? "Already default" : "Default company set");
      invalidate();
    },
    onError: (e) => toast.error((e as Error).message),
  });

  if (isLoading) return <div className="p-6 text-sm text-muted-foreground">Loading…</div>;
  if (!company) return <div className="p-6 text-sm">Company not found.</div>;

  const state = company.lifecycle_state as CompanyLifecycleState;

  return (
    <div className="space-y-6 p-6">
      <div>
        <Link
          to="/platform/tenants/$tenantId"
          params={{ tenantId: company.tenant_id }}
          className="text-sm text-muted-foreground hover:underline"
        >
          ← Tenant
        </Link>
        <div className="mt-2 flex items-center gap-3">
          <h1 className="text-2xl font-semibold tracking-tight">{company.name}</h1>
          <Badge variant="outline" className="font-mono">
            {company.slug}
          </Badge>
          <CompanyLifecycleBadge state={state} />
          {company.is_default && <Badge variant="secondary">Default</Badge>}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lifecycle actions</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Can permission={PERMISSIONS.PLATFORM_COMPANY_ACTIVATE}>
            <Button
              onClick={() => activateMut.mutate()}
              disabled={!canCompanyTransition(state, "active") || activateMut.isPending}
            >
              Activate
            </Button>
          </Can>
          <Can permission={PERMISSIONS.PLATFORM_COMPANY_DEACTIVATE}>
            <Button
              variant="secondary"
              onClick={() => deactivateMut.mutate()}
              disabled={
                !canCompanyTransition(state, "inactive") || deactivateMut.isPending
              }
            >
              Deactivate
            </Button>
          </Can>
          <Can permission={PERMISSIONS.PLATFORM_COMPANY_SET_DEFAULT}>
            <Button
              variant="outline"
              onClick={() => defaultMut.mutate()}
              disabled={company.is_default || defaultMut.isPending}
            >
              Set default
            </Button>
          </Can>
          <Can permission={PERMISSIONS.PLATFORM_COMPANY_ARCHIVE}>
            <Button
              variant="destructive"
              onClick={() => archiveMut.mutate()}
              disabled={
                !canCompanyTransition(state, "archived") || archiveMut.isPending
              }
            >
              Archive
            </Button>
          </Can>
        </CardContent>
      </Card>

      <Tabs defaultValue="branches" className="space-y-4">
        <TabsList>
          <TabsTrigger value="branches">Branches</TabsTrigger>
          <TabsTrigger value="financial-years">Financial Years</TabsTrigger>
        </TabsList>
        <TabsContent value="branches">
          <BranchesPanel companyId={companyId} />
        </TabsContent>
        <TabsContent value="financial-years">
          <FinancialYearsPanel companyId={companyId} />
        </TabsContent>
      </Tabs>
    </div>
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

// ────────────────────────────────────────────────────────────────────────
// Branches panel — SIP-016
// ────────────────────────────────────────────────────────────────────────

function BranchesPanel({ companyId }: { companyId: string }) {
  const list = useServerFn(listBranches);
  const create = useServerFn(createBranch);
  const update = useServerFn(updateBranch);
  const archive = useServerFn(archiveBranch);
  const setDefault = useServerFn(setDefaultBranch);
  const qc = useQueryClient();

  const key = ["platform", "company", companyId, "branches"] as const;
  const { data, isLoading } = useQuery({
    queryKey: key,
    queryFn: () => list({ data: { organizationId: companyId } }),
  });
  const invalidate = () => qc.invalidateQueries({ queryKey: key });

  const [createOpen, setCreateOpen] = React.useState(false);
  const [code, setCode] = React.useState("");
  const [name, setName] = React.useState("");
  const [timezone, setTimezone] = React.useState("UTC");
  const [isDefaultInput, setIsDefaultInput] = React.useState(false);

  const createMut = useMutation({
    mutationFn: () =>
      create({
        data: {
          organizationId: companyId,
          code,
          name,
          timezone,
          isDefault: isDefaultInput,
        },
      }),
    onSuccess: () => {
      toast.success("Branch created");
      invalidate();
      setCreateOpen(false);
      setCode("");
      setName("");
      setTimezone("UTC");
      setIsDefaultInput(false);
    },
    onError: (e) => toast.error((e as Error).message),
  });

  const [editing, setEditing] = React.useState<BranchRow | null>(null);
  const [editName, setEditName] = React.useState("");
  const [editTimezone, setEditTimezone] = React.useState("");

  React.useEffect(() => {
    if (editing) {
      setEditName(editing.name);
      setEditTimezone(editing.timezone ?? "");
    }
  }, [editing]);

  const updateMut = useMutation({
    mutationFn: () =>
      update({
        data: {
          branchId: editing!.id,
          name: editName,
          timezone: editTimezone || undefined,
        },
      }),
    onSuccess: () => {
      toast.success("Branch updated");
      invalidate();
      setEditing(null);
    },
    onError: (e) => toast.error((e as Error).message),
  });

  const archiveMut = useMutation({
    mutationFn: (branchId: string) => archive({ data: { branchId } }),
    onSuccess: (r) => {
      toast.success(r.already_archived ? "Already archived" : "Branch archived");
      invalidate();
    },
    onError: (e) => toast.error((e as Error).message),
  });
  const defaultMut = useMutation({
    mutationFn: (branchId: string) => setDefault({ data: { branchId } }),
    onSuccess: (r) => {
      toast.success(r.already_default ? "Already default" : "Default branch set");
      invalidate();
    },
    onError: (e) => toast.error((e as Error).message),
  });

  const columns = React.useMemo<ColumnDef<BranchRow, unknown>[]>(
    () => [
      { accessorKey: "name", header: "Name" },
      {
        accessorKey: "code",
        header: "Code",
        cell: ({ row }) => (
          <span className="font-mono text-sm">{row.original.code}</span>
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
          <BranchLifecycleBadge
            state={row.original.lifecycle_state as BranchLifecycleState}
          />
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
          const b = row.original;
          const state = b.lifecycle_state as BranchLifecycleState;
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <Can permission={PERMISSIONS.PLATFORM_BRANCH_UPDATE}>
                  <DropdownMenuItem
                    disabled={state !== "active"}
                    onClick={() => setEditing(b)}
                  >
                    Edit
                  </DropdownMenuItem>
                </Can>
                <Can permission={PERMISSIONS.PLATFORM_BRANCH_SET_DEFAULT}>
                  <DropdownMenuItem
                    disabled={b.is_default || state !== "active"}
                    onClick={() => defaultMut.mutate(b.id)}
                  >
                    Set default
                  </DropdownMenuItem>
                </Can>
                <Can permission={PERMISSIONS.PLATFORM_BRANCH_ARCHIVE}>
                  <DropdownMenuItem
                    disabled={!canBranchTransition(state, "archived")}
                    onClick={() => archiveMut.mutate(b.id)}
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
    [archiveMut, defaultMut],
  );

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Branches</CardTitle>
        <Can permission={PERMISSIONS.PLATFORM_BRANCH_CREATE}>
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button>New branch</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create branch</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <div className="space-y-2">
                  <Label htmlFor="branch-code">Code</Label>
                  <Input
                    id="branch-code"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="HQ"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="branch-name">Name</Label>
                  <Input
                    id="branch-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Headquarters"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="branch-timezone">Timezone</Label>
                  <Input
                    id="branch-timezone"
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                    placeholder="UTC"
                  />
                </div>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={isDefaultInput}
                    onChange={(e) => setIsDefaultInput(e.target.checked)}
                  />
                  Set as default branch
                </label>
              </div>
              <DialogFooter>
                <Button
                  disabled={!code || !name || createMut.isPending}
                  onClick={() => createMut.mutate()}
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

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit branch</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="edit-branch-name">Name</Label>
              <Input
                id="edit-branch-name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-branch-timezone">Timezone</Label>
              <Input
                id="edit-branch-timezone"
                value={editTimezone}
                onChange={(e) => setEditTimezone(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              disabled={!editName || updateMut.isPending}
              onClick={() => updateMut.mutate()}
            >
              {updateMut.isPending ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

function BranchLifecycleBadge({ state }: { state: BranchLifecycleState }) {
  const variant = state === "active" ? "default" : "outline";
  return <Badge variant={variant as never}>{state}</Badge>;
}

// ────────────────────────────────────────────────────────────────────────
// Financial Years panel — SIP-016
// ────────────────────────────────────────────────────────────────────────

function FinancialYearsPanel({ companyId }: { companyId: string }) {
  const list = useServerFn(listFinancialYears);
  const create = useServerFn(createFinancialYear);
  const open = useServerFn(openFinancialYear);
  const close = useServerFn(closeFinancialYear);
  const archive = useServerFn(archiveFinancialYear);
  const setDefault = useServerFn(setDefaultFinancialYear);
  const qc = useQueryClient();

  const key = ["platform", "company", companyId, "financial-years"] as const;
  const { data, isLoading } = useQuery({
    queryKey: key,
    queryFn: () => list({ data: { organizationId: companyId } }),
  });
  const invalidate = () => qc.invalidateQueries({ queryKey: key });

  const [createOpen, setCreateOpen] = React.useState(false);
  const [code, setCode] = React.useState("");
  const [startDate, setStartDate] = React.useState("");
  const [endDate, setEndDate] = React.useState("");
  const [isDefaultInput, setIsDefaultInput] = React.useState(false);

  const createMut = useMutation({
    mutationFn: () =>
      create({
        data: {
          organizationId: companyId,
          code,
          startDate,
          endDate,
          isDefault: isDefaultInput,
        },
      }),
    onSuccess: () => {
      toast.success("Financial year created");
      invalidate();
      setCreateOpen(false);
      setCode("");
      setStartDate("");
      setEndDate("");
      setIsDefaultInput(false);
    },
    onError: (e) => toast.error((e as Error).message),
  });

  const openMut = useMutation({
    mutationFn: (financialYearId: string) => open({ data: { financialYearId } }),
    onSuccess: (r) => {
      toast.success(r.already_open ? "Already open" : "Financial year opened");
      invalidate();
    },
    onError: (e) => toast.error((e as Error).message),
  });
  const closeMut = useMutation({
    mutationFn: (financialYearId: string) => close({ data: { financialYearId } }),
    onSuccess: (r) => {
      toast.success(r.already_closed ? "Already closed" : "Financial year closed");
      invalidate();
    },
    onError: (e) => toast.error((e as Error).message),
  });
  const archiveMut = useMutation({
    mutationFn: (financialYearId: string) => archive({ data: { financialYearId } }),
    onSuccess: (r) => {
      toast.success(r.already_archived ? "Already archived" : "Financial year archived");
      invalidate();
    },
    onError: (e) => toast.error((e as Error).message),
  });
  const defaultMut = useMutation({
    mutationFn: (financialYearId: string) => setDefault({ data: { financialYearId } }),
    onSuccess: (r) => {
      toast.success(r.already_default ? "Already default" : "Default financial year set");
      invalidate();
    },
    onError: (e) => toast.error((e as Error).message),
  });

  const columns = React.useMemo<ColumnDef<FinancialYearRow, unknown>[]>(
    () => [
      {
        accessorKey: "code",
        header: "Code",
        cell: ({ row }) => (
          <span className="font-mono text-sm">{row.original.code}</span>
        ),
      },
      {
        accessorKey: "start_date",
        header: "Start",
        cell: ({ row }) => row.original.start_date,
      },
      {
        accessorKey: "end_date",
        header: "End",
        cell: ({ row }) => row.original.end_date,
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
          <FinancialYearLifecycleBadge
            state={row.original.lifecycle_state as FinancialYearLifecycleState}
          />
        ),
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => {
          const fy = row.original;
          const state = fy.lifecycle_state as FinancialYearLifecycleState;
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <Can permission={PERMISSIONS.PLATFORM_FINANCIAL_YEAR_OPEN}>
                  <DropdownMenuItem
                    disabled={!canFyTransition(state, "open")}
                    onClick={() => openMut.mutate(fy.id)}
                  >
                    Open
                  </DropdownMenuItem>
                </Can>
                <Can permission={PERMISSIONS.PLATFORM_FINANCIAL_YEAR_CLOSE}>
                  <DropdownMenuItem
                    disabled={!canFyTransition(state, "closed")}
                    onClick={() => closeMut.mutate(fy.id)}
                  >
                    Close
                  </DropdownMenuItem>
                </Can>
                <Can permission={PERMISSIONS.PLATFORM_FINANCIAL_YEAR_SET_DEFAULT}>
                  <DropdownMenuItem
                    disabled={fy.is_default}
                    onClick={() => defaultMut.mutate(fy.id)}
                  >
                    Set default
                  </DropdownMenuItem>
                </Can>
                <Can permission={PERMISSIONS.PLATFORM_FINANCIAL_YEAR_ARCHIVE}>
                  <DropdownMenuItem
                    disabled={!canFyTransition(state, "archived")}
                    onClick={() => archiveMut.mutate(fy.id)}
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
    [openMut, closeMut, archiveMut, defaultMut],
  );

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Financial Years</CardTitle>
        <Can permission={PERMISSIONS.PLATFORM_FINANCIAL_YEAR_CREATE}>
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button>New financial year</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create financial year</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <div className="space-y-2">
                  <Label htmlFor="fy-code">Code</Label>
                  <Input
                    id="fy-code"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="FY2026"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="fy-start">Start date</Label>
                    <Input
                      id="fy-start"
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fy-end">End date</Label>
                    <Input
                      id="fy-end"
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                    />
                  </div>
                </div>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={isDefaultInput}
                    onChange={(e) => setIsDefaultInput(e.target.checked)}
                  />
                  Set as default financial year
                </label>
              </div>
              <DialogFooter>
                <Button
                  disabled={
                    !code || !startDate || !endDate || createMut.isPending
                  }
                  onClick={() => createMut.mutate()}
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

function FinancialYearLifecycleBadge({
  state,
}: {
  state: FinancialYearLifecycleState;
}) {
  const variant =
    state === "open"
      ? "default"
      : state === "closed"
        ? "secondary"
        : state === "archived"
          ? "outline"
          : "secondary";
  return <Badge variant={variant as never}>{state}</Badge>;
}
