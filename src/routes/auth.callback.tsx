import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef } from "react";
import { z } from "zod";

import { supabase } from "@/integrations/supabase/client";
import { sanitizeNextPath } from "@/lib/sanitize-next-path";
import { notifyAuthError } from "@/lib/auth-errors";
import { logAuthEvent } from "@/lib/auth-audit";
import { AUTH_CALLBACK_HYDRATION_TIMEOUT_MS } from "@/constants/auth";

const searchSchema = z.object({
  next: z.string().optional(),
  error: z.string().optional(),
  error_description: z.string().optional(),
});

export const Route = createFileRoute("/auth/callback")({
  validateSearch: (s) => searchSchema.parse(s),
  head: () => ({
    meta: [
      { title: "Signing you in…" },
      { name: "description", content: "Completing authentication." },
    ],
  }),
  component: AuthCallbackPage,
});

function AuthCallbackPage() {
  const navigate = useNavigate();
  const search = Route.useSearch();
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    const next = sanitizeNextPath(search.next);

    if (search.error) {
      notifyAuthError(search.error === "access_denied" ? "oauth_cancelled" : "unknown");
      void navigate({ to: "/login", replace: true });
      return;
    }

    let settled = false;
    const timer = setTimeout(() => {
      if (settled) return;
      settled = true;
      sub.subscription.unsubscribe();
      notifyAuthError("oauth_timeout");
      void navigate({ to: "/login", replace: true });
    }, AUTH_CALLBACK_HYDRATION_TIMEOUT_MS);

    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (settled) return;
      if (event === "SIGNED_IN" && session) {
        settled = true;
        clearTimeout(timer);
        sub.subscription.unsubscribe();
        logAuthEvent("user_logged_in", { entityId: session.user.id });
        void navigate({ to: next, replace: true });
      }
    });

    // If the SDK finished hydration before we subscribed, resolve immediately.
    void supabase.auth.getSession().then(({ data }) => {
      if (settled || !data.session) return;
      settled = true;
      clearTimeout(timer);
      sub.subscription.unsubscribe();
      logAuthEvent("user_logged_in", { entityId: data.session.user.id });
      void navigate({ to: next, replace: true });
    });

    return () => {
      clearTimeout(timer);
      sub.subscription.unsubscribe();
    };
  }, [navigate, search]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="text-center">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <p className="mt-4 text-sm text-muted-foreground">Signing you in…</p>
      </div>
    </div>
  );
}
