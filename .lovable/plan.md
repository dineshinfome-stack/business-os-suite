
# Login Page Redesign — Enterprise Red Theme

Scope: UI-only refresh of `src/routes/login.tsx` (and its co-located `AuthShell`). No auth logic, no route creation, no new dependencies, no new libraries.

## 0. Repository verification rule (do first)

Inspect the repository for existing equivalents and reuse them. Only add new tokens/utilities when no equivalent exists.

- Brand/theme tokens in `src/styles.css` (`@theme inline`, existing `--color-*`).
- Existing `AuthShell` in `src/routes/login.tsx` (already exported).
- Shared Card/Button/Input/Label/Checkbox/Form primitives under `src/components/ui/` and `src/components/forms/`.
- Button variants (`outline`, `ghost`, sizes) via existing `buttonVariants`.
- Animation utilities from `tailwindcss-animate` if configured; otherwise no new animation plugin.
- Existing routes: confirm `/forgot-password`, `/auth`, `/` before linking. Do not invent routes.
- Existing `APP_VERSION` in `src/constants/app.ts` — reuse if present; otherwise omit.
- Existing decorative utilities in `src/styles.css` — reuse before adding a new one.

## 1. Design tokens

Add red brand tokens through the repo's existing Tailwind v4 `@theme inline` block in `src/styles.css`. If an equivalent semantic token already exists, reuse it and only add what's missing. Never hardcode hex in components.

Candidate additions (only if not already covered):

- `--brand-red` `#C62828` · `--brand-red-hover` `#B71C1C` · `--brand-red-dark` `#8E0000`
- `--brand-surface` `#FAFAFA` · `--brand-border` `#E5E7EB`
- `--brand-text` `#111827` · `--brand-text-muted` `#6B7280`
- `--brand-success` `#16A34A` · `--brand-error` `#DC2626`

Mapped to `bg-brand-red`, `text-brand-red`, `border-brand`, `bg-brand-surface`, etc. Do not duplicate utilities already defined.

Reserve red strictly for logo mark, primary CTA, decorative accents, and dev outlined buttons. Keep the rest white/neutral.

## 2. Page structure (`src/routes/login.tsx`)

Keep the route config, `beforeLoad` session redirect, zod schema, react-hook-form wiring, `onSubmit`, and `onGoogleSignIn` handlers **unchanged**. Preserve all existing validation messages, error rendering, loading states, and success/error handling exactly as implemented. Rework only JSX + `AuthShell`.

```
AuthShell  (bg-brand-surface + subtle dotted grid + red corner accents)
└── Card   (max-w-[480px], rounded-2xl, soft shadow, thin border, fade-in if available)
    ├── Header
    │   ├── Business OS logo mark (red square glyph)
    │   ├── Wordmark "Business OS"
    │   ├── Kicker  "Enterprise Operating System"
    │   ├── Tagline "Manage Companies, Teams, Finance, HR, CRM, Projects, and Operations from one platform."
    │   ├── H1 "Welcome Back"
    │   └── Subtitle "Sign in to access your Business Operating System."
    ├── Continue with Google (outline, existing handler)
    ├── Divider "──── OR ────"
    ├── Form
    │   ├── Email    (autoFocus, autoComplete="email")
    │   ├── Password (autoComplete="current-password") + show/hide eye toggle
    │   ├── Row: Remember me checkbox │ Forgot Password link (conditional — see §4)
    │   └── Primary CTA "Login" — full width, h-12, bg-brand-red, hover bg-brand-red-hover, disabled + Loader2 while submitting
    ├── Dev-only Quick Access  (import.meta.env.DEV)
    │   ├── Divider "Development Login"
    │   └── 2×2 grid: Platform Admin / Tenant Admin / Company Admin / Employee
    └── Footer links (stacked, centered)
        ├── "Go to Home"                            → Link to "/"
        ├── "Don't have an account? Create Account" → Link to "/auth"
        └── Privacy Policy · Terms of Service (disabled placeholders — see §7)

Below card (centered):
© 2026 Business OS   (append "· v{APP_VERSION}" only if constant already exists)
```

Reuse the repository's existing `Link` import from TanStack Router. Do not introduce plain `<a>` anchors, browser redirects, additional navigation helpers, or wrapper components. Preserve `autoComplete="email"` and `autoComplete="current-password"` for browser password-manager compatibility.

## 3. Password toggle

- Inline `<Input type={show ? 'text' : 'password'}>` next to a Lucide Eye/EyeOff button.
- Toggle button MUST be `type="button"` (never submits the form).
- `aria-label="Show password" / "Hide password"` + `aria-pressed={show}`.
- Fully keyboard operable; focus ring retained. `FormField` component is not modified.

## 4. Forgot Password

Verify `/forgot-password` exists before linking. If present, render as a `Link` to that route. If absent, render as a disabled span (no link). Do not invent routes.

## 5. Development Login (dev-only)

- Renders only when `import.meta.env.DEV` is true.
- Buttons prefill email + password and invoke the **existing** `onSubmit` handler.
- Must not bypass authentication or introduce alternate auth paths.
- Reuses the existing two demo users where roles overlap.

## 6. Remember Me

Visual-only checkbox. No auth-logic change and no TODO comment left in code.

## 7. Privacy / Terms

Disabled placeholder links (non-interactive spans styled like links, `aria-disabled="true"`). Do not invent routes. Do not leave TODO comments.

## 8. Background & decorative accents

Reuse any existing decorative utility first. If a new decorative utility is required, keep it local to `src/styles.css`, implemented with CSS only. Do not introduce image assets, SVG files, icon components, or background libraries.

## 9. Animation

Reuse the repository's existing animation classes only. Use `animate-in fade-in duration-300` on the card only if `tailwindcss-animate` is already configured. Do not add animation plugins. Respect `prefers-reduced-motion`.

## 10. Accessibility

- Every input keeps `<Label htmlFor>` via existing `FormField`.
- Enter submits (native form). Email autofocused. Full tab order preserved.
- Icon-only buttons carry `aria-label`.
- Colour is never the sole state indicator.

## Files touched

1. `src/styles.css` — add red brand tokens (only what's missing) via existing `@theme inline`; add CSS-only dotted-grid + corner-accent `@utility` only if no equivalent exists.
2. `src/routes/login.tsx` — rework JSX for header, form (password toggle + remember me + autocomplete), dev quick-access grid, footer (with new **Go to Home** above **Create Account**), and `AuthShell` background/version footer. Route config and handlers unchanged.

## Implementation boundary

Code changes are limited to presentation (JSX, styling, local UI state for password visibility) and design tokens. Business logic, authentication flow, routing behavior, validation logic, API calls, and data flow must remain unchanged.

## Out of scope

- No changes to `/auth`, `/forgot-password`, `/reset-password`, `/auth/callback`.
- No auth logic, RBAC, or role-selection changes.
- No new routes; no Privacy/Terms pages.
- No dark-mode variant (light mode only).
- No new npm packages or UI libraries.

## Verification

- `tsgo --noEmit` clean.
- No new lint errors.
- No hardcoded hex in `src/routes/login.tsx`.
- No `console.*` statements added.
- No `TODO` comments added.
- No new dependencies.
- No duplicate components created.
- No unused imports.
- No dead CSS utilities.
- No image or SVG assets added.
- Browser autofill retained (`email`, `current-password`).
- Keyboard accessible (tab order, Enter submits, Eye button `type="button"`).
- Mobile responsive at ≤ `sm`.
- Dev quick login hidden in production build.
- Manual: `/login` renders red theme; **Go to Home** navigates to `/`; **Create Account** navigates to `/auth`.
