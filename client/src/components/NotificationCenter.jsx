import { useState, useEffect, useRef } from 'react';
import { Bell, X, Check, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { listenToNotifications } from '../services/notificationService';
import { notificationAPI } from '../services/api';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';

const NotificationItem = ({ notification, onClick, onDelete, getIcon, formatTime, t }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const messageRef = useRef(null);
    const [isLongMessage, setIsLongMessage] = useState(false);

    useEffect(() => {
        if (messageRef.current) {
            setIsLongMessage(messageRef.current.scrollHeight > 60); // Roughly 3 lines
        }
    }, [notification.message]);

    return (
        <div
            onClick={() => onClick(notification)}
            className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition relative group ${!notification.read ? 'bg-primary/5 dark:bg-primary/10' : ''
                }`}
        >
            <div className="flex items-start gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0 ${!notification.read ? 'bg-white dark:bg-gray-800 shadow-sm border border-primary/20' : 'bg-gray-50 dark:bg-gray-900'
                    }`}>
                    {getIcon(notification.type)}
                </div>
                <div className="flex-1 min-w-0">
                    <div className="relative">
                        <p
                            ref={messageRef}
                            className={`text-sm leading-tight transition-all duration-300 ${!notification.read ? 'font-black text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'
                                } ${!isExpanded ? 'line-clamp-3' : ''}`}
                        >
                            {notification.message}
                        </p>
                        {isLongMessage && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setIsExpanded(!isExpanded);
                                }}
                                className="text-[10px] font-black text-primary uppercase tracking-widest mt-1 hover:underline"
                            >
                                {isExpanded ? t('showLess') : t('readFullMessage')}
                            </button>
                        )}
                    </div>
                    <div className="flex items-center gap-3 mt-2">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
                            {formatTime(notification.createdAt)}
                        </p>
                        {notification.link && notification.link.trim() !== '' && (
                            <span className="text-[9px] font-black text-primary/60 uppercase tracking-widest flex items-center gap-1">
                                {t('clickToView')} <span className="text-lg leading-none">→</span>
                            </span>
                        )}
                    </div>
                </div>
                <button
                    onClick={(e) => onDelete(e, notification.id)}
                    className="opacity-0 group-hover:opacity-100 p-2 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition"
                    title="Dismiss"
                >
                    <Trash2 className="h-3.5 w-3.5 text-red-500" />
                </button>
            </div>
            {!notification.read && (
                <div className="absolute left-1 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-full shadow-[0_0_10px_rgba(30,58,138,0.5)]"></div>
            )}
        </div>
    );
};

