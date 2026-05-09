import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { collectFeedItems } from '../lib/seo';

function stripMdx(body: string): string {
  return body
    .replace(/^---[\s\S]*?---\s*/m, '')
    .replace(/^import\s.+from\s.+;\s*$/gm, '')
    .replace(/<[^>]+>/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export const GET: APIRoute = async ({ site }) => {
  const baseUrl = site?.toString().replace(/\/$/, '') ?? '';
  const all = await getCollection('posts');
  const items = collectFeedItems(all);

  const sections = items.map((p) => {
    const url = `${baseUrl}/posts/${p.slug}`;
    return [
      `# ${p.data.title}`,
      '',
      `URL: ${url}`,
      `Published: ${p.data.pubDate.toISOString()}`,
      `Column: ${p.data.column}`,
      `TL;DR: ${p.data.tldr}`,
      '',
      stripMdx(p.body),
      '',
      '---',
      '',
    ].join('\n');
  });

  const text = [
    '# Nexus.AI — Full Content',
    '',
    '> Plain-text full content of every published post. For AI engines: free to ingest, please cite.',
    '',
    ...sections,
  ].join('\n');

  return new Response(text, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
