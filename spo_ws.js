/*
 * Spotify Ultra-Lite Ads Cleaner (Based on app2smile Proto Logic)
 * Sadece reklamları hedefler, oturum verilerine dokunmaz.
 */

const url = $request.url;

// 1. OTURUM KORUMA (Safe-Pass)
if (url.includes("heartbeat") || url.includes("session") || url.includes("v1/log")) {
    $done({});
}

if (typeof $response !== "undefined" && $response.body) {
    let body = $response.body;

    try {
        // Reklam mantığının geçtiği temel alanlar
        if (url.includes("/ads/") || url.includes("/ad-logic/") || url.includes("/promotions/")) {
            
            // JSON paketlerini temizle
            let obj = JSON.parse(body);
            obj.ads = [];
            obj.slots = [];
            obj.messages = [];
            if (obj.preroll) obj.preroll = [];
            
            body = JSON.stringify(obj);
            $done({ body });

        } else if (url.includes("v1/ad-slot")) {
            // Protobuf (Binary) reklam slotu isteği gelirse boş döndür
            // Bu kısım reklamın "yüklenmesini" engeller
            $done({ body: "" });
        } else {
            $done({});
        }
    } catch (e) {
        // Eğer veri Protobuf ise ve JSON.parse hata verirse:
        // İçinde reklam anahtar kelimeleri geçen binary paketleri 'boş' ile değiştir
        if (body.includes("ad-supported") || body.includes("ads-code")) {
            $done({ body: "" });
        } else {
            $done({});
        }
    }
} else {
    $done({});
}
