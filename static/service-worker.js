const CACHE_NAME = '85f9abe3-ab81-47bb-9291-ba6f6439fa6a';
const CACHE_DURATION = 7200;

self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME)
    .then(function (cache) {
      return cache.addAll([
        '/404/',
      ]);
    })
  );
});

self.addEventListener('fetch', function (event) {
  if (event.request.url.startsWith('chrome-extension://') ||
    event.request.url.startsWith('http://localhost')) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
    .then(function (response) {
      if (response) {
        const headers = response.headers.get('date');
        if (headers) {
          const expirationDate = new Date(headers).getTime() + CACHE_DURATION * 1000;
          const now = new Date().getTime();
          if (now > expirationDate) {
            return fetchAndUpdateCache(event.request);
          }
        }
        return response;
      }

      return fetchAndUpdateCache(event.request);
    })
  );
});

function fetchAndUpdateCache(request) {
  return fetch(request)
  .then(function (networkResponse) {
    if (networkResponse && networkResponse.status === 200) {
      const clonedResponse = networkResponse.clone();
      caches.open(CACHE_NAME)
      .then(function (cache) {
        cache.put(request, clonedResponse);
      });
    }
    return networkResponse;
  })
  .catch(function () {
    return caches.match('/404/');
  });
}
