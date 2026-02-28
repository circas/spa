/*
 * Spotify Ultra v3 - OPTIMIZED & FIXED
 * Protobuf + JSON Hybrid Logic
 */

const url = $request.url;

// 1. OTURUM KORUMASI (Önemli: Oturum verilerini bozmamak için)
const bypass = ["heartbeat", "session", "track-playback", "v1/log", "ping", "quic", "image/"];
if (bypass.some(path => url.includes(path))) {
    $done({});
}

if (typeof $response !== "undefined" && $response.body) {
    let body = $response.body;

    try {
        // 2. JSON VEYA BİNARY AYIRT EDİCİ
        let obj;
        let isJson = false;

        try {
            obj = JSON.parse(body);
            isJson = true;
        } catch (e) {
            // JSON değilse binary/protobuf olabilir
            isJson = false;
        }

        // --- JSON İŞLEMLERİ (Eğer veri JSON ise) ---
        if (isJson) {
            
            // === A. REKLAM ENGELLEME (Gelişmiş) ===
            // Spotify artık reklamları /ads/ değil, ana track list'lerin içine gömüyor.
            // Dizilerin içindeki "ad" türünü bulup temizleriz.
            
            const removeAds = (item) => {
                // Eğer öğe bir reklam ise (type: "ad" veya is_ad: true) false döndür, yani sileriz.
                return !(item.type === "ad" || item.is_ad === true || (item.track && item.track.is_ad));
            };

            if (Array.isArray(obj)) {
                // Yanıt direkt bir array ise (örneğin bazı batch yanıtları)
                obj = obj.filter(removeAds);
            } else if (obj.items) {
                // Yanıt object ve items dizisi varsa (playlistler, albumler)
                obj.items = obj.items.filter(removeAds);
            }

            // Eğer özel reklam isteği yapılıyorsa (reklam sunucusu)
            if (url.includes("/ads/") || url.includes("/ad-logic/")) {
                body = JSON.stringify({ "ads": [], "slots": [], "messages": [] });
                $done({ body });
                return;
            }

            // === B. PREMIUM YETKİ KİLİDİ ===
            // Kullanıcı profili, özelleştirme ve ürün durumu kontrolü
            if (url.includes("v1/me") || url.includes("customize") || url.includes("product-state")) {
                
                // Root seviye kilitler
                obj.product = "premium";
                obj.type = "premium";
                obj.is_premium = true;
                obj.premium = true;

                // Özellikler (Features) bloğu
                if (obj.features) {
                    obj.features.is_premium = true;
                    obj.features.ads = false;
                    obj.features.shuffle_restricted = false;
                    obj.features.can_vto = true;
                    obj.features.can_seek = true;
                    obj.features.can_download = true;
                }
            }

            // JSON'ı tekrar stringe çevir
            body = JSON.stringify(obj);
        } 
        
        // --- BİNARY / PROTOBUF İŞLEMLERİ (JSON Değilse) ---
        else {
            // Eğer veri string ise (çoğu MITM aracı string döner)
            if (typeof body === "string") {
                // Basit string değişimi (Probuf başarısız olursa diye enjekte)
                if (body.includes("free") || body.includes("ad-supported")) {
                    body = body.replace(/free/g, "premium").replace(/ad-supported/g, "premium");
                }
                
                // Reklam endpoint'leri için ekstra güvenlik
                if (url.includes("/ad-logic") || url.includes("ads")) {
                     body = "{}"; // Reklam isteğini boş obje ile sonlandır
                }
            }
        }

        $done({ body });

    } catch (e) {
        // Hata olursa (örneğin veri bozuksa) orijinali gönder, uygulama çökmesin
        $done({});
    }
} else {
    // Yanıt yoksa veya body boşsa pas geç
    $done({});
}
