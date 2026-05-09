import { useEffect, useRef, useState } from 'react';

interface PagefindResult {
  id: string;
  data: () => Promise<{
    url: string;
    excerpt: string;
    meta: { title: string };
  }>;
}

interface PagefindAPI {
  search: (query: string) => Promise<{ results: PagefindResult[] }>;
}

declare global {
  interface Window {
    pagefind?: PagefindAPI;
  }
}

interface ResolvedHit {
  id: string;
  url: string;
  title: string;
  excerpt: string;
}

export default function SearchDialog() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [hits, setHits] = useState<ResolvedHit[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen(true);
      }
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
      if (!window.pagefind) {
        const s = document.createElement('script');
        s.type = 'module';
        s.text = `import * as pf from '/pagefind/pagefind.js'; window.pagefind = pf;`;
        document.head.appendChild(s);
      }
    }
  }, [open]);

  useEffect(() => {
    let cancelled = false;
    if (!query.trim() || !window.pagefind) {
      setHits([]);
      return;
    }
    setLoading(true);
    window.pagefind
      .search(query)
      .then(async (res) => {
        const top = res.results.slice(0, 10);
        const data = await Promise.all(top.map((r) => r.data()));
        if (cancelled) return;
        setHits(
          data.map((d, i) => ({
            id: top[i].id,
            url: d.url,
            title: d.meta.title,
            excerpt: d.excerpt,
          })),
        );
        setLoading(false);
      })
      .catch(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [query]);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open search"
        style={{
          background: 'transparent',
          border: '1px solid #2a2a30',
          color: '#8b949e',
          padding: '4px 10px',
          borderRadius: 5,
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: 12,
          cursor: 'pointer',
        }}
      >
        / search
      </button>
    );
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Search"
      onClick={(e) => {
        if (e.target === e.currentTarget) setOpen(false);
      }}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.7)',
        zIndex: 200,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingTop: '15vh',
      }}
    >
      <div
        style={{
          width: 'min(640px, 90vw)',
          background: '#0a0a0a',
          border: '1px solid #2a2a30',
          borderRadius: 8,
          fontFamily: 'JetBrains Mono, monospace',
          color: '#f0f6fc',
        }}
      >
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="search posts (esc to close)"
          aria-label="Search query"
          style={{
            width: '100%',
            border: 'none',
            background: 'transparent',
            color: '#f0f6fc',
            padding: '14px 16px',
            fontSize: 14,
            outline: 'none',
            fontFamily: 'inherit',
            borderBottom: '1px solid #1f1f24',
          }}
        />
        <div style={{ maxHeight: '50vh', overflowY: 'auto' }}>
          {loading && <p style={{ padding: 16, color: '#5c6370' }}>// searching...</p>}
          {!loading && hits.length === 0 && query && (
            <p style={{ padding: 16, color: '#5c6370' }}>// no results</p>
          )}
          {hits.map((h) => (
            <a
              key={h.id}
              href={h.url}
              style={{
                display: 'block',
                padding: '10px 16px',
                borderBottom: '1px dashed #1f1f24',
                color: 'inherit',
                textDecoration: 'none',
                fontSize: 12,
              }}
            >
              <div style={{ color: '#10b981', marginBottom: 2 }}>▸ {h.title}</div>
              <div
                style={{ color: '#8b949e' }}
                dangerouslySetInnerHTML={{ __html: h.excerpt }}
              />
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
