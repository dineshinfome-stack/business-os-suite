import { CommandGroup } from "@/components/ui/command";
import { SearchItem } from "./SearchItem";
import type { SearchResult } from "@/lib/search/types";

interface Props {
  results: SearchResult[];
  onSelect: (r: SearchResult) => void;
}

export function SearchResults({ results, onSelect }: Props) {
  if (results.length === 0) return null;
  return (
    <CommandGroup heading="Results">
      {results.map((r) => (
        <SearchItem key={`${r.resource_type}:${r.id}`} result={r} onSelect={onSelect} />
      ))}
    </CommandGroup>
  );
}
