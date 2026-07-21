import { notify } from "./notify";

/**
 * Map raw Supabase / OAuth error codes and messages to user-facing strings.
 * All auth-related toasts flow through here so the wording stays consistent.
 */

export type AuthErrorCode =
  | "invalid_credentials"
  | "email_not_confirmed"
  | "expired_session"
  | "account_disabled"
  | "oauth_cancelled"
  | "oauth_timeout"
  | "network_failure"
  | "signout_partial"
  | "unknown";

const MESSAGES: Record<AuthErrorCode, { title: string; description: string }> = {
  invalid_credentials: {
    title: "Sign in failed",
    description: "The email or password you entered is incorrect.",
  },
  email_not_confirmed: {
    title: "Confirm your email",
    description: "Check your inbox and click the verification link before signing in.",
  },
  expired_session: {
    title: "Session expired",
    description: "Please sign in again to continue.",
  },
  account_disabled: {
    title: "Account unavailable",
    description: "This account has been disabled. Contact your administrator.",
  },
  oauth_cancelled: {
    title: "Sign in cancelled",
    description: "The sign-in window was closed before completing.",
  },
  oauth_timeout: {
    title: "Sign in took too long",
    description: "We couldn't confirm your session in time. Please try signing in again.",
  },
  network_failure: {
    title: "Network problem",
    description: "Check your connection and try again.",
  },
  signout_partial: {
    title: "Signed out locally",
    description:
      "Signed out on this device, but the server couldn't confirm session invalidation. Sign in again if you weren't expecting this.",
  },
  unknown: {
    title: "Something went wrong",
    description: "Please try again in a moment.",
  },
};

export function mapSupabaseAuthError(err: unknown): AuthErrorCode {
  if (!err) return "unknown";
  const anyErr = err as { code?: string; status?: number; message?: string; name?: string };
  const msg = (anyErr.message ?? "").toLowerCase();
  const code = (anyErr.code ?? "").toLowerCase();
  if (code === "invalid_credentials" || msg.includes("invalid login")) return "invalid_credentials";
  if (msg.includes("email not confirmed") || code === "email_not_confirmed")
    return "email_not_confirmed";
  if (anyErr.name === "AuthSessionMissingError" || msg.includes("refresh_token_not_found"))
    return "expired_session";
  if (msg.includes("disabled")) return "account_disabled";
  if (msg.includes("cancel")) return "oauth_cancelled";
  if (msg.includes("network") || msg.includes("fetch")) return "network_failure";
  return "unknown";
}

export function notifyAuthError(code: AuthErrorCode | unknown): void {
  const resolved: AuthErrorCode =
    typeof code === "string" && code in MESSAGES ? (code as AuthErrorCode) : mapSupabaseAuthError(code);
  const { title, description } = MESSAGES[resolved];
  notify.error(title, description);
}

export function authErrorMessage(code: AuthErrorCode): { title: string; description: string } {
  return MESSAGES[code];
}
