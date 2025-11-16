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
    if (!this.isPermissionGranted()) {
      console.warn('Cannot schedule notification: permission not granted');
      return;
    }

    const scheduledTime = new Date(workUnit.scheduledStart);
    const notificationTime = new Date(scheduledTime.getTime() - reminderMinutes * 60000);
    const now = new Date();

    // Only schedule if the notification time is in the future
    if (notificationTime > now) {
      const delay = notificationTime.getTime() - now.getTime();
      
      setTimeout(() => {
        const priority = workUnit.goalId?.priority || 'med';
        const priorityEmoji = priority === 'high' ? '🔴' : priority === 'med' ? '🟡' : '🟢';
        
        this.showNotification(`${priorityEmoji} Upcoming Study Session`, {
          body: `${workUnit.goalId?.title || 'Task'} starts in ${reminderMinutes} minutes`,
          tag: `work-unit-${workUnit._id}`,
          requireInteraction: priority === 'high',
          actions: [
            { action: 'view', title: 'View Task' },
            { action: 'dismiss', title: 'Dismiss' }
          ],
          data: {
            workUnitId: workUnit._id,
            url: '/dashboard'
          }
        });
      }, delay);

      console.log(`Scheduled notification for ${workUnit.goalId?.title} at ${notificationTime.toLocaleString()}`);
    } else {
      console.log(`Skipped past notification for ${workUnit.goalId?.title}`);
    }
  }

  // Schedule notifications for multiple work units with different reminder times
  scheduleMultipleNotifications(workUnits, reminderMinutes = 15) {
    if (!this.isPermissionGranted()) {
      console.warn('Cannot schedule notifications: permission not granted');
      return;
    }

    workUnits.forEach(workUnit => {
      // Schedule main reminder
      this.scheduleWorkUnitNotification(workUnit, reminderMinutes);
      
      // For high priority tasks, also schedule a 5-minute reminder
      if (workUnit.goalId?.priority === 'high') {
        this.scheduleWorkUnitNotification(workUnit, 5);
      }
    });
  }

  // Send overdue task notification
  sendOverdueNotification(workUnit) {
    if (!this.isPermissionGranted()) {
      return;
    }

    this.showNotification('⏰ Overdue Task', {
      body: `${workUnit.goalId?.title || 'Task'} is now overdue. Please reschedule or complete it.`,
      tag: `overdue-${workUnit._id}`,
      requireInteraction: true,
      actions: [
        { action: 'reschedule', title: 'Reschedule' },
        { action: 'complete', title: 'Mark Complete' }
      ],
      data: {
        workUnitId: workUnit._id,
        url: '/dashboard'
      }
    });
  }

  // Send task completion celebration
  sendCompletionNotification(goalTitle, completedTasks, totalTasks) {
    if (!this.isPermissionGranted()) {
      return;
    }

    this.showNotification('✅ Great Progress!', {
      body: `You've completed ${completedTasks}/${totalTasks} tasks for "${goalTitle}"`,
      tag: 'completion',
      data: {
        url: '/dashboard'
      }
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
