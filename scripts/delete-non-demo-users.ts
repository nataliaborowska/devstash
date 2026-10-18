import { config } from "dotenv"

config({ path: ".env" })
config({ path: ".env.local", override: true })

import { PrismaClient } from "../src/generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

const DEMO_EMAIL = "demo@devstash.io"

// Dry run by default; pass --confirm to actually delete.
const confirmed = process.argv.includes("--confirm")

async function main() {
  const dbHost = new URL(process.env.DATABASE_URL!).host
  console.log(`Database: ${dbHost}\n`)

  const users = await prisma.user.findMany({
    where: { email: { not: DEMO_EMAIL } },
    select: {
      id: true,
      email: true,
      _count: { select: { items: true, collections: true, tags: true, itemTypes: true } },
    },
    orderBy: { email: "asc" },
  })

  if (users.length === 0) {
    console.log(`No users to delete — only ${DEMO_EMAIL} exists.`)
    return
  }

  console.log(`── Users to delete (${users.length}) ──`)
  users.forEach(({ email, _count }) =>
    console.log(
      `  ${email.padEnd(36)} items: ${_count.items}, collections: ${_count.collections}, tags: ${_count.tags}, custom types: ${_count.itemTypes}`
    )
  )

  if (!confirmed) {
    console.log("\nDry run — nothing deleted. Re-run with --confirm to delete.")
    return
  }

  // Items, collections, tags, custom item types, accounts and sessions cascade on user delete.
  const [tokens, deleted] = await prisma.$transaction([
    prisma.verificationToken.deleteMany({ where: { identifier: { not: DEMO_EMAIL } } }),
    prisma.user.deleteMany({ where: { email: { not: DEMO_EMAIL } } }),
  ])

  console.log(`\n✓ Deleted ${deleted.count} users and their content, plus ${tokens.count} verification tokens.`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
