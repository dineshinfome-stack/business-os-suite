import { Link } from "@tanstack/react-router";
import { useModuleLauncher } from "@/hooks/navigation/useModuleLauncher";
import { useNavPreferences } from "@/hooks/navigation/useNavPreferences";
import { Card } from "@/components/ui/card";
import { LayoutGrid, List } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Module Launcher — grid or list view of top-level modules, respects
 * user's `module_launcher_view` preference.
 */
export function ModuleLauncher() {
  const modules = useModuleLauncher();
  const { preferences, update } = useNavPreferences();
  const view = preferences.module_launcher_view;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Modules</h2>
        <div className="flex gap-1">
          <Button
            size="sm"
            variant={view === "grid" ? "default" : "ghost"}
            onClick={() => update({ module_launcher_view: "grid" })}
            aria-label="Grid view"
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant={view === "list" ? "default" : "ghost"}
            onClick={() => update({ module_launcher_view: "list" })}
            aria-label="List view"
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {view === "grid" ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {modules.map((m) => {
            const route = m.route ?? m.children.find((c) => c.route)?.route;
            if (!route) return null;
            return (
              <Link key={m.id} to={route}>
                <Card className="flex h-24 flex-col items-center justify-center gap-2 p-4 transition hover:border-primary hover:shadow-sm">
                  {m.icon && <m.icon className="h-6 w-6 text-primary" />}
                  <span className="text-sm font-medium">{m.title}</span>
                </Card>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="space-y-1">
          {modules.map((m) => {
            const route = m.route ?? m.children.find((c) => c.route)?.route;
            if (!route) return null;
            return (
              <Link
                key={m.id}
                to={route}
                className="flex items-center gap-3 rounded-md border border-transparent px-3 py-2 hover:border-border hover:bg-accent"
              >
                {m.icon && <m.icon className="h-4 w-4 text-primary" />}
                <span className="text-sm font-medium">{m.title}</span>
                <span className="ml-auto text-xs text-muted-foreground">
                  {m.children.length} item{m.children.length === 1 ? "" : "s"}
                </span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
