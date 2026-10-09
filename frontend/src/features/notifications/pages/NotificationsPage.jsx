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
    color: 'bg-rose-50 border border-rose-100 text-[#5A0D1A]',
    badgeVariant: 'primary',
  },
  quiz_graded: {
    label: 'Result Ready',
    icon: Trophy,
    color: 'bg-emerald-50 border border-emerald-100 text-emerald-700',
    badgeVariant: 'success',
  },
  result_available: {
    label: 'Submitted',
    icon: CheckCheck,
    color: 'bg-blue-50 border border-blue-100 text-blue-700',
    badgeVariant: 'info',
  },
  enrollment: {
    label: 'Enrolled',
    icon: BookOpen,
    color: 'bg-rose-50 border border-rose-100 text-[#5A0D1A]',
    badgeVariant: 'primary',
  },
  quiz_deadline: {
    label: 'Deadline',
    icon: Bell,
    color: 'bg-amber-50 border border-amber-100 text-amber-700',
    badgeVariant: 'warning',
  },
  general: {
    label: 'Notice',
    icon: Info,
    color: 'bg-[#FAF8F5] border border-[#EFE5E0] text-[#6B7280]',
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
      className={`flex items-start gap-4 p-4.5 transition-colors ${
        isUnread
          ? 'bg-rose-50/25'
          : 'hover:bg-[#FAF8F5]'
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
            <p className={`text-sm font-semibold ${isUnread ? 'text-[#111827] font-bold' : 'text-[#374151]'}`}>
              {notification.title}
            </p>
            <Badge variant={cfg.badgeVariant} size="sm">{cfg.label}</Badge>
            {isUnread && (
              <span className="w-2 h-2 rounded-full bg-[#5A0D1A] flex-shrink-0" />
            )}
          </div>
          <span className="text-xs text-[#6B7280] font-medium flex-shrink-0 mt-0.5">
            {timeAgo(notification.createdAt)}
          </span>
        </div>
        <p className="text-sm text-[#4B5563] mt-1 leading-relaxed">
          {notification.message}
        </p>

        {/* Actions row */}
        <div className="flex items-center gap-3 mt-2.5">
          {link && (
            <span className="text-xs font-bold uppercase tracking-wider text-[#5A0D1A] hover:underline flex items-center gap-0.5">
              View details <ChevronRight className="w-3.5 h-3.5" />
            </span>
          )}
          {isUnread && (
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); onMarkRead(notification._id); }}
              className="text-xs font-semibold text-[#6B7280] hover:text-[#5A0D1A] transition-colors"
            >
              Mark read
            </button>
          )}
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDelete(notification._id); }}
            className="text-xs text-[#9CA3AF] hover:text-red-600 transition-colors ml-auto p-1 rounded-md hover:bg-red-50"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );

  return link ? (
    <Link to={link} onClick={() => isUnread && onMarkRead(notification._id)} className="block">
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
          <h1 className="text-2xl font-serif font-bold tracking-tight text-[#111827] flex items-center gap-2.5">
            <Bell className="w-6 h-6 text-[#5A0D1A]" />
            Notifications
          </h1>
          <p className="mt-1 text-sm text-[#6B7280]">
            {unreadCount > 0
              ? `${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}`
              : 'All caught up!'}
          </p>
        </div>

        {unreadCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            leftIcon={<CheckCheck className="w-4 h-4 text-[#5A0D1A]" />}
            loading={markAllReadMutation.isPending}
            onClick={() => markAllReadMutation.mutate()}
            className="border-[#EFE5E0] text-[#5A0D1A] hover:bg-rose-50 rounded-xl"
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
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
              filter === f.value
                ? 'bg-[#5A0D1A] text-white shadow-xs'
                : 'bg-white border border-[#EFE5E0] text-[#6B7280] hover:text-[#111827] hover:bg-[#FAF8F5]'
            }`}
          >
            {f.label}
            {f.value === 'unread' && unreadCount > 0 && (
              <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-[#5A0D1A] text-white text-[10px]">
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
            <Skeleton key={i} className="h-20 rounded-2xl" />
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
        <Card className="!p-0 overflow-hidden divide-y divide-[#EFE5E0] bg-white border border-[#EFE5E0] shadow-xs rounded-2xl">
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
              <span key={key} className="flex items-center gap-1.5 text-xs text-[#6B7280] font-medium">
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
