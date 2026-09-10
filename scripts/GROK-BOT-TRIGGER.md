# 每日写作触发已迁移到 Grok Bot

- **以前**：launchd `com.yomxxx.daily-write` → `scripts/daily-write.sh` → Qoder CLI
- **现在**：Grok Bot 例程「博客每日写作发布」，每天 08:00 本地时间执行
- launchd plist 已移出：`~/Library/LaunchAgents/com.yomxxx.daily-write.plist.disabled-by-grokbot`
- `daily-write.sh` 已改为直接退出，避免误触发 Qoder

规范仍以根目录 `CLAUDE.md` 与 `scripts/daily-write-prompt.md` 为准。
