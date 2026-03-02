const Proxy = require('http-mitm-proxy');
const proxy = Proxy();

// Spotify'ın kullandığı tüm kritik anahtar kelimeler
const KILL_KEYWORDS = [
    'spotify', 
    'sp-client', 
    'audio-ak', 
    'ap-resolve', 
    'dealer', 
    'spclient.wg.spotify.com1'
];

proxy.onError(function(ctx, err) {
    // Agresif kesme işlemlerinde oluşan soket hatalarını gizle
    if (err.code === 'ECONNRESET' || err.code === 'EPIPE') return;
});

proxy.onRequest(function(ctx, callback) {
    const host = ctx.clientToProxyRequest.headers.host || '';
    const url = ctx.clientToProxyRequest.url || '';

    // Herhangi bir Spotify domaini yakalandığı an tetiklenir
    const isSpotify = KILL_KEYWORDS.some(keyword => host.toLowerCase().includes(keyword));

    if (isSpotify) {
        console.log(`\n[🔥 AGRESİF İMHA] Sunucu: ${host}`);
        console.log(`[🚫] Engellenen URL: ${url}`);

        // 1. Bağlantıyı kandır: 410 Gone (İçerik kalıcı olarak yok oldu) döndür
        // Bu, uygulamanın aynı URL'yi tekrar tekrar denemesini azaltabilir.
        ctx.proxyToClientResponse.writeHead(410, {
            'Content-Type': 'text/plain',
            'Connection': 'close',
            'Cache-Control': 'no-cache'
        });

        // 2. Yanıtı bitir ve soketi zorla kapat
        ctx.proxyToClientResponse.end('TERMINATED');
        
        // 3. Request'i tamamen çöpe at (Server'a asla ulaşmasın)
        return;
    }

    // Spotify harici trafik (Google, Instagram vb.) çalışmaya devam eder
    return callback();
});

// Performans Optimizasyonu: Sertifika işlemlerini hızlandırmak için
proxy.listen({ 
    port: 8081,
    sslCaDir: './.proxy' // Sertifikaları burada saklar
}, () => {
    console.log('--- ⚠️ SPOTIFY AGRESİF MITM AKTİF ⚠️ ---');
    console.log('Hedef: Tüm Spotify Mobil & Web Trafiği');
    console.log('Durum: Pusuda bekleniyor...');
});
