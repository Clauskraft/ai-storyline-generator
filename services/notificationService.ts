/**
 * Notification Service
 * Handles push notifications and email notifications
 */

export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
  action?: {
    label: string;
    url: string;
  };
}

class NotificationService {
  private notifications: Map<string, Notification[]> = new Map();
  private permissionRequested = false;

  /**
   * Request push notification permission
   */
  async requestPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications');
      return 'denied';
    }

    if (this.permissionRequested && Notification.permission !== 'default') {
      return Notification.permission;
    }

    this.permissionRequested = true;
    const permission = await Notification.requestPermission();
    return permission;
  }

  /**
   * Show browser notification
   */
  async showNotification(title: string, options?: NotificationOptions): Promise<void> {
    const permission = await this.requestPermission();

    if (permission !== 'granted') {
      console.warn('Notification permission not granted');
      return;
    }

    new Notification(title, {
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      ...options,
    });
  }

  /**
   * Add in-app notification
   */
  addNotification(userId: string, notification: Notification): void {
    if (!this.notifications.has(userId)) {
      this.notifications.set(userId, []);
    }

    const userNotifications = this.notifications.get(userId)!;
    userNotifications.push(notification);

    // Keep only last 50 notifications
    if (userNotifications.length > 50) {
      userNotifications.shift();
    }

    // Persist to localStorage
    this.persistNotifications(userId);

    // Show browser notification if enabled
    if (Notification.permission === 'granted') {
      this.showNotification(notification.title, {
        body: notification.message,
        tag: notification.id,
      });
    }
  }

  /**
   * Get notifications for user
   */
  getNotifications(userId: string): Notification[] {
    this.loadNotifications(userId);
    return this.notifications.get(userId) || [];
  }

  /**
   * Get unread count
   */
  getUnreadCount(userId: string): number {
    const notifications = this.getNotifications(userId);
    return notifications.filter(n => !n.read).length;
  }

  /**
   * Mark notification as read
   */
  markAsRead(userId: string, notificationId: string): void {
    const notifications = this.getNotifications(userId);
    const notification = notifications.find(n => n.id === notificationId);
    
    if (notification) {
      notification.read = true;
      this.persistNotifications(userId);
    }
  }

  /**
   * Mark all as read
   */
  markAllAsRead(userId: string): void {
    const notifications = this.getNotifications(userId);
    notifications.forEach(n => n.read = true);
    this.persistNotifications(userId);
  }

  /**
   * Delete notification
   */
  deleteNotification(userId: string, notificationId: string): void {
    const notifications = this.getNotifications(userId);
    const index = notifications.findIndex(n => n.id === notificationId);
    
    if (index > -1) {
      notifications.splice(index, 1);
      this.persistNotifications(userId);
    }
  }

  /**
   * Persist notifications to localStorage
   */
  private persistNotifications(userId: string): void {
    try {
      const notifications = this.notifications.get(userId) || [];
      localStorage.setItem(`notifications_${userId}`, JSON.stringify(notifications));
    } catch (error) {
      console.error('Failed to persist notifications:', error);
    }
  }

  /**
   * Load notifications from localStorage
   */
  private loadNotifications(userId: string): void {
    if (this.notifications.has(userId)) {
      return;
    }

    try {
      const saved = localStorage.getItem(`notifications_${userId}`);
      if (saved) {
        this.notifications.set(userId, JSON.parse(saved));
      }
    } catch (error) {
      console.error('Failed to load notifications:', error);
    }
  }

  /**
   * Create notification
   */
  createNotification(
    type: Notification['type'],
    title: string,
    message: string,
    action?: { label: string; url: string }
  ): Notification {
    return {
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      title,
      message,
      timestamp: Date.now(),
      read: false,
      action,
    };
  }

  /**
   * Send welcome notification
   */
  sendWelcome(userId: string): void {
    const notification = this.createNotification(
      'success',
      'Welcome!',
      'Welcome to AI Storyline Generator. Start creating amazing presentations.'
    );
    this.addNotification(userId, notification);
  }

  /**
   * Send presentation shared notification
   */
  sendPresentationShared(userId: string, presentationTitle: string, shareUrl: string): void {
    const notification = this.createNotification(
      'info',
      'Presentation shared',
      `Your presentation "${presentationTitle}" has been shared.`,
      { label: 'View Share Link', url: shareUrl }
    );
    this.addNotification(userId, notification);
  }

  /**
   * Send collaboration notification
   */
  sendCollaborationInvite(userId: string, userName: string, presentationTitle: string): void {
    const notification = this.createNotification(
      'info',
      'Collaboration invite',
      `${userName} invited you to collaborate on "${presentationTitle}"`
    );
    this.addNotification(userId, notification);
  }
}

export const notificationService = new NotificationService();

