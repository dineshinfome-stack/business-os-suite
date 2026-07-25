import { Link } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Can } from "@/components/auth/Can";
import type { QuickAction } from "./types";

/**
 * SPR-MOD-001-003 — Quick actions card.
 * Renders configured actions with per-item permission gating. Each item may
 * navigate via TanStack `to` or trigger an `onClick`.
 */
export function DashboardQuickActions({ items }: { items: QuickAction[] }) {
  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium">Quick actions</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-2">
        {items.map((item) => {
          const btn = (
            <Button
              key={item.id}
              size="sm"
              variant="outline"
              disabled={item.disabled}
              onClick={item.onClick}
              asChild={Boolean(item.to)}
            >
              {item.to ? (
                <Link to={item.to}>
                  {item.icon && <item.icon className="mr-1 h-3.5 w-3.5" />}
                  {item.label}
                </Link>
              ) : (
                <>
                  {item.icon && <item.icon className="mr-1 h-3.5 w-3.5" />}
                  {item.label}
                </>
              )}
            </Button>
          );
          return item.permission ? (
            <Can key={item.id} permission={item.permission}>
              {btn}
            </Can>
          ) : (
            btn
          );
        })}
        {items.length === 0 && (
          <p className="text-sm text-muted-foreground">No quick actions available.</p>
        )}
      </CardContent>
    </Card>
  );
}
