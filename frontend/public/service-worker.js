/* eslint-disable no-restricted-globals */

// Service Worker for Smart Study Planner v2
// Handles push notifications and background sync

const CACHE_NAME = 'ssp-v2-cache-v1';

// Install event
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  self.skipWaiting();
});

// Activate event
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: Clearing old cache');
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

// Listen for notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  event.waitUntil(
    clients.openWindow('/')
  );
});

// Listen for messages from the main thread
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SCHEDULE_NOTIFICATION') {
    const { workUnit, reminderMinutes } = event.data;
    scheduleNotification(workUnit, reminderMinutes);
  }
});

function scheduleNotification(workUnit, reminderMinutes) {
  const scheduledStart = new Date(workUnit.scheduledStart);
  const notificationTime = new Date(scheduledStart.getTime() - reminderMinutes * 60000);
  const now = new Date();
  
  const delay = notificationTime.getTime() - now.getTime();
  
  if (delay > 0) {
    setTimeout(() => {
      self.registration.showNotification('Study Session Reminder', {
        body: `"${workUnit.goal?.title || 'Study Session'}" starts in ${reminderMinutes} minutes`,
        icon: '/icon-192x192.png',
        badge: '/icon-192x192.png',
        tag: workUnit._id,
        requireInteraction: true,
        vibrate: [200, 100, 200],
        data: {
          workUnitId: workUnit._id,
          url: '/'
        }
      });
    }, delay);
  }
}
