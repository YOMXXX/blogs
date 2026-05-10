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

## 每日发文计划（5 篇/天）

按以下顺序每天各写一篇，覆盖所有栏目：

| 顺序 | 栏目 | 主题选择策略 |
|------|------|-------------|
| 1 | `workshop` | 紧跟最新 AI 工具/框架的实战教程 |
| 2 | `paper` | 近一周 arXiv 高引论文精读 |
| 3 | `long-form` | 深度架构分析或系统设计 |
| 4 | `tools` | AI 工具/IDE/框架的诚实测评 |
| 5 | `weekly` | 本周 AI 领域 5 件大事（仅周日发） |

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

## Git 规范

- commit 信息使用中文或英文均可，**禁止**带 AI 标识（如 Co-Authored-By）
- 写完文章后必须运行 `pnpm run check` 确保类型检查通过
- `.superpowers/` 和 `docs/superpowers/` 不得提交到 git
