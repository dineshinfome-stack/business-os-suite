import { createFileRoute } from "@tanstack/react-router";
import { PageContainer } from "@/components/layout/AppShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CardSkeleton } from "@/components/common/Skeletons";
import { EmptyState } from "@/components/common/EmptyState";
import { supabase } from "@/integrations/supabase/client";
import { notify } from "@/lib/notify";
import { useNavigate } from "@tanstack/react-router";
import { LogOut, Plus, Bell, Activity } from "lucide-react";
import { APP_NAME } from "@/constants/app";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: `Dashboard — ${APP_NAME}` },
      { name: "description", content: `${APP_NAME} workspace dashboard.` },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const navigate = useNavigate();

  async function handleSignOut() {
    await supabase.auth.signOut();
    notify.success("Signed out");
    navigate({ to: "/login", replace: true });
  }

  return (
    <PageContainer
      title="Welcome to Business OS"
      description="Your workspace foundation is ready."
      actions={
        <Button variant="outline" onClick={handleSignOut}>
          <LogOut className="mr-1 h-4 w-4" /> Sign out
        </Button>
      }
    >
      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Quick actions</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Button size="sm" variant="outline" disabled>
              <Plus className="mr-1 h-3.5 w-3.5" /> New
            </Button>
            <Button size="sm" variant="outline" disabled>
              Import
            </Button>
            <Button size="sm" variant="outline" disabled>
              Reports
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              <Activity className="mr-1 inline h-4 w-4" /> Recent activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <EmptyState title="No activity yet" description="Activity will appear as you work." />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              <Bell className="mr-1 inline h-4 w-4" /> Notifications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <EmptyState title="No notifications" description="You're all caught up." />
          </CardContent>
        </Card>
      </div>

      <section className="mt-6">
        <h2 className="mb-3 text-sm font-medium text-muted-foreground">Widgets</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </section>
    </PageContainer>
  );
}
