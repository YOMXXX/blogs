import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { collectFeedItems } from '../lib/seo';

function escapeXml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
}

export const GET: APIRoute = async ({ site }) => {
  const baseUrl = site?.toString().replace(/\/$/, '') ?? '';
  const all = await getCollection('posts');
  const items = collectFeedItems(all);
  const updated = items[0]?.data.pubDate ?? new Date();

  const entriesXml = items
    .map((p) => {
      const url = `${baseUrl}/posts/${p.slug}`;
      return `  <entry>
    <id>${url}</id>
    <title>${escapeXml(p.data.title)}</title>
    <link href="${url}" />
    <updated>${p.data.pubDate.toISOString()}</updated>
    <published>${p.data.pubDate.toISOString()}</published>
    <author><name>${escapeXml(p.data.author)}</name></author>
    <summary>${escapeXml(p.data.description)}</summary>
    <category term="${escapeXml(p.data.column)}" />
  </entry>`;
    })
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <id>${baseUrl}/</id>
  <title>Nexus.AI</title>
  <subtitle>Frontier ML, decoded. Production AI, dissected.</subtitle>
  <link href="${baseUrl}/atom.xml" rel="self" />
  <link href="${baseUrl}/" />
  <updated>${updated.toISOString()}</updated>
${entriesXml}
</feed>`;

  return new Response(xml, {
    headers: { 'Content-Type': 'application/atom+xml; charset=utf-8' },
  });
};
