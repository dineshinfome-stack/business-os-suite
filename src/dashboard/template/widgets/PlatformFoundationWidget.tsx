/**
 * Phase 1 — Platform Foundation placeholder widget.
 */
import { getPlatformMetadata } from "@/lib/platform";
import { registerDashboardWidget } from "@/dashboard/template/registry";

export function PlatformFoundationWidget() {
  const meta = getPlatformMetadata();
  return (
    <div className="rounded-md border border-dashed bg-muted/30 p-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm font-semibold text-foreground">
            Tenant Registry
          </div>
          <div className="text-xs text-muted-foreground">
            {meta.moduleName} · Foundation v{meta.version}
          </div>
        </div>
        <span className="rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
          Coming in Phase 2
        </span>
      </div>
      <p className="mt-3 text-xs text-muted-foreground">
        The Platform foundation is in place. Tenant Registry, Provisioning,
        and Lifecycle surfaces arrive in the next phases. This placeholder
        intentionally shows no metrics.
      </p>
    </div>
  );
}

registerDashboardWidget({
  id: "platform.foundation.placeholder",
  title: "Tenant Registry",
  component: PlatformFoundationWidget,
  permission: "platform.dashboard.view",
});
