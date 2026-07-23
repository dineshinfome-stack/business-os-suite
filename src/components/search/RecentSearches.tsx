import { Clock, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CommandGroup, CommandItem } from "@/components/ui/command";
import { Can } from "@/components/auth/Can";
import type { RecentSearchRow } from "@/lib/search/service.functions";

interface Props {
  recent: RecentSearchRow[];
  onSelect: (query: string) => void;
  onClear: () => void;
  isClearing?: boolean;
}

export function RecentSearches({ recent, onSelect, onClear, isClearing }: Props) {
  if (recent.length === 0) return null;
  return (
    <CommandGroup
      heading={
        <div className="flex items-center justify-between">
          <span>Recent searches</span>
          <Can permission="search.history.manage">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-xs"
              disabled={isClearing}
              onClick={(e) => {
                e.preventDefault();
                onClear();
              }}
            >
              <X className="mr-1 h-3 w-3" />
              Clear
            </Button>
          </Can>
        </div>
      }
    >
      {recent.map((r) => (
        <CommandItem
          key={r.id}
          value={`recent:${r.id}`}
          onSelect={() => onSelect(r.query)}
        >
          <Clock className="mr-2 h-4 w-4" />
          <span>{r.query}</span>
          {r.resourceType && (
            <span className="ml-auto text-xs text-muted-foreground">{r.resourceType}</span>
          )}
        </CommandItem>
      ))}
    </CommandGroup>
  );
}
