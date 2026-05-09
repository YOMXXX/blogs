import { useEffect } from 'react';
import { onLCP, onINP, onCLS, type Metric } from 'web-vitals';
import { buildSwHealthPayload } from '../../lib/sw-health';

function send(metric: Metric) {
  const body = JSON.stringify({
    name: metric.name,
    value: metric.value,
    id: metric.id,
    rating: metric.rating,
    page: window.location.pathname,
  });
  if (navigator.sendBeacon) {
    navigator.sendBeacon('/cdn-cgi/rum', body);
  } else {
    fetch('/cdn-cgi/rum', { method: 'POST', body, keepalive: true }).catch(() => undefined);
  }
}

function sendHealthBeacon(payload: ReturnType<typeof buildSwHealthPayload>) {
  const body = JSON.stringify(payload);
  if (navigator.sendBeacon) {
    navigator.sendBeacon('/cdn-cgi/rum', body);
  } else {
    fetch('/cdn-cgi/rum', { method: 'POST', body, keepalive: true }).catch(() => undefined);
  }
}

function reportSwHealth() {
  const hasSW = 'serviceWorker' in navigator;
  if (!hasSW) {
    sendHealthBeacon(buildSwHealthPayload({
      swStatus: 'unsupported',
      cacheHit: false,
      offline: !navigator.onLine,
    }));
    return;
  }

  navigator.serviceWorker.ready.then((reg) => {
    const sw = reg.active;
    const payload = buildSwHealthPayload({
      swStatus: sw ? 'activated' : 'installing',
      cacheHit: performance.getEntriesByType('navigation').some(
        (e: any) => e.transferSize === 0 && e.decodedBodySize > 0
      ),
      offline: !navigator.onLine,
    });
    sendHealthBeacon(payload);
  }).catch(() => {
    sendHealthBeacon(buildSwHealthPayload({
      swStatus: 'error',
      cacheHit: false,
      offline: !navigator.onLine,
    }));
  });
}

export default function WebVitalsReporter() {
  useEffect(() => {
    onLCP(send);
    onINP(send);
    onCLS(send);

    // Report SW health 5s after load to avoid blocking
    const timer = setTimeout(reportSwHealth, 5000);
    return () => clearTimeout(timer);
  }, []);
  return null;
}
