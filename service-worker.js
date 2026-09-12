const CACHE_NAME = "level-up-eps-v9";
const CHARACTERS = ["nova", "maya", "leo", "lina", "player5", "player6"];
const POSES = ["victory", "plank", "wall", "burpee", "pushup", "squat", "jumping", "knees", "hops", "balance", "stairs", "carry", "walk"];
const APP_FILES = [
  "./", "./index.html", "./manifest.webmanifest", "./logo-app.png", "./logo-wordmark.png", "./icon-192.png", "./icon-512.png",
  ...CHARACTERS.flatMap(character => POSES.map(pose => `./assets/characters/${character}-${pose}.png`))
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
  event.respondWith(
    caches.match(event.request).then(cached => cached || fetch(event.request).then(response => {
      const copy = response.clone();
      caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
      return response;
    }).catch(() => caches.match("./index.html")))
  );
});
