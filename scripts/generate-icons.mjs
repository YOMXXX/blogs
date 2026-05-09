/**
 * Generate PWA icons from favicon.svg using sharp
 * Usage: node scripts/generate-icons.mjs
 */
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);

async function main() {
  let sharp;
  try {
    sharp = require('sharp');
  } catch {
    // Try dynamic import
    const mod = await import('sharp');
    sharp = mod.default;
  }

  const INPUT = 'public/favicon.svg';
  const OUTDIR = 'public/icons';

  // Standard icons
  const sizes = [192, 512, 1024];
  for (const size of sizes) {
    await sharp(INPUT)
      .resize(size, size)
      .png()
      .toFile(`${OUTDIR}/icon-${size}x${size}.png`);
    console.log(`Created icon-${size}x${size}.png`);
  }

  // Apple touch icon (180x180)
  await sharp(INPUT)
    .resize(180, 180)
    .png()
    .toFile(`${OUTDIR}/apple-touch-icon.png`);
  console.log('Created apple-touch-icon.png');

  // Maskable icons with padding (20% safe zone)
  for (const size of [192, 512]) {
    const innerSize = Math.round(size * 0.8);
    const padding = Math.round((size - innerSize) / 2);

    await sharp(INPUT)
      .resize(innerSize, innerSize)
      .extend({
        top: padding,
        bottom: padding,
        left: padding,
        right: padding,
        background: { r: 10, g: 10, b: 10, alpha: 1 },
      })
      .png()
      .toFile(`${OUTDIR}/maskable-${size}x${size}.png`);
    console.log(`Created maskable-${size}x${size}.png`);
  }

  console.log('Done! All icons generated.');
}

main().catch(err => { console.error(err); process.exit(1); });
