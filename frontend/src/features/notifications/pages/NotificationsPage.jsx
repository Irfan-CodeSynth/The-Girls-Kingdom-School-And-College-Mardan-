import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router';
import notificationApi from '../api/notificationApi';
import { Card, Badge, Skeleton, EmptyState, Button } from '../../../components/ui';
import {
  Bell,
  BellOff,
  CheckCheck,
  Trash2,
  BookOpen,
  ClipboardList,
  Trophy,
  GraduationCap,
  Info,
  ChevronRight,
} from 'lucide-react';
import { toast } from 'sonner';

// ─── Notification type config ─────────────────────────────────
const TYPE_CONFIG = {
  quiz_published: {
    label: 'New Quiz',
    icon: ClipboardList,
    color: 'bg-primary-50 dark:bg-primary-950/60 text-primary-600 dark:text-primary-400',
    badgeVariant: 'primary',
  },
  quiz_graded: {
    label: 'Result Ready',
    icon: Trophy,
    color: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400',
    badgeVariant: 'success',
  },
  result_available: {
    label: 'Submitted',
    icon: CheckCheck,
    color: 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400',
    badgeVariant: 'info',
  },
  enrollment: {
    label: 'Enrolled',
    icon: BookOpen,
    color: 'bg-primary-50 dark:bg-primary-950/60 text-primary-600 dark:text-primary-400',
    badgeVariant: 'primary',
  },
  quiz_deadline: {
    label: 'Deadline',
    icon: Bell,
    color: 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400',
    badgeVariant: 'warning',
  },
  general: {
    label: 'Notice',
    icon: Info,
    color: 'bg-surface-100 dark:bg-surface-700 text-surface-500 dark:text-surface-400',
    badgeVariant: 'default',
  },
};

// ─── Deep-link builder ────────────────────────────────────────
const buildLink = (notification) => {
  const { type, data } = notification;
  if (type === 'quiz_published' && data?.quizId)
    return `/student/quizzes/${data.quizId}`;
  if (type === 'quiz_graded' && data?.quizId && data?.attemptId)
    return `/student/quizzes/${data.quizId}/result/${data.attemptId}`;
  if (type === 'enrollment')
    return '/student/classes';
  return null;
};

// ─── Time ago formatter ───────────────────────────────────────
const timeAgo = (dateStr) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  const h = Math.floor(m / 60);
  const d = Math.floor(h / 24);
  if (d > 0) return `${d}d ago`;
  if (h > 0) return `${h}h ago`;
  if (m > 0) return `${m}m ago`;
  return 'Just now';
};

// ─── Filter tabs ──────────────────────────────────────────────
const FILTERS = [
  { value: 'all',    label: 'All' },
  { value: 'unread', label: 'Unread' },
];

