import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { ProviderHealthDTO } from "../types";

const TONE: Record<ProviderHealthDTO["status"], string> = {
  healthy: "bg-emerald-500/15 text-emerald-600 border-emerald-500/30",
  degraded: "bg-amber-500/15 text-amber-600 border-amber-500/30",
  unavailable: "bg-destructive/15 text-destructive border-destructive/30",
  unknown: "bg-muted text-muted-foreground border-border",
};

export function ProviderHealthCard({ health }: { health: ProviderHealthDTO }) {
  const caps = Object.entries(health.capabilities)
    .filter(([, enabled]) => enabled)
    .map(([key]) => key.replace(/^supports/, ""));

  return (
    <Card>
      <CardHeader className="flex-row items-start justify-between gap-4 space-y-0">
        <div>
          <CardTitle className="text-base">{health.displayName}</CardTitle>
          <CardDescription>{health.message}</CardDescription>
        </div>
        <Badge variant="outline" className={TONE[health.status]}>
          {health.status}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-3">
        <dl className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
          <div>
            <dt className="text-xs text-muted-foreground">Total jobs</dt>
            <dd className="tabular-nums">{health.statistics.total}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Succeeded</dt>
            <dd className="tabular-nums">{health.statistics.succeeded}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Failed</dt>
            <dd className="tabular-nums">{health.statistics.failed}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Success rate</dt>
            <dd className="tabular-nums">{health.statistics.successRate}%</dd>
          </div>
        </dl>
        <div className="flex flex-wrap gap-2">
          {caps.map((cap) => (
            <Badge key={cap} variant="secondary" className="text-xs">
              {cap}
            </Badge>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">
          Statistics are historical, derived from stored jobs — not a live probe. Checked{" "}
          {new Date(health.checkedAt).toLocaleString()}.
        </p>
      </CardContent>
    </Card>
  );
}
