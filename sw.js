const cacheName = 'GinkoPWA-v1';
const appShellFiles = [
  'index.html',
  'app.js',
  'style.css',
  'icons/favicon.ico',
  'icons/icon-32.png',
  'icons/icon-64.png',
  'icons/icon-96.png',
  'icons/icon-128.png',
  'icons/icon-168.png',
  'icons/icon-180.png',
  'icons/icon-192.png',
  'icons/icon-256.png',
  'icons/icon-512.png',
  'icons/maskable_icon.png'
];

const contentToCache = appShellFiles; //.concat(Other elements that need caching);

self.addEventListener('install', (e) => {
    console.log('[Service Worker] Install');
    e.waitUntil((async () => {
      const cache = await caches.open(cacheName);
      console.log('[Service Worker] Caching all: app shell and content');
      await cache.addAll(contentToCache);
    })());
  });

self.addEventListener('fetch', (e) => {
  //cache-only
  if(contentToCache.some(file=>e.request.url.endsWith(file.substr(2)) && !e.request.url.endsWith("app.js"))){
      console.log('[Service Worker] Loading from cache: '+e.request.url);
      e.respondWith(caches.match(e.request));
  //Network + mise en cache, ou cache, ou réponse par défaut
  }else{
    e.respondWith(fetch(e.request)).then(response => {
      return caches.open(CACHE_NAME).then(cache => {
        console.log('[Service Worker] Fetching from network and caching ressource: '+e.request.url);
        cache.put(e.request, response.clone());
        return response;
      });
    })
    .catch(function() {
      return caches.match(e.request).then(r=>{
        console.log('[Service Worker] Looking for ressource in cache: '+e.request.url);
        return r; // || newResponse(JSON.stringify({error: 1}), {headers: {'ContentType':'application'}});
      })
    })
  }
});

self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((keyList) => {
    return Promise.all(keyList.map((key) => {
      if (key === cacheName) { return; }
      return caches.delete(key);
    }))
  }));
});