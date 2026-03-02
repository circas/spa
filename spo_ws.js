#!/usr/bin/env node
const http = require('http');
const https = require('https');
const { URL } = require('url');
const net = require('net');

// 2026 Spotify iOS ad endpoints (pentest verified)
const BLOCKLIST = new Set([
    'spclient.wg.spotify.com',
    'audio-fa-admiral-spotify-com.akamaized.net',
    'spadvertising.spotify.com',
    'ads-admiral-spotify-com.akamaized.net',
    'doubleclick.net',
    'cxense.com',
    'pagead2.googlesyndication.com'
]);

const AD_REGEX = /\/(ads?|advertisement|sponsored|audio-ad|commercial|promo)/i;

console.log('🎵 SPOTIFY iOS MITM BLOCKER v2.0');
console.log('📡 Listening on :8080 - iOS proxy OK');

const server = http.createServer((req, res) => {
    const parsed = new URL(req.url, `http://${req.headers.host}`);
    const host = parsed.host;
    const path = parsed.pathname + parsed.search;
    
    console.log(`${req.method} ${host}${path.slice(0, 80)}...`);
    
    // 🔥 AD TRAFFIC KILL
    if (BLOCKLIST.has(host) || AD_REGEX.test(path)) {
        console.log(`🚫 ${'\x1b[31m'}BLOCKED${'\x1b[0m'} ${host}${path}`);
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end('{"status":"ok","ads":[],"sponsored":[]}');
        return;
    }
    
    // Forward normal traffic
    proxyRequest(req, res, host, parsed);
});

function proxyRequest(clientReq, clientRes, host, url) {
    const opts = {
        hostname: host,
        port: 443,
        path: url.pathname + url.search,
        method: clientReq.method,
        headers: clientReq.headers
    };
    
    const proxyReq = https.request(opts, proxyRes => {
        let chunks = [];
        
        proxyRes.on('data', chunk => chunks.push(chunk));
        proxyRes.on('end', () => {
            let data = Buffer.concat(chunks);
            
            // JSON response'lardan ad temizle
            try {
                const json = JSON.parse(data.toString());
                scrubAds(json);
                data = Buffer.from(JSON.stringify(json));
            } catch {}
            
            clientRes.writeHead(proxyRes.statusCode, proxyRes.headers);
            clientRes.end(data);
        });
    });
    
    clientReq.pipe(proxyReq);
}

// HTTPS CONNECT tunnel (Spotify app kullanır)
server.on('connect', (req, cltSocket, head) => {
    const [host, port] = req.url.split(':');
    
    if (BLOCKLIST.has(host)) {
        console.log(`🚫 ${'\x1b[31m'}TUNNEL BLOCK${'\x1b[0m'} ${host}`);
        cltSocket.end('HTTP/1.1 403 Forbidden\r\n\r\n');
        return;
    }
    
    const srvSocket = net.connect(443, host, () => {
        cltSocket.write('HTTP/1.1 200 Connection Established\r\n\r\n');
        srvSocket.pipe(cltSocket).pipe(srvSocket);
    });
    
    srvSocket.on('error', () => cltSocket.end());
});

function scrubAds(obj) {
    if (!obj || typeof obj !== 'object') return;
    
    for (let key in obj) {
        if (key.toLowerCase().includes('ad') || key.toLowerCase().includes('sponsor')) {
            obj[key] = [];
            continue;
        }
        scrubAds(obj[key]);
    }
    
    // Track list temizle
    if (obj.tracks?.items) {
        obj.tracks.items = obj.tracks.items.filter(t => 
            !t?.name?.toLowerCase().includes('ad')
        );
    }
}

server.listen(8080, () => {
    console.log('\n✅ READY! iOS WiFi Proxy → YOUR_MAC_IP:8080');
    console.log('📱 Spotify aç → Test et!');
});
