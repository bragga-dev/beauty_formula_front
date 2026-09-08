import { api } from "./api";
import type { PageOut } from "@/types/common";
import type { AdminNotificationFilters, MarkAllReadOut, NotificationOut, UnreadCountOut } from "@/types/notification";

/**
 * Consome a app `notifications` do backend (model `Notification`, router
 * montado em `/notifications/`). Ver
 * `beauty_formula/apps/notifications/api/notification.py`.
 */
export const notificationService = {
  // Usuário (qualquer role autenticado)
  list: (page = 1, page_size = 20, unreadOnly = false) =>
    api
      .get<PageOut<NotificationOut>>("/notifications/", { params: { page, page_size, unread_only: unreadOnly } })
      .then((r) => r.data),

  unreadCount: () => api.get<UnreadCountOut>("/notifications/unread-count/").then((r) => r.data),

  markAsRead: (notificationId: string) =>
    api.post<NotificationOut>(`/notifications/${notificationId}/read/`).then((r) => r.data),

  markAllAsRead: () => api.post<MarkAllReadOut>("/notifications/read-all/").then((r) => r.data),

  remove: (notificationId: string) => api.delete(`/notifications/${notificationId}/`),

  // Admin
  listForAdmin: (filters: AdminNotificationFilters, page = 1, page_size = 20) =>
    api
      .get<PageOut<NotificationOut>>("/notifications/admin/list-all", {
        params: {
          page,
          page_size,
          user_id: filters.userId || undefined,
          read: filters.read,
        },
      })
      .then((r) => r.data),
};