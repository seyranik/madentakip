const CACHE = 'madentakip-v3';
const ASSETS = ['/', '/index.html', '/manifest.json'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
  ));
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  if (e.request.url.includes('workers.dev') || e.request.url.includes('gold-api') || e.request.url.includes('exchangerate')) {
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

// ── Alarm kontrolü için periyodik fetch ──────────────────
// iOS/PWA: periodicsync desteklenmez ama setInterval ile background sync yaparız
// SW'ye mesaj gönderince alarm kontrol eder
self.addEventListener('message', e => {
  if (e.data?.type === 'CHECK_ALARMS') {
    checkAndNotify(e.data.alarms, e.data.prices);
  }
});

// Periodic background sync (Android Chrome destekler)
self.addEventListener('periodicsync', e => {
  if (e.tag === 'alarm-check') {
    e.waitUntil(doBackgroundCheck());
  }
});

async function doBackgroundCheck() {
  try {
    // Worker URL'yi SW'ye kaydetmek için cache'e bakıyoruz
    const configCache = await caches.open('mt-config');
    const configResp  = await configCache.match('config');
    if (!configResp) return;
    const config = await configResp.json();
    if (!config.workerUrl || !config.alarms?.length) return;

    const res = await fetch(config.workerUrl);
    const d   = JSON.parse(await res.text());
    const prices = {
      gold:   parseFloat(d.XAU?.buy  || 0),
      silver: parseFloat(d.XAG?.buy  || 0),
    };
    checkAndNotify(config.alarms, prices);
  } catch(e) {}
}

function checkAndNotify(alarms, prices) {
  if (!alarms || !prices) return;
  alarms.forEach(alarm => {
    if (!alarm.active) return;
    const cur  = alarm.type === 'gold' ? prices.gold : prices.silver;
    const name = alarm.type === 'gold' ? 'Altın' : 'Gümüş';
    if (!cur) return;
    if (alarm.high && cur >= alarm.high) {
      self.registration.showNotification('Maden Takip — Fiyat Alarmı', {
        body: name + ' ' + alarm.high + '₺ üstüne çıktı! Şu an: ' + cur.toFixed(2) + '₺',
        icon: '/icons/icon-192.png',
        badge: '/icons/icon-192.png',
        tag: 'alarm-' + alarm.type + '-high',
        vibrate: [200, 100, 200],
        requireInteraction: false,
      });
    }
    if (alarm.low && cur <= alarm.low) {
      self.registration.showNotification('Maden Takip — Fiyat Alarmı', {
        body: name + ' ' + alarm.low + '₺ altına düştü! Şu an: ' + cur.toFixed(2) + '₺',
        icon: '/icons/icon-192.png',
        badge: '/icons/icon-192.png',
        tag: 'alarm-' + alarm.type + '-low',
        vibrate: [200, 100, 200],
        requireInteraction: false,
      });
    }
  });
}

self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(clients.matchAll({type:'window'}).then(cls => {
    for (const c of cls) { if (c.url.includes(self.location.origin)) { c.focus(); return; } }
    return clients.openWindow('/');
  }));
});
