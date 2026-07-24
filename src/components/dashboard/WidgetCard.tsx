import type { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface WidgetCardProps {
  title?: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
  contentClassName?: string;
  children: ReactNode;
}

/**
 * SPR-PLT-0005 — Generic dashboard widget container.
 * Presentational only. Consumers pass data via `children`.
 */
export function WidgetCard({
  title,
  description,
  actions,
  className,
  contentClassName,
  children,
}: WidgetCardProps) {
  return (
    <Card className={cn("h-full flex flex-col", className)}>
      {(title || actions) && (
        <CardHeader className="flex flex-row items-start justify-between gap-2 space-y-0 pb-3">
          <div className="min-w-0">
            {title && <CardTitle className="text-sm font-medium">{title}</CardTitle>}
            {description && (
              <CardDescription className="mt-1 text-xs">{description}</CardDescription>
            )}
          </div>
          {actions && <div className="flex shrink-0 items-center gap-1">{actions}</div>}
        </CardHeader>
      )}
      <CardContent className={cn("flex-1", contentClassName)}>{children}</CardContent>
    </Card>
  );
}
