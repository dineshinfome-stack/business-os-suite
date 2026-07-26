import * as React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { PROVISIONING_STATES } from "@/lib/provisioning/lifecycle";
import type { ProvisioningListQueryDTO } from "../types";

export function FilterPanel({
  filters,
  searchInput,
  onSearchChange,
  onChange,
  onExport,
  exporting,
}: {
  filters: ProvisioningListQueryDTO;
  searchInput: string;
  onSearchChange: (value: string) => void;
  onChange: (patch: Partial<ProvisioningListQueryDTO>) => void;
  onExport?: () => void;
  exporting?: boolean;
}) {
  const searchId = React.useId();

  return (
    <div className="flex flex-wrap items-end gap-3 rounded-lg border p-4">
      <div className="min-w-[16rem] flex-1 space-y-1.5">
        <Label htmlFor={searchId}>Search</Label>
        <Input
          id={searchId}
          value={searchInput}
          placeholder="Tenant, slug, job ID, correlation ID, provider"
          onChange={(event) => onSearchChange(event.target.value)}
        />
      </div>

      <div className="space-y-1.5">
        <Label>Status</Label>
        <Select
          value={filters.status ?? "all"}
          onValueChange={(value) =>
            onChange({ status: value as ProvisioningListQueryDTO["status"] })
          }
        >
          <SelectTrigger className="w-[11rem]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="not_started">Not started</SelectItem>
            <SelectItem value="in_progress">In progress</SelectItem>
            <SelectItem value="provisioned">Provisioned</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label>State</Label>
        <Select
          value={filters.state ?? "all"}
          onValueChange={(value) => onChange({ state: value })}
        >
          <SelectTrigger className="w-[13rem]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All states</SelectItem>
            {PROVISIONING_STATES.map((state) => (
              <SelectItem key={state} value={state}>
                {state.replace(/_/g, " ")}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label>Sort</Label>
        <Select
          value={filters.sortBy ?? "createdAt"}
          onValueChange={(value) =>
            onChange({ sortBy: value as ProvisioningListQueryDTO["sortBy"] })
          }
        >
          <SelectTrigger className="w-[12rem]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="createdAt">Created</SelectItem>
            <SelectItem value="lastTransitionAt">Last transition</SelectItem>
            <SelectItem value="tenantName">Tenant</SelectItem>
            <SelectItem value="state">State</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {onExport ? (
        <Button variant="outline" onClick={onExport} disabled={exporting}>
          {exporting ? "Exporting…" : "Export CSV"}
        </Button>
      ) : null}
    </div>
  );
}
