import { Link, useNavigate } from "@tanstack/react-router";
import { LogOut, Settings, User as UserIcon, Keyboard, Sun, Moon, Monitor } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";
import { useTheme } from "@/contexts/theme-context";
import { useCommandPalette } from "@/hooks/navigation/useCommandPalette";
import { initials } from "@/utils/string";

/**
 * SPR-PLT-0005 — Profile menu in top navigation.
 */
export function ProfileMenu() {
  const auth = useAuth();
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const palette = useCommandPalette();

  const displayName = auth.profile?.displayName ?? auth.user?.email ?? "User";
  const email = auth.user?.email ?? "";
  const initialsText = initials(displayName || email || "U");

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full"
          aria-label="Open profile menu"
        >
          <Avatar className="h-8 w-8">
            {auth.profile?.avatarUrl && <AvatarImage src={auth.profile.avatarUrl} alt="" />}
            <AvatarFallback className="text-xs">{initialsText}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-0.5">
            <p className="text-sm font-medium leading-none">{displayName}</p>
            {email && (
              <p className="truncate text-xs leading-none text-muted-foreground">{email}</p>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to="/settings" className="flex items-center gap-2">
            <UserIcon className="h-4 w-4" /> My business
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" /> Preferences
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => palette.setOpen(true)}>
          <Keyboard className="h-4 w-4" /> Keyboard shortcuts
        </DropdownMenuItem>
        <DropdownMenuSub>
          <DropdownMenuSubTrigger className="gap-2">
            {theme === "dark" ? (
              <Moon className="h-4 w-4" />
            ) : theme === "light" ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Monitor className="h-4 w-4" />
            )}
            Theme
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuItem onSelect={() => setTheme("light")}>
              <Sun className="h-4 w-4" /> Light
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => setTheme("dark")}>
              <Moon className="h-4 w-4" /> Dark
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => setTheme("system")}>
              <Monitor className="h-4 w-4" /> System
            </DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onSelect={() => {
            void (async () => {
              await auth.signOut();
              await navigate({ to: "/login" });
            })();
          }}
          className="text-destructive focus:text-destructive"
        >
          <LogOut className="h-4 w-4" /> Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
