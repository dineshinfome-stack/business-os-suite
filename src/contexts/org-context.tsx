import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
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
import { notify } from "@/lib/notify";

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
  const failureToastShownRef = useRef(false);

  const refresh = useCallback(async () => {
    if (auth.status === "unauthenticated") {
      // Sprint 0.4A: fully clear org state on sign-out so re-login starts clean.
      setStatus("loading");
      setCurrent(null);
      setOrganizations([]);
      failureToastShownRef.current = false;
      return;
    }
    if (auth.status !== "authenticated") {
      setStatus("loading");
      return;
    }
    const attempt = async () => Promise.all([listFn(), getFn()]);
    let list: OrgMembershipRow[];
    let ctx: Awaited<ReturnType<typeof getFn>>;
    try {
      [list, ctx] = await attempt();
    } catch (err) {
      logger.warn("org-context refresh failed, retrying once", { error: String(err) });
      try {
        [list, ctx] = await attempt();
      } catch (err2) {
        logger.error("org-context refresh failed", { error: String(err2) });
        if (!failureToastShownRef.current) {
          failureToastShownRef.current = true;
          notify.error("Couldn't load your workspace", "Please refresh the page or sign in again.");
        }
        setStatus("no-organizations");
        return;
      }
    }
    failureToastShownRef.current = false;
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
