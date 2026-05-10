export interface ArticleSchemaInput {
  title: string;
  description: string;
  slug: string;
  pubDate: Date;
  updatedDate?: Date;
  author: string;
  siteUrl: string;
  image: string;
}

export interface ArticleSchema {
  '@context': 'https://schema.org';
  '@type': 'Article';
  headline: string;
  description: string;
  datePublished: string;
  dateModified?: string;
  author: { '@type': 'Person'; name: string };
  publisher?: { '@type': 'Organization'; name: string };
  image: string;
  mainEntityOfPage: string;
}

export function buildArticleSchema(input: ArticleSchemaInput): ArticleSchema {
  const url = `${input.siteUrl.replace(/\/$/, '')}/posts/${input.slug}`;
  const schema: ArticleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: input.title,
    description: input.description,
    datePublished: input.pubDate.toISOString(),
    author: { '@type': 'Person', name: input.author },
    publisher: { '@type': 'Organization', name: 'YOMXXX' },
    image: input.image,
    mainEntityOfPage: url,
  };
  if (input.updatedDate) {
    schema.dateModified = input.updatedDate.toISOString();
  }
  return schema;
}

export interface BreadcrumbItem {
  name: string;
  url: string;
}

export interface BreadcrumbSchema {
  '@context': 'https://schema.org';
  '@type': 'BreadcrumbList';
  itemListElement: Array<{
    '@type': 'ListItem';
    position: number;
    name: string;
    item: string;
  }>;
}

export function buildBreadcrumbSchema(items: BreadcrumbItem[]): BreadcrumbSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export interface OrganizationInput {
  name: string;
  url: string;
  logo: string;
}

export function buildOrganizationSchema(input: OrganizationInput) {
  return {
    '@context': 'https://schema.org' as const,
    '@type': 'Organization' as const,
    name: input.name,
    url: input.url,
    logo: input.logo,
  };
}

export interface WebSiteInput {
  name: string;
  url: string;
}

export function buildWebSiteSchema(input: WebSiteInput) {
  return {
    '@context': 'https://schema.org' as const,
    '@type': 'WebSite' as const,
    name: input.name,
    url: input.url,
  };
}

export interface FaqEntry {
  q: string;
  a: string;
}

export function buildFaqSchema(faqs: FaqEntry[]) {
  if (faqs.length === 0) return null;
  return {
    '@context': 'https://schema.org' as const,
    '@type': 'FAQPage' as const,
    mainEntity: faqs.map((f) => ({
      '@type': 'Question' as const,
      name: f.q,
      acceptedAnswer: { '@type': 'Answer' as const, text: f.a },
    })),
  };
}

export interface FeedablePost {
  slug: string;
  body: string;
  data: {
    title: string;
    description: string;
    pubDate: Date;
    author: string;
    column: string;
    draft: boolean;
  };
}

export function collectFeedItems<T extends FeedablePost>(posts: T[]): T[] {
  return posts
    .filter((p) => !p.data.draft)
    .sort((a, b) => b.data.pubDate.getTime() - a.data.pubDate.getTime());
}
