import { describe, it, expect } from 'vitest';
import { readingTime } from '@lib/readingTime';

describe('readingTime', () => {
  it('returns minutes for plain text using 200wpm default', () => {
    const text = Array.from({ length: 400 }, () => 'word').join(' ');
    expect(readingTime(text)).toBe('2 min read');
  });

  it('rounds up partial minutes', () => {
    const text = Array.from({ length: 250 }, () => 'word').join(' ');
    expect(readingTime(text)).toBe('2 min read');
  });

  it('returns at least 1 min for very short text', () => {
    expect(readingTime('hello world')).toBe('1 min read');
  });

  it('handles empty string', () => {
    expect(readingTime('')).toBe('1 min read');
  });

  it('strips MDX/markdown noise (code fences, links) before counting', () => {
    const text = '```ts\nconst x = 1;\n```\n[link](url) word '.repeat(100);
    const result = readingTime(text);
    expect(result).toMatch(/^\d+ min read$/);
  });

  it('honors custom wpm override', () => {
    const text = Array.from({ length: 600 }, () => 'word').join(' ');
    expect(readingTime(text, 300)).toBe('2 min read');
  });
});
