import type { ReactNode } from "react";
import { Inbox, Search, ShieldAlert, Clock, Wrench } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-lg border border-dashed border-border p-10 text-center",
        className,
      )}
    >
      <div className="text-muted-foreground">{icon ?? <Inbox className="h-10 w-10" />}</div>
      <h3 className="mt-4 text-base font-medium text-foreground">{title}</h3>
      {description && <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export const NoData = (p: Partial<EmptyStateProps>) => (
  <EmptyState title="No data" description="There's nothing here yet." {...p} />
);

export const NoSearchResults = (p: Partial<EmptyStateProps>) => (
  <EmptyState
    icon={<Search className="h-10 w-10" />}
    title="No results"
    description="Try a different search or clear filters."
    {...p}
  />
);

export const NoPermission = (p: Partial<EmptyStateProps>) => (
  <EmptyState
    icon={<ShieldAlert className="h-10 w-10" />}
    title="No permission"
    description="You don't have access to view this content."
    {...p}
  />
);

export const ComingSoon = (p: Partial<EmptyStateProps>) => (
  <EmptyState
    icon={<Clock className="h-10 w-10" />}
    title="Coming soon"
    description="This feature is on the roadmap."
    {...p}
  />
);

export const UnderDevelopment = (p: Partial<EmptyStateProps>) => (
  <EmptyState
    icon={<Wrench className="h-10 w-10" />}
    title="Under development"
    description="We're actively building this."
    {...p}
  />
);
