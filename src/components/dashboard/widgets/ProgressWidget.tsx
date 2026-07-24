import { WidgetCard } from "@/components/dashboard/WidgetCard";
import { Progress } from "@/components/ui/progress";

export interface ProgressRow {
  label: string;
  value: number; // 0..100
  right?: string;
}

export function ProgressWidget({
  title,
  rows,
}: {
  title: string;
  rows: ProgressRow[];
}) {
  return (
    <WidgetCard title={title}>
      <div className="space-y-4">
        {rows.map((r) => (
          <div key={r.label}>
            <div className="mb-1 flex items-center justify-between text-xs">
              <span className="truncate font-medium">{r.label}</span>
              {r.right && <span className="text-muted-foreground tabular-nums">{r.right}</span>}
            </div>
            <Progress value={r.value} className="h-2" />
          </div>
        ))}
      </div>
    </WidgetCard>
  );
}
