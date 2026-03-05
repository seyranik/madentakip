const CACHE = 'madentakip-v4';
const ASSETS = ['/madentakip/', '/madentakip/index.html', '/madentakip/manifest.json'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS).catch(()=>{})));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
  ));
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  if (e.request.url.includes('workers.dev') ||
      e.request.url.includes('firestore') ||
      e.request.url.includes('googleapis')) {
    e.respondWith(fetch(e.request).catch(() => new Response('{}', {headers:{'Content-Type':'application/json'}})));
    return;
  }
  e.respondWith(
    fetch(e.request).then(res => {
      const clone = res.clone();
      caches.open(CACHE).then(c => c.put(e.request, clone));
      return res;
    }).catch(() => caches.match(e.request))
  );
});

// ── Uygulama açıkken alarm mesajı ────────────────────────
self.addEventListener('message', e => {
  if (e.data?.type === 'CHECK_ALARMS') {
    checkAndNotify(e.data.alarms, e.data.prices);
  }
});

// ── Web Push bildirimi gelince göster ─────────────────────
self.addEventListener('push', e => {
  if (!e.data) return;
  let data = {};
  try { data = e.data.json(); } catch { data = { title: 'Maden Takip', body: e.data.text() }; }
  e.waitUntil(
    self.registration.showNotification(data.title || 'Maden Takip', {
      body:    data.body || '',
      icon:    '/madentakip/icons/icon-192.png',
      badge:   '/madentakip/icons/icon-192.png',
      tag:     data.tag || 'maden-alarm',
      vibrate: [200, 100, 200],
      data:    { url: '/madentakip/' },
    })
  );
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

function checkAndNotify(alarms, prices) {
  if (!alarms || !prices) return;
  alarms.forEach(alarm => {
    if (!alarm.active) return;
    const cur  = alarm.type === 'gold' ? prices.gold : prices.silver;
    const name = alarm.type === 'gold' ? 'Altın' : 'Gümüş';
    if (!cur) return;
    if (alarm.high && cur >= alarm.high) {
      self.registration.showNotification('🔔 Maden Takip', {
        body: `${name} ${alarm.high}₺ üstüne çıktı! Şu an: ${cur.toFixed(2)}₺`,
        icon: '/madentakip/icons/icon-192.png',
        tag:  'alarm-' + alarm.type + '-high',
        vibrate: [200, 100, 200],
      });
    }
    if (alarm.low && cur <= alarm.low) {
      self.registration.showNotification('🔔 Maden Takip', {
        body: `${name} ${alarm.low}₺ altına düştü! Şu an: ${cur.toFixed(2)}₺`,
        icon: '/madentakip/icons/icon-192.png',
        tag:  'alarm-' + alarm.type + '-low',
        vibrate: [200, 100, 200],
      });
    }
  });
}
