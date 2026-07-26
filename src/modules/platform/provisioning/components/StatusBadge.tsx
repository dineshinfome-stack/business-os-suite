import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { ProvisioningStatusDTO } from "../types";

const STATUS_STYLES: Record<ProvisioningStatusDTO, string> = {
  provisioned: "bg-emerald-500/15 text-emerald-600 border-emerald-500/30",
  in_progress: "bg-sky-500/15 text-sky-600 border-sky-500/30",
  failed: "bg-destructive/15 text-destructive border-destructive/30",
  not_started: "bg-muted text-muted-foreground border-border",
};

const STATUS_LABELS: Record<ProvisioningStatusDTO, string> = {
  provisioned: "Provisioned",
  in_progress: "In progress",
  failed: "Failed",
  not_started: "Not started",
};

export function StatusBadge({
  status,
  state,
  className,
}: {
  status: ProvisioningStatusDTO;
  state?: string;
  className?: string;
}) {
  return (
    <Badge
      variant="outline"
      className={cn("font-medium capitalize", STATUS_STYLES[status], className)}
    >
      {state ? state.replace(/_/g, " ") : STATUS_LABELS[status]}
    </Badge>
  );
}
