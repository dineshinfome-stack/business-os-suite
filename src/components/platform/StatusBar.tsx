import { APP_NAME, APP_VERSION } from "@/constants/app";
import { useOrg } from "@/contexts/org-context";

/**
 * SPR-PLT-0005 — Application status bar (footer).
 */
export function StatusBar() {
  const org = useOrg();
  return (
    <footer
      role="contentinfo"
      className="flex items-center justify-between border-t border-border bg-surface-2 px-4 py-1.5 text-[11px] text-muted-foreground"
    >
      <div className="flex items-center gap-3">
        <span className="font-medium text-foreground">{APP_NAME}</span>
        <span>v{APP_VERSION}</span>
      </div>
      <div className="flex items-center gap-3">
        {org.current && <span className="truncate">Tenant: {org.current.name}</span>}
        <span className="hidden items-center gap-1 md:inline-flex">
          <span className="h-1.5 w-1.5 rounded-full bg-brand-success" aria-hidden />
          Connected
        </span>
      </div>
    </footer>
  );
}
