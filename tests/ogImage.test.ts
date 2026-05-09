import { describe, it, expect } from 'vitest';
import { renderOgSvg } from '@lib/ogImage';

describe('renderOgSvg', () => {
  it('returns a valid 1200×630 SVG with path data for the given title', async () => {
    const svg = await renderOgSvg({
      title: 'Production-Grade Agentic RAG',
      column: 'workshop',
      date: new Date('2026-05-09'),
    });
    expect(svg).toMatch(/^<svg /);
    expect(svg).toContain('width="1200"');
    expect(svg).toContain('height="630"');
    // Satori converts text to <path> elements; SVG must have path data
    expect(svg).toContain('<path');
  });

  it('produces a valid SVG even with very long titles', async () => {
    const longTitle = 'A'.repeat(200);
    const svg = await renderOgSvg({ title: longTitle, column: 'long-form', date: new Date() });
    expect(svg).toMatch(/^<svg /);
    expect(svg).toContain('width="1200"');
  });
});
