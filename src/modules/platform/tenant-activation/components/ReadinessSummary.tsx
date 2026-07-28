/**
 * Gate 3.8 — Readiness summary card. Displays backend-computed values only.
 */
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { TenantOnboardingReadinessDTO } from "@/lib/tenant-onboarding/types/v1";
import { overallStatusLabel } from "../reason-text";

export function ReadinessSummarySkeleton() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Readiness</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {Array.from({ length: 7 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </CardContent>
    </Card>
  );
}

function Metric({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wide text-muted-foreground">
        {label}
      </div>
      <div className="mt-1 text-sm font-medium">{value}</div>
    </div>
  );
}

export function ReadinessSummary({
  readiness,
}: {
  readiness: TenantOnboardingReadinessDTO;
}) {
  const passedCount = readiness.checks.filter((c) => c.status === "pass").length;
  const tone =
    readiness.overallStatus === "ready"
      ? "default"
      : readiness.overallStatus === "ready_with_warnings"
        ? "secondary"
        : "destructive";

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-3">
        <CardTitle>Tenant readiness</CardTitle>
        <Badge variant={tone} data-testid="readiness-overall">
          <span className="sr-only">Overall readiness status: </span>
          {overallStatusLabel(readiness.overallStatus)}
        </Badge>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
        <Metric
          label="Blocking"
          value={<span data-testid="blocking-count">{readiness.blockingCount}</span>}
        />
        <Metric
          label="Warnings"
          value={<span data-testid="warning-count">{readiness.warningCount}</span>}
        />
        <Metric
          label="Passed"
          value={<span data-testid="passed-count">{passedCount}</span>}
        />
        <Metric
          label="Applicable"
          value={<span data-testid="applicable-count">{readiness.applicableCount}</span>}
        />
        <Metric
          label="Last evaluated"
          value={
            readiness.evaluatedAt
              ? new Date(readiness.evaluatedAt).toLocaleString()
              : "Never"
          }
        />
        <Metric label="Workflow version" value={readiness.workflowVersion} />
        <Metric
          label="Evaluation"
          value={readiness.evaluationStatus.replace(/_/g, " ")}
        />
        <Metric label="Contract" value={readiness.contractVersion} />
      </CardContent>
    </Card>
  );
}
