# DevStash

A developer knowledeg hub for snippets, prompts, notes, commands, files, images, links and custom types.

## Context files

read the following to get the full context of the project
- @context/project-overview.md
- @context/coding-standards.md
- @context/ai-interaction.md
- @context/current-feature.md

## Neon MCP / Database

- Project: **devstash-dev** (id: `restless-lab-50995339`)
- Default branch: **development** (id: `br-delicate-mode-ald8ligh`)
- Always use the `development` branch for Neon MCP queries (`run_sql`, schema tools, etc.) unless I explicitly say "production" or name another branch.
- Never run queries, migrations, or any destructive operations against the **production** branch (id: `br-sweet-leaf-al2xzbwi`) unless I explicitly ask for production.
- If a Neon MCP request is ambiguous about which branch to target, default to `development` — don't ask, just state which branch was used.

## Commands

```bash
npm run dev      # start dev server (Turbopack, outputs to .next/dev)
npm run build    # production build (Turbopack by default)
npm run start    # start production server
npm run lint     # run ESLint directly (next lint no longer exists)
npm test         # run Vitest unit tests once (server actions + utilities)
npm run test:watch  # run Vitest in watch mode
```

**important:** Do not add clause to any commit messages