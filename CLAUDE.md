# YOMXXX AI 博客项目规范

## 项目概述

Astro 5 + TypeScript + Tailwind CSS 4 + MDX 技术博客，部署在 Cloudflare Pages。

## 文章规范

### 文件命名

- 格式：`{YYYY-MM-DD}-{slug}.mdx`
- 日期**必须**是实际发布当天的日期，禁止使用未来日期
- slug 使用英文小写 + 连字符

### Frontmatter 必填字段

```yaml
title: "标题"                    # 8-100 字符
description: "描述"              # 80-160 字符
column: "workshop"               # workshop | long-form | paper | tools | weekly
tags: ["tag1", "tag2"]           # 1-8 个标签
pubDate: YYYY-MM-DD              # 实际发布日期
featured: false                  # 慎用，精选文章才设为 true
tldr: "摘要"                     # 50-300 字符
author: "YOMXXX"                 # 固定值
faq:                             # 必须 5 条，中文
  - q: "问题"                    # 8-120 字符
    a: "回答"                    # 20-400 字符
```

### 栏目说明

| 栏目 | 说明 | 内容类型 |
|------|------|----------|
| `workshop` | 实战工坊 | LLM API、Agent、RAG、微调，代码优先 |
| `long-form` | 深度长文 | 架构剖析、系统设计、原理推导 |
| `paper` | 论文速读 | arXiv 精读、核心贡献、工程意义 |
| `tools` | 工具速评 | IDE、框架、AI 工具横评 |
| `weekly` | AI 周报 | 趋势速览、5 条要点 |

### 内容质量要求

- 每篇不少于 1500 字
- FAQ 必须 5 条，使用**中文**
- 代码示例必须可运行或有明确的伪代码标注
- 禁止出现占位符文本（如 `@yourhandle`、`example.com`）

### MDX 特殊字符转义

