import * as React from "react";

interface HeaderContextValue {
  openId: string | null;
  isOpen: (id: string) => boolean;
  open: (id: string) => void;
  close: () => void;
  toggle: (id: string) => void;
  setOpen: (id: string, open: boolean) => void;
}

const HeaderContext = React.createContext<HeaderContextValue | null>(null);

/**
 * Board Rec 2 — HeaderProvider. Coordinates header popover slots so only one
 * is open at a time. Future badge/AI/notification slots plug in through the
 * same primitive without touching AppShell.
 */
export function HeaderProvider({ children }: { children: React.ReactNode }) {
  const [openId, setOpenId] = React.useState<string | null>(null);

  const value = React.useMemo<HeaderContextValue>(
    () => ({
      openId,
      isOpen: (id) => openId === id,
      open: (id) => setOpenId(id),
      close: () => setOpenId(null),
      toggle: (id) => setOpenId((prev) => (prev === id ? null : id)),
      setOpen: (id, open) => setOpenId((prev) => (open ? id : prev === id ? null : prev)),
    }),
    [openId],
  );

  return <HeaderContext.Provider value={value}>{children}</HeaderContext.Provider>;
}

export function useHeader(): HeaderContextValue {
  const ctx = React.useContext(HeaderContext);
  if (!ctx) throw new Error("useHeader must be used inside <HeaderProvider>");
  return ctx;
}
