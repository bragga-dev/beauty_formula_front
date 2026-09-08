import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { notificationService } from "@/services/notification.service";
import type { PageOut } from "@/types/common";
import type { AdminNotificationFilters, NotificationOut } from "@/types/notification";

const UNREAD_POLL_INTERVAL = 30_000;

/**
 * Contagem de não lidas — usada pro badge do sino. Faz polling contínuo
 * (sem WebSocket no backend) enquanto o usuário estiver autenticado;
 * `enabled` controla isso pra não bater a API deslogado.
 */
export function useUnreadNotificationsCount(enabled: boolean) {
  return useQuery({
    queryKey: ["notifications", "unread-count"],
    queryFn: () => notificationService.unreadCount(),
    enabled,
    refetchInterval: enabled ? UNREAD_POLL_INTERVAL : false,
    refetchOnWindowFocus: true,
    staleTime: 15_000,
  });
}

/** Lista de notificações do usuário — usada no painel do sino. `enabled` evita buscar antes do dropdown abrir. */
export function useNotifications(enabled: boolean, unreadOnly = false, page = 1, pageSize = 20) {
  return useQuery({
    queryKey: ["notifications", "list", unreadOnly, page, pageSize],
    queryFn: () => notificationService.list(page, pageSize, unreadOnly),
    enabled,
  });
}

export function useNotificationMutations() {
  const queryClient = useQueryClient();

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["notifications"] });
  };

  const markAsRead = useMutation({
    mutationFn: (id: string) => notificationService.markAsRead(id),
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: ["notifications", "list"] });
      const previousLists = queryClient.getQueriesData<PageOut<NotificationOut>>({
        queryKey: ["notifications", "list"],
      });
      queryClient.setQueriesData<PageOut<NotificationOut>>({ queryKey: ["notifications", "list"] }, (old) => {
        if (!old) return old;
        return { ...old, items: old.items.map((n) => (n.id === id ? { ...n, is_read: true } : n)) };
      });

      const previousCount = queryClient.getQueryData<{ unread_count: number }>(["notifications", "unread-count"]);
      queryClient.setQueryData<{ unread_count: number }>(["notifications", "unread-count"], (old) =>
        old ? { unread_count: Math.max(0, old.unread_count - 1) } : old,
      );

      return { previousLists, previousCount };
    },
    onError: (_err, _id, context) => {
      context?.previousLists?.forEach(([key, data]) => queryClient.setQueryData(key, data));
      if (context?.previousCount) queryClient.setQueryData(["notifications", "unread-count"], context.previousCount);
    },
    onSettled: invalidate,
  });

  const markAllAsRead = useMutation({
    mutationFn: () => notificationService.markAllAsRead(),
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: (id: string) => notificationService.remove(id),
    onSuccess: invalidate,
  });

  return { markAsRead, markAllAsRead, remove };
}

// ═══════════════════════════════════════════════════════════════════
// Admin — visão total
// ═══════════════════════════════════════════════════════════════════

export function useAdminNotifications(filters: AdminNotificationFilters, page = 1, pageSize = 20) {
  return useQuery({
    queryKey: ["notifications", "admin", filters, page, pageSize],
    queryFn: () => notificationService.listForAdmin(filters, page, pageSize),
  });
}