/** @type {import('next').NextConfig} */
 
const withPWA = require("next-pwa")({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
  customWorkerDir: "src/service-worker",
  cacheOnFrontEndNav: true,
  dynamicStartUrl: false,
  fallbacks: {
    document: "/offline.html",
  },
  runtimeCaching: [
    {
      urlPattern: ({ request }) => request.destination === "document",
      handler: "NetworkFirst",
      options: {
        cacheName: "pages",
        networkTimeoutSeconds: 3,
        cacheableResponse: { statuses: [0, 200] },
      },
    },
    {
      urlPattern: ({ request }) =>
        ["script", "style", "worker"].includes(request.destination),
      handler: "StaleWhileRevalidate",
      options: {
        cacheName: "static-resources",
        cacheableResponse: { statuses: [0, 200] },
      },
    },
    {
      urlPattern: ({ request }) =>
        ["image", "font"].includes(request.destination),
      handler: "CacheFirst",
      options: {
        cacheName: "media",
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 60 * 60 * 24 * 30,
        },
        cacheableResponse: { statuses: [0, 200] },
      },
    },
    // Cubre las navegaciones internas del App Router (RSC fetch) y
    // cualquier otra petición al mismo dominio que no calzó arriba.
    {
      urlPattern: ({ url }) => url.origin === self.location.origin,
      handler: "NetworkFirst",
      options: {
        cacheName: "others",
        networkTimeoutSeconds: 3,
        cacheableResponse: { statuses: [0, 200] },
      },
    },
  ],
});
 
const nextConfig = {
  reactStrictMode: true,
 
  // 🔥 IMPORTANTE: evitar conflicto con Turbopack
  turbopack: {},
 
  webpack: (config) => {
    return config;
  },
};
 
module.exports = withPWA(nextConfig);