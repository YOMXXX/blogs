#!/usr/bin/env python3
"""校验指定日期的文章 frontmatter 与正文长度（无 yaml 依赖，手写正则解析）。

用法:
    python3 scripts/validate-posts.py              # 校验今天（Asia/Shanghai）
    python3 scripts/validate-posts.py 2026-09-17   # 校验指定日期
    python3 scripts/validate-posts.py --expect 5   # 指定期望篇数（默认 5）

覆盖 CLAUDE.md 的发布前检查项：title / description / tldr / tags / FAQ / template /
column / author / pubDate / 正文长度 / 裸 < / $...$ LaTeX / 未定义 JSX 组件。

本机没有 python venv 也没有 pyyaml，因此刻意不依赖 yaml 库。
"""
import argparse
import datetime
import glob
import pathlib
import re
import sys
import zoneinfo

ALLOWED_TEMPLATES = {"classic", "terminal", "editorial", "dossier", "digest"}
ALLOWED_COLUMNS = {"workshop", "long-form", "paper", "tools", "weekly"}
BAD_TAG_CHARS = set("/\\?#%")
FORBIDDEN_COMPONENTS = ["Callout", "Card", "Tabs"]


def today_shanghai() -> str:
    return datetime.datetime.now(zoneinfo.ZoneInfo("Asia/Shanghai")).strftime("%Y-%m-%d")


def check_file(path: str) -> tuple[str, list[str], str]:
    """返回 (slug, 错误列表, 摘要行)。"""
    raw = pathlib.Path(path).read_text(encoding="utf-8")
    slug = pathlib.Path(path).stem
    errs: list[str] = []

    m = re.match(r"^---\n(.*?)\n---\n(.*)$", raw, re.S)
    if not m:
        return slug, ["frontmatter 解析失败"], ""
    fm, body = m.group(1), m.group(2)

    def scalar(key: str) -> str | None:
        mm = re.search(rf'^{key}:\s*"?(.*?)"?\s*$', fm, re.M)
        return mm.group(1) if mm else None

    title = scalar("title") or ""
    desc = scalar("description") or ""
    col = scalar("column") or ""
    tpl = scalar("template") or ""
    tldr = scalar("tldr") or ""
    author = scalar("author") or ""
    pub = scalar("pubDate") or ""

    if not (8 <= len(title) <= 100):
        errs.append(f"title {len(title)} (需 8-100)")
    if not (80 <= len(desc) <= 160):
        errs.append(f"description {len(desc)} (需 80-160)")
    if not (50 <= len(tldr) <= 300):
        errs.append(f"tldr {len(tldr)} (需 50-300)")
    if author != "YOMXXX":
        errs.append(f"author={author!r}")
    if pub != DATE:
        errs.append(f"pubDate={pub!r} (需 {DATE})")
    if col not in ALLOWED_COLUMNS:
        errs.append(f"column={col!r}")
    if tpl not in ALLOWED_TEMPLATES:
        errs.append(f"template={tpl!r}")

    tm = re.search(r"^tags:\s*\[(.*?)\]\s*$", fm, re.M)
    tags = re.findall(r'"([^"]*)"', tm.group(1)) if tm else []
    if not (1 <= len(tags) <= 8):
        errs.append(f"tags 数量 {len(tags)} (需 1-8)")
    for t in tags:
        bad = BAD_TAG_CHARS & set(t)
        if bad:
            errs.append(f"tag {t!r} 含非法字符 {sorted(bad)}")

    faq_block = fm.split("faq:", 1)[1] if "faq:" in fm else ""
    qs = re.findall(r'^\s*- q:\s*"(.*)"\s*$', faq_block, re.M)
    as_ = re.findall(r'^\s+a:\s*"(.*)"\s*$', faq_block, re.M)
    if len(qs) != 5 or len(as_) != 5:
        errs.append(f"FAQ 数量 q={len(qs)} a={len(as_)} (需各 5)")
    for i, q in enumerate(qs, 1):
        if not (8 <= len(q) <= 120):
            errs.append(f"FAQ{i} q 长度 {len(q)} (需 8-120)")
    for i, a in enumerate(as_, 1):
        if not (20 <= len(a) <= 400):
            errs.append(f"FAQ{i} a 长度 {len(a)} (需 20-400)")

    # 剔除代码块后再扫描 MDX 红线
    body_nocode = re.sub(r"```.*?```", "", body, flags=re.S)
    for line in body_nocode.split("\n"):
        if "<" in line:
            errs.append(f"裸 < : {line.strip()[:70]!r}")
    if re.search(r"(?<!\\)\$[^$\n]{1,80}\$", body_nocode):
        errs.append("疑似 $...$ LaTeX")
    for comp in FORBIDDEN_COMPONENTS:
        if re.search(rf"<{comp}[ />]", body_nocode):
            errs.append(f"使用了未定义组件 <{comp}>")

    cjk = len(re.findall(r"[\u4e00-\u9fff]", body))
    words = len(re.findall(r"[A-Za-z][A-Za-z0-9\-.]*", body))
    total = cjk + words
    if total < 1500:
        errs.append(f"正文 {total} 字 (需 >=1500)")

    summary = (
        f"title={len(title)} desc={len(desc)} tldr={len(tldr)} "
        f"faq=5 正文={total}(CJK {cjk}+词 {words}) tpl={tpl} col={col}"
    )
    return slug, errs, summary


def main() -> int:
    global DATE
    ap = argparse.ArgumentParser()
    ap.add_argument("date", nargs="?", default=today_shanghai())
    ap.add_argument("--expect", type=int, default=5)
    args = ap.parse_args()
    DATE = args.date

    files = sorted(glob.glob(f"src/content/posts/{DATE}-*.mdx"))
    if len(files) != args.expect:
        print(f"!! 期望 {args.expect} 篇，实际 {len(files)} 篇")
    if not files:
        print(f"!! {DATE} 没有文章")
        return 1

    failed, templates = [], []
    for f in files:
        slug, errs, summary = check_file(f)
        print(f"[{'OK ' if not errs else 'FAIL'}] {slug}")
        print(f"        {summary}")
        for e in errs:
            print(f"        - {e}")
        templates.append(re.search(r'template:\s*"([^"]+)"', pathlib.Path(f).read_text(encoding="utf-8")).group(1))
        if errs:
            failed.append(slug)

    print("-" * 62)
    print(f"模板: {templates}  去重后 {len(set(templates))} 种")
    if len(set(templates)) == 1:
        print("!! 五篇模板全部相同（CLAUDE.md 禁止）")
        failed.append("templates")

    print("结果:", "全部通过" if not failed else f"失败 {failed}")
    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(main())
