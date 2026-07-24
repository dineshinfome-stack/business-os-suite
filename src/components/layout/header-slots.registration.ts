/**
 * Static registration of all standard tenant-header slots.
 *
 * Import this module once (from AppShell) to populate the header slot
 * registry. New modules register additional slots by calling
 * `registerHeaderSlot` from their own registration modules.
 *
 * Stable order values (increments of 10) leave room for future entries
 * to slot between existing ones without renumbering.
 */
import { registerHeaderSlot } from "@/lib/header/slot-registry";
import { BusinessOsLogo } from "@/components/platform/header/BusinessOsLogo";
import { NavigatorButton } from "@/components/platform/header/NavigatorButton";
import { FavoritesPopover } from "@/components/platform/header/FavoritesPopover";
import { RecentPopover } from "@/components/platform/header/RecentPopover";
import { AiAssistantSlot } from "@/components/platform/header/AiAssistantSlot";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { ProfileMenu, HelpMenu, SearchTrigger } from "@/components/platform";

// Start area — brand + primary navigation entries (ServiceNow-style: All,
// Favorites, History sit next to the brand mark).
registerHeaderSlot({ id: "logo", area: "start", order: 10, component: BusinessOsLogo });
registerHeaderSlot({ id: "navigator", area: "start", order: 20, component: NavigatorButton });
registerHeaderSlot({ id: "favorites", area: "start", order: 30, component: FavoritesPopover });
registerHeaderSlot({ id: "recent", area: "start", order: 40, component: RecentPopover });

// End area — productivity + identity. Order gaps reserved for future slots
// (e.g. Tasks=45, Announcements=55).
registerHeaderSlot({ id: "search", area: "end", order: 10, component: SearchTrigger });
registerHeaderSlot({ id: "ai-assistant", area: "end", order: 40, component: AiAssistantSlot });
registerHeaderSlot({ id: "notifications", area: "end", order: 50, component: NotificationBell });
registerHeaderSlot({ id: "help", area: "end", order: 60, component: HelpMenu });
registerHeaderSlot({ id: "profile", area: "end", order: 70, component: ProfileMenu });
