const CACHE_NAME = 'acumalaka-v1.0.2-beta';
const ASSETS_TO_CACHE = [
'/',
'/index.html',
'/style.css',
'/script.js',
'/config.json',

'/app/icon.png',

'/app/banner.png',
'/app/banner_event',
'/app/banner_info.png',
'/app/banner_download.png',

'/app/home.png',
'/app/event.png',
'/app/info.png',
'/app/download.png',
'/app/bebas.png'
];

self.addEventListener('install', event => {
event.waitUntil(
caches.open(CACHE_NAME)
.then(cache => cache.addAll(ASSETS_TO_CACHE))
.then(() => self.skipWaiting())
);
});

self.addEventListener('activate', event => {
event.waitUntil(
caches.keys().then(cacheNames => {
return Promise.all(
cacheNames.map(cache => {
if (cache !== CACHE_NAME) {
return caches.delete(cache);
}
})
);
})
);
});

self.addEventListener('fetch', event => {
event.respondWith(
caches.match(event.request)
.then(response => response || fetch(event.request))
);
});
