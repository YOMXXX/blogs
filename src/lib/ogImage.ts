import satori from 'satori';
import { html as satoriHtml } from 'satori-html';
import fs from 'node:fs';
import path from 'node:path';

interface OgInput {
  title: string;
  column: string;
  date: Date;
}

const MAX_TITLE_LEN = 80;

let cachedFont: Buffer | null = null;
function loadFont(): Buffer {
  if (cachedFont) return cachedFont;
  const candidates = [
    path.resolve('public/fonts/Inter-Regular.ttf'),
    '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',
  ];
  for (const p of candidates) {
    try {
      cachedFont = fs.readFileSync(p);
      return cachedFont;
    } catch {
      /* try next */
    }
  }
  throw new Error('No suitable font found for OG image rendering');
}

function truncate(s: string, n: number): string {
  return s.length > n ? `${s.slice(0, n - 1)}…` : s;
}

export async function renderOgSvg(input: OgInput): Promise<string> {
  const title = truncate(input.title, MAX_TITLE_LEN);
  const dateStr = input.date.toISOString().slice(0, 10);
  const markup = satoriHtml(`
    <div style="display:flex;flex-direction:column;justify-content:space-between;width:1200px;height:630px;background:#0a0a0a;color:#f0f6fc;padding:64px;font-family:Inter">
      <div style="display:flex;align-items:center;gap:12px;color:#10b981;font-size:24px;letter-spacing:1px">
        <span>$ ~/yomxxx</span>
      </div>
      <div style="display:flex;flex-direction:column;gap:24px">
        <div style="color:#fbbf24;font-size:20px;letter-spacing:2px;text-transform:uppercase">// ${input.column}</div>
        <div style="font-size:64px;line-height:1.1;font-weight:700;letter-spacing:-1px">${title}</div>
      </div>
      <div style="display:flex;justify-content:space-between;color:#5c6370;font-size:18px">
        <span>${dateStr}</span>
        <span>yomxxx.com</span>
      </div>
    </div>
  `);

  const fontData = loadFont();
  const svg = await satori(markup as unknown as React.ReactNode, {
    width: 1200,
    height: 630,
    fonts: [{ name: 'Inter', data: fontData, weight: 400, style: 'normal' }],
  });
  return svg;
}
