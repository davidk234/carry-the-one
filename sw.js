// Carry the One offline cache. Bump VERSION to push an update.
const VERSION='2026.10.08-2';
const CACHE='carry-the-one-'+VERSION;
const ASSETS=['./','./index.html','./manifest.webmanifest','./icons/icon-192.png','./icons/icon-512.png','./icons/icon-maskable-512.png','./icons/apple-touch-icon.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting()));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k.startsWith('carry-the-one-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
function withTimeout(p,ms){return new Promise((res,rej)=>{const t=setTimeout(()=>rej(new Error('timeout')),ms);p.then(v=>{clearTimeout(t);res(v);},err=>{clearTimeout(t);rej(err);});});}
self.addEventListener('fetch',e=>{
  const req=e.request;if(req.method!=='GET')return;
  const url=new URL(req.url);if(url.origin!==self.location.origin)return;
  if(req.mode==='navigate'){
    // Try the network briefly so updates arrive; fall back to the saved copy offline.
    e.respondWith(withTimeout(fetch(req),3000).then(r=>{if(r&&r.ok){const cp=r.clone();caches.open(CACHE).then(c=>c.put('./index.html',cp));}return r;})
      .catch(()=>caches.match('./index.html').then(hit=>hit||caches.match('./'))));
    return;
  }
  e.respondWith(caches.match(req,{ignoreSearch:true}).then(hit=>hit||fetch(req).then(r=>{if(r&&r.ok){const cp=r.clone();caches.open(CACHE).then(c=>c.put(req,cp));}return r;})));
});
