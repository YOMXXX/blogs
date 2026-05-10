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
    AstroPWA({
      registerType: 'autoUpdate',
      manifest: false,
      workbox: {
        // 只 precache 静态资源，绝不碰 HTML
        globPatterns: ['**/*.{js,css,woff2}'],
        // 不缓存 HTML — 始终走网络，杜绝页面闪动
        navigateFallback: null,
        runtimeCaching: [
          {
            urlPattern: /\/_astro\/.*\.(js|css)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'static-assets',
              expiration: { maxEntries: 200, maxAgeSeconds: 365 * 24 * 60 * 60 },
            },
          },
          {
            urlPattern: /\/fonts\/.*\.woff2$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'font-cache',
              expiration: { maxEntries: 10, maxAgeSeconds: 365 * 24 * 60 * 60 },
            },
          },
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|avif|ico)$/,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'image-cache',
              expiration: { maxEntries: 100, maxAgeSeconds: 30 * 24 * 60 * 60 },
            },
          },
        ],
      },
      devOptions: { enabled: false },
    }),
    sitemap({
      changefreq: 'weekly',
      priority: 0.7,
      filter: (page) => !page.includes('/404'),
      serialize(item) {
        const isPostDetail = /\/posts\/[^/]+$/.test(item.url) && !item.url.endsWith('/posts');
        const isHome = item.url === SITE || item.url === `${SITE}/`;
        if (isPostDetail) return { ...item, priority: 0.9, changefreq: 'monthly' };
        if (isHome) return { ...item, priority: 1.0, changefreq: 'daily' };
        return item;
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
