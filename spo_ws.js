/**
 * Spotify Song Skipper for  X
 * Amacı: Şarkıyı yükletmeyip bir sonrakine zorlamak.
 */

const url = $request.url;

// Sadece ses dosyalarını ve parça bilgilerini hedefleyen filtre
const audioPatterns = [
  "audio-ak-spotify-com", // CDN ses dosyaları
  "/play/",               // Oynatma komutları
  "spclient.wg.spotify.com1",       // Metadata ve parça bilgisi
  "spclient.wg.spotify.com2"      // Stream yetkilendirme
  "gew4-spclient.spotify.com"
  "spclient.wg.spotify.com"
];

let shouldSkip = audioPatterns.some(p => url.includes(p));

if (shouldSkip) {
    // Şarkıyı "Yok" gibi göstererek uygulamanın sonrakine geçmesini sağlarız
    console.log("⏩ Şarkı Atlatılıyor: " + url.split('/')[2]);
    
    $done({
        status: "HTTP/1.1 404 Not Found",
        headers: { 
            "Content-Type": "text/plain",
            "Access-Control-Allow-Origin": "*" 
        },
        body: ""
    });
} else {
    // Diğer tüm trafik (Arama, Görseller, Profil) normal devam eder
    $done({});
}
