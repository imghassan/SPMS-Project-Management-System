import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Check, X, Clock, Inbox, UserPlus, ClipboardList, MessageSquare, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import notificationsApi from '../api/notificationsApi';
import api from '../api/apiClient';
import { formatDistanceToNow } from 'date-fns';
import '../styles/Components/NotificationDropdown.css';

const NotificationDropdown = ({ onClose }) => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await notificationsApi.getNotifications();
      setNotifications(res.data.data);
    } catch (err) {
      console.error('Failed to fetch notifications', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkRead = async (id) => {
    try {
      await notificationsApi.markRead(id);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
    } catch (err) {
      console.error('Failed to mark read', err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationsApi.markAllRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (err) {
      console.error('Failed to mark all read', err);
    }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    try {
      await notificationsApi.deleteNotification(id);
      setNotifications(prev => prev.filter(n => n._id !== id));
    } catch (err) {
      console.error('Failed to delete notification', err);
    }
  };

  const handleClearAll = async () => {
    if (!window.confirm('Are you sure you want to clear all notifications?')) return;
    try {
      await notificationsApi.clearAll();
      setNotifications([]);
    } catch (err) {
      console.error('Failed to clear all notifications', err);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'task_assigned': return <ClipboardList size={18} className="text-[#00D1FF]" />;
      case 'invitation_received': return <UserPlus size={18} className="text-[#10B981]" />;
      case 'comment_added': return <MessageSquare size={18} className="text-[#F59E0B]" />;
      case 'task_completed': return <Check size={18} className="text-[#10B981]" />;
      case 'chat_message': return <MessageSquare size={18} className="text-[#00D1FF]" />;
      default: return <Bell size={18} className="text-[#94A3B8]" />;
    }
  };

  const handleInvitationResponse = async (e, notification, status) => {
    e.stopPropagation();
    const invitationId = notification.metadata?.invitationId;
    if (!invitationId) return;

    // Immediately remove from UI to provide instant feedback
    setNotifications(prev => prev.filter(n => n._id !== notification._id));

    try {
      await api.put(`/invitations/${invitationId}/respond`, { status });
    } catch (err) {
      console.error('Failed to respond to invitation', err);
      // Optional: Restore notification if action failed
      fetchNotifications();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.95 }}
      className="nd-container"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="nd-header">
        <h3 className="nd-title">Notifications</h3>
        <div className="flex items-center gap-3">
          {notifications.some(n => !n.isRead) && (
            <button className="nd-mark-all" onClick={handleMarkAllRead}>
              Mark all read
            </button>
          )}
          {notifications.length > 0 && (
            <button 
              className="nd-clear-all" 
              onClick={handleClearAll}
              title="Clear all notifications"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      </div>

      <div className="nd-list custom-scrollbar">
        {loading ? (
          <div className="nd-empty">
            <div className="w-8 h-8 border-2 border-[#00D1FF] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : notifications.length === 0 ? (
          <div className="nd-empty">
            <Inbox size={40} className="text-[#94A3B8] opacity-20" />
            <p className="nd-empty-text">No notifications yet</p>
          </div>
        ) : (
          notifications.map(notification => (
            <div
              key={notification._id}
              className={`nd-item group ${!notification.isRead ? 'unread' : ''}`}
              onClick={() => {
                if (notification.link) {
                  navigate(notification.link);
                  onClose && onClose();
                }
                handleMarkRead(notification._id);
              }}
            >
              <div className="flex gap-3 w-full">
                <div className="nd-icon-wrap shrink-0">
                  {getIcon(notification.type)}
                </div>
                <div className="nd-content flex-1">
                  <span className="nd-item-title">{notification.title}</span>
                  <p className="nd-item-message">{notification.message}</p>

                  {notification.type === 'invitation_received' && !notification.isRead && (
                    <div className="nd-actions">
                      <button
                        onClick={(e) => handleInvitationResponse(e, notification, 'declined')}
                        className="nd-btn-reject"
                      >
                        Reject
                      </button>
                      <button
                        onClick={(e) => handleInvitationResponse(e, notification, 'accepted')}
                        className="nd-btn-accept"
                      >
                        Accept
                      </button>
                    </div>
                  )}

                  <span className="nd-item-time">
                    <Clock size={10} className="inline mr-1" />
                    {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                  </span>
                </div>
                <button
                  className="nd-delete-btn opacity-0 group-hover:opacity-100"
                  onClick={(e) => handleDelete(e, notification._id)}
                >
                  <X size={14} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {notifications.length > 0 && (
        <div className="nd-footer">
          <button
            className="nd-btn-view-all uppercase tracking-wider text-[#00D1FF] hover:text-white transition-colors text-[11px] font-bold"
            onClick={handleMarkAllRead}
          >
            Mark all as read
          </button>
        </div>
      )}
    </motion.div>
  );
};

export default NotificationDropdown;
