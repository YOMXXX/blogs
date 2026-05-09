import { describe, it, expect } from 'vitest';
import { slugify } from '@lib/slugify';

describe('slugify', () => {
  it('lowercases and dashes a simple title', () => {
    expect(slugify('Hello World')).toBe('hello-world');
  });

  it('strips punctuation', () => {
    expect(slugify('What is RAG? A 2026 guide!')).toBe('what-is-rag-a-2026-guide');
  });

  it('collapses multiple spaces and dashes', () => {
    expect(slugify('  multi---space   string  ')).toBe('multi-space-string');
  });

  it('removes leading and trailing dashes', () => {
    expect(slugify('---hello---')).toBe('hello');
  });

  it('returns empty string for input with only punctuation', () => {
    expect(slugify('!!!')).toBe('');
  });

  it('preserves digits', () => {
    expect(slugify('GPT-5 vs Claude 4.7')).toBe('gpt-5-vs-claude-4-7');
  });
});
