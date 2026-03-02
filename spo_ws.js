/**
 * Spotify Premium & AdBlock (Stabil Versiyon)
 */

let url = $request.url;
let body = $response.body;

// 1. KRİTİK HATA DÜZELTME: Ses dosyalarını engelleme!
// 'audio-fa' ve 'audio-ak' gerçek müzik dosyalarıdır. 
// Bunları engellersen uygulama offline düşer.
if (url.includes('doubleclick') || /ads?|ad-logic|ads-v2/.test(url)) {
    console.log("🛑 REKLAM ENGELLENDİ: " + url);
    $done({ status: "HTTP/1.1 204 No Content", body: "" }); // 204 daha temizdir
    return;
}

// 2. JSON GÜVENLİK KONTROLÜ
try {
    if (body) {
        body = JSON.parse(body);
    } else {
        $done({}); // Gövde yoksa devam et
        return;
    }
} catch (e) {
    // Eğer gelen veri JSON değilse (Audio datası vb.), işleme ve devam et
    $done({});
    return;
}

// 3. PREMIUM ENJEKSİYON (Geliştirilmiş)
if (/\/(me|user|account|features?|capabilities|player|v1\/bootstrap)/.test(url)) {
    
    // Temel Premium Verileri
    const PREMIUM = {
        "premium": true,
        "product": "premium",
        "can_subscribe": false,
        "features": {
            "shuffle": true,
            "skip_unlimited": true,
            "next_prev": true,
            "high_quality": true,
            "on_demand": true,
            "ads": false
        },
        "capabilities": {
            "shuffle_capable": true,
            "skip_capable": true,
            "next_prev_capable": true,
            "on_demand_capable": true
        }
    };

    // Mevcut body ile birleştir
    body = { ...body, ...PREMIUM };

    // Player özel ayarları
    if (url.includes("player")) {
        body.shuffle_state = false; // İsteğe bağlı
        body.skips = { "remaining": 999, "is_limited": false };
    }

    console.log(`👑 PREMIUM AKTİF: ${url}`);
    $done({ body: JSON.stringify(body) });
} else {
    $done({ body: JSON.stringify(body) });
}
