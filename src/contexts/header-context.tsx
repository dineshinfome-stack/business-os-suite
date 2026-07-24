import * as React from "react";

/**
 * Sidebar chrome controls exposed to header slots (Navigator, Logo, etc.).
 * AppShell owns the state; header slot components consume it via context so
 * they can be moved between shells without prop-drilling.
 */
export interface SidebarControls {
  pinned: boolean;
  collapsed: boolean;
  togglePinned: () => void;
  toggleCollapsed: () => void;
}

interface HeaderContextValue {
  /** Which popover slot (by id) is currently open, if any. */
  openId: string | null;
  isOpen: (id: string) => boolean;
  open: (id: string) => void;
  close: () => void;
  toggle: (id: string) => void;
  setOpen: (id: string, open: boolean) => void;
  /** Sidebar chrome controls provided by AppShell. */
  sidebar: SidebarControls;
}

const HeaderContext = React.createContext<HeaderContextValue | null>(null);

interface ProviderProps {
  sidebar: SidebarControls;
  children: React.ReactNode;
}

/**
 * Board Rec 1/2 — HeaderProvider.
 *
 * Coordinates:
 *   • popover open/close (only one slot open at a time)
 *   • sidebar chrome controls (pin / collapse) for slot components
 *
 * Future badge/AI/notification/task slots plug in through the same primitive
 * without touching AppShell.
 */
export function HeaderProvider({ sidebar, children }: ProviderProps) {
  const [openId, setOpenId] = React.useState<string | null>(null);

  const value = React.useMemo<HeaderContextValue>(
    () => ({
      openId,
      isOpen: (id) => openId === id,
      open: (id) => setOpenId(id),
      close: () => setOpenId(null),
      toggle: (id) => setOpenId((prev) => (prev === id ? null : id)),
      setOpen: (id, open) => setOpenId((prev) => (open ? id : prev === id ? null : prev)),
      sidebar,
    }),
    [openId, sidebar],
  );

  return <HeaderContext.Provider value={value}>{children}</HeaderContext.Provider>;
}

export function useHeader(): HeaderContextValue {
  const ctx = React.useContext(HeaderContext);
  if (!ctx) throw new Error("useHeader must be used inside <HeaderProvider>");
  return ctx;
}
