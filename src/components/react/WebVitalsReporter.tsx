import { useEffect } from 'react';
import { onLCP, onINP, onCLS, type Metric } from 'web-vitals';

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

export default function WebVitalsReporter() {
  useEffect(() => {
    onLCP(send);
    onINP(send);
    onCLS(send);
  }, []);
  return null;
}
