import { Check, ChevronsUpDown, Building2 } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useOrg } from "@/contexts/org-context";
import { cn } from "@/lib/utils";

export function OrgSwitcher() {
  const { current, organizations, switchOrganization, status } = useOrg();
  const [switching, setSwitching] = useState<string | null>(null);

  if (status === "loading") {
    return (
      <div className="flex h-9 items-center gap-2 rounded-md border border-border/60 px-3 text-xs text-muted-foreground">
        <Building2 className="h-3.5 w-3.5" />
        Loading…
      </div>
    );
  }

  if (!current) {
    return (
      <div className="flex h-9 items-center gap-2 rounded-md border border-dashed border-border px-3 text-xs text-muted-foreground">
        <Building2 className="h-3.5 w-3.5" />
        No organization
      </div>
    );
  }

  const handleSelect = async (id: string) => {
    if (id === current.organizationId) return;
    setSwitching(id);
    try {
      await switchOrganization(id);
    } finally {
      setSwitching(null);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 max-w-[220px]">
          <Building2 className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate text-xs font-medium">{current.name}</span>
          <ChevronsUpDown className="ml-auto h-3.5 w-3.5 opacity-60" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[240px]">
        <DropdownMenuLabel className="text-xs text-muted-foreground">
          Organizations
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {organizations.map((org) => {
          const isCurrent = org.organizationId === current.organizationId;
          const isSwitching = switching === org.organizationId;
          return (
            <DropdownMenuItem
              key={org.organizationId}
              disabled={isSwitching}
              onSelect={(e) => {
                e.preventDefault();
                void handleSelect(org.organizationId);
              }}
              className="flex items-center gap-2"
            >
              <div className="flex flex-1 flex-col">
                <span className="truncate text-sm">{org.name}</span>
                <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
                  {org.role}
                </span>
              </div>
              <Check
                className={cn("h-4 w-4", isCurrent ? "opacity-100" : "opacity-0")}
              />
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
