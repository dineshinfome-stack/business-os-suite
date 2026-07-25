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
    throw new Error("useSecondaryNavTab must be used within SecondaryNavTabProvider");
  }
  return ctx;
}
