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
    image: input.image,
    mainEntityOfPage: url,
  };
  if (input.updatedDate) {
    schema.dateModified = input.updatedDate.toISOString();
  }
  return schema;
}
