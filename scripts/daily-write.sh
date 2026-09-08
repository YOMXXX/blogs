#!/bin/bash
# 每日自动写 5 篇 AI 博客文章
# 由 launchd 在 08:00 触发，通过 qoder chat 执行
# 日志写入 ~/Desktop/blogs/logs/

set -euo pipefail

# ===== 配置 =====
PROJECT_DIR="/Users/liguanchen/Desktop/blogs"
LOG_DIR="$PROJECT_DIR/logs"
LOCK_FILE="/tmp/daily-write.lock"
QODER_BIN="/Applications/Qoder IDE.app/Contents/Resources/app/bin/qoder"
DATE=$(date +%Y-%m-%d)
LOG_FILE="$LOG_DIR/$DATE.log"
PROMPT_FILE="$PROJECT_DIR/scripts/daily-write-prompt.md"

# ===== 环境变量 =====
export PATH="/usr/local/bin:/opt/homebrew/bin:/usr/bin:/bin:/usr/sbin:/sbin:$PATH"
export HOME="$HOME"
if [ -z "${TERM:-}" ] || [ "$TERM" = "dumb" ]; then
  export TERM="xterm-256color"
fi

# ===== 初始化 =====
mkdir -p "$LOG_DIR"

log() {
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" >> "$LOG_FILE"
}

notify() {
  osascript -e "display notification \"$2\" with title \"$1\"" 2>/dev/null || true
}

cleanup() {
  rm -f "$LOCK_FILE"
  log "清理完成，锁文件已删除"
}

# 日志清理（保留 30 天）
find "$LOG_DIR" -name "*.log" -mtime +30 -delete 2>/dev/null || true
find "$LOG_DIR" -name "*.done" -mtime +30 -delete 2>/dev/null || true

# ===== 锁机制 =====
if [ -f "$LOCK_FILE" ]; then
  OLD_PID=$(cat "$LOCK_FILE" 2>/dev/null || echo "")
  if [ -n "$OLD_PID" ] && kill -0 "$OLD_PID" 2>/dev/null; then
    log "另一个实例正在运行 (PID: $OLD_PID)，退出"
    exit 0
  else
    log "发现残留锁文件，清理"
    rm -f "$LOCK_FILE"
  fi
fi

echo $$ > "$LOCK_FILE"
trap cleanup EXIT

# ===== 重复执行检查 =====
if [ -f "$LOG_DIR/$DATE.done" ]; then
  log "今天 ($DATE) 已执行完成，跳过"
  exit 0
fi

# 检查今天是否已有 5 篇文章
cd "$PROJECT_DIR"
EXISTING=$(find src/content/posts -name "${DATE}-*.mdx" 2>/dev/null | wc -l | tr -d ' ')
if [ "$EXISTING" -ge 5 ]; then
  log "今天已有 ${EXISTING} 篇文章，跳过"
  touch "$LOG_DIR/$DATE.done"
  exit 0
fi

# ===== 开始执行 =====
log "开始执行每日写作任务 (PID: $$)"

if [ ! -x "$QODER_BIN" ]; then
  log "未找到 Qoder CLI: $QODER_BIN"
  notify "Daily Blog" "未找到 Qoder CLI"
  exit 127
fi

if [ ! -f "$PROMPT_FILE" ]; then
  log "未找到 prompt 文件: $PROMPT_FILE"
  notify "Daily Blog" "prompt 文件缺失"
  exit 1
fi

log "启动 qoder chat..."
cd "$PROJECT_DIR"

# 通过 qoder chat 执行写作 prompt
# --mode agent：使用 agent 模式（可读写文件、执行命令）
# --reuse-window：复用已打开的窗口（如果 IDE 已在运行）
"$QODER_BIN" chat \
  --mode agent \
  --reuse-window \
  "$(cat "$PROMPT_FILE")" >> "$LOG_FILE" 2>&1 &
QODER_PID=$!

log "qoder chat 已启动 (PID: $QODER_PID)"

# qoder chat 注入 prompt 后可能很快返回，
# 实际写作在 IDE 内异步进行，这里只记录启动成功
wait "$QODER_PID" 2>/dev/null && {
  log "qoder chat 命令执行完成"
} || {
  EXIT_CODE=$?
  log "qoder chat 退出码: $EXIT_CODE"
  # 非零退出也可能是正常的（IDE 接管了任务）
}

log "写作任务已提交给 Qoder，请在 IDE 中查看进度"
notify "Daily Blog" "写作任务已提交，请在 Qoder 中查看"
