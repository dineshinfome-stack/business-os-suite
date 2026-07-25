## Problem

On `/dashboard` (tenant `AppShell`), the app crashes with:
`useSecondaryNavTab must be used within SecondaryNavTabProvider`

## Root cause (verified)

`AppShell` renders `PlatformSidebarV2`, which calls `useSecondaryNavTab()`. That hook throws unless a `SecondaryNavTabProvider` sits above it. Only `PlatformShell` currently wraps its subtree in `SecondaryNavTabProvider` (and `SidebarPopupProvider`). `AppShell` doesn't — so any tenant page using the sidebar crashes.

This became reachable now that sign-out navigates to `/login` → the user re-enters the tenant shell on `/dashboard` and hits the missing provider.

## Fix

Wrap `AppShell`'s tree in the same two providers `PlatformShell` uses:

- `SecondaryNavTabProvider` — required by `PlatformSidebarV2`.
- `SidebarPopupProvider` — `useSidebarPopup` has a fallback, but the tenant shell should behave like the platform shell (popup mode works when unpinned). Wrap it too for parity.

No changes to sign-out, routing, or platform shell.

### File to edit

- `src/components/layout/AppShell.tsx` — add the two providers around the existing `HeaderProvider` subtree.
