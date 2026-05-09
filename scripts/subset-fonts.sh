#!/usr/bin/env bash
# Font subsetting script for YOMXXX blog
# Generates Latin-subset woff2 files from Google Fonts API
# Usage: pnpm run fonts:download
#        OR bash scripts/subset-fonts.sh (requires pyftsubset)

set -euo pipefail

OUTDIR="public/fonts"
mkdir -p "$OUTDIR"

# If pyftsubset is available, use it for better subsetting
if command -v pyftsubset &>/dev/null; then
  LATIN_RANGE="U+0000-007F,U+00A0-00FF,U+0100-024F,U+0300-036F,U+2000-206F,U+2070-209F,U+20A0-20CF,U+2100-214F,U+2200-22FF,U+FB00-FB06"

  echo "=== Subsetting with pyftsubset ==="

  INTER_SRC=$(find /tmp -name "Inter*Regular.ttf" 2>/dev/null | head -1)
  JBMONO_SRC=$(find /tmp -name "JetBrainsMono-Regular.ttf" 2>/dev/null | head -1)

  if [ -n "$INTER_SRC" ]; then
    pyftsubset "$INTER_SRC" --unicodes="$LATIN_RANGE" \
      --layout-features="kern,liga,calt,ccmp,locl,mark,mkmk,onum,pnum,smcp" \
      --flavor=woff2 --output-file="$OUTDIR/inter-latin.woff2"
    echo "Inter done."
  fi

  if [ -n "$JBMONO_SRC" ]; then
    pyftsubset "$JBMONO_SRC" --unicodes="$LATIN_RANGE" \
      --layout-features="kern,liga,calt,ccmp,locl,mark,mkmk,zero,ss01,ss02" \
      --flavor=woff2 --output-file="$OUTDIR/jetbrains-mono-latin.woff2"
    echo "JetBrains Mono done."
  fi
else
  echo "pyftsubset not found. Use: pnpm run fonts:download"
  echo "(downloads pre-subsetted woff2 from Google Fonts API)"
  exit 1
fi

echo ""
echo "=== Results ==="
ls -lh "$OUTDIR"/*.woff2 2>/dev/null
