/**
 * Spotify Ultra-Minimalist AdBlock (No-Offline)
 * Sadece reklamları engeller, Premium inject yapmaz.
 */

const url = $request.url;

// Spotify reklam ve takip (tracking) domainleri
const adPatterns = [
  "ads-v2",
  "ad-logic",
  "doubleclick",
  "googlesyndication",
  "analytics",
  "crashlytics"
];

const isAd = adPatterns.some(p => url.includes(p));

if (isAd) {
    console.log("🛑 Reklam Engellendi: " + url.split('/')[2]);
    // 204 No Content: "İstek başarılı ama içerik yok" diyerek uygulamayı bekletmez.
    $done({
        status: "HTTP/1.1 204 No Content",
        headers: { "Content-Type": "text/plain" },
        body: ""
    });
} else {
    // Diğer tüm trafik (Müzik, Arama vb.) orijinal haliyle devam eder.
    $done({});
}
