/**
 * Board Rec 7 — reserved footer slot. Future: version, environment,
 * documentation, feedback, status. Empty today but occupies its layout row.
 */
export function SidebarFooter() {
  return (
    <div
      className="px-4 py-2 text-[10px]"
      style={{
        color: "var(--nav-fg-muted)",
        borderTop: "1px solid var(--nav-border)",
      }}
    >
      Business OS · v1.0
    </div>
  );
}
