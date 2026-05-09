import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { collectFeedItems } from '../lib/seo';

export const GET: APIRoute = async ({ site }) => {
  const baseUrl = site?.toString().replace(/\/$/, '') ?? '';
  const all = await getCollection('posts');
  const items = collectFeedItems(all);

  const json = {
    version: 'https://jsonfeed.org/version/1.1',
    title: 'Nexus.AI',
    home_page_url: `${baseUrl}/`,
    feed_url: `${baseUrl}/feed.json`,
    description: 'Frontier ML, decoded. Production AI, dissected.',
    language: 'en',
    items: items.map((p) => ({
      id: `${baseUrl}/posts/${p.slug}`,
      url: `${baseUrl}/posts/${p.slug}`,
      title: p.data.title,
      summary: p.data.description,
      date_published: p.data.pubDate.toISOString(),
      authors: [{ name: p.data.author }],
      tags: [p.data.column],
    })),
  };

  return new Response(JSON.stringify(json, null, 2), {
    headers: { 'Content-Type': 'application/feed+json; charset=utf-8' },
  });
};
