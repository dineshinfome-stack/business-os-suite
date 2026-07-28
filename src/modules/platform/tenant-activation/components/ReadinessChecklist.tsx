/**
 * Gate 3.8 — Readiness checklist.
 *
 * Renders the checks EXACTLY in the order supplied by the backend evaluator.
 * No local ordering, filtering or status derivation.
 */
import { AlertTriangle, CheckCircle2, Circle, MinusCircle, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { TenantOnboardingReadinessCheckDTO } from "@/lib/tenant-onboarding/types/v1";
import { checkRemediation, checkStatusLabel } from "../reason-text";

const ICONS = {
  pass: CheckCircle2,
  warning: AlertTriangle,
  blocked: XCircle,
  not_applicable: MinusCircle,
  not_evaluated: Circle,
} as const;

export function ReadinessChecklistSkeleton() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Readiness checks</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </CardContent>
    </Card>
  );
}

export function ReadinessChecklist({
  checks,
}: {
  checks: TenantOnboardingReadinessCheckDTO[];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Readiness checks</CardTitle>
      </CardHeader>
      <CardContent>
        {checks.length === 0 ? (
          <p className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
            Readiness has not been evaluated for this tenant yet. Use Refresh
            readiness to evaluate it.
          </p>
        ) : (
          <ul className="divide-y" data-testid="readiness-checklist">
            {checks.map((check) => {
              const Icon = ICONS[check.status] ?? Circle;
              return (
                <li
                  key={check.checkKey}
                  data-check-key={check.checkKey}
                  className="flex flex-col gap-1 py-3 md:flex-row md:items-start md:gap-4"
                >
                  <Icon
                    className={
                      check.status === "blocked"
                        ? "mt-0.5 h-4 w-4 shrink-0 text-destructive"
                        : check.status === "pass"
                          ? "mt-0.5 h-4 w-4 shrink-0 text-primary"
                          : "mt-0.5 h-4 w-4 shrink-0 text-muted-foreground"
                    }
                    aria-hidden
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-medium">{check.label}</span>
                      <Badge
                        variant={
                          check.status === "blocked"
                            ? "destructive"
                            : check.status === "pass"
                              ? "default"
                              : "secondary"
                        }
                      >
                        {checkStatusLabel(check.status)}
                      </Badge>
                      <Badge variant="outline">
                        {check.classification === "warning"
                          ? "warning"
                          : check.classification}
                      </Badge>
                      <code className="text-xs text-muted-foreground">
                        {check.reasonCode}
                      </code>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {checkRemediation(check)}
                    </p>
                    {check.deepLink && (
                      <a
                        href={check.deepLink}
                        className="mt-1 inline-block text-sm underline underline-offset-4"
                      >
                        Resolve this check
                      </a>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
