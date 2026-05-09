import { describe, it, expect } from 'vitest';
import { buildSwHealthPayload } from '../src/lib/sw-health';

describe('buildSwHealthPayload', () => {
  it('returns correct structure with sw status', () => {
    const payload = buildSwHealthPayload({
      swStatus: 'activated',
      cacheHit: true,
      offline: false,
    });
    expect(payload).toEqual({
      type: 'sw-health',
      swStatus: 'activated',
      cacheHit: true,
      offline: false,
      page: expect.any(String),
      timestamp: expect.any(Number),
    });
  });

  it('includes offline=true when navigator.onLine is false', () => {
    const payload = buildSwHealthPayload({
      swStatus: 'activated',
      cacheHit: false,
      offline: true,
    });
    expect(payload.offline).toBe(true);
  });

  it('handles no-sw scenario', () => {
    const payload = buildSwHealthPayload({
      swStatus: 'unsupported',
      cacheHit: false,
      offline: false,
    });
    expect(payload.swStatus).toBe('unsupported');
  });
});
