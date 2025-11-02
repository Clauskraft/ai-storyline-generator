import React, { useState, useEffect } from 'react';
import { notificationService } from '../services/notificationService';
import { BellIcon } from './Icons';

interface NotificationBellProps {
  userId: string;
}

const BellIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);

const NotificationBell: React.FC<NotificationBellProps> = ({ userId }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 5000);
    return () => clearInterval(interval);
  }, [userId]);

  const loadNotifications = () => {
    const n = notificationService.getNotifications(userId);
    setNotifications(n);
    setUnreadCount(notificationService.getUnreadCount(userId));
  };

  const handleMarkAsRead = (notificationId: string) => {
    notificationService.markAsRead(userId, notificationId);
    loadNotifications();
  };

  const handleMarkAllAsRead = () => {
    notificationService.markAllAsRead(userId);
    loadNotifications();
  };

  const handleDelete = (notificationId: string) => {
    notificationService.deleteNotification(userId, notificationId);
    loadNotifications();
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-400 hover:text-white transition-colors"
      >
        <BellIcon className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-96 bg-gray-800 rounded-lg shadow-2xl z-50 max-h-96 overflow-hidden flex flex-col">
            <div className="p-4 border-b border-gray-700 flex justify-between items-center">
              <h3 className="font-bold text-white">Notifications</h3>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="text-xs text-blue-400 hover:text-blue-300"
                >
                  Mark all read
                </button>
              )}
            </div>

            <div className="overflow-y-auto flex-1">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-gray-400">
                  <p>No notifications</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-700">
                  {notifications.slice().reverse().map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 hover:bg-gray-700 transition-colors ${
                        !notification.read ? 'bg-blue-900/20' : ''
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <p className="font-semibold text-white text-sm">
                            {notification.title}
                          </p>
                          <p className="text-gray-300 text-xs mt-1">
                            {notification.message}
                          </p>
                        </div>
                        <button
                          onClick={() => handleDelete(notification.id)}
                          className="text-gray-500 hover:text-gray-300 ml-2"
                        >
                          ✕
                        </button>
                      </div>

                      <div className="flex justify-between items-center mt-2">
                        <span className="text-xs text-gray-500">
                          {new Date(notification.timestamp).toLocaleString()}
                        </span>
                        {!notification.read && (
                          <button
                            onClick={() => handleMarkAsRead(notification.id)}
                            className="text-xs text-blue-400 hover:text-blue-300"
                          >
                            Mark as read
                          </button>
                        )}
                      </div>

                      {notification.action && (
                        <a
                          href={notification.action.url}
                          className="block mt-2 text-xs text-blue-400 hover:text-blue-300"
                        >
                          {notification.action.label} →
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationBell;

