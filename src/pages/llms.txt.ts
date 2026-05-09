import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { collectFeedItems } from '../lib/seo';

export const GET: APIRoute = async ({ site }) => {
  const baseUrl = site?.toString().replace(/\/$/, '') ?? '';
  const all = await getCollection('posts');
  const items = collectFeedItems(all);

  const lines = [
    '# YOMXXX',
    '',
    '> Frontier ML, decoded. Production AI, dissected. Personal engineering blog on LLMs, Agents, RAG, and the systems beneath. Published weekly.',
    '',
    '## Posts',
    '',
    ...items.map((p) => `- [${p.data.title}](${baseUrl}/posts/${p.slug}): ${p.data.description}`),
    '',
    '## About',
    '',
    `- [About the author](${baseUrl}/about)`,
    `- [Contact](${baseUrl}/contact)`,
    `- [Privacy](${baseUrl}/privacy)`,
    '',
    '## Feeds',
    '',
    `- [RSS](${baseUrl}/rss.xml)`,
    `- [Atom](${baseUrl}/atom.xml)`,
    `- [JSON Feed](${baseUrl}/feed.json)`,
    `- [Full content](${baseUrl}/llms-full.txt)`,
    '',
  ];

  return new Response(lines.join('\n'), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
