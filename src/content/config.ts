import { defineCollection, z } from 'astro:content';

const COLUMNS = ['workshop', 'long-form', 'paper', 'tools', 'weekly'] as const;

const posts = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string().min(8).max(100),
    description: z.string().min(80).max(160),
    column: z.enum(COLUMNS),
    tags: z.array(z.string()).min(1).max(8),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    cover: z.string().optional(),
    coverAlt: z.string().optional(),
    draft: z.boolean().default(false),
    featured: z.boolean().default(false),
    tldr: z.string().min(50).max(300),
    faq: z
      .array(
        z.object({
          q: z.string().min(8).max(120),
          a: z.string().min(20).max(400),
        }),
      )
      .min(0)
      .max(10)
      .default([]),
    author: z.string().default('AI Frontier'),
  }),
});

export const collections = { posts };
export const COLUMN_LABELS: Record<(typeof COLUMNS)[number], string> = {
  'workshop': 'Workshop',
  'long-form': 'Long-form',
  'paper': 'Paper',
  'tools': 'Tools',
  'weekly': 'Weekly',
};
export const COLUMN_TAG_COLOR: Record<(typeof COLUMNS)[number], string> = {
  'workshop': 'var(--color-tag-workshop)',
  'long-form': 'var(--color-tag-long)',
  'paper': 'var(--color-tag-paper)',
  'tools': 'var(--color-tag-tools)',
  'weekly': 'var(--color-tag-weekly)',
};
