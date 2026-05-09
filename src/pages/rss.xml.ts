import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { collectFeedItems } from '../lib/seo';

function escapeXml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export const GET: APIRoute = async ({ site }) => {
  const baseUrl = site?.toString().replace(/\/$/, '') ?? '';
  const all = await getCollection('posts');
  const items = collectFeedItems(all);

  const itemsXml = items
    .map((p) => {
      const url = `${baseUrl}/posts/${p.slug}`;
      return `    <item>
      <title>${escapeXml(p.data.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${p.data.pubDate.toUTCString()}</pubDate>
      <description>${escapeXml(p.data.description)}</description>
      <category>${escapeXml(p.data.column)}</category>
    </item>`;
    })
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>YOMXXX</title>
    <link>${baseUrl}/</link>
    <atom:link href="${baseUrl}/rss.xml" rel="self" type="application/rss+xml" />
    <description>Frontier ML, decoded. Production AI, dissected.</description>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
${itemsXml}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' },
  });
};
