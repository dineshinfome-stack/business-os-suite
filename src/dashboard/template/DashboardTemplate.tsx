/**
 * SPR-MOD-001-003 — Enterprise Dashboard Template.
 *
 * <DashboardTemplate context="tenant"|"platform"|... config={...} />
 *
 * All Platform, Tenant, Company, Branch, and future module dashboards
 * render through this single component. Composition is driven by the
 * supplied config; permission gating is applied automatically.
 */
import { PageContainer } from "@/components/layout/AppShell";
import { DashboardSection } from "@/components/dashboard/Dashboard";
import { DashboardQuickActions } from "./DashboardQuickActions";
import { DashboardRecentActivity } from "./DashboardRecentActivity";
import { DashboardNotifications } from "./DashboardNotifications";
import { DashboardWidgets } from "./DashboardWidgets";
import type { DashboardTemplateProps, QuickAction } from "./types";

const DEFAULT_QUICK_ACTIONS: QuickAction[] = [
  { id: "new", label: "New", disabled: true },
  { id: "import", label: "Import", disabled: true },
  { id: "reports", label: "Reports", disabled: true },
];

export function DashboardTemplate({ context, config, registry }: DashboardTemplateProps) {
  const quickActionsEnabled = Boolean(config.quickActions);
  const quickActionsItems: QuickAction[] =
    typeof config.quickActions === "object" && config.quickActions
      ? config.quickActions.items
      : DEFAULT_QUICK_ACTIONS;

  const showTopRow =
    quickActionsEnabled || Boolean(config.recentActivity) || Boolean(config.notifications);

  return (
    <PageContainer
      title={config.title}
      description={config.description}
      actions={config.headerActions}
      data-dashboard-context={context}
    >
      {showTopRow && (
        <div className="grid gap-4 lg:grid-cols-3">
          {quickActionsEnabled && <DashboardQuickActions items={quickActionsItems} />}
          {config.recentActivity && <DashboardRecentActivity />}
          {config.notifications && <DashboardNotifications />}
        </div>
      )}

      {config.widgets && config.widgets.length > 0 && (
        <DashboardSection title="Widgets">
          <DashboardWidgets widgetIds={config.widgets} registry={registry} />
        </DashboardSection>
      )}

      {config.footer}
    </PageContainer>
  );
}
