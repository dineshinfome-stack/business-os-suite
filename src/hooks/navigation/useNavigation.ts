import { useMemo } from "react";
import { buildTree } from "@/lib/navigation/tree";
import { filterNavForUser } from "@/lib/navigation/permissions";
import { usePermissions } from "@/contexts/permissions-context";
import { useFeatureFlags } from "@/hooks/settings/useFeatureFlag";

/**
 * Returns the nav tree filtered for the current user's permissions
 * and enabled feature flags. Memoized by (permissions, flags) identity.
 */
export function useNavigation() {
  const perms = usePermissions();
  const flags = useFeatureFlags();

  return useMemo(() => {
    const enabledFlags = new Set<string>(
      (flags.data ?? []).filter((f) => f.enabled).map((f) => f.key),
    );
    const tree = buildTree();
    return filterNavForUser(tree, {
      permissions: perms.permissions,
      featureFlags: enabledFlags,
    });
  }, [perms.permissions, flags.data]);
}
