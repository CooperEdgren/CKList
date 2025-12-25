const CACHE_NAME = 'tvguide-v1';
const ASSETS = [
  './',
  'index.html',
  'styles.css',
  'app.js',
  'channels.json',
  'manifest.json',
  'icons/default.svg'
];

self.addEventListener('install', evt => {
  evt.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', evt => {
  evt.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', evt => {
  const req = evt.request;
  if(req.method !== 'GET') return;
  // Use network-first for channels.json so channel edits (and nameSvg changes) appear quickly.
  if(new URL(req.url).pathname.endsWith('channels.json')){
    evt.respondWith(
      fetch(req).then(resp => {
        if(resp && resp.status === 200){
          const copy = resp.clone();
          caches.open(CACHE_NAME).then(c=>c.put(req, copy));
        }
        return resp;
      }).catch(()=>caches.match(req))
    );
    return;
  }

  // Fallback cache-first for other assets (app shell)
  evt.respondWith(
    caches.match(req).then(cached => cached || fetch(req).then(resp => {
      if(resp && resp.status === 200 && resp.type === 'basic'){
        const copy = resp.clone();
        caches.open(CACHE_NAME).then(c=>c.put(req, copy));
      }
      return resp;
    }).catch(()=>caches.match('/index.html')))
  );
});
