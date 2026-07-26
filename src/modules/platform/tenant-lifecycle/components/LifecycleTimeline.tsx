/**
 * Gate 3.6 — Unified tenant timeline (lifecycle + provisioning history).
 */
import { Badge } from "@/components/ui/badge";
import type { TimelineEntry } from "@/lib/tenant-lifecycle/timeline";

export function LifecycleTimeline({
  entries,
  isLoading,
}: {
  entries: readonly TimelineEntry[];
  isLoading?: boolean;
}) {
  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Loading history…</p>;
  }
  if (entries.length === 0) {
    return <p className="text-sm text-muted-foreground">No history recorded yet.</p>;
  }

  return (
    <ol className="space-y-3" data-testid="lifecycle-timeline">
      {entries.map((entry) => (
        <li
          key={entry.id}
          className="flex items-start gap-3 border-l-2 border-border pl-4"
        >
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-sm">{entry.action}</span>
              <Badge variant={entry.source === "provisioning" ? "outline" : "secondary"}>
                {entry.source}
              </Badge>
              {entry.fromState && entry.toState && (
                <span className="text-xs text-muted-foreground">
                  {entry.fromState} → {entry.toState}
                </span>
              )}
            </div>
            {typeof entry.detail.reason === "string" && (
              <p className="mt-1 text-sm text-muted-foreground">
                {entry.detail.reason}
              </p>
            )}
          </div>
          <time className="shrink-0 text-xs text-muted-foreground">
            {new Date(entry.at).toLocaleString()}
          </time>
        </li>
      ))}
    </ol>
  );
}
