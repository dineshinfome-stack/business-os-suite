import type { ReactNode } from "react";

export interface DashboardHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
}

/**
 * SPR-MOD-001-003 — Presentational dashboard header.
 * The wrapping `PageContainer` still owns the outer heading; this component
 * is used inside templates that render their own header (e.g. embedded
 * module dashboards).
 */
export function DashboardHeader({ title, description, actions }: DashboardHeaderProps) {
  return (
    <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}
