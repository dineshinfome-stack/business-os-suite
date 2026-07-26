/**
 * Gate 3.7 · Operations overview cards + platform health matrix.
 * Presentation only — every value arrives as a DTO.
 */
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type {
  PlatformHealthSectionDTO,
  PlatformOperationsSummaryDTO,
} from "@/modules/platform/administration/types";

function Metric({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-lg border p-4">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-semibold tabular-nums">{value}</p>
    </div>
  );
}

export function OperationsSummaryCards({
  summary,
}: {
  summary: PlatformOperationsSummaryDTO;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <Metric label="Tenants" value={summary.tenants.total} />
      <Metric label="Active tenants" value={summary.tenants.active} />
      <Metric label="In maintenance" value={summary.tenants.maintenance} />
      <Metric label="Pending deletion" value={summary.tenants.pendingDeletion} />
      <Metric label="Queued jobs" value={summary.provisioning.queued} />
      <Metric label="Running jobs" value={summary.provisioning.running} />
      <Metric label="Failed jobs" value={summary.provisioning.failed} />
      <Metric label="Needs attention" value={summary.attention.total} />
    </div>
  );
}

const STATUS_VARIANT: Record<
  PlatformHealthSectionDTO["status"],
  "default" | "secondary" | "destructive" | "outline"
> = {
  ok: "secondary",
  attention: "destructive",
  unavailable: "outline",
};

export function PlatformHealthMatrix({
  sections,
}: {
  sections: PlatformHealthSectionDTO[];
}) {
  return (
    <div className="grid gap-3 md:grid-cols-2">
      {sections.map((section) => (
        <Card key={section.key}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{section.label}</CardTitle>
            <Badge variant={STATUS_VARIANT[section.status]}>{section.status}</Badge>
          </CardHeader>
          <CardContent className="space-y-1">
            <p className="text-sm text-muted-foreground">{section.detail}</p>
            <p className="text-xs text-muted-foreground">
              Owning module: {section.owner} ·{" "}
              {section.measuredAt
                ? `measured ${new Date(section.measuredAt).toLocaleString()}`
                : "no persisted measurement"}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
