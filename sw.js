// ⚡ VERSIÓN — cambia este número cada vez que subas código nuevo
const CACHE_VERSION = 'v2';
const CACHE_NAME = 'family-chat-' + CACHE_VERSION;

importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyBZ7X_DpQCWAvRzSDiEZMVkfG7xQMc8yRs",
  authDomain: "isabella-chat.firebaseapp.com",
  projectId: "isabella-chat",
  storageBucket: "isabella-chat.appspot.com",
  messagingSenderId: "995687703346",
  appId: "1:995687703346:web:568e98aaa577745e162d2b"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(payload => {
  const title = payload.notification?.title || 'Family Chat';
  const body  = payload.notification?.body  || 'Nuevo mensaje';
  self.registration.showNotification(title, {
    body,
    icon: '/Isabella-chat/icon-192.png',
    badge: '/Isabella-chat/icon-192.png',
    vibrate: [200, 100, 200],
    tag: 'family-chat-msg',
    renotify: true,
    data: { url: 'https://gabo440.github.io/Isabella-chat/' }
  });
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(clients.openWindow(e.notification.data?.url || 'https://gabo440.github.io/Isabella-chat/'));
});

self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll([
      '/Isabella-chat/',
      '/Isabella-chat/index.html',
      '/Isabella-chat/icon-192.png',
      '/Isabella-chat/icon-512.png',
      '/Isabella-chat/manifest.json'
    ]))
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  if(e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request)
      .then(res => {
        const clone = res.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(e.request, clone));
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});
