import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import AstroPWA from '@vite-pwa/astro';

const SITE = 'https://yomxxx.com';

export default defineConfig({
  site: SITE,
  trailingSlash: 'never',
  build: {
    format: 'file',
  },
  prefetch: {
    prefetchAll: false,
    defaultStrategy: 'hover',
  },
  integrations: [
    mdx(),
    react(),
    sitemap({
      changefreq: 'weekly',
      priority: 0.7,
      lastmod: new Date(),
      filter: (page) => !page.includes('/404'),
      serialize(item) {
        const isPostDetail = /\/posts\/[^/]+$/.test(item.url) && !item.url.endsWith('/posts');
        const isHome = item.url === SITE || item.url === `${SITE}/`;
        if (isPostDetail) return { ...item, priority: 0.9, changefreq: 'monthly' };
        if (isHome) return { ...item, priority: 1.0, changefreq: 'daily' };
        return item;
      },
    }),
    AstroPWA({
      registerType: 'prompt',
      includeAssets: ['favicon.svg', 'fonts/*.woff2'],
      manifest: false, // Task 8 will create manual manifest
      workbox: {
        // Precache: build artifacts with content hash
        globPatterns: ['**/*.{js,css,woff2}', 'index.html', 'offline.html'],

        // Runtime caching strategies
        runtimeCaching: [
          // HTML pages: NetworkFirst, 3-day TTL
          {
            urlPattern: /^https:\/\/yomxxx\.com\/.*\.html$/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'html-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 3 * 24 * 60 * 60,
              },
              cacheableResponse: { statuses: [0, 200] },
              networkTimeoutSeconds: 3,
            },
          },
          // Homepage (no .html suffix)
          {
            urlPattern: /^https:\/\/yomxxx\.com\/$/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'html-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 3 * 24 * 60 * 60,
              },
              cacheableResponse: { statuses: [0, 200] },
              networkTimeoutSeconds: 3,
            },
          },
          // JS/CSS: CacheFirst, 365-day TTL (content hash)
          {
            urlPattern: /\/_astro\/.*\.(js|css)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'static-assets',
              expiration: {
                maxEntries: 200,
                maxAgeSeconds: 365 * 24 * 60 * 60,
              },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          // Fonts: CacheFirst, 365-day TTL
          {
            urlPattern: /\/fonts\/.*\.woff2$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'font-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 365 * 24 * 60 * 60,
              },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          // Images: StaleWhileRevalidate, 30-day TTL, 50MB cap
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|avif|ico)$/,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'image-cache',
              expiration: {
                maxEntries: 200,
                maxAgeSeconds: 30 * 24 * 60 * 60,
                purgeOnQuotaError: true,
              },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          // RSS/Atom/JSON Feed: NetworkFirst, 1-hour TTL
          {
            urlPattern: /\/(rss\.xml|atom\.xml|feed\.json)$/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'feed-cache',
              expiration: {
                maxEntries: 5,
                maxAgeSeconds: 60 * 60,
              },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          // Pagefind index: StaleWhileRevalidate
          {
            urlPattern: /\/pagefind\//,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'search-cache',
              expiration: {
                maxEntries: 30,
                maxAgeSeconds: 7 * 24 * 60 * 60,
              },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],

        // Offline fallback
        navigateFallback: '/offline',
        navigateFallbackDenylist: [
          /\/rss\.xml$/,
          /\/atom\.xml$/,
          /\/feed\.json$/,
          /\/llms.*\.txt$/,
          /\/sitemap.*\.xml$/,
          /\/robots\.txt$/,
          /\/cdn-cgi\//,
        ],

        navigateFallbackAllowlist: [/^\/(?!cdn-cgi)/],
      },
      devOptions: {
        enabled: false,
      },
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
  markdown: {
    shikiConfig: {
      theme: 'github-dark-dimmed',
      wrap: true,
    },
  },
});
