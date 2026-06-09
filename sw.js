importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyBZ7X_DpQCWAvRzSDiEZMVkfG7xQMc8yRs",
  authDomain: "isabella-chat.firebaseapp.com",
  projectId: "isabella-chat",
  storageBucket: "isabella-chat.firebasestorage.app",
  messagingSenderId: "995687703346",
  appId: "1:995687703346:web:568e98aaa577745e162d2b"
});

const messaging = firebase.messaging();

// Notificación cuando la app está en segundo plano o cerrada
messaging.onBackgroundMessage(payload => {
  const title = payload.notification?.title || 'Family Chat';
  const body  = payload.notification?.body  || 'Tienes un nuevo mensaje';
  self.registration.showNotification(title, {
    body,
    icon: '/Isabella-chat/icon-192.png',
    badge: '/Isabella-chat/icon-192.png',
    vibrate: [200, 100, 200],
    tag: 'family-chat-msg',
    renotify: true,
    data: { url: '/Isabella-chat/' }
  });
});

// Al tocar la notificación abrir la app
self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(clients.openWindow(e.notification.data?.url || '/Isabella-chat/'));
});

// Cache básico
const CACHE = 'family-chat-v2';
self.addEventListener('install', e => { self.skipWaiting(); });
self.addEventListener('activate', e => { self.clients.claim(); });
self.addEventListener('fetch', e => {
  if(e.request.method !== 'GET') return;
  e.respondWith(fetch(e.request).catch(() => caches.match(e.request)));
});
