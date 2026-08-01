---
name: devstash-structure
description: Where DevStash source code actually lives on disk vs. what CLAUDE.md's documented tree shows
metadata:
  type: project
---

DevStash uses a `src/` directory layout: `src/app`, `src/components`, `src/lib`, `src/generated/prisma` (Prisma 7 generated client, gitignored). The `context/project-overview.md` doc tree shows paths without the `src/` prefix (e.g. `app/`, `components/`, `lib/`) — that tree is aspirational/illustrative, not literal. Prisma schema output is configured as `../src/generated/prisma` in `prisma/schema.prisma`.

Path alias `@/*` maps to `./src/*` (tsconfig.json).

**Why:** Repo was scaffolded with `src/` opted in, docs weren't updated to reflect it.
**How to apply:** When searching for files, always check `src/` first, not repo-root `app/`, `components/`, `lib/`. Glob `app/**` etc. at root will return nothing.
