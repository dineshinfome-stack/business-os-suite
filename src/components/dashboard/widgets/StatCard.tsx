import type { LucideIcon } from "lucide-react";
import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface StatCardProps {
  label: string;
  value: string | number;
  delta?: { value: string; direction: "up" | "down" | "flat" };
  icon?: LucideIcon;
  hint?: string;
  sample?: boolean;
}

/**
 * SPR-PLT-0005 — KPI stat card. Number-first, trend + hint below.
 */
export function StatCard({ label, value, delta, icon: Icon, hint, sample }: StatCardProps) {
  const DeltaIcon =
    delta?.direction === "up" ? ArrowUpRight : delta?.direction === "down" ? ArrowDownRight : Minus;
  const deltaTone =
    delta?.direction === "up"
      ? "text-brand-success"
      : delta?.direction === "down"
        ? "text-destructive"
        : "text-muted-foreground";

  return (
    <Card className="relative overflow-hidden">
      <CardContent className="pt-6">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {label}
            </p>
            <p className="mt-2 text-3xl font-semibold tracking-tight tabular-nums">{value}</p>
            {delta && (
              <p className={cn("mt-2 flex items-center gap-1 text-xs font-medium", deltaTone)}>
                <DeltaIcon className="h-3.5 w-3.5" />
                <span>{delta.value}</span>
                {hint && <span className="text-muted-foreground">· {hint}</span>}
              </p>
            )}
            {!delta && hint && <p className="mt-2 text-xs text-muted-foreground">{hint}</p>}
          </div>
          {Icon && (
            <div className="rounded-md bg-primary/10 p-2 text-primary">
              <Icon className="h-4 w-4" />
            </div>
          )}
        </div>
        {sample && (
          <span className="absolute right-2 top-2 rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
            Sample
          </span>
        )}
      </CardContent>
    </Card>
  );
}
