
import React, { useState, useEffect, useRef } from 'react';
import { Bell, XCircle } from 'lucide-react';
import { useNotifications } from '../contexts/NotificationContext';
import { useLanguage } from '../contexts/LanguageContext';

const NotificationBell: React.FC = () => {
    const { notifications, unreadCount, markAllAsRead, navigateToProject } = useNotifications();
    const { t } = useLanguage();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const timeSince = (date: string) => {
        const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
        let interval = seconds / 31536000;
        if (interval > 1) return Math.floor(interval) + "y ago";
        interval = seconds / 2592000;
        if (interval > 1) return Math.floor(interval) + "mo ago";
        interval = seconds / 86400;
        if (interval > 1) return Math.floor(interval) + "d ago";
        interval = seconds / 3600;
        if (interval > 1) return Math.floor(interval) + "h ago";
        interval = seconds / 60;
        if (interval > 1) return Math.floor(interval) + "m ago";
        return Math.floor(seconds) + "s ago";
    }

    const handleNotificationClick = (notificationId: string, projectId: number) => {
      navigateToProject(projectId, notificationId);
      setIsOpen(false);
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-full transition-colors"
                aria-label={`Notifications (${unreadCount} unread)`}
            >
                <Bell size={20} />
                {unreadCount > 0 && (
                    <span className="absolute top-0 end-0 block h-4 w-4 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center font-bold ring-2 ring-slate-900/70">
                        {unreadCount}
                    </span>
                )}
            </button>
            {isOpen && (
                <div className="absolute end-0 mt-2 w-80 bg-slate-800 border border-slate-700 rounded-lg shadow-2xl z-20 animate-fade-in-fast">
                    <div className="p-3 flex justify-between items-center border-b border-slate-700">
                        <h3 className="font-semibold text-white">{t('notificationBell.title')}</h3>
                        <button
                            onClick={(e) => { e.stopPropagation(); markAllAsRead(); }}
                            className="text-xs text-cyan-400 hover:underline"
                            disabled={unreadCount === 0}
                        >
                            {t('notificationBell.markAllAsRead')}
                        </button>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                        {notifications.length > 0 ? (
                            notifications.map(n => (
                                <div
                                    key={n.id}
                                    onClick={() => handleNotificationClick(n.id, n.projectId)}
                                    className="p-3 flex gap-3 border-b border-slate-700/50 hover:bg-slate-700/50 cursor-pointer transition-colors"
                                >
                                    {!n.read && <div className="w-2 h-2 bg-cyan-400 rounded-full mt-1.5 flex-shrink-0"></div>}
                                    <div className={`flex-grow ${n.read ? 'ms-5' : ''}`}>
                                        <p className="text-sm text-slate-300">{n.message}</p>
                                        <p className="text-xs text-slate-500 mt-1">{timeSince(n.timestamp)}</p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="p-8 text-center text-sm text-slate-500">{t('notificationBell.noNotifications')}</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationBell;
