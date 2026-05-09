# YOMXXX — AI Frontier Blog

Personal engineering blog on AI frontier — LLMs, Agents, RAG, and the systems beneath.

## Stack

- **Astro 5** + TypeScript (strict)
- **Tailwind CSS 4** + design tokens
- **MDX** + Content Collections
- **Vitest** for utility tests
- **Cloudflare Pages** for hosting

## Develop

```bash
nvm use            # node 20.18.0
npm install
npm run dev        # http://localhost:4321
npm test           # vitest
npm run check      # astro check (typecheck)
npm run build      # production build to dist/
```

## Project layout

See `docs/superpowers/specs/2026-05-09-ai-frontier-blog-design.md` for the full design.

Plans live in `docs/superpowers/plans/`.

## Authoring

New essays go in `src/content/posts/` as `.mdx` files. Frontmatter schema enforced by
`src/content/config.ts`.

## License

Code: MIT. Content: CC BY-NC 4.0.
