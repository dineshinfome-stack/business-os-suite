import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { PlatformShell } from "@/components/platform";
import { supabase } from "@/integrations/supabase/client";
import { useRouterState } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated")({
  beforeLoad: async ({ location }) => {
    if (typeof window === "undefined") return;
    const { data } = await supabase.auth.getSession();
    if (!data.session) {
      throw redirect({
        to: "/login",
        search: { redirect: location.href },
      });
    }
  },
  component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isPlatform = pathname === "/platform" || pathname.startsWith("/platform/");
  if (isPlatform) {
    return (
      <PlatformShell>
        <Outlet />
      </PlatformShell>
    );
  }
  return (
    <AppShell>
      <Outlet />
    </AppShell>
  );
}
