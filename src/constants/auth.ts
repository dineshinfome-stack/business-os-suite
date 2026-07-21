/**
 * Authentication constants.
 *
 * CONVENTION: All future authentication-related timing thresholds, retry budgets,
 * and numeric configuration values MUST live in this file. No inline magic numbers
 * in auth code. Add new constants here with a JSDoc explaining the operational
 * meaning and how to tune it.
 */

/**
 * Hard timeout for /auth/callback to observe a hydrated session after an OAuth
 * round-trip. On expiry the callback route redirects to /login with a mapped
 * error. Platform default; can be tuned in a later sprint if operational
 * experience warrants.
 */
export const AUTH_CALLBACK_HYDRATION_TIMEOUT_MS = 10_000;
