/**
 * Download Latin-subset woff2 fonts from Google Fonts API
 * Usage: node scripts/download-fonts.mjs
 */
import https from 'node:https';
import fs from 'node:fs';
import path from 'node:path';

const OUTDIR = 'public/fonts';

function fetchWithRedirect(url, headers = {}) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers }, res => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        fetchWithRedirect(res.headers.location, headers).then(resolve).catch(reject);
        return;
      }
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

function fetchBinary(url) {
  return new Promise((resolve, reject) => {
    https.get(url, res => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        fetchBinary(res.headers.location).then(resolve).catch(reject);
        return;
      }
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => resolve(Buffer.concat(chunks)));
    }).on('error', reject);
  });
}

function extractAllWoff2Urls(css) {
  const urls = [];
  const regex = /url\(([^)]+\.woff2)\)/g;
  let m;
  while ((m = regex.exec(css)) !== null) {
    urls.push(m[1]);
  }
  return urls;
}

function extractLatinUrl(css) {
  // Try to find /* latin */ block
  const blocks = css.split('@font-face');
  for (const block of blocks) {
    if (block.includes('/* latin */') && !block.includes('/* latin-ext */')) {
      const m = block.match(/url\(([^)]+\.woff2)\)/);
      if (m) return m[1];
    }
  }
  // Try finding block with U+0000-00FF unicode range (latin)
  for (const block of blocks) {
    if (block.includes('U+0000-00FF') && !block.includes('U+0100-024F')) {
      const m = block.match(/url\(([^)]+\.woff2)\)/);
      if (m) return m[1];
    }
  }
  // Fallback: get any woff2 URL
  const allUrls = extractAllWoff2Urls(css);
  if (allUrls.length > 0) return allUrls[allUrls.length - 1]; // last is usually latin
  return null;
}

async function main() {
  fs.mkdirSync(OUTDIR, { recursive: true });

  // Download Inter Latin
  console.log('Fetching Inter CSS...');
  const interCss = await fetchWithRedirect(
    'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
    { 'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' }
  );

  // Debug: show first 300 chars
  console.log('CSS response length:', interCss.length);
  console.log('First 300 chars:', interCss.substring(0, 300));

  const allInterUrls = extractAllWoff2Urls(interCss);
  console.log('All Inter woff2 URLs found:', allInterUrls.length);

  const interUrl = extractLatinUrl(interCss);
  if (interUrl) {
    console.log('Downloading Inter woff2:', interUrl);
    const buf = await fetchBinary(interUrl);
    fs.writeFileSync(path.join(OUTDIR, 'inter-latin.woff2'), buf);
    console.log('  Saved inter-latin.woff2 (' + (buf.length / 1024).toFixed(1) + ' KB)');
  } else {
    console.error('FAIL: Could not extract Inter Latin URL');
    console.error('Full CSS:', interCss);
  }

  // Download JetBrains Mono Latin
  console.log('\nFetching JetBrains Mono CSS...');
  const jbCss = await fetchWithRedirect(
    'https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&display=swap',
    { 'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' }
  );

  console.log('CSS response length:', jbCss.length);
  console.log('First 300 chars:', jbCss.substring(0, 300));

  const allJbUrls = extractAllWoff2Urls(jbCss);
  console.log('All JB Mono woff2 URLs found:', allJbUrls.length);

  const jbUrl = extractLatinUrl(jbCss);
  if (jbUrl) {
    console.log('Downloading JetBrains Mono woff2:', jbUrl);
    const buf = await fetchBinary(jbUrl);
    fs.writeFileSync(path.join(OUTDIR, 'jetbrains-mono-latin.woff2'), buf);
    console.log('  Saved jetbrains-mono-latin.woff2 (' + (buf.length / 1024).toFixed(1) + ' KB)');
  } else {
    console.error('FAIL: Could not extract JetBrains Mono Latin URL');
    console.error('Full CSS:', jbCss);
  }

  console.log('\nDone. Font files:');
  for (const f of fs.readdirSync(OUTDIR)) {
    if (f.endsWith('.woff2') || f.endsWith('.ttf')) {
      const s = fs.statSync(path.join(OUTDIR, f));
      console.log('  ' + f + ' - ' + (s.size / 1024).toFixed(1) + ' KB');
    }
  }
}

main().catch(err => { console.error(err); process.exit(1); });
