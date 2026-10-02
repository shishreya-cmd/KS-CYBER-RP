const CACHE="ks-cyber-rp-v1";
const ASSETS=["./","./index.html","./style.css","./app.js","./curriculum.js","./manifest.webmanifest","./icons/ks-cyber-rp-192.png","./icons/ks-cyber-rp-512.png","./icons/favicon-64.png","./icons/apple-touch-icon-180.png"];
self.addEventListener("install",e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS))));
self.addEventListener("activate",e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k))))));
self.addEventListener("fetch",e=>e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request))));
