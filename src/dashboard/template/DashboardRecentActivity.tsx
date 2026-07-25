import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/common/EmptyState";
import { Activity } from "lucide-react";

/**
 * SPR-MOD-001-003 — Recent activity card.
 * Placeholder empty-state today; wired to the Audit service in a follow-up
 * once the identity server functions surface activity feeds.
 */
export function DashboardRecentActivity() {
  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium">
          <Activity className="mr-1 inline h-4 w-4" /> Recent activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        <EmptyState title="No activity yet" description="Activity will appear as you work." />
      </CardContent>
    </Card>
  );
}
