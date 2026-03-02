/**
 * Spotify Aggressive Kill Script for  X
 */

const url = $request.url;
const host = $request.headers['Host'] || $request.headers['host'];

// Agresif hedef listesi
const targets = [
  "spclient.wg.spotify.com1",
  "audio-ak-spotify-com",
  "http://googleusercontent.com/spotify.com",
  "spclient.wg.spotify.com1",
  "spclient.wg.spotify.com2"
];

let isMatch = targets.some(t => url.includes(t) || (host && host.includes(t)));

if (isMatch) {
    console.log("🛑 Spotify Trafiği İmha Edildi: " + host);
    
    // Bağlantıyı anında reddet ve boş yanıt dön
    $done({
        status: "HTTP/1.1 410 Gone",
        headers: { "Content-Type": "text/plain", "Connection": "close" },
        body: ""
    });
} else {
    $done({});
}
