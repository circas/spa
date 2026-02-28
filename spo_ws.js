/*
 * Spotify Hybrid Optimizer (Maasea + app2smile + ddgksf2013)
 * Amacı: Oturumu korumak (Session/Heartbeat Bypass) ve Premium simülasyonu.
 */

const url = $request.url;
if (!$response || !$response.body) $done({});

let body = $response.body;

// 1. KRİTİK KATMAN: Maasea Usulü Binary/Session Koruması
// Eğer paket bir heartbeat, session veya track-log ise ASLA dokunma.
if (url.includes("heartbeat") || url.includes("session") || url.includes("track-playback") || url.includes("v1/log")) {
    $done({});
}

try {
    // 2. KATMAN: JSON Kontrolü
    // Paket JSON değilse (Protobuf ise) hata fırlatıp 'catch' bloğuna gidecek.
    let obj = JSON.parse(body);

    // 3. KATMAN: app2smile & ddgksf2013 Yetki Mantığı
    // Bootstrap ve Customize endpointlerinde yetkileri değiştir.
    if (url.includes("bootstrap") || url.includes("customize") || url.includes("product-state")) {
        // Genel yetki tanımları
        if (obj.u64_data) { /* Protobuf datası varsa içeriği bozmadan geç */ }
        
        obj["product"] = "premium";
        obj["type"] = "premium";
        obj["can_vto"] = true; // Sınırsız atlama vb.
        
        // Reklam ve kısıtlama dizilerini temizle
        if (obj.features) {
            obj.features["is_premium"] = true;
            obj.features["ads"] = false;
        }
    }

    // 4. KATMAN: Reklam Slotlarını Temizleme
    if (url.includes("/ads/") || url.includes("/ad-logic/")) {
        obj = { "ads": [], "slots": [], "messages": [] };
    }

    $done({ body: JSON.stringify(obj) });

} catch (e) {
    // Eğer veri Protobuf/Binary ise veya JSON hatası verirse Orijinali İlet
    // Bu kısım oturumdan atılmanı engelleyen en önemli 'sigorta'dır.
    $done({});
}
