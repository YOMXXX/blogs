#!/bin/bash
# 批量提交 URL 到 IndexNow（Bing / Yandex）+ 百度推送
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
  URLS=$(curl -s "$SITEMAP_URL" | sed 's/</\n</g' | sed -n 's/.*<loc>\([^<]*\).*/\1/p' | grep "$DATE")
  echo "仅提交今天 ($DATE) 的新文章"
else
  URLS=$(curl -s "$SITEMAP_URL" | sed 's/</\n</g' | sed -n 's/.*<loc>\([^<]*\).*/\1/p')
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

# ===== 百度推送 =====
BAIDU_TOKEN="24zogxFaojNFvmKE"
echo -n "提交到 百度 ... "
BAIDU_RESULT=$(echo "$URLS" | curl -s -H 'Content-Type:text/plain' --data-binary @- \
  "http://data.zz.baidu.com/urls?site=$SITE&token=$BAIDU_TOKEN")

if echo "$BAIDU_RESULT" | grep -q '"success"'; then
  SUCCESS=$(echo "$BAIDU_RESULT" | sed -n 's/.*"success":\([0-9]*\).*/\1/p')
  REMAIN=$(echo "$BAIDU_RESULT" | sed -n 's/.*"remain":\([0-9]*\).*/\1/p')
  echo "成功 ${SUCCESS} 条，今日剩余配额 ${REMAIN}"
else
  MSG=$(echo "$BAIDU_RESULT" | sed -n 's/.*"message":"\([^"]*\)".*/\1/p')
  echo "失败: ${MSG:-$BAIDU_RESULT}"
fi

echo ""
echo "完成！"
