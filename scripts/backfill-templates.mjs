#!/usr/bin/env node
// 给最近 N 天(默认 3)未带 template 的文章按 slug 哈希确定性回填模板字段
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const POSTS_DIR = fileURLToPath(new URL('../src/content/posts/', import.meta.url));
const KEYS = ['classic', 'terminal', 'editorial', 'dossier', 'digest'];
const DRY_RUN = process.argv.includes('--dry-run');
const DAYS = Number(process.argv.find((a) => a.startsWith('--days='))?.split('=')[1] ?? 3);
const cutoff = Date.now() - DAYS * 24 * 60 * 60 * 1000;

let changed = 0;
for (const f of readdirSync(POSTS_DIR).filter((n) => n.endsWith('.mdx')).sort()) {
  const path = join(POSTS_DIR, f);
  const src = readFileSync(path, 'utf8');
  const fmEnd = src.indexOf('---', 3);
  const fm = src.slice(0, fmEnd);
  if (/^template:/m.test(fm)) continue;
  const m = fm.match(/^pubDate:\s*(\d{4}-\d{2}-\d{2})/m);
  if (!m || new Date(`${m[1]}T00:00:00Z`).getTime() < cutoff) continue;
  let hash = 0;
  for (const ch of f) hash += ch.charCodeAt(0);
  const tpl = KEYS[hash % KEYS.length];
  const out = src.replace(/^pubDate:.*$/m, (line) => `${line}\ntemplate: "${tpl}"`);
  if (!DRY_RUN) writeFileSync(path, out);
  console.log(`${f} -> ${tpl}`);
  changed++;
}
console.log(`backfill ${changed} files${DRY_RUN ? ' (dry-run)' : ''}`);
