import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// TODO: replace with real domain before deploy (used by sitemap and OG canonical URLs)
const SITE = 'https://nexus-ai.example.com';

export default defineConfig({
  site: SITE,
  trailingSlash: 'never',
  build: {
    format: 'file',
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
