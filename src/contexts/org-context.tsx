import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useServerFn } from "@tanstack/react-start";

import {
  getOrgContext,
  listMyOrganizations,
  setCurrentOrganization,
  type OrgMembershipRow,
} from "@/lib/organizations.functions";
import { useAuth } from "@/contexts/auth-context";
import { logger } from "@/lib/logger";

export interface CurrentOrg {
  organizationId: string;
  name: string;
  slug: string;
  role: OrgMembershipRow["role"];
}

interface OrgContextValue {
  status: "loading" | "ready" | "no-organizations";
  current: CurrentOrg | null;
  organizations: OrgMembershipRow[];
  switchOrganization: (organizationId: string) => Promise<void>;
  refresh: () => Promise<void>;
}

const OrgContext = createContext<OrgContextValue | null>(null);

export function OrgProvider({ children }: { children: ReactNode }) {
  const auth = useAuth();
  const listFn = useServerFn(listMyOrganizations);
  const getFn = useServerFn(getOrgContext);
  const setFn = useServerFn(setCurrentOrganization);

  const [status, setStatus] = useState<OrgContextValue["status"]>("loading");
  const [current, setCurrent] = useState<CurrentOrg | null>(null);
  const [organizations, setOrganizations] = useState<OrgMembershipRow[]>([]);

  const refresh = useCallback(async () => {
    if (auth.status !== "authenticated") {
      setStatus("loading");
      setCurrent(null);
      setOrganizations([]);
      return;
    }
    try {
      const [list, ctx] = await Promise.all([listFn(), getFn()]);
      setOrganizations(list);
      if (ctx.organizationId) {
        setCurrent({
          organizationId: ctx.organizationId,
          name: ctx.name ?? "",
          slug: ctx.slug ?? "",
          role: (ctx.role ?? "member") as OrgMembershipRow["role"],
        });
        setStatus("ready");
      } else {
        setCurrent(null);
        setStatus("no-organizations");
      }
    } catch (err) {
      logger.warn("org-context refresh failed", { error: String(err) });
      setStatus("no-organizations");
    }
  }, [auth.status, listFn, getFn]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const switchOrganization = useCallback(
    async (organizationId: string) => {
      await setFn({ data: { organizationId } });
      await refresh();
    },
    [setFn, refresh],
  );

  const value = useMemo<OrgContextValue>(
    () => ({ status, current, organizations, switchOrganization, refresh }),
    [status, current, organizations, switchOrganization, refresh],
  );

  return <OrgContext.Provider value={value}>{children}</OrgContext.Provider>;
}

export function useOrg(): OrgContextValue {
  const ctx = useContext(OrgContext);
  if (!ctx) throw new Error("useOrg must be used inside <OrgProvider>");
  return ctx;
}
