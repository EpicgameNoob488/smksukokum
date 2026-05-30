import React, { useState, useRef, useEffect } from 'react';
import { Bell, FileCheck, CheckCircle2, RefreshCw, Loader2, ChevronRight } from 'lucide-react';
import { useNotification, type Notification } from '../contexts/NotificationContext';
import { tokens, DT } from '../lib/designTokens';
import { api } from '../lib/api';

export default function NotificationBell() {
  const {
    notifications,
    unreadCount,
    isLoading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    addNotification,
    setIsPanelOpen,
    triggerPendingRolesRefresh,
  } = useNotification();

  const [isHovered, setIsHovered] = useState(false);
  const [hoverTimeout, setHoverTimeout] = useState<NodeJS.Timeout | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleMouseEnter = () => {
    if (hoverTimeout) clearTimeout(hoverTimeout);
    setHoverTimeout(setTimeout(() => setIsHovered(true), 100));
  };

  const handleMouseLeave = () => {
    if (hoverTimeout) {
      clearTimeout(hoverTimeout);
      setHoverTimeout(setTimeout(() => setIsHovered(false), 150));
    }
  };

  useEffect(() => {
    return () => {
      if (hoverTimeout) clearTimeout(hoverTimeout);
    };
  }, [hoverTimeout]);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'teacher_approval':
        return <FileCheck className="w-4 h-4" />;
      case 'system_alert':
        return <CheckCircle2 className="w-4 h-4" />;
      case 'data_sync':
        return <RefreshCw className="w-4 h-4" />;
      default:
        return <CheckCircle2 className="w-4 h-4" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'teacher_approval':
        return 'bg-red-50 text-red-600';
      case 'system_alert':
        return 'bg-amber-50 text-amber-600';
      case 'data_sync':
        return 'bg-blue-50 text-blue-600';
      default:
        return 'bg-gray-50 text-gray-600';
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <span className="px-1.5 py-0.5 bg-red-500 text-white text-[9px] font-bold rounded-full">URGENT</span>;
      case 'medium':
        return <span className="px-1.5 py-0.5 bg-orange-500 text-white text-[9px] font-bold rounded-full">MEDIUM</span>;
      case 'low':
        return <span className="px-1.5 py-0.5 bg-gray-400 text-white text-[9px] font-bold rounded-full">LOW</span>;
    }
  };

  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMins = Math.floor(diffInMs / 60000);
    const diffInHours = Math.floor(diffInMins / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInMins < 1) return 'Just now';
    if (diffInMins < 60) return `${diffInMins}m ago`;
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${diffInDays}d ago`;
  };

  const handleApproveTeacher = async (requestId: string, email: string) => {
    try {
      await api.approveRequest(requestId, 'Approved from notification bell');
      addNotification({
        type: 'system_alert',
        title: 'Teacher Approved',
        message: `Approved! Teacher can now log in with their password.`,
        isRead: false,
        priority: 'medium',
      });
      fetchNotifications();
      triggerPendingRolesRefresh();
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
      await api.rejectRequest(requestId, 'Rejected from notification bell');
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

  const handleOpenPanel = () => {
    setIsHovered(false);
    setIsPanelOpen(true);
  };

  const handleNotificationClick = (notification: Notification) => {
    markAsRead(notification.id);
  };

  const displayedNotifications = notifications.slice(0, 5);
  const hasMore = notifications.length > 5;

  return (
    <div className="relative">
      <button
        onClick={handleOpenPanel}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={`w-10 h-10 ${DT.radius.full} flex items-center justify-center ${DT.shadow.sm} hover:bg-slate-50 transition-all ${DT.transition.normal} cursor-pointer border group`}
        style={{ backgroundColor: tokens.colors.cardInnerBg, borderColor: tokens.colors.lightBorder }}
        title="Notifications"
      >
        <Bell className="w-5 h-5 transition-transform duration-200 group-hover:scale-110" style={{ color: tokens.colors.textMuted }} />
        {unreadCount > 0 && (
          <span
            className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] rounded-full border-2 border-white flex items-center justify-center text-[10px] font-bold text-white animate-pulse"
            style={{
              backgroundColor: tokens.colors.primaryRed,
              minWidth: unreadCount > 9 ? '22px' : '18px',
            }}
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isHovered && (
        <div
          ref={dropdownRef}
          className={`absolute right-0 top-full mt-2 w-80 backdrop-blur-xl ${DT.shadow.modal} ${DT.radius.md} border animate-in fade-in slide-in-from-top-2 ${DT.transition.normal} z-50`}
          style={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', borderColor: tokens.colors.lightBorder }}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <div className="px-4 py-3 border-b" style={{ borderColor: tokens.colors.lighterBorder }}>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold" style={{ color: tokens.colors.textNavy }}>
                  Notifications
                  {unreadCount > 0 && (
                    <span className="ml-2 text-xs font-semibold" style={{ color: tokens.colors.textMuted }}>
                      ({unreadCount} unread)
                    </span>
                  )}
                </h3>
              </div>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-xs font-bold hover:underline transition-all"
                  style={{ color: tokens.colors.primaryRed }}
                >
                  Mark all read
                </button>
              )}
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin" style={{ color: tokens.colors.textMuted }} />
              </div>
            ) : notifications.length === 0 ? (
              <div className="py-12 px-4 text-center">
                <CheckCircle2 className="w-12 h-12 mx-auto mb-3" style={{ color: tokens.colors.textMuted, opacity: 0.5 }} />
                <p className="text-sm font-medium" style={{ color: tokens.colors.textMuted }}>
                  All caught up!
                </p>
                <p className="text-xs mt-1" style={{ color: tokens.colors.textMuted, opacity: 0.7 }}>
                  No new notifications
                </p>
              </div>
            ) : (
              <>
                {displayedNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`px-4 py-3 cursor-pointer transition-all hover:bg-slate-50 border-b last:border-b-0 ${
                      !notification.isRead ? 'bg-amber-50/50' : ''
                    }`}
                    style={{ borderColor: tokens.colors.lighterBorder }}
                  >
                    <div className="flex gap-3">
                      <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${getNotificationColor(
                          notification.type
                        )}`}
                      >
                        {getNotificationIcon(notification.type)}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h4 className="text-xs font-bold truncate flex-1" style={{ color: tokens.colors.textNavy }}>
                            {notification.title}
                          </h4>
                          {getPriorityBadge(notification.priority)}
                        </div>
                        <p className="text-[11px] text-slate-600 mb-2 line-clamp-2 leading-relaxed">
                          {notification.message}
                        </p>
                        <div className="flex items-center justify-between">
                          <p className="text-[10px]" style={{ color: tokens.colors.textMuted }}>
                            {formatTimestamp(notification.timestamp)}
                          </p>

                          {notification.type === 'teacher_approval' && notification.requestId && (
                            <div className="flex gap-1.5 mt-1">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleApproveTeacher(notification.requestId!, notification.email!);
                                }}
                                className="px-2.5 py-1 text-[10px] font-bold text-white bg-green-600 rounded-full hover:bg-green-700 transition-colors"
                              >
                                Approve
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRejectTeacher(notification.requestId!, notification.email!);
                                }}
                                className="px-2.5 py-1 text-[10px] font-bold text-white rounded-full hover:opacity-90 transition-colors"
                                style={{ backgroundColor: tokens.colors.primaryRed }}
                              >
                                Reject
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {hasMore && (
                  <div className="px-4 py-3 border-t bg-slate-50/50" style={{ borderColor: tokens.colors.lighterBorder }}>
                    <button
                      onClick={handleOpenPanel}
                      className="w-full text-center text-xs font-bold hover:underline transition-all"
                      style={{ color: tokens.colors.primaryRed }}
                    >
                      View all {notifications.length} notifications
                      <ChevronRight className="inline-block w-3 h-3 ml-1" />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
