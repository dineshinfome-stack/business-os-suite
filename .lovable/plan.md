
# Tenant Shell Header Redesign v2 (Architecture Board Approved)

Applies Board recommendations 1–8 to the previously approved plan. Scope stays presentation-only on the **Tenant** shell (`AppShell.tsx`). `NAV_REGISTRY`, permissions, routing, ADR-009 concepts, and Platform shell are untouched.

## Target architecture

```text
TenantShell
    │
    ▼
AppShell ── HeaderProvider (context)
                │
    ┌───────────┼──────────────────────────────┐
    ▼           ▼                              ▼
 Navigator   HeaderPopover slots           Utility slots
 (sidebar    ├─ FavoritesPopover           ├─ SearchTrigger
 toggle +    ├─ RecentPopover              ├─ AiAssistantSlot (reserved)
 pin)        └─ (future: Notifications,    ├─ NotificationBell
             Tasks, Bookmarks, AI)         ├─ HelpMenu
                                           └─ ProfileMenu
    │
    ▼
EnterpriseSidebar (tenant)
    │
    ├─ SidebarHeader  (Business OS logo · Current Tenant · collapse)
    ├─ NavigationIndex (search facade over registry)
    │      └─ NavigationTree → NavigationItem
    └─ SidebarFooter  (reserved: version/env/docs/feedback/status)
```

## Header layout (left → right)

1. **Business OS logo** (links to `/dashboard`).
2. **Navigator button** — pill labeled "Navigator" with `LayoutGrid` icon; toggles sidebar `pinned`. Adjacent `Pin`/`PinOff` icon flips pin state without closing. (Board Rec 1 — "All" renamed to "Navigator".)
3. Spacer.
4. **FavoritesPopover** trigger.
5. **RecentPopover** trigger.
6. **SearchTrigger** (existing ⌘K).
7. **AiAssistantSlot** — reserved empty slot component, renders nothing today. (Board Rec 8.)
8. **NotificationBell · HelpMenu · ProfileMenu** (unchanged).

## Sidebar layout

- **SidebarHeader** — logo mark, then two-line context: `Business OS` (strong) / current tenant display name (muted). Collapse button on the right. (Board Rec 5.)
- **NavigationIndex** — search input backed by a small index module (`src/lib/navigation/index.ts`) that exposes `search(query)` over registry title / module / keywords / aliases. Tree consumes results, so the index is reusable by future AI Search. (Board Rec 3.)
- **NavigationTree** — always-on "everything" view; tabs removed.
- **SidebarFooter** — reserved slot component, empty today. (Board Rec 7.)

## Files

### New

- `src/contexts/header-context.tsx` — `HeaderProvider` + `useHeader()`; manages which header popover is open (single-open semantics), exposes slot registration hooks so future badges/AI can plug in without touching `AppShell`. (Board Rec 2.)
- `src/components/platform/header/HeaderPopover.tsx` — generic popover trigger; props `id`, `label`, `icon`, `badge?`, `children`. Wraps shadcn `Popover`, wired to `HeaderProvider` for single-open behavior. (Board Rec 4.)
- `src/components/platform/header/FavoritesPopover.tsx` — uses `usePinnedNav()` + `getNavItem()`; empty state matches existing copy. (Board Rec — rename from `HeaderFavoritesMenu`.)
- `src/components/platform/header/RecentPopover.tsx` — uses `useRecentPages()`; caps at 10; row click navigates and closes.
- `src/components/platform/header/AiAssistantSlot.tsx` — placeholder component that renders `null` today, keeps layout position stable. (Board Rec 8.)
- `src/components/platform/header/NavigatorButton.tsx` — "Navigator" pill + inline pin/unpin control.
- `src/components/platform/navigation/SidebarHeader.tsx` — logo + tenant context row + collapse control.
- `src/components/platform/navigation/SidebarFooter.tsx` — reserved empty slot.
- `src/lib/navigation/index.ts` — `buildNavigationIndex()` and `searchNavigation(query)`; pure, permission-agnostic (permissions still applied by `useNavigation()`).

### Modified

- `src/components/layout/AppShell.tsx` — wrap tree in `<HeaderProvider>`; header replaced with new layout above; drops the current identity/pin/collapse block.
- `src/components/platform/navigation/PlatformSidebarV2.tsx` (tenant variant only) — remove `NavigationTabs`, `FavoritesPane`, `RecentPane`, internal `tab` state. Mount `SidebarHeader` + `NavigationIndex` + `NavigationTree` + `SidebarFooter`. Platform variant continues to render tabs for now (out of scope for this pass).
- `src/components/platform/index.ts` — export new header + sidebar pieces.

### Deleted (only if no remaining consumers after edit)

- `src/components/platform/navigation/NavigationTabs.tsx` — verify Platform still imports it; if yes, keep and only unmount from tenant variant. If no, delete.

## Behavior contract

- Navigator click ⇒ toggle `pinned` via `usePlatformNavState("tenant")`.
- Pin icon click ⇒ flip `pinned` without closing (stopPropagation).
- Opening any header popover closes any other (via `HeaderProvider`).
- Popover row click ⇒ `Link` navigation + `close()` from context.
- Sidebar search filters the tree via `NavigationIndex.searchNavigation`; `/` focuses, `Esc` clears — unchanged.
- ⌘K still opens the global CommandPalette.

## Deferred (documented, not built)

- **Rec 6** (extended nav metadata: `description`, `category`, `aliases`, `badgeProvider`): schema-only change in a follow-up sprint; requires `NAV_REGISTRY` migration and cannot be added without touching every entry. Board explicitly marked recommendations as non-blocking.
- Real Notifications / Tasks / AI popovers — slots reserved via `HeaderProvider`, no components yet.
- Platform shell adoption of the same pattern.

## Verification

- `tsgo` clean.
- Playwright on `/dashboard`: capture screenshots of (a) collapsed header, (b) Navigator open, (c) FavoritesPopover empty + populated, (d) RecentPopover populated, (e) sidebar with tenant context header and reserved footer.
- Manual: pin toggle from header persists across reload; popovers mutually exclusive; keyboard focus returns to trigger on close.

## Non-goals

Routing, permissions, RLS, data model, Platform shell, real badge sources, `NAV_REGISTRY` schema extensions.
