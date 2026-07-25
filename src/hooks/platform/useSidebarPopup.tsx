import * as React from "react";

interface Ctx {
  /** true when the sidebar is running as a floating popup (unpinned). */
  isPopupMode: boolean;
  /** Open anchored under a given element (dropdown behavior). */
  openFromAnchor: (el: HTMLElement) => void;
  /** Open from the left edge (hover-strip behavior). */
  openFromEdge: () => void;
  close: () => void;
}

const SidebarPopupContext = React.createContext<Ctx | null>(null);

export function SidebarPopupProvider({
  value,
  children,
}: {
  value: Ctx;
  children: React.ReactNode;
}) {
  return <SidebarPopupContext.Provider value={value}>{children}</SidebarPopupContext.Provider>;
}

export function useSidebarPopup(): Ctx {
  return (
    React.useContext(SidebarPopupContext) ?? {
      isPopupMode: false,
      openFromAnchor: () => {},
      openFromEdge: () => {},
      close: () => {},
    }
  );
}
