/**
 * Gate 3.7 · Tenant operations directory (cross-surface read composition).
 */
import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TenantOperationsTable } from "@/modules/platform/administration/components/TenantOperationsTable";
import {
  useTenantOperations,
  type TenantOpsQuery,
} from "@/modules/platform/administration/hooks/useAdministration";
import {
  ErrorState,
  LoadingState,
} from "@/modules/platform/provisioning/components/States";

const LIFECYCLE_STATES = [
  "all",
  "created",
  "active",
  "suspended",
  "maintenance",
  "archived",
  "pending_deletion",
  "deleted",
];

export const Route = createFileRoute("/_authenticated/platform/admin/tenants")({
  head: () => ({
    meta: [
      { title: "Tenant Operations — Business OS Platform" },
      {
        name: "description",
        content:
          "Operational directory of tenants with lifecycle, provisioning status and attention counts.",
      },
    ],
  }),
  component: TenantOperationsPage,
});

function TenantOperationsPage() {
  const [query, setQuery] = React.useState<TenantOpsQuery>({
    lifecycleState: "all",
    sortBy: "updatedAt",
    sortDir: "desc",
    pageSize: 50,
  });
  const tenants = useTenantOperations(query);

  return (
    <div className="space-y-6 p-6">
      <header>
        <h1 className="text-xl font-semibold">Tenant operations</h1>
        <p className="text-sm text-muted-foreground">
          Read-only view. Lifecycle actions remain on the tenant record, which owns
          state transitions and their audit trail.
        </p>
      </header>

      <div className="flex flex-wrap gap-2">
        <Input
          className="w-64"
          placeholder="Search name, slug or code"
          aria-label="Search tenants"
          value={query.search ?? ""}
          onChange={(event) =>
            setQuery((q) => ({ ...q, search: event.target.value, page: 1 }))
          }
        />
        <Select
          value={query.lifecycleState ?? "all"}
          onValueChange={(value) =>
            setQuery((q) => ({ ...q, lifecycleState: value, page: 1 }))
          }
        >
          <SelectTrigger className="w-52" aria-label="Filter by lifecycle state">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {LIFECYCLE_STATES.map((state) => (
              <SelectItem key={state} value={state}>
                {state === "all" ? "All lifecycle states" : state}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {tenants.isPending ? (
        <LoadingState label="Loading tenant operations" />
      ) : tenants.error ? (
        <ErrorState error={tenants.error} />
      ) : (
        <>
          <TenantOperationsTable rows={tenants.data?.rows ?? []} />
          <p className="text-xs text-muted-foreground">
            Showing {tenants.data?.rows.length ?? 0} of {tenants.data?.total ?? 0} tenants.
          </p>
        </>
      )}
    </div>
  );
}
