const CJK_CPM = 500;
const LATIN_WPM = 200;

export function readingTime(content: string): string {
  const stripped = content
    .replace(/```[\s\S]*?```/g, '')
    .replace(/`[^`]+`/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/[#*_>~-]/g, ' ')
    .trim();

  const cjk = stripped.match(/[一-鿿㐀-䶿]/g);
  const cjkCount = cjk ? cjk.length : 0;
  const latin = stripped.replace(/[一-鿿㐀-䶿]/g, ' ').trim();
  const latinCount = latin.length === 0 ? 0 : latin.split(/\s+/).filter(Boolean).length;

  const minutes = Math.max(1, Math.ceil(cjkCount / CJK_CPM + latinCount / LATIN_WPM));
  return `${minutes} min read`;
}
