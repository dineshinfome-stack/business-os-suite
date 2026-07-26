import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ProvisioningSummaryDTO } from "../types";

function formatDuration(ms: number | null): string {
  if (ms === null) return "—";
  const minutes = Math.round(ms / 60_000);
  if (minutes < 1) return "<1 min";
  return `${minutes} min`;
}

export function SummaryCards({ summary }: { summary: ProvisioningSummaryDTO }) {
  const cards = [
    { label: "Total jobs", value: summary.total },
    { label: "Active", value: summary.active },
    { label: "Completed", value: summary.completed },
    { label: "Failed", value: summary.failed },
    { label: "Success rate", value: `${summary.successRate}%` },
    { label: "Avg. duration", value: formatDuration(summary.averageDurationMs) },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {cards.map((card) => (
        <Card key={card.label}>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {card.label}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold tabular-nums">{card.value}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
