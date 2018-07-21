const CACHE_NAME = 'aizhuzi';

const PRECACHE_LIST = [
  './dist/static/umi.js',
  './dist/static/umi.css',
  './dist/static/common-umi.async.js',
  './dist/static/src__layouts__index.async.js',
  './dist/static/src__pages__blog__$id__index.async.js',
  './dist/static/src__pages__blog__index.async.js',
  './dist/static/src__pages__index.async.js',
  './dist/static/src__pages__memory__index.async.js',
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(PRECACHE_LIST)
        .then(self.skipWaiting())
        .catch(err => console.log(err))
    })
  )
});

self.addEventListener('activate', event => {
  // delete old deprecated caches.
  caches.keys().then(cacheNames => Promise.all(
    cacheNames
      .filter(cacheName => cacheName !== CACHE_NAME)
      .map(cacheName => caches.delete(cacheName))
  ))
  console.log('service worker activated.')
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', event => {
  if (event.request.method.toUpperCase() !== 'GET') {
    return;
  }

  const fetchPromise = fetch(event.request, { cache: "no-store" });
  const fetchPromiseClone = fetchPromise.then(res => res.clone());

  // 缓存
  fetchPromiseClone.then((res) => {
    if(!res || res.status !== 200 || res.type !== 'basic') {
      return;
    }

    caches.open(CACHE_NAME)
      .then((cache) => {
        cache.put(event.request, res.clone());
      });
  });

  event.respondWith(
    fetchPromise.catch(err => caches.match(event.request))
  );
});