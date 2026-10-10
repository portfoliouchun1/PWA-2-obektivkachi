const CACHE_NAME = "obektivkachi-pwa-v3";
const ASSETS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./icons/logo.png",
  "./icons/logo.png"
];

// ===== O'rnatish =====
self.addEventListener("install", (event) => {
  console.log("Service Worker o'rnatilmoqda...");
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("Resurslar keshga yuklanmoqda");
      return cache.addAll(ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// ===== Faollashtirish =====
self.addEventListener("activate", (event) => {
  console.log("Service Worker faollashmoqda...");
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME)
            .map(key => {
              console.log("Eski kesh o'chirilmoqda:", key);
              return caches.delete(key);
            })
      );
    }).then(() => self.clients.claim())
  );
});

// ===== So'rovlarni ushlash =====
self.addEventListener("fetch", (event) => {
  // Faqat GET so'rovlarini keshga olish
  if (event.request.method !== "GET") return;
  
  // Chrome extension va boshqa tashqi so'rovlarni o'tkazib yuborish
  if (!event.request.url.startsWith(self.location.origin)) return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      
      return fetch(event.request).then((response) => {
        // Faqat muvaffaqiyatli javoblarni keshga saqlash
        if (!response || response.status !== 200 || response.type !== "basic") {
          return response;
        }
        
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseClone);
        });
        
        return response;
      }).catch(() => {
        // Oflayn va keshda yo'q bo'lsa
        if (event.request.destination === "document") {
          return caches.match("./index.html");
        }
      });
    })
  );
});