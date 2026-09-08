export type NotificationType =
  | "scheduling_complete"
  | "scheduling_confirmed"
  | "scheduling_cancelled"
  | "scheduling_rescheduled"
  | "scheduling_reminder"
  | "scheduling_no_show"
  | "payment_received"
  | "refund_requested"
  | "refund_reviewed"
  | "request_rating"
  | "new_rating"
  | "employee_promoted"
  | "profile_incomplete"
  | "system";

export interface NotificationOut {
  id: string;
  notification_type: NotificationType;
  title: string;
  body: string;
  action_url: string;
  is_read: boolean;
  created_at: string;
}

export interface UnreadCountOut {
  unread_count: number;
}

export interface MarkAllReadOut {
  updated: number;
}

export interface AdminNotificationFilters {
  userId?: string;
  read?: boolean;
}