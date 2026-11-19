/* Ario web – service worker: کار آفلاین بعد از اولین باز کردن */
const V='ario-web-v475';
const CORE=['./','index.html','css/app.css?v=349','js/app.js?v=359','fonts/Vazirmatn.woff2','img/app-icon.webp','manifest.webmanifest'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>Promise.all(CORE.map(u=>c.add(u).catch(()=>{})))).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==V).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  const r=e.request;
  if(r.method!=='GET')return;
  const u=new URL(r.url);
  if(u.origin!==location.origin)return;           /* Supabase و CDN دست نخورد */
  if(r.headers.has('range'))return;               /* صدا/ویدیو */
  const page=r.mode==='navigate'||/\.(html|js|css)(\?|$)/.test(u.pathname+u.search)||u.pathname.endsWith('/');
  if(page){ /* اول شبکه، اگر نبود کش */
    e.respondWith(fetch(r).then(res=>{if(res.ok){const c=res.clone();caches.open(V).then(x=>x.put(r,c))}return res}).catch(()=>caches.match(r,{ignoreSearch:false}).then(m=>m||caches.match('index.html'))));
  }else{ /* تصویر/فونت/صدا: اول کش */
    e.respondWith(caches.match(r).then(m=>m||fetch(r).then(res=>{if(res.ok){const c=res.clone();caches.open(V).then(x=>x.put(r,c))}return res})));
  }
});
