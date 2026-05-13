#!/bin/bash
# 批量提交 URL 到 IndexNow（Bing / Yandex / Seznam / Naver）
# 用法:
#   ./scripts/submit-indexnow.sh          # 提交 sitemap 中所有 URL
#   ./scripts/submit-indexnow.sh --new    # 仅提交今天新增的文章

set -euo pipefail

SITE="https://yomxxx.com"
SITEMAP_URL="$SITE/sitemap-0.xml"
KEY_FILE="public/indexnow-key.txt"
PROJECT_DIR="/Users/liguanchen/Desktop/blogs"

cd "$PROJECT_DIR"

# ===== IndexNow Key =====
if [ ! -f "$KEY_FILE" ]; then
  KEY=$(openssl rand -hex 16)
  echo "$KEY" > "$KEY_FILE"
  echo "已生成 IndexNow key: $KEY"
  echo "请提交并部署后再运行此脚本（key 文件需要能通过 $SITE/$KEY.txt 访问）"
  exit 0
fi

KEY=$(cat "$KEY_FILE" | tr -d '[:space:]')

# ===== 获取 URL 列表 =====
if [ "${1:-}" = "--new" ]; then
  DATE=$(date +%Y-%m-%d)
  URLS=$(curl -s "$SITEMAP_URL" | grep -oP '<loc>[^<]+</loc>' | sed 's/<\/?loc>//g' | grep "$DATE")
  echo "仅提交今天 ($DATE) 的新文章"
else
  URLS=$(curl -s "$SITEMAP_URL" | grep -oP '<loc>[^<]+</loc>' | sed 's/<\/?loc>//g')
  echo "提交 sitemap 中所有 URL"
fi

URL_COUNT=$(echo "$URLS" | wc -l | tr -d ' ')
echo "共 $URL_COUNT 个 URL"

if [ "$URL_COUNT" -eq 0 ]; then
  echo "没有 URL 需要提交"
  exit 0
fi

# ===== 构造 JSON =====
URL_ARRAY=$(echo "$URLS" | while read -r url; do
  [ -n "$url" ] && echo "    \"$url\""
done | paste -sd ',' -)

JSON_BODY=$(cat <<EOF
{
  "host": "yomxxx.com",
  "key": "$KEY",
  "keyLocation": "$SITE/$KEY.txt",
  "urlList": [
$URL_ARRAY
  ]
}
EOF
)

# ===== 提交到各搜索引擎 =====
ENGINES=("api.indexnow.org" "www.bing.com" "yandex.com")

for engine in "${ENGINES[@]}"; do
  echo -n "提交到 $engine ... "
  HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" \
    -X POST "https://$engine/indexnow" \
    -H "Content-Type: application/json; charset=utf-8" \
    -d "$JSON_BODY")

  case $HTTP_CODE in
    200) echo "成功 (200)" ;;
    202) echo "已接受 (202)" ;;
    400) echo "失败: 请求格式错误 (400)" ;;
    403) echo "失败: key 验证不通过 (403)" ;;
    422) echo "失败: URL 不属于该域名 (422)" ;;
    429) echo "失败: 请求过于频繁 (429)" ;;
    *)   echo "HTTP $HTTP_CODE" ;;
  esac
done

echo ""
echo "完成！Bing/Yandex 通常 24 小时内处理。"
echo ""
echo "Google 不支持 IndexNow，请手动操作："
echo "  1. 打开 https://search.google.com/search-console"
echo "  2. 站点地图 → 提交 sitemap-index.xml"
echo "  3. 网址检查 → 逐个提交重点页面"
