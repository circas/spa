/**
 * Spotify Premium & Anti-Offline (Fixed for QX)
 */

let url = $request.url;
let obj;

try {
    // 1. Reklamları sessizce geç (204 No Content en güvenlisidir)
    if (url.indexOf("ads-v2") !== -1 || url.indexOf("ad-logic") !== -1) {
        $done({status: "HTTP/1.1 204 No Content", body: ""});
    }

    // 2. Sadece JSON formatında olduğundan emin olduğumuz endpointler
    if (url.indexOf("/v1/bootstrap") !== -1 || url.indexOf("/me") !== -1) {
        obj = JSON.parse($response.body);
        
        // Sadece bu 4 satır yeterli, gerisine dokunma (Offline sebebi budur)
        obj["product"] = "premium";
        obj["type"] = "premium";
        if (obj.features) {
            obj.features["ads"] = false;
            obj.features["on_demand"] = true;
        }

        $done({body: JSON.stringify(obj)});
    } else {
        // Geri kalan her şeyi (Audio, Playlist, Search) serbest bırak
        $done({});
    }
} catch (e) {
    // En ufak bir hatada orijinal yanıtı bozma, olduğu gibi gönder
    $done({});
}
