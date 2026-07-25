import { Link } from "@tanstack/react-router";

/**
 * Business OS brand mark. Mirrors the PlatformTopBar wordmark but sized for
 * the tenant header.
 */
export function BusinessOsLogo({ to = "/settings/platform" }: { to?: string }) {
  return (
    <Link to={to} aria-label="Business OS home" className="flex items-center gap-2">
      <span
        className="flex h-7 w-7 items-center justify-center rounded-md text-sm font-bold text-white"
        style={{ background: "var(--brand-red)" }}
        aria-hidden
      >
        B
      </span>
      <span className="hidden items-baseline gap-1 text-[15px] font-semibold tracking-tight md:flex">
        <span className="text-foreground">business</span>
        <span style={{ color: "var(--brand-red)" }}>os</span>
      </span>
    </Link>
  );
}
