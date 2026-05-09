const DEFAULT_WPM = 200;

/**
 * Estimate reading time in minutes (rounded up).
 * Strips code fences and markdown link syntax before word count.
 */
export function readingTime(content: string, wpm = DEFAULT_WPM): string {
  const stripped = content
    .replace(/```[\s\S]*?```/g, '')          // fenced code blocks
    .replace(/`[^`]+`/g, '')                  // inline code
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')  // markdown links
    .replace(/[#*_>~-]/g, ' ')                // markdown punctuation
    .trim();

  const wordCount = stripped.length === 0 ? 0 : stripped.split(/\s+/).length;
  const minutes = Math.max(1, Math.ceil(wordCount / wpm));
  return `${minutes} min read`;
}
