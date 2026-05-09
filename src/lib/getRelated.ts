export interface RelatableEntry {
  slug: string;
  data: {
    title: string;
    tags: string[];
    pubDate: Date;
  };
}

/**
 * Return top-N posts most related to `current`, by tag overlap then pubDate desc.
 * Excludes `current` itself and posts with zero tag overlap.
 */
export function getRelated<T extends RelatableEntry>(
  current: T,
  all: T[],
  limit = 3,
): T[] {
  const currentTags = new Set(current.data.tags);
  return all
    .filter((p) => p.slug !== current.slug)
    .map((p) => ({
      post: p,
      overlap: p.data.tags.filter((t) => currentTags.has(t)).length,
    }))
    .filter((x) => x.overlap > 0)
    .sort((a, b) => {
      if (b.overlap !== a.overlap) return b.overlap - a.overlap;
      return b.post.data.pubDate.getTime() - a.post.data.pubDate.getTime();
    })
    .slice(0, limit)
    .map((x) => x.post);
}
