import { CommandItem } from "@/components/ui/command";
import { ChevronRight } from "lucide-react";
import type { SearchResult } from "@/lib/search/types";

interface Props {
  result: SearchResult;
  onSelect: (r: SearchResult) => void;
}

export function SearchItem({ result, onSelect }: Props) {
  return (
    <CommandItem
      value={`${result.resource_type}:${result.id}`}
      onSelect={() => onSelect(result)}
      className="flex items-center gap-2"
    >
      <div className="flex flex-1 flex-col">
        <span className="text-sm font-medium">{result.title}</span>
        {result.subtitle && (
          <span className="text-xs text-muted-foreground">{result.subtitle}</span>
        )}
      </div>
      <span className="text-xs uppercase tracking-wide text-muted-foreground">
        {result.resource_type}
      </span>
      <ChevronRight className="h-3 w-3 text-muted-foreground" />
    </CommandItem>
  );
}
