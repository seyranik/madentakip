/**
 * Firebase Messaging Service Worker
 * Bu dosya GitHub'a yüklenecek: firebase-messaging-sw.js
 * Root'ta olması zorunlu — FCM bunu arar
 */
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey:            "AIzaSyCUUidWp9ryxYV0lW2WVYofgON5NkpnByc",
  authDomain:        "madentakip-cd811.firebaseapp.com",
  projectId:         "madentakip-cd811",
  storageBucket:     "madentakip-cd811.firebasestorage.app",
  messagingSenderId: "921103282964",
  appId:             "1:921103282964:web:ae0dd3d0a8e77aee904801",
});

const messaging = firebase.messaging();

// Arka planda gelen bildirimleri göster
messaging.onBackgroundMessage(payload => {
  const { title, body } = payload.notification;
  self.registration.showNotification(title, {
    body,
    icon:    '/madentakip/icons/icon-192.png',
    badge:   '/madentakip/icons/icon-192.png',
    vibrate: [200, 100, 200],
    tag:     'maden-alarm',
    data:    { url: '/madentakip/' },
  });
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(
    clients.matchAll({ type: 'window' }).then(cls => {
      for (const c of cls) {
        if (c.url.includes('madentakip')) { c.focus(); return; }
      }
      return clients.openWindow('/madentakip/');
    })
  );
});
