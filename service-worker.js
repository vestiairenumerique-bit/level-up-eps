const CACHE_NAME = "level-up-eps-v36-final";
const DEMONSTRATIONS = ["jumping", "knees", "hops", "squat", "wall", "plank", "lunges", "burpee", "balance", "stairs", "walk", "carry"];
const BADGES = ["01-rookie","02-espoir","03-challenger","04-titulaire","05-pro","06-expert","07-leader","08-capitaine","09-champion","10-elite","11-icone","12-legende"].map(name => `./assets/badges-v23/${name}.webp`);
const REWARDS = ["bag-closed","bag-open","bottle"].map(name => `./assets/rewards/${name}.webp`);
const WARDROBE = ["serviette","corde","ballon","tapis","elastique","chronometre","halteres","medecine-ball","montre","tenue"].map(name => `./assets/wardrobe/${name}.webp`);
const WARDROBE_V34 = ["lacets","brassard","chaussettes","casquette","chaussures","chasuble","cones","sac-a-dos","brassard-capitaine","medaille","fanion","coupe"].map(name => `./assets/wardrobe-v34/${name}.webp`);
const APP_FILES = [
  "./", "./index.html", "./premium-v34.css", "./manifest.webmanifest", "./logo-app.png", "./logo-wordmark.png", "./icon-192.png", "./icon-512.png",
  ...BADGES, ...REWARDS, ...WARDROBE, ...WARDROBE_V34,
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

self.addEventListener("notificationclick", event => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({type: "window", includeUncontrolled: true}).then(windows => {
      const existing = windows.find(client => "focus" in client);
      return existing ? existing.focus() : clients.openWindow("./");
    })
  );
});
