const CACHE_NAME = 'aizhuzi';

const PRECACHE_LIST = ['./dist/umi.js', './dist/umi.css'];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache
        .addAll(PRECACHE_LIST)
        .then(self.skipWaiting())
        .catch((err) => console.log(err));
    }),
  );
});

self.addEventListener('activate', (event) => {
  // delete old deprecated caches.
  caches
    .keys()
    .then((cacheNames) =>
      Promise.all(
        cacheNames
          .filter((cacheName) => cacheName !== CACHE_NAME)
          .map((cacheName) => caches.delete(cacheName)),
      ),
    );
  console.log('service worker activated.');
  event.waitUntil(self.clients.claim());
});

// const isNavigationReq = (req) => (req.mode === 'navigate' || (req.method === 'GET' && req.headers.get('accept').includes('text/html')))
// const endWithExtension = (req) => Boolean(new URL(req.url).pathname.match(/\.\w+$/))
// const shouldRedirect = (req) => (isNavigationReq(req) && new URL(req.url).pathname.substr(-1) !== "/" && !endWithExtension(req))

self.addEventListener('fetch', (event) => {
  if (event.request.method.toUpperCase() !== 'GET') {
    return;
  }

  // const fetchPromise = fetch(event.request, { cache: "no-store" });
  const fetchPromise = fetch(event.request);
  const fetchPromiseClone = fetchPromise.then((res) => res.clone());

  // 缓存
  fetchPromiseClone.then((res) => {
    if (!res || res.status !== 200 || res.type !== 'basic') {
      return;
    }

    caches.open(CACHE_NAME).then((cache) => {
      cache.put(event.request, res.clone());
    });
  });

  event.respondWith(fetchPromise.catch((err) => caches.match(event.request)));
});
