# 每日写作触发方式

## 当前（生效中）

**WorkBuddy 自动化「博客每日写作发布（YOMXXX AI Blog）」**，每天 **08:00** 本地时间执行。

- 自动化 ID：`0618d371-acf8-4272-906b-eb1606839836`
- 工作目录：`/Users/liguanchen/Desktop/blogs`
- 执行内容：读取 `CLAUDE.md` + `scripts/daily-write-prompt.md`，选题 → 写 5 篇 → 发布前检查 → `git commit` / `git push` → 提交搜索引擎索引
- 日志沿用 `logs/YYYY-MM-DD.log`，行首标记为 `WorkBuddy`，完成后生成 `logs/YYYY-MM-DD.done`

如需手动立刻跑一轮，在 WorkBuddy 中直接说「开始今天的博客」即可。

## 历史沿革

| 阶段 | 触发方式 | 状态 |
|------|---------|------|
| 1 | launchd `com.yomxxx.daily-write` → `scripts/daily-write.sh` → Qoder CLI | 已停用 |
| 2 | Codex CLI（`codex exec`，gpt-5.5） | 已停用（用量受限） |
| 3 | Grok Bot 例程「博客每日写作发布」（08:00） | 已迁移，请手动关闭 |
| 4 | **WorkBuddy 自动化（08:00）** | **生效中** |

## 遗留物说明

- `scripts/daily-write.sh`：已改为直接退出的占位脚本，仅作历史参考，**不要再挂回 launchd**。
- `scripts/com.yomxxx.daily-write.plist`：launchd 配置备份，`launchctl` 中已卸载。
- `~/Library/LaunchAgents/com.yomxxx.daily-write.plist.disabled-by-grokbot`：备份文件，可删。

> ⚠️ 迁移期间请确认 Grok Bot 里的旧例程已关闭，否则会在同一时间重复执行、产生文章冲突。

规范仍以根目录 `CLAUDE.md` 与 `scripts/daily-write-prompt.md` 为准。
