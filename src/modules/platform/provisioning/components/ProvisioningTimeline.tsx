import { cn } from "@/lib/utils";
import type { ProvisioningTimelineEntryDTO } from "../types";
import { EmptyState } from "./States";

const TONE: Record<ProvisioningTimelineEntryDTO["tone"], string> = {
  neutral: "bg-muted-foreground",
  success: "bg-emerald-500",
  warning: "bg-amber-500",
  danger: "bg-destructive",
};

export function ProvisioningTimeline({
  entries,
}: {
  entries: ProvisioningTimelineEntryDTO[];
}) {
  if (entries.length === 0) {
    return <EmptyState message="No provisioning activity recorded yet." />;
  }

  return (
    <ol className="relative space-y-4 border-l pl-6">
      {entries.map((entry) => (
        <li key={entry.id} className="relative">
          <span
            aria-hidden
            className={cn(
              "absolute -left-[1.6rem] top-1.5 h-2.5 w-2.5 rounded-full",
              TONE[entry.tone],
            )}
          />
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <p className="text-sm font-medium">{entry.label}</p>
            <time className="text-xs text-muted-foreground" dateTime={entry.at}>
              {new Date(entry.at).toLocaleString()}
            </time>
          </div>
          <p className="text-sm text-muted-foreground">{entry.description}</p>
          {entry.durationMs !== null ? (
            <p className="text-xs text-muted-foreground">
              Duration {Math.round(entry.durationMs / 1000)}s
            </p>
          ) : null}
        </li>
      ))}
    </ol>
  );
}
