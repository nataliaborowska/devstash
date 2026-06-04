import { config } from "dotenv"

config({ path: ".env" })
config({ path: ".env.local", override: true })

import { PrismaClient } from "../src/generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log("Testing database connection...\n")

  // Item types
  const itemTypes = await prisma.itemType.findMany({ orderBy: { name: "asc" } })
  console.log(`── Item Types (${itemTypes.length}) ──`)
  itemTypes.forEach((t) => console.log(`  ${(t.icon ?? "").padEnd(12)} ${t.name}  ${t.color}`))

  // Demo user
  const user = await prisma.user.findUnique({
    where: { email: "demo@devstash.io" },
    include: {
      collections: {
        include: {
          items: {
            include: { type: true },
          },
        },
        orderBy: { name: "asc" },
      },
    },
  })

  if (!user) {
    console.log("\n✗ Demo user not found — run `npm run db:seed`")
    return
  }

  console.log(`\n── Demo User ──`)
  console.log(`  email:         ${user.email}`)
  console.log(`  name:          ${user.name}`)
  console.log(`  isPro:         ${user.isPro}`)
  console.log(`  emailVerified: ${user.emailVerified?.toISOString() ?? "null"}`)
  console.log(`  password hash: ${user.password ? "✓ set" : "✗ missing"}`)

  const totalItems = user.collections.reduce((sum, c) => sum + c.items.length, 0)
  console.log(`\n── Collections (${user.collections.length}) — ${totalItems} items total ──`)

  for (const col of user.collections) {
    console.log(`\n  ${col.name}`)
    console.log(`  ${col.description ?? ""}`)
    for (const item of col.items) {
      const detail = item.url ?? item.language ?? ""
      console.log(`    · [${item.type.name.padEnd(7)}] ${item.title}${detail ? `  (${detail})` : ""}`)
    }
  }
}

main()
  .catch((e) => {
    console.error("Connection failed:", e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
