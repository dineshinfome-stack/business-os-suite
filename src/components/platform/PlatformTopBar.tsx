import { Bell, StickyNote, Plus, Power, Sun } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useAuth } from "@/contexts/auth-context";

interface PlatformTopBarProps {
  title: string;
  breadcrumb?: string;
}

export function PlatformTopBar({ title, breadcrumb }: PlatformTopBarProps) {
  const { signOut } = useAuth();

  const IconBtn = ({
    label,
    onClick,
    children,
  }: {
    label: string;
    onClick?: () => void;
    children: React.ReactNode;
  }) => (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="inline-flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-black/5 hover:text-foreground"
    >
      {children}
    </button>
  );

  return (
    <header
      className="sticky top-0 z-20 flex h-14 items-center gap-4 border-b px-6"
      style={{ background: "var(--platform-topbar-bg)", borderColor: "var(--brand-border)" }}
    >
      <div className="flex min-w-0 items-baseline gap-3">
        <h1 className="truncate text-lg font-semibold text-foreground">{title}</h1>
        {breadcrumb && (
          <nav aria-label="Breadcrumb" className="hidden text-xs text-muted-foreground md:block">
            <Link to="/platform" className="hover:text-foreground">Home</Link>
            <span className="mx-1.5">•</span>
            <span>{breadcrumb}</span>
          </nav>
        )}
      </div>

      <div className="ml-auto flex items-center gap-1">
        <IconBtn label="Theme"><Sun className="h-4 w-4" /></IconBtn>
        <IconBtn label="Notes"><StickyNote className="h-4 w-4" /></IconBtn>
        <IconBtn label="Quick add"><Plus className="h-4 w-4" /></IconBtn>
        <div className="relative">
          <IconBtn label="Notifications"><Bell className="h-4 w-4" /></IconBtn>
          <span
            className="pointer-events-none absolute right-1.5 top-1.5 h-2 w-2 rounded-full"
            style={{ background: "var(--brand-red)" }}
          />
        </div>
        <IconBtn label="Sign out" onClick={() => signOut()}>
          <Power className="h-4 w-4" />
        </IconBtn>
      </div>
    </header>
  );
}
