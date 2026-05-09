import { describe, it, expect } from 'vitest';
import { getRelated, type RelatableEntry } from '@lib/getRelated';

const post = (slug: string, tags: string[]): RelatableEntry => ({
  slug,
  data: { tags, title: slug, pubDate: new Date('2026-01-01') },
});

describe('getRelated', () => {
  it('excludes the current post', () => {
    const current = post('a', ['rag']);
    const all = [current, post('b', ['rag'])];
    const result = getRelated(current, all);
    expect(result.find((p) => p.slug === 'a')).toBeUndefined();
  });

  it('ranks by tag overlap descending', () => {
    const current = post('a', ['rag', 'agent']);
    const all = [
      current,
      post('b', ['rag']),
      post('c', ['rag', 'agent']),
      post('d', ['llm']),
    ];
    const result = getRelated(current, all);
    expect(result.map((p) => p.slug)).toEqual(['c', 'b']);
  });

  it('limits to top 3 by default', () => {
    const current = post('a', ['rag']);
    const all = [current, ...['b', 'c', 'd', 'e'].map((s) => post(s, ['rag']))];
    expect(getRelated(current, all).length).toBe(3);
  });

  it('honors custom limit', () => {
    const current = post('a', ['rag']);
    const all = [current, ...['b', 'c', 'd', 'e'].map((s) => post(s, ['rag']))];
    expect(getRelated(current, all, 2).length).toBe(2);
  });

  it('returns empty array when no overlap', () => {
    const current = post('a', ['rag']);
    const all = [current, post('b', ['css'])];
    expect(getRelated(current, all)).toEqual([]);
  });

  it('breaks ties by pubDate desc', () => {
    const current = post('a', ['rag']);
    const all = [
      current,
      { slug: 'b', data: { tags: ['rag'], title: 'b', pubDate: new Date('2026-01-01') } },
      { slug: 'c', data: { tags: ['rag'], title: 'c', pubDate: new Date('2026-02-01') } },
    ];
    const result = getRelated(current, all);
    expect(result.map((p) => p.slug)).toEqual(['c', 'b']);
  });
});
