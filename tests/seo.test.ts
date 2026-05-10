import { describe, it, expect } from 'vitest';
import { buildArticleSchema, buildBreadcrumbSchema, buildOrganizationSchema, buildWebSiteSchema, buildFaqSchema, collectFeedItems, type FeedablePost } from '@lib/seo';

describe('buildArticleSchema', () => {
  it('produces a valid Article JSON-LD with required fields', () => {
    const schema = buildArticleSchema({
      title: 'Production-Grade Agentic RAG',
      description: 'Eight lessons from rewriting a customer-support RAG into an agentic architecture over 90 days.',
      slug: 'agentic-rag-production',
      pubDate: new Date('2026-05-09T00:00:00Z'),
      author: 'AI Frontier',
      siteUrl: 'https://nexus-ai.example.com',
      image: 'https://nexus-ai.example.com/og/agentic-rag-production.svg',
    });
    expect(schema['@context']).toBe('https://schema.org');
    expect(schema['@type']).toBe('Article');
    expect(schema.headline).toBe('Production-Grade Agentic RAG');
    expect(schema.description).toBe('Eight lessons from rewriting a customer-support RAG into an agentic architecture over 90 days.');
    expect(schema.datePublished).toBe('2026-05-09T00:00:00.000Z');
    expect(schema.author).toEqual({ '@type': 'Person', name: 'AI Frontier' });
    expect(schema.image).toBe('https://nexus-ai.example.com/og/agentic-rag-production.svg');
    expect(schema.mainEntityOfPage).toBe('https://nexus-ai.example.com/posts/agentic-rag-production');
  });

  it('includes dateModified when updatedDate provided', () => {
    const schema = buildArticleSchema({
      title: 'a'.repeat(20),
      description: 'b'.repeat(120),
      slug: 'x',
      pubDate: new Date('2026-01-01'),
      updatedDate: new Date('2026-02-01'),
      author: 'A',
      siteUrl: 'https://example.com',
      image: 'https://example.com/og.svg',
    });
    expect(schema.dateModified).toBe('2026-02-01T00:00:00.000Z');
  });

  it('omits dateModified when updatedDate is undefined', () => {
    const schema = buildArticleSchema({
      title: 'a'.repeat(20),
      description: 'b'.repeat(120),
      slug: 'x',
      pubDate: new Date('2026-01-01'),
      author: 'A',
      siteUrl: 'https://example.com',
      image: 'https://example.com/og.svg',
    });
    expect(schema.dateModified).toBeUndefined();
  });
});

describe('buildBreadcrumbSchema', () => {
  it('produces a valid BreadcrumbList with positions', () => {
    const schema = buildBreadcrumbSchema([
      { name: 'Home', url: 'https://example.com/' },
      { name: 'Posts', url: 'https://example.com/posts' },
      { name: 'Agentic RAG', url: 'https://example.com/posts/agentic-rag' },
    ]);
    expect(schema['@type']).toBe('BreadcrumbList');
    expect(schema.itemListElement).toHaveLength(3);
    expect(schema.itemListElement[0]).toEqual({
      '@type': 'ListItem',
      position: 1,
      name: 'Home',
      item: 'https://example.com/',
    });
    expect(schema.itemListElement[2].position).toBe(3);
  });

  it('returns an empty list for empty input', () => {
    const schema = buildBreadcrumbSchema([]);
    expect(schema.itemListElement).toEqual([]);
  });
});

describe('buildOrganizationSchema', () => {
  it('produces an Organization with name and url', () => {
    const schema = buildOrganizationSchema({
      name: 'YOMXXX',
      url: 'https://nexus-ai.example.com',
      logo: 'https://nexus-ai.example.com/favicon.svg',
    });
    expect(schema['@type']).toBe('Organization');
    expect(schema.name).toBe('YOMXXX');
    expect(schema.url).toBe('https://nexus-ai.example.com');
    expect(schema.logo).toBe('https://nexus-ai.example.com/favicon.svg');
  });
});

describe('buildWebSiteSchema', () => {
  it('produces a WebSite schema', () => {
    const schema = buildWebSiteSchema({
      name: 'YOMXXX',
      url: 'https://nexus-ai.example.com',
    });
    expect(schema['@type']).toBe('WebSite');
    expect(schema.name).toBe('YOMXXX');
    expect(schema.url).toBe('https://nexus-ai.example.com');
  });
});

describe('buildFaqSchema', () => {
  it('produces FAQPage with mainEntity questions', () => {
    const schema = buildFaqSchema([
      { q: 'What is Agentic RAG?', a: 'A retrieval pattern where the LLM decides retrieval strategy itself.' },
      { q: 'How is it different from naive RAG?', a: 'Agentic RAG can plan, retry, and verify; naive RAG retrieves once.' },
    ]);
    expect(schema).not.toBeNull();
    expect(schema!['@type']).toBe('FAQPage');
    expect(schema!.mainEntity).toHaveLength(2);
    expect(schema!.mainEntity[0]).toEqual({
      '@type': 'Question',
      name: 'What is Agentic RAG?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'A retrieval pattern where the LLM decides retrieval strategy itself.',
      },
    });
  });

  it('returns null when faqs array is empty', () => {
    expect(buildFaqSchema([])).toBeNull();
  });
});

describe('collectFeedItems', () => {
  const post = (slug: string, date: string, draft = false): FeedablePost => ({
    slug,
    body: 'body',
    data: {
      title: `Title ${slug}`,
      description: 'd'.repeat(120),
      pubDate: new Date(date),
      author: 'Author',
      column: 'long-form',
      draft,
    },
  });

  it('filters out drafts', () => {
    const items = collectFeedItems([post('a', '2026-01-01'), post('b', '2026-01-02', true)]);
    expect(items.map((i) => i.slug)).toEqual(['a']);
  });

  it('sorts by pubDate desc', () => {
    const items = collectFeedItems([
      post('a', '2026-01-01'),
      post('b', '2026-03-01'),
      post('c', '2026-02-01'),
    ]);
    expect(items.map((i) => i.slug)).toEqual(['b', 'c', 'a']);
  });
});
