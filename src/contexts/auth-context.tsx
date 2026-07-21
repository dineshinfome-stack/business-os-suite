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
import type { Session, User } from "@supabase/supabase-js";

import { supabase } from "@/integrations/supabase/client";
import { fingerprintClaims } from "@/lib/auth-fingerprint";
import { logAuthEvent } from "@/lib/auth-audit";
import { notifyAuthError } from "@/lib/auth-errors";
import { logger } from "@/lib/logger";
import { newCorrelationId } from "@/lib/correlation";

/**
 * Sprint 0.3 — Authentication Platform
 *
 * Ownership rules:
 *   - Session refresh (JWT rotation) is owned by supabase-js (autoRefreshToken).
 *   - refresh() below re-reads profile + roles from the database. It does NOT
 *     force a JWT refresh.
 *   - Roles cached in this context are refreshed on: initial load, SIGNED_IN,
 *     explicit refresh(), and fingerprint change on TOKEN_REFRESHED. Admin-
 *     side role edits require the affected user to call refresh() or sign in
 *     again to see the new role. This is documented in the Sprint 0.3 spec.
 *   - Audit writes are fire-and-forget; auth flows never block on audit.
 */

export interface AuthProfile {
  id: string;
  displayName: string | null;
  avatarUrl: string | null;
}

interface AuthContextValue {
  status: "loading" | "authenticated" | "unauthenticated";
  session: Session | null;
  user: User | null;
  profile: AuthProfile | null;
  roles: string[];
  hasRole: (role: string) => boolean;
  hasAnyRole: (roles: string[]) => boolean;
  hasAllRoles: (roles: string[]) => boolean;
  refresh: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

/** Derive display name from OAuth provider metadata with tolerant fallbacks. */
function pickDisplayName(user: User | null): string | null {
  if (!user) return null;
  const meta = (user.user_metadata ?? {}) as Record<string, unknown>;
  const candidates = [meta.full_name, meta.name, meta.preferred_username, user.email];
  for (const c of candidates) if (typeof c === "string" && c.trim().length > 0) return c;
  return null;
}

function pickAvatar(user: User | null): string | null {
  if (!user) return null;
  const meta = (user.user_metadata ?? {}) as Record<string, unknown>;
  const v = meta.avatar_url ?? meta.picture;
  return typeof v === "string" ? v : null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthContextValue["status"]>("loading");
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<AuthProfile | null>(null);
  const [roles, setRoles] = useState<string[]>([]);

  // Deduplicated in-flight refresh (only ever one profile/roles fetch outstanding).
  const refreshPromiseRef = useRef<Promise<void> | null>(null);
  // Increments on signOut so an in-flight refresh can detect cancellation.
  const refreshEpochRef = useRef(0);
  // Last observed claims fingerprint — used to skip no-op TOKEN_REFRESHED events.
  const lastFingerprintRef = useRef<string>("");

  const loadProfileAndRoles = useCallback(async (user: User, epoch: number) => {
    const [{ data: profileRow, error: profileErr }, { data: roleRows, error: rolesErr }] =
      await Promise.all([
        supabase
          .from("profiles")
          .select("id, display_name, avatar_url")
          .eq("id", user.id)
          .is("deleted_at", null)
          .maybeSingle(),
        supabase.from("user_roles").select("role").eq("user_id", user.id).is("deleted_at", null),
      ]);

    if (epoch !== refreshEpochRef.current) return; // cancelled by signOut

    if (profileErr) logger.warn("profile load failed", profileErr.message);
    if (rolesErr) logger.warn("roles load failed", rolesErr.message);

    setProfile({
      id: user.id,
      displayName: profileRow?.display_name ?? pickDisplayName(user),
      avatarUrl: profileRow?.avatar_url ?? pickAvatar(user),
    });
    setRoles((roleRows ?? []).map((r) => r.role as string));
  }, []);

  const applySession = useCallback(
    async (next: Session | null, opts: { forceReload?: boolean } = {}) => {
      const nextFingerprint = fingerprintClaims(next);
      const changed = opts.forceReload || nextFingerprint !== lastFingerprintRef.current;
      lastFingerprintRef.current = nextFingerprint;
      setSession(next);

      if (!next?.user) {
        setProfile(null);
        setRoles([]);
        setStatus("unauthenticated");
        return;
      }

      if (!changed) {
        setStatus("authenticated");
        return; // TOKEN_REFRESHED no-op path
      }

      const epoch = refreshEpochRef.current;
      await loadProfileAndRoles(next.user, epoch);
      if (epoch === refreshEpochRef.current) setStatus("authenticated");
    },
    [loadProfileAndRoles],
  );

  // Initial hydration + subscription. One and only one auth listener in the app.
  useEffect(() => {
    let mounted = true;

    (async () => {
      const { data } = await supabase.auth.getSession();
      if (!mounted) return;
      await applySession(data.session, { forceReload: true });
    })();

    const { data: sub } = supabase.auth.onAuthStateChange((event, next) => {
      if (!mounted) return;
      if (event === "SIGNED_IN") {
        void applySession(next, { forceReload: true });
      } else if (event === "SIGNED_OUT") {
        void applySession(null, { forceReload: true });
      } else if (event === "TOKEN_REFRESHED" || event === "USER_UPDATED") {
        // Fingerprint decides whether we re-fetch — TOKEN_REFRESHED is no-op
        // when identity claims are unchanged.
        void applySession(next);
      }
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, [applySession]);

  const refresh = useCallback(async () => {
    if (refreshPromiseRef.current) return refreshPromiseRef.current;
    const p = (async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;
        await applySession(data.session, { forceReload: true });
      } catch (err) {
        // Preserve current session on failure — never sign the user out on a
        // transient refresh error. Log and continue.
        logger.warn("auth refresh failed", String(err));
      } finally {
        refreshPromiseRef.current = null;
      }
    })();
    refreshPromiseRef.current = p;
    return p;
  }, [applySession]);

  const signOut = useCallback(async () => {
    // Cancel any in-flight refresh so its writes are discarded.
    refreshEpochRef.current += 1;
    refreshPromiseRef.current = null;

    const correlationId = newCorrelationId();
    logAuthEvent("user_logged_out", { correlationId, entityId: session?.user?.id });

    let serverOk = true;
    try {
      const { error } = await supabase.auth.signOut();
      if (error) serverOk = false;
    } catch {
      serverOk = false;
    }

    // Local teardown runs regardless of server outcome.
    setSession(null);
    setProfile(null);
    setRoles([]);
    setStatus("unauthenticated");
    lastFingerprintRef.current = "";

    if (!serverOk) notifyAuthError("signout_partial");
  }, [session]);

  const value = useMemo<AuthContextValue>(() => {
    const roleSet = new Set(roles);
    return {
      status,
      session,
      user: session?.user ?? null,
      profile,
      roles,
      hasRole: (r) => roleSet.has(r),
      hasAnyRole: (rs) => rs.some((r) => roleSet.has(r)),
      hasAllRoles: (rs) => rs.every((r) => roleSet.has(r)),
      refresh,
      signOut,
    };
  }, [status, session, profile, roles, refresh, signOut]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}
