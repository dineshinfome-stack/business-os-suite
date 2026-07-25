import { EmptyState } from "@/components/common/EmptyState";

export function DashboardEmptyState({
  title = "Nothing to show yet",
  description = "Widgets will appear here as data becomes available.",
}: {
  title?: string;
  description?: string;
}) {
  return <EmptyState title={title} description={description} />;
}
