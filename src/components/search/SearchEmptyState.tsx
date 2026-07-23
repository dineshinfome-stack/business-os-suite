import { SearchIcon } from "lucide-react";

interface Props {
  query: string;
}

export function SearchEmptyState({ query }: Props) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-8 text-center text-muted-foreground">
      <SearchIcon className="h-6 w-6" />
      <p className="text-sm">
        {query ? (
          <>No results for <span className="font-medium">&ldquo;{query}&rdquo;</span></>
        ) : (
          "Start typing to search"
        )}
      </p>
    </div>
  );
}
