// Notification Service for Browser Notifications

class NotificationService {
  constructor() {
    this.registration = null;
    this.permission = 'default';
  }

  // Initialize the service worker and request notification permission
  async initialize() {
    if (!('serviceWorker' in navigator)) {
      console.warn('Service Workers are not supported');
      return false;
    }

    if (!('Notification' in window)) {
      console.warn('Notifications are not supported');
      return false;
    }

    try {
      // Register service worker
      this.registration = await navigator.serviceWorker.register('/service-worker.js');
      console.log('Service Worker registered:', this.registration);

      // Request notification permission
      this.permission = await Notification.requestPermission();
      console.log('Notification permission:', this.permission);

      return this.permission === 'granted';
    } catch (error) {
      console.error('Failed to initialize notification service:', error);
      return false;
    }
  }

  // Check if notifications are supported and permitted
  isSupported() {
    return 'serviceWorker' in navigator && 'Notification' in window;
  }

  // Check if permission is granted
  isPermissionGranted() {
    return this.permission === 'granted' || Notification.permission === 'granted';
  }

  // Request notification permission
  async requestPermission() {
    if (!this.isSupported()) {
      return false;
    }

    this.permission = await Notification.requestPermission();
    return this.permission === 'granted';
  }

  // Schedule a notification for a work unit
  scheduleWorkUnitNotification(workUnit, reminderMinutes = 15) {
    if (!this.isPermissionGranted() || !this.registration) {
      console.warn('Cannot schedule notification: permission not granted or service worker not registered');
      return;
    }

    // Send message to service worker to schedule the notification
    if (navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'SCHEDULE_NOTIFICATION',
        workUnit,
        reminderMinutes
      });
    }
  }

  // Schedule notifications for multiple work units
  scheduleMultipleNotifications(workUnits, reminderMinutes = 15) {
    if (!this.isPermissionGranted()) {
      console.warn('Cannot schedule notifications: permission not granted');
      return;
    }

    workUnits.forEach(workUnit => {
      this.scheduleWorkUnitNotification(workUnit, reminderMinutes);
    });
  }

  // Show immediate notification
  async showNotification(title, options = {}) {
    if (!this.isPermissionGranted()) {
      console.warn('Cannot show notification: permission not granted');
      return;
    }

    if (this.registration) {
      await this.registration.showNotification(title, {
        icon: '/icon-192x192.png',
        badge: '/icon-192x192.png',
        ...options
      });
    } else {
      new Notification(title, {
        icon: '/icon-192x192.png',
        ...options
      });
    }
  }

  // Clear all notifications
  async clearAllNotifications() {
    if (this.registration) {
      const notifications = await this.registration.getNotifications();
      notifications.forEach(notification => notification.close());
    }
  }
}

// Export singleton instance
const notificationService = new NotificationService();
export default notificationService;
