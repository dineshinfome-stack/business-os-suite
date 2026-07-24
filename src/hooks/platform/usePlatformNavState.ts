import * as React from "react";
import { storage } from "@/utils/storage";

const PIN_KEY = "platform.nav.pinned";

export type PlatformTab = "all" | "favorites" | "history" | "workspaces" | "admin" | null;

export function usePlatformNavState() {
  const [pinned, setPinned] = React.useState<boolean>(false);
  const [activeTab, setActiveTab] = React.useState<PlatformTab>(null);

  React.useEffect(() => {
    const p = storage.get<boolean>(PIN_KEY, false) ?? false;
    setPinned(p);
    if (p) setActiveTab("all");
  }, []);

  const togglePinned = React.useCallback(() => {
    setPinned((prev) => {
      const next = !prev;
      storage.set(PIN_KEY, next);
      if (next) setActiveTab("all");
      return next;
    });
  }, []);

  const openTab = React.useCallback(
    (tab: PlatformTab) => {
      setActiveTab((cur) => {
        if (tab === "all" && pinned) return "all";
        return cur === tab ? null : tab;
      });
    },
    [pinned],
  );

  const closeMenus = React.useCallback(() => {
    setActiveTab(pinned ? "all" : null);
  }, [pinned]);

  return { pinned, togglePinned, activeTab, openTab, closeMenus, setActiveTab };
}
