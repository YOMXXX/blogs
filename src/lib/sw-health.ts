export interface SwHealthInput {
  swStatus: 'activated' | 'installing' | 'waiting' | 'redundant' | 'unsupported' | 'error';
  cacheHit: boolean;
  offline: boolean;
}

export interface SwHealthPayload extends SwHealthInput {
  type: 'sw-health';
  page: string;
  timestamp: number;
}

export function buildSwHealthPayload(input: SwHealthInput): SwHealthPayload {
  return {
    type: 'sw-health',
    ...input,
    page: typeof window !== 'undefined' ? window.location.pathname : '/',
    timestamp: Date.now(),
  };
}