MDX 会将正文中的 `<` 解析为 HTML 标签起始。以下字符**必须转义**（代码块 ` ``` ` 内除外）：

| 字符 | 转义写法 | 场景 |
|------|---------|------|
| `<` | `&lt;` | 小于号、百分比（如 `<0.5%`、`<2%`）、HTML 标签前缀 |
| `>` | `&gt;` | 大于号（如 `>100 tokens`） |
| `{` | `\{` 或 `{'{'}` | 花括号（如 JSON 示例 `{key: value}`） |
| `}` | `\}` 或 `{'}'}` | 花括号 |

**反面案例**：`精度损失 <0.5%` → MDX 解析 `<0` 为非法标签名，构建报错
**正面案例**：`精度损失 &lt;0.5%` → 正确渲染为 `<0.5%`

FAQ 中的 `<` 不需要转义（YAML frontmatter 由 YAML 解析器处理，不经过 MDX）。

### MDX 组件使用规范

本项目 **没有** `Callout`、`Card`、`Tabs` 等第三方 MDX 组件。文章中**禁止**使用这些未定义的 JSX 组件。需要高亮/提示内容时，使用标准 Markdown：

- 提示块：`> **💡 提示内容**`（引用块 + 粗体 + emoji）
- 重要警告：`> **⚠️ 警告内容**`
- 禁止使用：`<Callout>`、`<Card>`、`<Tabs>` 等未导入的组件

### LaTeX 数学符号

项目未配置数学渲染（KaTeX/MathJax），**禁止**在正文中使用 `$...$` LaTeX 语法。需要表示数学变量时：

- 使用内联代码：`` `π_θ` ``、`` `x` ``、`` `e_i` ```
- 复杂公式放入代码块（```）中展示
- 或改用自然语言描述

## 选题流程（必须执行）

每次发文前**必须**按以下流程选题，禁止凭经验拍脑袋。

### Step 1: 从信息源搜索热点

按优先级依次搜索以下渠道（使用 `tvly search`），每个渠道至少看 5 条结果：

| 优先级 | 渠道 | 搜索方式 | 适合栏目 |
|--------|------|---------|---------|
| P0 | **arXiv cs.AI / cs.CL** | `tvly search "arXiv AI {今天日期} new papers"` | paper |
| P0 | **Hugging Face Daily Papers** | `tvly search "huggingface daily papers site:huggingface.co"` | paper |
| P1 | **Hacker News 首页** | `tvly search "hacker news AI top stories today"` | tools, workshop |
| P1 | **GitHub Trending** | `tvly search "github trending AI machine-learning today"` | tools, workshop |
| P2 | **Reddit r/MachineLearning** | `tvly search "reddit MachineLearning hot posts this week"` | paper, long-form |
| P2 | **Reddit r/LocalLLaMA** | `tvly search "reddit LocalLLaMA hot posts"` | workshop, tools |
| P3 | **Twitter/X AI KOL** | `tvly search "AI news twitter trending this week"` | weekly |
| P3 | **产品发布/公告** | `tvly search "AI product launch announcement {当月}"` | tools |

### Step 2: 筛选和去重

1. 从搜索结果中提取 10-15 个候选主题
2. 与已有文章对比（`ls src/content/posts/`），排除已覆盖的主题
3. 按以下标准打分：
   - **时效性**（3 天内的话题 > 1 周内 > 1 月内）
   - **开发者实用性**（能用的 > 能看的 > 只能聊的）
   - **深度空间**（能写 1500+ 字的 > 只能写 500 字的）

### Step 3: 确定 5 篇选题

从候选中选出 5 篇，确保覆盖不同栏目。优先选择：
- 有**完整代码示例**可写的主题（workshop）
- 有**明确论文来源**的主题（paper）
- 有**多方对比数据**的主题（tools）
- 有**架构级洞察**的主题（long-form）

## 每日发文计划（5 篇/天）

按以下顺序每天各写一篇，覆盖所有栏目：

| 顺序 | 栏目 | 主题选择策略 |
|------|------|-------------|
| 1 | `workshop` | 从 GitHub Trending / HN 中选新框架或工具，写实战教程 |
| 2 | `paper` | 从 arXiv / HF Daily Papers 中选高引论文精读 |
| 3 | `long-form` | 从 Reddit 讨论或行业趋势中选深度架构分析 |
| 4 | `tools` | 从产品发布或 HN 讨论中选工具横评 |
| 5 | `weekly` | 综合所有渠道的本周热点（仅周日发） |

周日发 weekly，其余天 weekly 替换为额外一篇其他栏目文章。

## 代码规范

### OG Image

- 格式：PNG（非 SVG），通过 satori + sharp 生成
- 尺寸：1200x630
- 引用路径：`/og/{slug}.png`

### SEO

- 文章页 `og:type` 必须为 `article`
- 必须包含 `twitter:title`、`twitter:description`、`twitter:image`
- Article Schema 必须包含 `publisher` 字段
- 不得声明不存在的 SearchAction 端点

### 样式

- 颜色值使用 `tokens.css` 中定义的 CSS 变量，禁止硬编码 hex
- Tailwind CSS 4 使用 CSS-first 配置，不需要 `tailwind.config.ts`

### PWA

- SW 注册由 `@vite-pwa/astro` 自动处理，禁止手动注册
- `registerType` 设为 `autoUpdate`

## 发布前检查清单（必须逐项执行）

每次提交文章前**必须**完成以下检查，缺一不可：

1. **类型检查**：运行 `pnpm run check`，确认 0 errors
2. **MDX 角括号扫描**：运行 `grep -rn '<[0-9%]' src/content/posts/{新文件}.mdx`，确认正文（非代码块、非 frontmatter）中无未转义的 `<`，有则改为 `&lt;`
3. **Frontmatter 校验**：确认 description 80-160 字符、tldr 50-300 字符、FAQ 5 条且每条回答 20-400 字符
4. **字数检查**：正文不少于 1500 字
5. **本地预览**：运行 `pnpm run dev` 在浏览器中打开文章，确认渲染正常
6. **提交并推送**：`git add` 相关文件 → `git commit`（不带 AI 标识）→ `git push origin master`

## Git 规范

- commit 信息使用中文或英文均可，**禁止**带 AI 标识（如 Co-Authored-By）
- 写完文章后必须运行 `pnpm run check` 确保类型检查通过
- `.superpowers/` 和 `docs/superpowers/` 不得提交到 git
