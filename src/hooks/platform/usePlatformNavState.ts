import * as React from "react";
import { storage } from "@/utils/storage";

/**
 * Nav state for Enterprise Navigation v2.
 * Scoped so the platform and tenant shells keep independent pin/collapse
 * preferences (`platform.nav.*` vs `tenant.nav.*`).
 */
export function usePlatformNavState(scope: "platform" | "tenant" = "platform") {
  const PIN_KEY = `${scope}.nav.pinned`;
  const COLLAPSED_KEY = `${scope}.nav.collapsed`;

  const [pinned, setPinned] = React.useState<boolean>(true);
  const [collapsed, setCollapsed] = React.useState<boolean>(false);

  React.useEffect(() => {
    setPinned(storage.get<boolean>(PIN_KEY, true) ?? true);
    // Collapse toggle removed from UI — always render expanded and clear any stale preference.
    setCollapsed(false);
    storage.set(COLLAPSED_KEY, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scope]);

  const togglePinned = React.useCallback(() => {
    setPinned((prev) => {
      const next = !prev;
      storage.set(PIN_KEY, next);
      return next;
    });
  }, [PIN_KEY]);

  const toggleCollapsed = React.useCallback(() => {
    setCollapsed((prev) => {
      const next = !prev;
      storage.set(COLLAPSED_KEY, next);
      return next;
    });
  }, [COLLAPSED_KEY]);

  return { pinned, togglePinned, collapsed, toggleCollapsed };
}
