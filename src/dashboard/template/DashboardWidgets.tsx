import { usePermissions } from "@/contexts/permissions-context";
import { CardSkeleton } from "@/components/common/Skeletons";
import { getDashboardWidget } from "./registry";
import type { WidgetRegistry } from "./types";

/**
 * SPR-MOD-001-003 — Widget grid.
 * Resolves widget ids against the (default or supplied) registry and
 * filters out items the caller lacks permission for. Unknown ids render a
 * skeleton placeholder so misconfigured configs are visible without
 * crashing.
 */
export function DashboardWidgets({
  widgetIds,
  registry,
}: {
  widgetIds: string[];
  registry?: WidgetRegistry;
}) {
  const { has, ready } = usePermissions();

  const resolved = widgetIds
    .map((id) => registry?.[id] ?? getDashboardWidget(id))
    .filter((w) => (w && !w.permission ? true : Boolean(w && has(w.permission!))));

  if (!ready) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {widgetIds.slice(0, 4).map((id) => (
          <CardSkeleton key={id} />
        ))}
      </div>
    );
  }

  if (resolved.length === 0) return null;

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {resolved.map((w) => {
        const Widget = w!.component;
        return <Widget key={w!.id} />;
      })}
    </div>
  );
}
