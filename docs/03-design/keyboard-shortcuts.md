# Keyboard Shortcuts

Status: **Ratified**
Owner: Tenant Shell
Related: ADR-085 (Tenant Header Architecture),
         `src/hooks/header/useHeaderShortcuts.ts`

Global shortcuts for the tenant shell. Shortcuts are suppressed when the
focus is inside an `<input>`, `<textarea>`, or contenteditable element,
unless noted otherwise.

## Implemented

| Shortcut          | Action                                      | Owner                          |
|-------------------|---------------------------------------------|--------------------------------|
| `⌘K` / `Ctrl+K`   | Open command palette                        | `CommandPalette`               |
| `/`               | Focus sidebar navigation search             | `PlatformSidebarV2`            |
| `Esc` (in search) | Clear sidebar search input                  | `PlatformSidebarV2`            |
| `Esc` (any)       | Close the currently open header popover     | `useHeaderShortcuts`           |
| `Ctrl/⌘+Shift+F`  | Toggle Favorites popover                    | `useHeaderShortcuts`           |
| `Ctrl/⌘+Shift+R`  | Toggle Recent popover                       | `useHeaderShortcuts`           |

## Planned

| Shortcut       | Action                                      | Notes                    |
|----------------|---------------------------------------------|--------------------------|
| `Alt + ←`      | Collapse the current navigation group       | design pending           |
| `Alt + →`      | Expand the current navigation group         | design pending           |
| `Ctrl/⌘+Shift+N` | Toggle Notifications popover              | after slot registers     |
| `Ctrl/⌘+Shift+A` | Toggle AI Assistant                       | after slot activates     |

## Conventions

- All modifier combinations use `Ctrl` on Windows/Linux and `⌘` on macOS.
- Shortcuts that toggle a UI surface should also close it on repeat press.
- Every new header slot that opens a popover SHOULD claim a shortcut here
  and wire it through `HeaderProvider.toggle(id)`.
- Shortcuts documented under "Planned" are contract-only: they reserve the
  binding so no other feature claims it.
