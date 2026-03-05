# MetalTakip PWA 🥇🥈

Altın ve gümüş fiyatlarını takip eden kişisel PWA uygulaması.

## Özellikler
- 💰 Dünya (metals.live API) ve Albaraka fiyatları
- 📊 Portföy takibi — kâr/zarar hesabı
- 🔔 Fiyat alarmları (ses + bildirim)
- 📈 Geçmiş fiyat grafiği
- 💱 USD/TRY kur takibi
- 📱 iPhone'a Ana Ekrana eklenebilir (PWA)

## GitHub Pages Kurulum

1. Bu repo'yu GitHub'a push et
2. Settings → Pages → Branch: `main` → `/root` seç
3. Birkaç dakika sonra `https://KULLANICI_ADIN.github.io/REPO_ADIN` adresinde yayında!

## iPhone'a Yükleme (PWA)
1. Safari'de siteyi aç
2. Paylaş butonu (□↑) → "Ana Ekrana Ekle"
3. Uygulama gibi çalışır!

## İkon Oluşturma
`icons/` klasörüne 192x192 ve 512x512 PNG ikon koy.
Hızlı çözüm: https://favicon.io/favicon-generator/ adresinde oluştur.

## Notlar
- Albaraka verisi CORS proxy üzerinden çekilmeye çalışılır (başarısız olursa "CORS ENGEL" görünür — bu normaldir)
- Fiyatlar 5 dakikada bir otomatik güncellenir
- Alarmlar ve portföy localStorage'da saklanır

## Kullanılan API'lar (Ücretsiz)
- **metals.live** — altın/gümüş ons fiyatı
- **exchangerate-api.com** — USD/TRY kuru
- **corsproxy.io** — Albaraka CORS proxy denemesi
