import { Link } from "@tanstack/react-router";
import { HelpCircle, BookOpen, Keyboard, MessageSquare } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useCommandPalette } from "@/hooks/navigation/useCommandPalette";

export function HelpMenu() {
  const palette = useCommandPalette();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Help and resources">
          <HelpCircle className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Help</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to="/docs" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" /> Documentation
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => palette.setOpen(true)}>
          <Keyboard className="h-4 w-4" /> Command palette
        </DropdownMenuItem>
        <DropdownMenuItem disabled>
          <MessageSquare className="h-4 w-4" /> Contact support
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
