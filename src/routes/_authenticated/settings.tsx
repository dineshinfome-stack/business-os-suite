import { createFileRoute, Link, Outlet, useMatches } from "@tanstack/react-router";
import { PageContainer } from "@/components/layout/AppShell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { APP_NAME } from "@/constants/app";

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({
    meta: [
      { title: `Settings — ${APP_NAME}` },
      { name: "description", content: `${APP_NAME} workspace settings.` },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const matches = useMatches();
  const hasChild = matches.some((m) => m.routeId.startsWith("/_authenticated/settings/"));
  if (hasChild) return <Outlet />;

  return (
    <PageContainer title="Settings" description="Configure your workspace preferences.">
      <div className="grid gap-4 md:grid-cols-2">
        <Link to="/settings/platform" className="block">
          <Card className="h-full transition-colors hover:border-primary">
            <CardHeader>
              <CardTitle className="text-base">Platform settings</CardTitle>
              <CardDescription>
                Framework demonstration surface — exercises the shared Settings Foundation.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Branding, locale, security, and AI provider defaults.
            </CardContent>
          </Card>
        </Link>
      </div>
    </PageContainer>
  );
}
