# 每日写作触发（云电脑）

- **以前**：本机 launchd → `daily-write.sh` → Qoder
- **现在**：Grok Bot 例程「博客每日写作发布」，每天 08:00（Asia/Shanghai）在**云电脑**执行
- 云仓库路径：`/home/box/repos/blogs`（远程 `YOMXXX/blogs`，推 `master` → Cloudflare Pages）
- 不依赖用户 Mac 开机；Grok Bot 聊天窗口也不必一直开着
- 规范仍以根目录 `CLAUDE.md` 与 `scripts/daily-write-prompt.md` 为准
