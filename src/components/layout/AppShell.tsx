import type { ReactNode } from "react";
import { Outlet } from "@tanstack/react-router";
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/navigation/AppSidebar";
import { Breadcrumb } from "@/components/navigation/Breadcrumb";
import { CommandPalette } from "@/components/navigation/CommandPalette";
import { OrgSwitcher } from "@/components/navigation/OrgSwitcher";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { CommandPaletteProvider } from "@/hooks/navigation/useCommandPalette";
import { ProfileMenu, HelpMenu, SearchTrigger, StatusBar } from "@/components/platform";

export function AppShell({ children }: { children?: ReactNode }) {
  return (
    <CommandPaletteProvider>
      <SidebarProvider>
        <div className="flex min-h-screen w-full bg-background">
          <AppSidebar />
          <SidebarInset className="flex flex-1 flex-col">
            <header
              role="banner"
              className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-border bg-background/95 px-3 backdrop-blur supports-[backdrop-filter]:bg-background/80"
            >
              <SidebarTrigger aria-label="Toggle sidebar" />
              <div className="hidden min-w-0 flex-1 md:block">
                <Breadcrumb />
              </div>
              <div className="ml-auto flex items-center gap-1.5">
                <SearchTrigger />
                <OrgSwitcher />
                <NotificationBell />
                <HelpMenu />
                <ProfileMenu />
              </div>
            </header>
            <main id="main" role="main" className="flex-1 p-6">
              <div className="mx-auto w-full max-w-7xl">{children ?? <Outlet />}</div>
            </main>
            <StatusBar />
          </SidebarInset>
        </div>
        <CommandPalette />
      </SidebarProvider>
    </CommandPaletteProvider>
  );
}

export function PageContainer({
  title,
  description,
  actions,
  children,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">{title}</h1>
          {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
      <div>{children}</div>
    </div>
  );
}
