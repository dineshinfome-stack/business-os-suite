/**
 * Gate 3.8 — Activation audit history.
 *
 * Reuses the existing composed onboarding activity read model (audit_logs +
 * onboarding steps). No second audit store is created here.
 */
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { TenantOnboardingActivityDTO } from "@/lib/tenant-onboarding/types/v1";

export function ActivationAuditSkeleton() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Activity</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </CardContent>
    </Card>
  );
}

export function ActivationAudit({
  entries,
  includesAuditEntries,
}: {
  entries: TenantOnboardingActivityDTO[];
  includesAuditEntries: boolean;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-3">
        <CardTitle>Activity</CardTitle>
        {!includesAuditEntries && (
          <Badge variant="outline">Step events only</Badge>
        )}
      </CardHeader>
      <CardContent>
        {entries.length === 0 ? (
          <p className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
            No activity has been recorded for this tenant yet.
          </p>
        ) : (
          <ol className="space-y-3" data-testid="activation-audit">
            {entries.map((entry) => (
              <li key={entry.id} className="flex flex-col gap-1 border-l-2 pl-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-medium">{entry.label}</span>
                  <Badge
                    variant={entry.tone === "danger" ? "destructive" : "secondary"}
                  >
                    {entry.tone}
                  </Badge>
                  <time
                    className="text-xs text-muted-foreground"
                    dateTime={entry.occurredAt}
                  >
                    {new Date(entry.occurredAt).toLocaleString()}
                  </time>
                </div>
                <p className="text-sm text-muted-foreground">{entry.description}</p>
              </li>
            ))}
          </ol>
        )}
      </CardContent>
    </Card>
  );
}
