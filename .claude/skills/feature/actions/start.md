# Start Action

1. Read current-feature.md - verify Goals are populated
2. If empty, error: "Run /feature load first"
3. Set Status to "In Progress"
4. Create and checkout the feature branch (derive name from H1 heading)
5. List the goals, then implement them one by one
6. If any server actions or utilities were added or changed, write or update their unit tests following steps 3-4 of [test.md](test.md)
7. Run `npm test`, `npm run lint`, and `npm run build`, and fix any failures (follow step 6 of [test.md](test.md) for test failures)
8. Don't run the server by yourself, it will be done manually by me.