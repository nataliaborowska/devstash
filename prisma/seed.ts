import { config } from "dotenv"

config({ path: ".env" })
config({ path: ".env.local", override: true })

import { PrismaClient } from "../src/generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

const SYSTEM_ITEM_TYPES = [
  { name: "Snippet", icon: "</>", color: "#3b82f6" },
  { name: "Prompt",  icon: "✨",  color: "#a855f7" },
  { name: "Note",    icon: "📝",  color: "#22c55e" },
  { name: "Command", icon: "$_",  color: "#f97316" },
  { name: "File",    icon: "📄",  color: "#64748b" },
  { name: "Image",   icon: "🖼️",  color: "#ec4899" },
  { name: "URL",     icon: "🔗",  color: "#06b6d4" },
]

async function main() {
  for (const type of SYSTEM_ITEM_TYPES) {
    const existing = await prisma.itemType.findFirst({
      where: { name: type.name, isSystem: true },
    })
    if (!existing) {
      await prisma.itemType.create({
        data: { ...type, isSystem: true },
      })
    }
  }
  console.log("Seeded", SYSTEM_ITEM_TYPES.length, "system item types")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
