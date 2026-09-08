import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  BellRing,
  CalendarCheck,
  CalendarClock,
  CalendarX,
  CalendarSync,
  UserX,
  CreditCard,
  RotateCcw,
  Star,
  MessageSquareText,
  UserCog,
  UserCircle,
  Info,
  Trash2,
  type LucideIcon,
} from "lucide-react";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/feedback/EmptyState";
import { useAuth } from "@/app/providers/auth-context";
import { useNotificationMutations, useNotifications, useUnreadNotificationsCount } from "@/hooks/useNotifications";
import { formatRelativeTime } from "@/utils/format";
import { cn } from "@/utils/cn";
import type { NotificationOut, NotificationType } from "@/types/notification";

const TYPE_ICON: Record<NotificationType, LucideIcon> = {
  scheduling_complete: CalendarCheck,
  scheduling_confirmed: CalendarCheck,
  scheduling_cancelled: CalendarX,
  scheduling_rescheduled: CalendarSync,
  scheduling_reminder: CalendarClock,
  scheduling_no_show: UserX,
  payment_received: CreditCard,
  refund_requested: RotateCcw,
  refund_reviewed: RotateCcw,
  request_rating: MessageSquareText,
  new_rating: Star,
  employee_promoted: UserCog,
  profile_incomplete: UserCircle,
  system: Info,
};

export function NotificationBell() {
  const { isAuthenticated } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const { data: unread } = useUnreadNotificationsCount(isAuthenticated);
  const { data, isLoading, isError } = useNotifications(isAuthenticated && open, false, 1, 20);
  const { markAsRead, markAllAsRead, remove } = useNotificationMutations();

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  if (!isAuthenticated) return null;

  const unreadCount = unread?.unread_count ?? 0;
  const notifications = data?.items ?? [];

  function handleItemClick(n: NotificationOut) {
    if (!n.is_read) markAsRead.mutate(n.id);
    setOpen(false);
    if (n.action_url) navigate(n.action_url);
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label={unreadCount > 0 ? `Notificações (${unreadCount} não lidas)` : "Notificações"}
        className="relative flex h-10 w-10 items-center justify-center rounded-full text-bone-100 transition-colors hover:bg-ink-800 hover:text-gold-400"
      >
        {unreadCount > 0 ? <BellRing className="h-5 w-5" /> : <Bell className="h-5 w-5" />}
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-crimson-500 px-1 text-[10px] font-semibold leading-none text-bone-50">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-40 mt-2 w-[22rem] max-w-[90vw] overflow-hidden rounded-card border border-ink-700 bg-ink-800 shadow-elevated">
          <div className="flex items-center justify-between border-b border-ink-700 px-4 py-3">
            <h3 className="font-display text-sm font-semibold uppercase tracking-wide text-bone-50">Notificações</h3>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={() => markAllAsRead.mutate()}
                disabled={markAllAsRead.isPending}
                className="text-xs font-medium text-gold-400 hover:text-gold-300 disabled:opacity-50"
              >
                Marcar todas como lidas
              </button>
            )}
          </div>

          <div className="max-h-[24rem] overflow-y-auto">
            {isLoading && (
              <div className="space-y-3 p-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            )}

            {isError && <p className="p-4 text-sm text-danger-500">Não foi possível carregar suas notificações.</p>}

            {!isLoading && !isError && notifications.length === 0 && (
              <div className="p-2">
                <EmptyState icon={Bell} title="Sem notificações" description="Você está em dia por aqui." />
              </div>
            )}

            {!isLoading &&
              notifications.map((n) => {
                const Icon = TYPE_ICON[n.notification_type] ?? Info;
                return (
                  <div
                    key={n.id}
                    onClick={() => handleItemClick(n)}
                    className={cn(
                      "group flex cursor-pointer items-start gap-3 border-b border-ink-700/60 px-4 py-3 transition-colors hover:bg-ink-700/50 last:border-b-0",
                      !n.is_read && "bg-ink-700/30",
                    )}
                  >
                    <div
                      className={cn(
                        "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                        n.is_read ? "bg-ink-700 text-bone-500" : "bg-gold-400/15 text-gold-400",
                      )}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <p className={cn("truncate text-sm", n.is_read ? "text-bone-300" : "font-semibold text-bone-50")}>
                          {n.title}
                        </p>
                        {!n.is_read && <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-crimson-500" />}
                      </div>
                      {n.body && <p className="mt-0.5 line-clamp-2 text-xs text-bone-500">{n.body}</p>}
                      <p className="mt-1 text-[11px] text-bone-600">{formatRelativeTime(n.created_at)}</p>
                    </div>
                    <button
                      type="button"
                      aria-label="Excluir notificação"
                      onClick={(e) => {
                        e.stopPropagation();
                        remove.mutate(n.id);
                      }}
                      className="mt-0.5 shrink-0 text-bone-600 opacity-0 transition-opacity hover:text-danger-500 group-hover:opacity-100"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
}