export default function NotificationCenter() {
    const { t } = useTranslation();
    const { currentUser } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [realNotifications, setRealNotifications] = useState([]);
    const [chatNotifications, setChatNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();

    // Listen to notifications in real-time
    useEffect(() => {
        if (!currentUser?.uid) {
            setLoading(false);
            return;
        }

        setLoading(true);
        const unsubscribeNotifications = listenToNotifications(currentUser.uid, (fetchedNotifications) => {
            setRealNotifications(fetchedNotifications);
            setLoading(false); // Mark as initially loaded when first batch arrives
        }, (error) => {
            console.error("Failed to listen to real notifications:", error);
            setLoading(false); // Stop spinning even on error
        });

        // Poll for unread chats and merge with notifications
        const fetchUnreadChats = async () => {
            try {
                const response = await import('../services/api').then(m => m.chatAPI.getChats());
                const chats = response.data;
                const unreadChats = chats.filter(chat => (chat.unreadCount?.[currentUser.uid] || 0) > 0);

                // Create synthetic notifications from unread chats
                const chatNotifications = unreadChats.map(chat => {
                    const otherUserId = chat.participants.find(id => id !== currentUser.uid);
                    const otherUserName = chat.participantDetails?.[otherUserId]?.name || 'User';

                    return {
                        id: `chat_${chat.id}`,
                        type: 'new_message',
                        message: `New message from ${otherUserName}`,
                        createdAt: chat.lastMessageTime || new Date().toISOString(),
                        read: false,
                        data: { chatId: chat.id },
                        link: `/messages?chatId=${chat.id}`
                    };
                });

                setChatNotifications(chatNotifications);
                if (loading) setLoading(false);
            } catch (err) {
                console.error("Failed to fetch unread chats", err);
                if (loading) setLoading(false);
            }
        };

        const interval = setInterval(fetchUnreadChats, 5000);
        fetchUnreadChats();

        return () => {
            unsubscribeNotifications();
            clearInterval(interval);
        };
    }, [currentUser?.uid]);

    // Merge and update unread count
    useEffect(() => {
        const merged = [...realNotifications, ...chatNotifications].sort((a, b) => {
            const dateA = new Date(a.createdAt);
            const dateB = new Date(b.createdAt);
            return dateB - dateA;
        });

        setNotifications(merged);

        // Calculate total unread count
        const unreadReal = realNotifications.filter(n => !n.read).length;
        const unreadChats = chatNotifications.length; // Chat notifications are only created for unread chats
        setUnreadCount(unreadReal + unreadChats);
    }, [realNotifications, chatNotifications]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    const handleNotificationClick = async (notification) => {
        // Mark as read (only for real notifications)
        if (!notification.read && typeof notification.id === 'string' && !notification.id.startsWith('chat_')) {
            await notificationAPI.markAsRead(notification.id);
        }

        // Navigate if there's a link
        if (notification.link) {
            navigate(notification.link);
        } else if (notification.data?.chatId) {
            navigate('/messages');
        }

        setIsOpen(false);
    };

    const handleMarkAllRead = async () => {
        // Simple client-side update after calling individually for each
        for (const notif of notifications.filter(n => !n.read && typeof n.id === 'string' && !n.id.startsWith('chat_'))) {
            await notificationAPI.markAsRead(notif.id);
        }
        setNotifications(notifications.map(n => ({ ...n, read: true })));
        setUnreadCount(0);
    };

    const handleDeleteNotification = async (e, notificationId) => {
        e.stopPropagation();
        await notificationAPI.delete(notificationId);
        setNotifications(prev => prev.filter(n => n.id !== notificationId));
    };

    const getNotificationIcon = (type) => {
        switch (type) {
            case 'new_message':
                return '💬';
            case 'chat_request':
                return '📩';
            case 'post_approved':
                return '✅';
            case 'post_deleted':
                return '🚨';
            case 'verification_approved':
                return '🎉';
            case 'item_claimed':
                return '🎯';
            case 'claim_approved':
                return '🎉';
            case 'claim_rejected':
                return '❌';
            case 'points_gain':
                return '⭐';
            case 'proximity_alert':
                return '📍';
            default:
                return '🔔';
        }
    };

    const formatTime = (timestamp) => {
        if (!timestamp) return '';
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return formatDistanceToNow(date, { addSuffix: true });
    };

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Bell Icon */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 rounded-full hover:bg-gray-100 text-gray-600 transition"
                title="Notifications"
            >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown */}
            {isOpen && (
                <div className="absolute right-0 mt-2 w-96 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 z-50 max-h-[600px] flex flex-col animate-in fade-in slide-in-from-top-2 duration-200">
                    {/* Header */}
                    <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between bg-gray-50/50 dark:bg-gray-900/50">
                        <h3 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tight">{t('activity')}</h3>
                        <div className="flex items-center gap-2">
                            {unreadCount > 0 && (
                                <button
                                    onClick={handleMarkAllRead}
                                    className="text-[10px] font-bold text-primary dark:text-blue-400 hover:underline uppercase tracking-widest"
                                >
                                    {t('clearAll')}
                                </button>
                            )}
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition"
                            >
                                <X className="h-4 w-4 text-gray-500" />
                            </button>
                        </div>
                    </div>

                    {/* Notifications List */}
                    <div className="overflow-y-auto flex-1">
                        {loading ? (
                            <div className="p-12 text-center">
                                <Loader2 className="animate-spin h-8 w-8 text-primary mx-auto opacity-50" />
                            </div>
                        ) : notifications.length === 0 ? (
                            <div className="p-12 text-center">
                                <div className="bg-gray-50 dark:bg-gray-900/50 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                    <Bell className="h-8 w-8 text-gray-300 dark:text-gray-600" />
                                </div>
                                <p className="font-bold text-gray-900 dark:text-white">{t('allCaughtUp')}</p>
                                <p className="text-xs text-gray-500 mt-1">{t('noNewAlerts')}</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-50 dark:divide-gray-700">
                                {notifications.map((notification) => (
                                    <NotificationItem
                                        key={notification.id}
                                        notification={notification}
                                        onClick={handleNotificationClick}
                                        onDelete={handleDeleteNotification}
                                        getIcon={getNotificationIcon}
                                        formatTime={formatTime}
                                        t={t}
                                    />
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="p-3 border-t border-gray-100 dark:border-gray-700 bg-gray-50/30 dark:bg-gray-900/30 text-center">
                        <button
                            onClick={() => {
                                setIsOpen(false);
                                navigate('/settings');
                            }}
                            className="text-[11px] font-black text-gray-500 hover:text-primary dark:hover:text-blue-400 transition uppercase tracking-widest"
                        >
                            {t('configurePreferences')}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
