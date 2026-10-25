# Test Action

1. Read current-feature.md to understand what was implemented
2. Run `git diff master --name-only` (plus `git status --short` for uncommitted/untracked files) to get the files changed in this feature
3. Pick the files that need unit tests — only server actions and utilities, never components:
   - `src/actions/**/*.ts`
   - `src/lib/**/*.ts` (including `src/lib/db/` and `src/lib/validations/`)
   - Skip `.tsx` files, pages, layouts, and route handlers
4. For each picked file, write or update a colocated `*.test.ts` next to it, following the Testing section of @context/coding-standards.md:
   - Test new and changed exports only; don't rewrite passing tests for untouched code
   - Server actions: cover the happy path plus auth, validation, and error branches
   - Utilities: cover normal inputs and edge cases
   - Mock `@/auth`, `@/lib/prisma`, `next/navigation`, and third-party clients with `vi.mock` — never hit the real database or external services
   - Use `src/actions/profile.test.ts` as the reference pattern for server actions
5. Run `npm test`
6. If tests fail:
   - Fix mistakes in the tests themselves
   - If a failure reveals a bug in the source code, stop and report it instead of changing the code to make the test pass
   - After 2-3 failed attempts, stop and explain the issue
7. Report the results

## Output Format

## Tests

**path/to/file.test.ts** (new | updated)
What is covered (list the cases briefly).

## Skipped

Changed files that were not tested and why (e.g. component, page, no logic).

## Result

`npm test` output summary (files / tests passed or failed), plus any source bugs found.
