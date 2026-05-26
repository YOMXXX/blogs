#!/bin/bash
# 检查所有 mdx frontmatter 的 tags 是否含非法字符
# 非法字符：/ \ ? # %（会被 URL/路由解析为分隔符）

set -e

cd "$(dirname "$0")/.."

BAD_TAGS=$(grep -hE '^tags:' src/content/posts/*.mdx | grep -oE '"[^"]*"' | sort -u | grep -E '[/\?#%\\]' || true)

if [ -n "$BAD_TAGS" ]; then
  echo "❌ 发现含非法字符的标签（/  \\  ?  #  % 会破坏路由）："
  echo "$BAD_TAGS"
  echo ""
  echo "请用相邻字符替换，例如："
  echo "  'Google I/O 2026'  →  'Google IO 2026'"
  echo "  'EU AI Act'        →  'EU-AI-Act'"
  exit 1
fi

echo "✅ 所有标签合规"
