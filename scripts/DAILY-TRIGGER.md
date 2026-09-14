# 每日写作触发方式

## 当前（生效中）：WorkBuddy 本机自动化

**WorkBuddy 自动化「博客每日写作发布（YOMXXX AI Blog）」**，每天 **08:00（Asia/Shanghai）** 在本机执行。

- **自动化 ID**：`cda81023-d270-4fae-bac4-eba9515df7bf`
- **工作目录**：`/Users/liguanchen/Desktop/blogs`
- **提示词正文**：`scripts/workbuddy-prompt.md`（自包含，改任务时整段替换即可）
- **执行流程**：`scripts/preflight.sh` 环境预检 → 选题 → 写 5 篇 → `pnpm run check` + `lint-tags.sh` → `git push master` → IndexNow 提交
- **日志**：沿用 `logs/YYYY-MM-DD.log`，行首标记 `WorkBuddy`，完成后生成 `logs/YYYY-MM-DD.done`

如需手动立刻跑一轮，在 WorkBuddy 里说「开始今天的博客」即可。

### ⚠️ 前提与注意事项

- **08:00 时 Mac 需处于唤醒状态，且 WorkBuddy 客户端在运行**。这是本机方案的固有前提；历史上 2026-08-18 ~ 08-25 整段漏跑就是机器没开导致的。
- **建议加电源计划**（一次性，需管理员密码）：
  ```bash
  sudo pmset repeat wakeorpoweron MTWRFSU 07:55:00   # 每天 07:55 自动唤醒
  pmset -g sched                                     # 查看当前计划
  ```
- 任务第一步就跑 `scripts/preflight.sh`（7 项 ✅/❌ 清单），环境没通会**先报错再动手**，不会白写 5 篇。
- **保持全平台只此一个任务**：与云端任务或 Grok Bot 例程同在 08:00 触发会产生文章与提交冲突。

## 历史沿革

| 阶段 | 触发方式 | 状态 |
|------|---------|------|
| 1 | launchd `com.yomxxx.daily-write` → `scripts/daily-write.sh` → Qoder CLI | 已停用 |
| 2 | Codex CLI（`codex exec`，gpt-5.5） | 已停用（用量受限） |
| 3 | Grok Bot 云电脑例程（`/home/box/repos/blogs`，08:00 Asia/Shanghai） | **待手动关闭** |
| 4 | WorkBuddy 云端自动化方案（已评估，用户放弃） | 已放弃 |
| 5 | **WorkBuddy 本机自动化（08:00）** | **生效中** |

## 遗留物说明

- `scripts/daily-write.sh`：已改为直接退出的占位脚本，仅作历史参考，**不要再挂回 launchd**
- `scripts/com.yomxxx.daily-write.plist`：launchd 配置备份，`launchctl` 中已卸载
- `~/Library/LaunchAgents/com.yomxxx.daily-write.plist.disabled-by-grokbot`：备份文件，可删
- 云端工作空间上**没有**创建过任务，无需清理

规范仍以根目录 `CLAUDE.md` 与 `scripts/daily-write-prompt.md` 为准。
