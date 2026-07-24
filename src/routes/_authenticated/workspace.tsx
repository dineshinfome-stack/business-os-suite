import { createFileRoute, redirect } from "@tanstack/react-router";

// Redirect shim: /workspace → /tenant (kept for old bookmarks).
export const Route = createFileRoute("/_authenticated/workspace")({
  beforeLoad: () => {
    throw redirect({ to: "/tenant", replace: true });
  },
});
