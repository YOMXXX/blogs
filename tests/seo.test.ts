import { describe, it, expect } from 'vitest';
import { buildArticleSchema, buildBreadcrumbSchema } from '@lib/seo';

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
