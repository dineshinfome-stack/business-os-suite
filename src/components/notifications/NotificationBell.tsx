import { Bell } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Can } from "@/components/auth/Can";
import { useNotifications } from "@/hooks/notifications/useNotifications";
import { NotificationCenter } from "./NotificationCenter";

export function NotificationBell() {
  const { unreadCount } = useNotifications();
  return (
    <Can permission="notifications.inbox.read">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="relative"
            aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ""}`}
          >
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <Badge
                variant="destructive"
                className="absolute -right-1 -top-1 h-4 min-w-4 justify-center rounded-full px-1 text-[10px] leading-none"
              >
                {unreadCount > 99 ? "99+" : unreadCount}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-96 p-0">
          <NotificationCenter />
        </PopoverContent>
      </Popover>
    </Can>
  );
}