// ─── Single notification item ─────────────────────────────────
const NotificationItem = ({ notification, onMarkRead, onDelete }) => {
  const cfg = TYPE_CONFIG[notification.type] || TYPE_CONFIG.general;
  const Icon = cfg.icon;
  const link = buildLink(notification);
  const isUnread = !notification.isRead;

  const content = (
    <div
      className={`flex items-start gap-4 p-4 transition-colors ${
        isUnread
          ? 'bg-primary-50/40 dark:bg-primary-950/20'
          : 'hover:bg-surface-50 dark:hover:bg-surface-700/40'
      }`}
    >
      {/* Icon */}
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${cfg.color}`}>
        <Icon className="w-5 h-5" />
      </div>

      {/* Body */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <p className={`text-sm font-semibold ${isUnread ? 'text-surface-900 dark:text-white' : 'text-surface-700 dark:text-surface-200'}`}>
              {notification.title}
            </p>
            <Badge variant={cfg.badgeVariant} size="sm">{cfg.label}</Badge>
            {isUnread && (
              <span className="w-2 h-2 rounded-full bg-primary-500 flex-shrink-0" />
            )}
          </div>
          <span className="text-xs text-surface-400 flex-shrink-0 mt-0.5">
            {timeAgo(notification.createdAt)}
          </span>
        </div>
        <p className="text-sm text-surface-500 dark:text-surface-400 mt-1 leading-relaxed">
          {notification.message}
        </p>

        {/* Actions row */}
        <div className="flex items-center gap-3 mt-2">
          {link && (
            <span className="text-xs font-semibold text-primary-600 dark:text-primary-400 flex items-center gap-0.5">
              View details <ChevronRight className="w-3 h-3" />
            </span>
          )}
          {isUnread && (
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); onMarkRead(notification._id); }}
              className="text-xs text-surface-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
            >
              Mark read
            </button>
          )}
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDelete(notification._id); }}
            className="text-xs text-surface-300 hover:text-danger-500 transition-colors ml-auto"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );

  return link ? (
    <Link to={link} onClick={() => isUnread && onMarkRead(notification._id)}>
      {content}
    </Link>
  ) : (
    <div>{content}</div>
  );
};

// ─── Main page ────────────────────────────────────────────────
export const NotificationsPage = () => {
  const [filter, setFilter] = useState('all');
  const queryClient = useQueryClient();

  const { data, isPending } = useQuery({
    queryKey: ['notifications', filter],
    queryFn: () => notificationApi.getNotifications({
      unreadOnly: filter === 'unread',
      limit: 50,
    }),
  });

  const markReadMutation = useMutation({
    mutationFn: (id) => notificationApi.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['unreadCount'] });
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: () => notificationApi.markAllAsRead(),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['unreadCount'] });
      toast.success(`${result.updated} notification${result.updated !== 1 ? 's' : ''} marked as read.`);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => notificationApi.deleteNotification(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['unreadCount'] });
      toast.success('Notification removed.');
    },
  });

  const notifications = data?.notifications || [];
  const unreadCount = data?.unreadCount ?? 0;

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* ── Page header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-surface-900 dark:text-white flex items-center gap-2">
            <Bell className="w-6 h-6 text-primary-600 dark:text-primary-400" />
            Notifications
          </h1>
          <p className="mt-1 text-sm text-surface-500 dark:text-surface-400">
            {unreadCount > 0
              ? `${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}`
              : 'All caught up!'}
          </p>
        </div>

        {unreadCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            leftIcon={<CheckCheck className="w-4 h-4" />}
            loading={markAllReadMutation.isPending}
            onClick={() => markAllReadMutation.mutate()}
          >
            Mark all read
          </Button>
        )}
      </div>

      {/* ── Filter tabs ── */}
      <div className="flex gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              filter === f.value
                ? 'bg-primary-600 text-white'
                : 'bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-400 hover:bg-surface-200 dark:hover:bg-surface-700'
            }`}
          >
            {f.label}
            {f.value === 'unread' && unreadCount > 0 && (
              <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-primary-500 text-white text-xs">
                {unreadCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── Notification list ── */}
      {isPending ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <EmptyState
          icon={filter === 'unread' ? BellOff : Bell}
          title={filter === 'unread' ? 'No Unread Notifications' : 'No Notifications Yet'}
          message={
            filter === 'unread'
              ? "You're all caught up! Switch to 'All' to see your notification history."
              : 'Notifications will appear here when quizzes are published, results are ready, or you are enrolled in a class.'
          }
        />
      ) : (
        <Card className="!p-0 overflow-hidden divide-y divide-surface-100 dark:divide-surface-700">
          {notifications.map((notification) => (
            <NotificationItem
              key={notification._id}
              notification={notification}
              onMarkRead={(id) => markReadMutation.mutate(id)}
              onDelete={(id) => deleteMutation.mutate(id)}
            />
          ))}
        </Card>
      )}

      {/* ── Type legend ── */}
      {!isPending && notifications.length > 0 && (
        <div className="flex flex-wrap gap-3 pt-2">
          {Object.entries(TYPE_CONFIG).map(([key, cfg]) => {
            const Icon = cfg.icon;
            return (
              <span key={key} className="flex items-center gap-1.5 text-xs text-surface-400">
                <span className={`w-5 h-5 rounded-md flex items-center justify-center ${cfg.color}`}>
                  <Icon className="w-3 h-3" />
                </span>
                {cfg.label}
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;
