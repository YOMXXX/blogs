# 每日写作触发方式

## 当前：WorkBuddy 云端自动化

**目标形态**：WorkBuddy App「自动化」页面，在 **云端工作** 模式下创建的定时任务，每天 **08:00（Asia/Shanghai）** 执行。

- **提示词正文**：`scripts/workbuddy-cloud-prompt.md`（自包含，整段复制粘贴即可）
- 云端工作空间自行 clone `YOMXXX/blogs` → 选题写稿 → `git push master` → Cloudflare Pages 自动部署
- **不依赖本机 Mac 开机**（与已停用的 Grok Bot 云电脑方案等价）
- 执行记录由 WorkBuddy 自动化的「历史执行记录」承担；云端工作空间一般不持久化 `logs/`，故不再依赖本地日志文件

### 创建步骤（一次性）

1. 打开 WorkBuddy App → 切换到 **云端工作** → 进入「自动化」页面
2. 点击 **+** 新建定时任务
3. 标题填：`博客每日写作发布（YOMXXX AI Blog）`
4. 提示词：粘贴 `scripts/workbuddy-cloud-prompt.md` 中「提示词正文」整段
5. 执行频率：每天；执行时间：08:00
6. 先点 **测试运行** 跑一次，验证通过后再交给它每天自动执行

### ⚠️ 注意事项

- **云端工作空间需要 GitHub 写入凭据**（token 或 SSH key）。这是最容易卡住的一步；提示词已内置兜底 —— push 失败时把 5 篇文章正文输出到执行记录中，便于人工补推。
- **首次务必用「测试运行」验证**，不要直接等到 08:00。
- **不要在本机模式下另建同名任务**：本地任务与云端任务同在 08:00 触发会产生文章与提交冲突。（迁移过程中曾创建的本地任务已删除。）

## 历史沿革

| 阶段 | 触发方式 | 状态 |
|------|---------|------|
| 1 | launchd `com.yomxxx.daily-write` → `scripts/daily-write.sh` → Qoder CLI | 已停用 |
| 2 | Codex CLI（`codex exec`，gpt-5.5） | 已停用（用量受限） |
| 3 | Grok Bot 云电脑例程（`/home/box/repos/blogs`，08:00 Asia/Shanghai） | **待手动关闭** |
| 4 | **WorkBuddy 云端自动化（08:00）** | 目标形态 |

## 遗留物说明

- `scripts/daily-write.sh`：已改为直接退出的占位脚本，仅作历史参考，**不要再挂回 launchd**
- `scripts/com.yomxxx.daily-write.plist`：launchd 配置备份，`launchctl` 中已卸载
- `~/Library/LaunchAgents/com.yomxxx.daily-write.plist.disabled-by-grokbot`：备份文件，可删
- 本机不再承载该定时任务（本地自动化已删除），避免与云端任务双跑

规范仍以根目录 `CLAUDE.md` 与 `scripts/daily-write-prompt.md` 为准。
