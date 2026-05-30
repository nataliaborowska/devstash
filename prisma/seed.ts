import { config } from "dotenv"

config({ path: ".env" })
config({ path: ".env.local", override: true })

import { PrismaClient } from "../src/generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import bcrypt from "bcryptjs"

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

const SYSTEM_ITEM_TYPES = [
  { name: "snippet", icon: "Code",       color: "#3b82f6" },
  { name: "prompt",  icon: "Sparkles",   color: "#8b5cf6" },
  { name: "command", icon: "Terminal",   color: "#f97316" },
  { name: "note",    icon: "StickyNote", color: "#fde047" },
  { name: "file",    icon: "File",       color: "#6b7280" },
  { name: "image",   icon: "Image",      color: "#ec4899" },
  { name: "link",    icon: "Link",       color: "#10b981" },
]

async function main() {
  // Remove stale system item types from previous seed versions
  const currentNames = SYSTEM_ITEM_TYPES.map((t) => t.name)
  const staleTypes = await prisma.itemType.findMany({
    where: { isSystem: true, name: { notIn: currentNames } },
  })
  if (staleTypes.length > 0) {
    const staleIds = staleTypes.map((t) => t.id)
    await prisma.item.deleteMany({ where: { typeId: { in: staleIds } } })
    await prisma.itemType.deleteMany({ where: { id: { in: staleIds } } })
    console.log(`Removed ${staleTypes.length} stale system item types`)
  }

  // System item types
  for (const type of SYSTEM_ITEM_TYPES) {
    const existing = await prisma.itemType.findFirst({ where: { name: type.name, isSystem: true } })
    if (!existing) {
      await prisma.itemType.create({ data: { ...type, isSystem: true } })
    }
  }
  console.log("Seeded", SYSTEM_ITEM_TYPES.length, "system item types")

  // Demo user
  const passwordHash = await bcrypt.hash("12345678", 12)
  const user = await prisma.user.upsert({
    where: { email: "demo@devstash.io" },
    update: {},
    create: {
      email: "demo@devstash.io",
      name: "Demo User",
      password: passwordHash,
      isPro: false,
      emailVerified: new Date(),
    },
  })
  console.log("Seeded demo user:", user.email)

  // Fetch item types by name
  const types = await prisma.itemType.findMany({ where: { isSystem: true } })
  const typeMap = Object.fromEntries(types.map((t) => [t.name, t.id]))

  // --- Collection: React Patterns ---
  const reactPatterns = await prisma.collection.upsert({
    where: { id: "seed-react-patterns" },
    update: {},
    create: {
      id: "seed-react-patterns",
      name: "React Patterns",
      description: "Reusable React patterns and hooks",
      userId: user.id,
    },
  })

  await prisma.item.createMany({
    skipDuplicates: true,
    data: [
      {
        id: "seed-rp-1",
        title: "Custom Hooks Collection",
        content: `import { useState, useEffect, useRef } from "react"

// useDebounce — delays updating a value until after delay ms
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value)
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])
  return debouncedValue
}

// useLocalStorage — syncs state with localStorage
export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch {
      return initialValue
    }
  })
  const setValue = (value: T) => {
    setStoredValue(value)
    window.localStorage.setItem(key, JSON.stringify(value))
  }
  return [storedValue, setValue] as const
}

// usePrevious — tracks the previous value of any variable
export function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T>()
  useEffect(() => { ref.current = value }, [value])
  return ref.current
}

// useOnClickOutside — calls handler when clicking outside element
export function useOnClickOutside(ref: React.RefObject<HTMLElement>, handler: () => void) {
  useEffect(() => {
    const listener = (e: MouseEvent) => {
      if (!ref.current || ref.current.contains(e.target as Node)) return
      handler()
    }
    document.addEventListener("mousedown", listener)
    return () => document.removeEventListener("mousedown", listener)
  }, [ref, handler])
}`,
        language: "typescript",
        contentType: "TEXT",
        typeId: typeMap["snippet"],
        userId: user.id,
        collectionId: reactPatterns.id,
      },
      {
        id: "seed-rp-2",
        title: "Context Provider Pattern",
        content: `import { createContext, useContext, useState, ReactNode } from "react"

// Generic context factory — avoids repetitive boilerplate
function createCtx<T>() {
  const ctx = createContext<T | undefined>(undefined)
  function useCtx() {
    const c = useContext(ctx)
    if (!c) throw new Error("useCtx must be inside Provider")
    return c
  }
  return [useCtx, ctx.Provider] as const
}

// --- Example: Theme context ---
type Theme = "dark" | "light"
interface ThemeCtx { theme: Theme; toggle: () => void }
const [useTheme, ThemeProvider] = createCtx<ThemeCtx>()

export function ThemeRoot({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>("dark")
  return (
    <ThemeProvider value={{ theme, toggle: () => setTheme(t => t === "dark" ? "light" : "dark") }}>
      {children}
    </ThemeProvider>
  )
}
export { useTheme }

// --- Compound component pattern ---
interface ItemProps { title: string; children: ReactNode }

function Accordion({ children }: { children: ReactNode }) {
  return <div className="divide-y">{children}</div>
}

function AccordionItem({ title, children }: ItemProps) {
  const [open, setOpen] = useState(false)
  return (
    <div>
      <button onClick={() => setOpen(o => !o)} className="w-full text-left py-2 font-medium">
        {title}
      </button>
      {open && <div className="pb-2">{children}</div>}
    </div>
  )
}

Accordion.Item = AccordionItem
export { Accordion }`,
        language: "typescript",
        contentType: "TEXT",
        typeId: typeMap["snippet"],
        userId: user.id,
        collectionId: reactPatterns.id,
      },
      {
        id: "seed-rp-3",
        title: "Utility Functions",
        content: `import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

// cn — merge Tailwind classes safely
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// formatDate — locale-aware date formatter
export function formatDate(date: Date | string, options?: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    ...options,
  }).format(new Date(date))
}

// truncate — shorten string with ellipsis
export function truncate(str: string, maxLength: number) {
  return str.length > maxLength ? str.slice(0, maxLength - 3) + "..." : str
}

// sleep — promise-based delay
export const sleep = (ms: number) => new Promise(res => setTimeout(res, ms))

// groupBy — group array by key
export function groupBy<T>(arr: T[], key: keyof T): Record<string, T[]> {
  return arr.reduce((acc, item) => {
    const k = String(item[key])
    ;(acc[k] ??= []).push(item)
    return acc
  }, {} as Record<string, T[]>)
}

// pick — select subset of object keys
export function pick<T extends object, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {
  return Object.fromEntries(keys.map(k => [k, obj[k]])) as Pick<T, K>
}`,
        language: "typescript",
        contentType: "TEXT",
        typeId: typeMap["snippet"],
        userId: user.id,
        collectionId: reactPatterns.id,
      },
    ],
  })

  // --- Collection: AI Workflows ---
  const aiWorkflows = await prisma.collection.upsert({
    where: { id: "seed-ai-workflows" },
    update: {},
    create: {
      id: "seed-ai-workflows",
      name: "AI Workflows",
      description: "AI prompts and workflow automations",
      userId: user.id,
    },
  })

  await prisma.item.createMany({
    skipDuplicates: true,
    data: [
      {
        id: "seed-ai-1",
        title: "Code Review Prompt",
        content: `You are an expert software engineer performing a thorough code review. Analyze the following code and provide feedback on:

1. **Correctness** — Are there any bugs, logic errors, or edge cases not handled?
2. **Security** — Are there vulnerabilities (injection, XSS, auth bypass, insecure defaults)?
3. **Performance** — Are there unnecessary re-renders, N+1 queries, or blocking operations?
4. **Readability** — Is the code self-documenting? Are names clear and consistent?
5. **Patterns** — Does it follow established patterns in the codebase?

Format your response as:
- **Summary** — One sentence verdict.
- **Issues** — Bulleted list, each tagged [bug], [security], [perf], or [style].
- **Suggestions** — Concrete improvements with example code where helpful.

Be direct and specific. Skip praise unless a pattern is exceptionally well done and worth reinforcing.

Code to review:
\`\`\`
{{CODE}}
\`\`\``,
        contentType: "TEXT",
        typeId: typeMap["prompt"],
        userId: user.id,
        collectionId: aiWorkflows.id,
      },
      {
        id: "seed-ai-2",
        title: "Documentation Generation Prompt",
        content: `You are a technical writer. Generate clear, developer-friendly documentation for the following code.

Include:
- **Overview** — What this does in one or two sentences.
- **Parameters / Props** — Name, type, required/optional, and description for each.
- **Return value** — What is returned and its shape.
- **Example** — A realistic usage example with sample inputs and expected output.
- **Edge cases** — Any gotchas, limitations, or behaviors that may surprise users.

Use JSDoc format for functions/classes. Use markdown for everything else. Do not add obvious comments.

Code:
\`\`\`
{{CODE}}
\`\`\``,
        contentType: "TEXT",
        typeId: typeMap["prompt"],
        userId: user.id,
        collectionId: aiWorkflows.id,
      },
      {
        id: "seed-ai-3",
        title: "Refactoring Assistant Prompt",
        content: `You are a senior engineer specializing in clean code and pragmatic refactoring.

Refactor the following code with these goals (in priority order):
1. Eliminate duplication — extract repeated logic into well-named functions or hooks.
2. Simplify — remove unnecessary complexity, intermediate variables, and over-engineering.
3. Clarify intent — rename anything unclear; structure code so the reader can follow top-down.
4. Preserve behavior — do not change what the code does, only how it does it.

Constraints:
- Keep the public API identical (same function signatures, exports).
- Do not add new dependencies.
- Do not introduce abstractions for hypothetical future requirements.

Output the refactored code followed by a brief **Rationale** section explaining each significant change.

Original code:
\`\`\`
{{CODE}}
\`\`\``,
        contentType: "TEXT",
        typeId: typeMap["prompt"],
        userId: user.id,
        collectionId: aiWorkflows.id,
      },
    ],
  })

  // --- Collection: DevOps ---
  const devops = await prisma.collection.upsert({
    where: { id: "seed-devops" },
    update: {},
    create: {
      id: "seed-devops",
      name: "DevOps",
      description: "Infrastructure and deployment resources",
      userId: user.id,
    },
  })

  await prisma.item.createMany({
    skipDuplicates: true,
    data: [
      {
        id: "seed-do-1",
        title: "Dockerfile + GitHub Actions CI",
        content: `# ---- Dockerfile (multi-stage, Next.js) ----
FROM node:20-alpine AS base
WORKDIR /app

FROM base AS deps
COPY package*.json ./
RUN npm ci

FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM base AS runner
ENV NODE_ENV=production
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
EXPOSE 3000
CMD ["node", "server.js"]

# ---- .github/workflows/ci.yml ----
name: CI
on:
  push:
    branches: [main]
  pull_request:

jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npm run lint
      - run: npm run build
    env:
      DATABASE_URL: \${{ secrets.DATABASE_URL }}`,
        language: "dockerfile",
        contentType: "TEXT",
        typeId: typeMap["snippet"],
        userId: user.id,
        collectionId: devops.id,
      },
      {
        id: "seed-do-2",
        title: "Deploy to Vercel",
        content: `git pull origin main && npm ci && npx prisma migrate deploy && vercel --prod`,
        contentType: "TEXT",
        typeId: typeMap["command"],
        userId: user.id,
        collectionId: devops.id,
      },
      {
        id: "seed-do-3",
        title: "Prisma Docs",
        url: "https://www.prisma.io/docs",
        description: "Official Prisma ORM documentation — schema, migrations, client API, and guides.",
        contentType: "TEXT",
        typeId: typeMap["link"],
        userId: user.id,
        collectionId: devops.id,
      },
      {
        id: "seed-do-4",
        title: "GitHub Actions Docs",
        url: "https://docs.github.com/en/actions",
        description: "Complete reference for GitHub Actions — workflows, triggers, runners, and marketplace actions.",
        contentType: "TEXT",
        typeId: typeMap["link"],
        userId: user.id,
        collectionId: devops.id,
      },
    ],
  })

  // --- Collection: Terminal Commands ---
  const terminalCmds = await prisma.collection.upsert({
    where: { id: "seed-terminal-cmds" },
    update: {},
    create: {
      id: "seed-terminal-cmds",
      name: "Terminal Commands",
      description: "Useful shell commands for everyday development",
      userId: user.id,
    },
  })

  await prisma.item.createMany({
    skipDuplicates: true,
    data: [
      {
        id: "seed-tc-1",
        title: "Git Operations",
        content: `# Undo last commit but keep changes staged
git reset --soft HEAD~1

# Interactively stage chunks of a file
git add -p <file>

# Stash including untracked files
git stash --include-untracked

# Find the commit that introduced a bug
git bisect start && git bisect bad && git bisect good <commit>

# Clean up merged local branches
git branch --merged main | grep -v '^\* main$' | xargs git branch -d

# Amend last commit message without changing content
git commit --amend -m "new message"

# Show file history with diffs
git log --follow -p -- <file>`,
        contentType: "TEXT",
        typeId: typeMap["command"],
        userId: user.id,
        collectionId: terminalCmds.id,
      },
      {
        id: "seed-tc-2",
        title: "Docker Commands",
        content: `# Remove stopped containers, dangling images, unused networks
docker system prune -f

# Build and tag image
docker build -t myapp:latest .

# Run container with env file and port mapping
docker run --env-file .env -p 3000:3000 myapp:latest

# Follow logs for a running container
docker logs -f <container_id>

# Shell into a running container
docker exec -it <container_id> sh

# Stop and remove all containers
docker stop $(docker ps -q) && docker rm $(docker ps -aq)`,
        contentType: "TEXT",
        typeId: typeMap["command"],
        userId: user.id,
        collectionId: terminalCmds.id,
      },
      {
        id: "seed-tc-3",
        title: "Process Management",
        content: `# Find process using a port
lsof -i :3000

# Kill process on a port
kill -9 $(lsof -t -i:3000)

# Show top memory consumers
ps aux --sort=-%mem | head -10

# Run process in background, keep after shell exit
nohup node server.js > server.log 2>&1 &

# Check what's listening on all ports
ss -tlnp`,
        contentType: "TEXT",
        typeId: typeMap["command"],
        userId: user.id,
        collectionId: terminalCmds.id,
      },
      {
        id: "seed-tc-4",
        title: "Package Manager Utilities",
        content: `# List outdated packages
npm outdated

# Update a single package to latest
npm install <package>@latest

# Check for security vulnerabilities
npm audit

# Remove packages not in package.json
npm prune

# Run script with env variable inline
NODE_ENV=production npm run build

# List globally installed packages
npm list -g --depth=0

# Clear npm cache
npm cache clean --force`,
        contentType: "TEXT",
        typeId: typeMap["command"],
        userId: user.id,
        collectionId: terminalCmds.id,
      },
    ],
  })

  // --- Collection: Design Resources ---
  const designResources = await prisma.collection.upsert({
    where: { id: "seed-design-resources" },
    update: {},
    create: {
      id: "seed-design-resources",
      name: "Design Resources",
      description: "UI/UX resources and references",
      userId: user.id,
    },
  })

  await prisma.item.createMany({
    skipDuplicates: true,
    data: [
      {
        id: "seed-dr-1",
        title: "Tailwind CSS Docs",
        url: "https://tailwindcss.com/docs",
        description: "Official Tailwind CSS documentation — utility classes, configuration, and v4 CSS-based config.",
        contentType: "TEXT",
        typeId: typeMap["link"],
        userId: user.id,
        collectionId: designResources.id,
      },
      {
        id: "seed-dr-2",
        title: "shadcn/ui",
        url: "https://ui.shadcn.com",
        description: "Copy-paste React components built on Radix UI and Tailwind CSS. Fully accessible and customizable.",
        contentType: "TEXT",
        typeId: typeMap["link"],
        userId: user.id,
        collectionId: designResources.id,
      },
      {
        id: "seed-dr-3",
        title: "Radix UI Primitives",
        url: "https://www.radix-ui.com/primitives",
        description: "Unstyled, accessible UI primitives for React. The foundation under shadcn/ui components.",
        contentType: "TEXT",
        typeId: typeMap["link"],
        userId: user.id,
        collectionId: designResources.id,
      },
      {
        id: "seed-dr-4",
        title: "Lucide Icons",
        url: "https://lucide.dev/icons",
        description: "Searchable library of 1000+ open-source SVG icons. Used throughout DevStash.",
        contentType: "TEXT",
        typeId: typeMap["link"],
        userId: user.id,
        collectionId: designResources.id,
      },
    ],
  })

  console.log("Seed complete.")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
