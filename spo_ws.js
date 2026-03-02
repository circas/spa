// Quantumult X - Spotify Premium + AdBlock
let body = $response.body ? JSON.parse($response.body) : {};
let url = $request.url;

// 🎛️ Premium Inject
const PREMIUM = {
    "premium": true,
    "product": "premium",
    "features": {
        "shuffle": true,
        "skip_unlimited": true,
        "next_prev": true,
        "high_quality": true
    },
    "capabilities": {
        "shuffle_capable": true,
        "skip_capable": true,
        "next_prev_capable": true
    },
    "player": {
        "shuffle_state": true,
        "skips": {"remaining": 999}
    }
};

// 🔍 Ad endpoints block
if ($request.url.includes('audio-fa') || $request.url.includes('audio-ak') || 
    $request.url.includes('doubleclick') || /ads?/.test($request.url)) {
    $done({status: 200, body: JSON.stringify({"ads": [], "sponsored": []})});
    return;
}

// 👑 Premium endpoints override
if (/\/(me|user|account|features?|capabilities|player)/.test($request.url)) {
    // Merge premium data
    body = Object.assign(body, PREMIUM);
    
    // Player specific
    if (/player/.test($request.url)) {
        body.shuffle_state = true;
        body.skips = {"remaining": 999};
    }
    
    console.log(`👑 PREMIUM INJECT: ${$request.url}`);
    $done({status: 200, headers: $response.headers, body: JSON.stringify(body)});
    return;
}

$done($response);
