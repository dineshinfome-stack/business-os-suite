import type { ReactNode } from "react";
import { APP_VERSION } from "@/constants/app";

/**
 * Board Rec 4 — Sidebar Footer contract.
 *
 * A stable grid with five named slots: version, environment, documentation,
 * feedback, systemStatus. Defaults render version + environment today; other
 * slots stay reserved so future additions don't shift the sidebar layout.
 */
export interface SidebarFooterProps {
  version?: ReactNode;
  environment?: ReactNode;
  documentation?: ReactNode;
  feedback?: ReactNode;
  systemStatus?: ReactNode;
}

export function SidebarFooter({
  version,
  environment,
  documentation,
  feedback,
  systemStatus,
}: SidebarFooterProps = {}) {
  const versionNode = version ?? <span>Business OS · v{APP_VERSION}</span>;
  const environmentNode =
    environment ??
    (import.meta.env.MODE !== "production" ? (
      <span
        className="rounded px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wider"
        style={{ background: "var(--nav-hover)", color: "var(--nav-fg-strong)" }}
      >
        {import.meta.env.MODE}
      </span>
    ) : null);

  return (
    <div
      className="grid grid-cols-[1fr_auto] items-center gap-x-2 gap-y-1 px-3 py-2 text-[10px]"
      style={{
        color: "var(--nav-fg-muted)",
        borderTop: "1px solid var(--nav-border)",
      }}
      role="contentinfo"
      aria-label="Sidebar footer"
    >
      <div className="min-w-0 truncate" data-slot="version">
        {versionNode}
      </div>
      <div className="justify-self-end" data-slot="environment">
        {environmentNode}
      </div>
      {/* Reserved slots: rendered only when provided. Keep them in the DOM
          order that future designs expect so ARIA and CSS remain stable. */}
      {documentation ? (
        <div className="col-span-2" data-slot="documentation">
          {documentation}
        </div>
      ) : null}
      {feedback ? (
        <div className="col-span-2" data-slot="feedback">
          {feedback}
        </div>
      ) : null}
      {systemStatus ? (
        <div className="col-span-2" data-slot="system-status">
          {systemStatus}
        </div>
      ) : null}
    </div>
  );
}
