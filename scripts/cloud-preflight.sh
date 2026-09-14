#!/bin/bash
# 每日写作任务预检：确认当前环境（云端工作空间 / 本机）能跑通整条链路
# 用法: bash scripts/cloud-preflight.sh
# 只做检查与依赖安装，不修改仓库内容、不产生提交
# 退出码: 0 = 全部通过；1 = 存在阻断项

set -uo pipefail

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_DIR"

FAIL=0
ok()   { echo "  ✅ $1"; }
bad()  { echo "  ❌ $1"; FAIL=1; }
note() { echo "  ·  $1"; }

echo "=== 每日写作任务预检 ==="
echo "项目目录: $PROJECT_DIR"
echo

# 1. Node 版本（package.json 要求 >= 22.11.0）
echo "[1/7] Node 版本（要求 >= 22.11.0）"
if command -v node >/dev/null 2>&1; then
  NODE_V=$(node -v | sed 's/^v//')
  MAJOR=${NODE_V%%.*}
  REST=${NODE_V#*.}
  MINOR=${REST%%.*}
  if [ "$MAJOR" -gt 22 ] || { [ "$MAJOR" -eq 22 ] && [ "$MINOR" -ge 11 ]; }; then
    ok "node v$NODE_V"
  else
    bad "node v$NODE_V 过低，请升级到 22.11.0+"
  fi
else
  bad "未找到 node"
fi

# 2. pnpm（项目锁定 pnpm@9.12.0，可用 corepack 激活）
echo "[2/7] pnpm"
export PATH="/usr/local/bin:/opt/homebrew/bin:$PATH"
if ! command -v pnpm >/dev/null 2>&1 && command -v corepack >/dev/null 2>&1; then
  note "未找到 pnpm，尝试 corepack 激活 pnpm@9.12.0 ..."
  corepack enable >/dev/null 2>&1 || true
  corepack prepare pnpm@9.12.0 --activate >/dev/null 2>&1 || true
fi
if command -v pnpm >/dev/null 2>&1; then
  ok "pnpm $(pnpm -v)"
else
  bad "pnpm 不可用，请执行 corepack prepare pnpm@9.12.0 --activate"
fi

# 3. 依赖安装（lockfile 必须无漂移）
echo "[3/7] 依赖安装（--frozen-lockfile）"
if command -v pnpm >/dev/null 2>&1; then
  if pnpm install --frozen-lockfile >/tmp/preflight-install.log 2>&1; then
    ok "依赖安装成功"
  else
    bad "依赖安装失败，详见 /tmp/preflight-install.log"
  fi
else
  bad "跳过：pnpm 不可用"
fi

# 4. git 提交身份（缺失会使 git commit 直接失败）
echo "[4/7] git 提交身份"
GIT_NAME=$(git config user.name || true)
GIT_EMAIL=$(git config user.email || true)
if [ -n "$GIT_NAME" ] && [ -n "$GIT_EMAIL" ]; then
  ok "user.name=$GIT_NAME  user.email=$GIT_EMAIL"
else
  bad "未配置 git 身份（缺失会使 git commit 失败）。请先执行：
     git config user.name \"92year\"
     git config user.email \"316195542@qq.com\"
     （与仓库既有 199 次提交保持一致；文章 frontmatter 的 author 另为 YOMXXX，互不影响）"
fi

# 5. IndexNow key（提交搜索引擎索引依赖它）
echo "[5/7] IndexNow key 文件"
if [ -f public/indexnow-key.txt ]; then
  ok "public/indexnow-key.txt 存在"
else
  bad "缺失 public/indexnow-key.txt"
fi

# 6. 远端可读
echo "[6/7] 远端仓库可读"
if git ls-remote origin HEAD >/dev/null 2>&1; then
  ok "origin 可读（$(git remote get-url origin)）"
else
  bad "无法读取 origin，检查网络或 remote 地址"
fi

# 7. 推送凭据（dry-run，不产生任何实际变更）
echo "[7/7] 推送凭据（git push --dry-run）"
BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo master)
if git push --dry-run origin "$BRANCH" >/dev/null 2>&1; then
  ok "推送凭据可用（$BRANCH）"
else
  bad "推送凭据不可用！需为云端工作空间配置 GitHub token 或 SSH key，
     否则文章写完无法 push，只能走人工补推兜底"
fi

echo
if [ "$FAIL" -eq 0 ]; then
  echo "🎉 预检全部通过，可以执行每日写作发布任务"
else
  echo "❌ 预检存在阻断项（见上方 ❌），请先修复再依赖定时执行"
fi
exit "$FAIL"
