export { DashboardTemplate } from "./DashboardTemplate";
export { DashboardHeader } from "./DashboardHeader";
export { DashboardQuickActions } from "./DashboardQuickActions";
export { DashboardRecentActivity } from "./DashboardRecentActivity";
export { DashboardNotifications } from "./DashboardNotifications";
export { DashboardWidgets } from "./DashboardWidgets";
export { DashboardEmptyState } from "./DashboardEmptyState";
export {
  registerDashboardWidget,
  getDashboardWidget,
  getDashboardRegistry,
} from "./registry";
export type {
  DashboardContext,
  DashboardConfig,
  DashboardTemplateProps,
  QuickAction,
  WidgetRegistry,
  WidgetRegistryEntry,
} from "./types";
