import * as React from "react";

export type SecondaryNavTab = "all" | "favorites" | "recent";

interface Ctx {
  tab: SecondaryNavTab;
  setTab: (t: SecondaryNavTab) => void;
}

const SecondaryNavTabContext = React.createContext<Ctx | null>(null);

export function SecondaryNavTabProvider({ children }: { children: React.ReactNode }) {
  const [tab, setTab] = React.useState<SecondaryNavTab>("all");
  const value = React.useMemo(() => ({ tab, setTab }), [tab]);
  return (
    <SecondaryNavTabContext.Provider value={value}>{children}</SecondaryNavTabContext.Provider>
  );
}

export function useSecondaryNavTab(): Ctx {
  const ctx = React.useContext(SecondaryNavTabContext);
  if (!ctx) {
    // Fallback for isolated usage (no provider).
    const [tab, setTab] = React.useState<SecondaryNavTab>("all");
    return { tab, setTab };
  }
  return ctx;
}
