import type { ReactNode } from "react";
import { WidgetCard } from "@/components/dashboard/WidgetCard";

export interface ActivityItem {
  id: string;
  icon?: ReactNode;
  title: string;
  meta?: string;
  timestamp: string;
}

export function ActivityFeedWidget({
  title = "Activity",
  items,
  emptyLabel = "No recent activity.",
}: {
  title?: string;
  items: ActivityItem[];
  emptyLabel?: string;
}) {
  return (
    <WidgetCard title={title} contentClassName="pt-0">
      {items.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted-foreground">{emptyLabel}</p>
      ) : (
        <ul className="divide-y divide-border">
          {items.map((i) => (
            <li key={i.id} className="flex items-start gap-3 py-3">
              {i.icon && <div className="mt-0.5 shrink-0 text-muted-foreground">{i.icon}</div>}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{i.title}</p>
                {i.meta && <p className="truncate text-xs text-muted-foreground">{i.meta}</p>}
              </div>
              <span className="shrink-0 text-xs text-muted-foreground">{i.timestamp}</span>
            </li>
          ))}
        </ul>
      )}
    </WidgetCard>
  );
}
