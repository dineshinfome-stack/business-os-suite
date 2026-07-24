import * as React from "react";
import { storage } from "@/utils/storage";

const PIN_KEY = "platform.nav.pinned";
const COLLAPSED_KEY = "platform.nav.collapsed";

/**
 * Simplified nav state for Enterprise Navigation v2.
 * Sidebar is always visible; user controls pinning (persists layout shift)
 * and collapsed (mini rail) modes.
 */
export function usePlatformNavState() {
  const [pinned, setPinned] = React.useState<boolean>(true);
  const [collapsed, setCollapsed] = React.useState<boolean>(false);

  React.useEffect(() => {
    setPinned(storage.get<boolean>(PIN_KEY, true) ?? true);
    setCollapsed(storage.get<boolean>(COLLAPSED_KEY, false) ?? false);
  }, []);

  const togglePinned = React.useCallback(() => {
    setPinned((prev) => {
      const next = !prev;
      storage.set(PIN_KEY, next);
      return next;
    });
  }, []);

  const toggleCollapsed = React.useCallback(() => {
    setCollapsed((prev) => {
      const next = !prev;
      storage.set(COLLAPSED_KEY, next);
      return next;
    });
  }, []);

  return { pinned, togglePinned, collapsed, toggleCollapsed };
}
