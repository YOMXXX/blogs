// src/layouts/templates/types.ts
import type { COLUMN_LABELS } from '../../content/config';

export interface ArticleTemplateProps {
  frontmatter: {
    title: string;
    description: string;
    column: keyof typeof COLUMN_LABELS;
    pubDate: Date;
    updatedDate?: Date;
    tldr: string;
    faq?: Array<{ q: string; a: string }>;
    author: string;
    tags: string[];
  };
  headings: Array<{ depth: number; slug: string; text: string }>;
  slug: string;
  tagColor: string;
  columnLabel: string;
  dateStr: string;
  readingTimeStr: string;
}
