import type { SearchProvider } from "@/lib/search/types";
import { registryProvider } from "./registry-provider";
import { databaseProvider } from "./database-provider";

/** Providers in priority order (lower priority number first). */
export const SEARCH_PROVIDERS: readonly SearchProvider[] = Object.freeze(
  [registryProvider, databaseProvider].sort((a, b) => a.priority - b.priority),
);

export { registryProvider, databaseProvider };
export { registerDbLookup } from "./database-provider";
