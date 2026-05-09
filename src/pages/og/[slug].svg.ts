import type { APIRoute, GetStaticPaths } from 'astro';
import { getCollection } from 'astro:content';
import { renderOgSvg } from '../../lib/ogImage';

export const getStaticPaths: GetStaticPaths = async () => {
  const posts = await getCollection('posts', ({ data }) => !data.draft);
  return posts.map((post) => ({
    params: { slug: post.slug },
    props: { post },
  }));
};

export const GET: APIRoute = async ({ props }) => {
  const post = props.post as Awaited<ReturnType<typeof getCollection>>[number];
  const svg = await renderOgSvg({
    title: post.data.title,
    column: post.data.column,
    date: post.data.pubDate,
  });
  return new Response(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
};
