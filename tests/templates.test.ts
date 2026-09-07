// tests/templates.test.ts
import { describe, it, expect } from 'vitest';
import { resolveTemplate, TEMPLATE_KEYS, dossierNumber } from '../src/lib/templates';

describe('resolveTemplate', () => {
  it.each(TEMPLATE_KEYS)('accepts %s', (k) => {
    expect(resolveTemplate(k)).toBe(k);
  });
  it('falls back to classic for undefined', () => {
    expect(resolveTemplate(undefined)).toBe('classic');
  });
  it('falls back to classic for empty string', () => {
    expect(resolveTemplate('')).toBe('classic');
  });
  it('falls back to classic for unknown value', () => {
    expect(resolveTemplate('fancy')).toBe('classic');
  });
});

describe('dossierNumber', () => {
  it('is deterministic for the same slug', () => {
    expect(dossierNumber('2026-09-07-foo')).toBe(dossierNumber('2026-09-07-foo'));
  });
  it('is in range 0-999', () => {
    const n = dossierNumber('2026-09-07-multi-template-design');
    expect(n).toBeGreaterThanOrEqual(0);
    expect(n).toBeLessThanOrEqual(999);
  });
});
