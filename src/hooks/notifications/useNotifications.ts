import { useCallback } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";

import { queryKeys } from "@/lib/query-keys";
import { useOrg } from "@/contexts/org-context";
import { useAuth } from "@/contexts/auth-context";
import {
  getUnreadNotificationCount,
  listMyNotifications,
  markAllNotificationsRead,
  markNotificationArchived,
  markNotificationRead,
  type NotificationRow,
} from "@/lib/notifications/service.functions";

const POLL_MS = 60_000;

export function useNotifications() {
  const { current } = useOrg();
  const { status } = useAuth();
  const orgId = current?.organizationId ?? null;
  const isAuthed = status === "authenticated";
  const qc = useQueryClient();

  const listFn = useServerFn(listMyNotifications);
  const countFn = useServerFn(getUnreadNotificationCount);
  const readFn = useServerFn(markNotificationRead);
  const archFn = useServerFn(markNotificationArchived);
  const allReadFn = useServerFn(markAllNotificationsRead);

  const listQ = useQuery<NotificationRow[]>({
    queryKey: queryKeys.notifications.list(orgId),
    queryFn: () => listFn({ data: { organizationId: orgId, limit: 50 } }),
    enabled: isAuthed && Boolean(orgId),
    refetchInterval: POLL_MS,
    staleTime: 15_000,
  });

  const countQ = useQuery<{ count: number }>({
    queryKey: queryKeys.notifications.unreadCount(orgId),
    queryFn: () => countFn({ data: { organizationId: orgId } }),
    enabled: isAuthed && Boolean(orgId),
    refetchInterval: POLL_MS,
    staleTime: 15_000,
  });

  const invalidate = useCallback(() => {
    void qc.invalidateQueries({ queryKey: queryKeys.notifications.list(orgId) });
    void qc.invalidateQueries({ queryKey: queryKeys.notifications.unreadCount(orgId) });
  }, [qc, orgId]);

  const markRead = useMutation({
    mutationFn: (id: string) => readFn({ data: { id } }),
    onSuccess: invalidate,
  });
  const markArchived = useMutation({
    mutationFn: (id: string) => archFn({ data: { id } }),
    onSuccess: invalidate,
  });
  const markAllRead = useMutation({
    mutationFn: () => allReadFn({ data: { organizationId: orgId } }),
    onSuccess: invalidate,
  });

  return {
    notifications: listQ.data ?? [],
    unreadCount: countQ.data?.count ?? 0,
    isLoading: listQ.isLoading,
    markRead: (id: string) => markRead.mutate(id),
    markArchived: (id: string) => markArchived.mutate(id),
    markAllRead: () => markAllRead.mutate(),
    refetch: invalidate,
  };
}
