import React from 'react';
import { X, CheckCircle2, FileCheck, RefreshCw, Loader2, ChevronRight } from 'lucide-react';
import { useNotification } from '../contexts/NotificationContext';
import { cn } from '../lib/utils';
import { api } from '../lib/api';

export default function NotificationPanel() {
  const {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    addNotification,
    isPanelOpen,
    setIsPanelOpen,
    fetchNotifications,
  } = useNotification();

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'teacher_approval':
        return <FileCheck className="w-5 h-5" />;
      case 'system_alert':
        return <CheckCircle2 className="w-5 h-5" />;
      case 'data_sync':
        return <RefreshCw className="w-5 h-5" />;
      default:
        return <CheckCircle2 className="w-5 h-5" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'teacher_approval':
        return 'bg-red-100 text-red-600';
      case 'system_alert':
        return 'bg-yellow-100 text-yellow-600';
      case 'data_sync':
        return 'bg-blue-100 text-blue-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <span className="px-2 py-0.5 bg-red-100 text-red-600 text-xs font-bold rounded-full">URGENT</span>;
      case 'medium':
        return <span className="px-2 py-0.5 bg-yellow-100 text-yellow-600 text-xs font-bold rounded-full">MEDIUM</span>;
      case 'low':
        return <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs font-bold rounded-full">LOW</span>;
    }
  };

  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMins = Math.floor(diffInMs / 60000);
    const diffInHours = Math.floor(diffInMins / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInMins < 1) return 'Just now';
    if (diffInMins < 60) return `${diffInMins} min ago`;
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  };

  const handleApproveTeacher = async (requestId: string, email: string) => {
    try {
      await api.approveRequest(requestId, 'Approved from dashboard');
      addNotification({
        type: 'system_alert',
        title: 'Teacher Approved',
        message: `Approved! Teacher can now log in with their password.`,
        isRead: false,
        priority: 'medium',
      });
      fetchNotifications();
    } catch (error) {
      console.error('Error approving teacher:', error);
      addNotification({
        type: 'system_alert',
        title: 'Approval Failed',
        message: 'Could not approve teacher. Please try again.',
        isRead: false,
        priority: 'high',
      });
    }
  };

  const handleRejectTeacher = async (requestId: string, email: string) => {
    try {
      await api.rejectRequest(requestId, 'Rejected from dashboard');
      addNotification({
        type: 'system_alert',
        title: 'Teacher Request Rejected',
        message: `Rejected ${email} as a teacher`,
        isRead: false,
        priority: 'medium',
      });
      fetchNotifications();
    } catch (error) {
      console.error('Error rejecting teacher:', error);
      addNotification({
        type: 'system_alert',
        title: 'Rejection Failed',
        message: 'Could not reject request. Please try again.',
        isRead: false,
        priority: 'high',
      });
    }
  };

  const handleNotificationClick = (notification: any) => {
    markAsRead(notification.id);
    if (notification.actionUrl) {
      setIsPanelOpen(false);
    }
  };

  if (!isPanelOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 z-40 animate-in fade-in duration-200"
        onClick={() => setIsPanelOpen(false)}
      />

      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 animate-in slide-in-from-right duration-300">
        <div className="flex flex-col h-full">
          <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-extrabold" style={{ color: '#2B3674' }}>Notifications</h2>
              <p className="text-sm text-slate-600">
                {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {!!unreadCount && (
                <button
                  onClick={markAllAsRead}
                  className="text-sm font-bold text-red-600 hover:text-red-700 transition-colors"
                >
                  Mark all as read
                </button>
              )}
              <button
                onClick={() => setIsPanelOpen(false)}
                className="p-2 rounded-full hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5 text-slate-600" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full px-6">
                <CheckCircle2 className="w-16 h-16 text-slate-300 mb-4" />
                <h3 className="text-lg font-bold text-slate-600 mb-2">All caught up!</h3>
                <p className="text-sm text-slate-500 text-center">
                  You have no new notifications.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={cn(
                      'px-6 py-4 cursor-pointer transition-all hover:bg-slate-50',
                      !notification.isRead && 'bg-amber-50 border-l-4 border-amber-400'
                    )}
                  >
                    <div className="flex gap-3">
                      <div
                        className={cn(
                          'w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0',
                          getNotificationColor(notification.type)
                        )}
                      >
                        {getNotificationIcon(notification.type)}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h3 className="text-sm font-bold text-slate-900 truncate">
                            {notification.title}
                          </h3>
                          {getPriorityBadge(notification.priority)}
                        </div>
                        <p className="text-xs text-slate-600 mb-2 line-clamp-2">
                          {notification.message}
                        </p>
                        <div className="flex items-center justify-between">
                          <p className="text-[10px] text-slate-500">
                            {formatTimestamp(notification.timestamp)}
                          </p>

                          {notification.type === 'teacher_approval' && notification.requestId && (
                            <div className="flex gap-2 mt-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleApproveTeacher(notification.requestId!, notification.email!);
                                }}
                                className="px-3 py-1 bg-green-600 text-white text-xs font-bold rounded-full hover:bg-green-700 transition-colors"
                              >
                                Approve
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRejectTeacher(notification.requestId!, notification.email!);
                                }}
                                className="px-3 py-1 bg-red-600 text-white text-xs font-bold rounded-full hover:bg-red-700 transition-colors"
                              >
                                Reject
                              </button>
                            </div>
                          )}

                          {notification.type !== 'teacher_approval' && notification.actionUrl && (
                            <button className="text-xs font-bold text-red-600 hover:text-red-700 flex items-center gap-1">
                              View <ChevronRight className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
