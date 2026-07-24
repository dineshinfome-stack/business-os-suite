import { createFileRoute, redirect } from "@tanstack/react-router";
import { z } from "zod";

// Redirect shim: /workspace/accept → /tenant/accept (preserves ?token=).
const search = z.object({ token: z.string().optional() });

export const Route = createFileRoute("/_authenticated/workspace/accept")({
  validateSearch: (s) => search.parse(s),
  beforeLoad: ({ search }) => {
    throw redirect({
      to: "/tenant/accept",
      search: { token: search.token },
      replace: true,
    });
  },
});
