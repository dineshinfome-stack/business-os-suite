import { Link } from "@tanstack/react-router";
import { Check, Archive, Inbox } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useNotifications } from "@/hooks/notifications/useNotifications";
import type { NotificationRow } from "@/lib/notifications/service.functions";
import type { NotificationSeverity } from "@/lib/notifications/constants";
import { cn } from "@/lib/utils";

const severityDot: Record<NotificationSeverity, string> = {
  info: "bg-primary",
  success: "bg-emerald-500",
  warning: "bg-amber-500",
  error: "bg-destructive",
};

export function NotificationCenter() {
  const { notifications, unreadCount, isLoading, markRead, markArchived, markAllRead } =
    useNotifications();

  return (
    <div className="flex max-h-[32rem] flex-col">
      <div className="flex items-center justify-between px-4 py-3">
        <div>
          <p className="text-sm font-semibold">Notifications</p>
          <p className="text-xs text-muted-foreground">
            {unreadCount > 0 ? `${unreadCount} unread` : "You're all caught up"}
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => markAllRead()}
          disabled={unreadCount === 0}
        >
          Mark all read
        </Button>
      </div>
      <Separator />
      <ScrollArea className="max-h-96 flex-1">
        {isLoading ? (
          <p className="px-4 py-8 text-center text-sm text-muted-foreground">Loading…</p>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center gap-2 px-4 py-10 text-muted-foreground">
            <Inbox className="h-6 w-6" />
            <p className="text-sm">No notifications yet.</p>
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {notifications.map((n) => (
              <Item key={n.id} n={n} onRead={markRead} onArchive={markArchived} />
            ))}
          </ul>
        )}
      </ScrollArea>
    </div>
  );
}

function Item({
  n,
  onRead,
  onArchive,
}: {
  n: NotificationRow;
  onRead: (id: string) => void;
  onArchive: (id: string) => void;
}) {
  const isUnread = n.status === "unread";
  return (
    <li className={cn("flex gap-3 px-4 py-3", isUnread && "bg-muted/40")}>
      <span
        className={cn("mt-1.5 h-2 w-2 shrink-0 rounded-full", severityDot[n.severity])}
        aria-hidden
      />
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-2">
          <p className="truncate text-sm font-medium text-foreground">{n.title}</p>
          <span className="shrink-0 text-[10px] text-muted-foreground">
            {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
          </span>
        </div>
        {n.message && (
          <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{n.message}</p>
        )}
        <div className="mt-2 flex items-center gap-2">
          {n.actionUrl && (
            <Button asChild variant="link" size="sm" className="h-auto p-0 text-xs">
              <Link to={n.actionUrl}>{n.actionLabel ?? "Open"}</Link>
            </Button>
          )}
          {isUnread && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 gap-1 px-2 text-xs"
              onClick={() => onRead(n.id)}
            >
              <Check className="h-3 w-3" /> Mark read
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="h-6 gap-1 px-2 text-xs"
            onClick={() => onArchive(n.id)}
          >
            <Archive className="h-3 w-3" /> Archive
          </Button>
        </div>
      </div>
    </li>
  );
}
