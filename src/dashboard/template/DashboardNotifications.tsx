import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/common/EmptyState";
import { Bell } from "lucide-react";

/**
 * SPR-MOD-001-003 — Notifications summary card.
 * Header bell already shows live counts; this card is a dashboard-level
 * summary/empty-state slot.
 */
export function DashboardNotifications() {
  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium">
          <Bell className="mr-1 inline h-4 w-4" /> Notifications
        </CardTitle>
      </CardHeader>
      <CardContent>
        <EmptyState title="No notifications" description="You're all caught up." />
      </CardContent>
    </Card>
  );
}
