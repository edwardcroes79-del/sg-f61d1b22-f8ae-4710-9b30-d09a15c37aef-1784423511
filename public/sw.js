const CACHE_NAME = "torque-log-v2";

const STATIC_ASSETS = ["/", "/offline"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener("push", (event) => {
  let data = {};
  try {
    data = event.data?.json() || {};
  } catch (e) {
    data = { title: "Torque Log", body: event.data?.text() || "Service reminder" };
  }

  const title = data.title || "Torque Log";
  const options = {
    body: data.body || "Your vehicle is due for service soon.",
    icon: data.icon || "/favicon.ico",
    badge: data.badge || "/favicon.ico",
    data: data.data || {},
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url || "/";

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url === url && "focus" in client) {
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(url);
      }
    })
  );
});

function isNetworkFirst(request) {
  const url = new URL(request.url);
  return (
    url.pathname.startsWith("/api/manifest") ||
    url.pathname.startsWith("/storage/v1/object/public/")
  );
}

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  if (isNetworkFirst(event.request)) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
          return response;
        })
        .catch(() => {
          return caches.match(event.request).then((cached) => {
            if (cached) return cached;
            if (event.request.mode === "navigate") {
              return caches.match("/offline") || caches.match("/");
            }
            return new Response("Offline", { status: 503 });
          });
        })
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => {
      return (
        cached ||
        fetch(event.request)
          .then((response) => {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
            });
            return response;
          })
          .catch(() => {
            if (event.request.mode === "navigate") {
              return caches.match("/offline") || caches.match("/");
            }
            return new Response("Offline", { status: 503 });
          })
      );
    })
  );
});