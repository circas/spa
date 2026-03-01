/*
 * Spotify Reklam Kesici - Agresif Mod
 */

// 1. Gelen isteği ve yanıtı durdur
const url = $request.url;

// Eğer bu bir reklam isteğiyse (ad-logic veya audio-er)
if (url.includes("ad-logic") || url.includes("ads") || url.includes("audio-er")) {
    console.log("!!! SPOTIFY REKLAMI ENGELLENDİ VE DURDURULDU !!!");
    
    // Uygulamaya reklamın olmadığını ve geçilmesi gerektiğini söyleyen boş bir JSON döndür
    // Bu, reklam motorunu "hata" moduna sokar.
    $done({
        status: "HTTP/1.1 200 OK",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            "slots": [],
            "ads": [],
            "intervals": [],
            "disable_ads": true
        })
    });
} else {
    // Normal şarkı verisiyse dokunma
    $done({});
}
