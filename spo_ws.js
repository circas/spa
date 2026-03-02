/**
 * Spotify Stabil Premium & AdBlock (No-Offline Version)
 */

let url = $request.url;

// 1. REKLAM ENGELEME (En Güvenli Yol: Boş Yanıt)
// Reklam sunucularına 204 (İçerik Yok) dönerek uygulamanın beklemesini engelleriz.
if (url.includes("ads") || url.includes("ad-logic") || url.includes("doubleclick")) {
    $done({ status: "HTTP/1.1 204 No Content", body: "" });
} 

// 2. PREMIUM ÖZELLİKLERİ ENJEKTE ETME
// Sadece bu spesifik endpoint'lerde işlem yapıyoruz.
else if (url.includes("/v1/bootstrap") || url.includes("/v1/user") || url.includes("/v1/me")) {
    let body = $response.body;
    
    try {
        let obj = JSON.parse(body);
        
        // Sadece en kritik 3-4 alanı değiştiriyoruz (Offline düşürmemesi için)
        obj["product"] = "premium";
        obj["type"] = "premium";
        obj["premium"] = true;
        
        if (obj.features) {
            obj.features["ads"] = false;
            obj.features["shuffle"] = true;
            obj.features["skip_unlimited"] = true;
            obj.features["on_demand"] = true;
        }

        console.log("✅ Spotify Premium Enjekte Edildi");
        $done({ body: JSON.stringify(obj) });

    } catch (e) {
        // Hata durumunda (JSON değilse) orijinal yanıtı bozmadan gönder
        $done({});
    }
} 

// 3. DİĞER TÜM TRAFİK (Audio, Images, Search)
// Bu kısım çok kritik; müdahale etmeden geçmesine izin veriyoruz.
else {
    $done({});
}
