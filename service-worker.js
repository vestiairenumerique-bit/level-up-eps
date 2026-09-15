const CACHE_NAME = "level-up-eps-v19";
const DEMONSTRATIONS = ["jumping", "knees", "hops", "squat", "wall", "plank", "lunges", "burpee", "balance", "stairs", "walk", "carry"];
const APP_FILES = [
  "./", "./index.html", "./manifest.webmanifest", "./logo-app.png", "./logo-wordmark.png", "./icon-192.png", "./icon-512.png",
  ...DEMONSTRATIONS.map(state => `./assets/demonstrator/${state}.webp`),
  "./assets/demonstrator/burpee-v2.png",
  "./assets/demonstrator/pushup.png",
  "./assets/demonstrator/rowing.png",
  "./assets/demonstrator/crunch.png"
];

self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(APP_FILES)));
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))))
  );
  self.clients.claim();
});

self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;

  // Always check the network first for page navigations so a newly deployed
  // version cannot remain hidden behind the previous cached index.html.
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request).then(response => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put("./index.html", copy));
        return response;
      }).catch(() => caches.match("./index.html"))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then(cached => cached || fetch(event.request).then(response => {
      const copy = response.clone();
      caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
      return response;
    }).catch(() => caches.match("./index.html")))
  );
});
