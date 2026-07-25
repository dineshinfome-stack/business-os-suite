## Goal
Route users with the `company_admin` role to `/platform/companies` immediately after login (mirroring how `super_admin` / `platform_admin` land on `/platform/dashboard`).

## Change
In `src/routes/login.tsx`, extend `resolvePostLoginPath`:

```ts
if (roles.includes("super_admin") || roles.includes("platform_admin"))
  return "/platform/dashboard";
if (roles.includes("company_admin")) return "/platform/companies";
return nextPath;
```

Precedence: platform-level roles first, then `company_admin`, then the sanitized `nextPath` fallback (unchanged for tenant admins / employees).

## Out of scope
- No changes to nav registry, permissions, or the Companies page itself.
- No changes to the `/auth/callback` OAuth path (matches existing behavior — only password login resolves role-based landing today).

## Verification
- Log in as a `company_admin` → lands on `/platform/companies`.
- Log in as `super_admin` / `platform_admin` → still lands on `/platform/dashboard`.
- Log in as a user without those roles → still lands on the default/next path.
