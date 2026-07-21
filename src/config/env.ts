/**
 * Typed accessor for client-safe environment variables.
 * Server secrets MUST NOT be exposed via VITE_* — read them inside a
 * server-only boundary instead.
 */
export const env = {
  MODE: import.meta.env.MODE,
  DEV: import.meta.env.DEV,
  PROD: import.meta.env.PROD,
  APP_NAME: (import.meta.env.VITE_APP_NAME as string | undefined) ?? "Business OS",
} as const;
