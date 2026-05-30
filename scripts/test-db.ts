import { config } from "dotenv"

config({ path: ".env" })
config({ path: ".env.local", override: true })

import { PrismaClient } from "../src/generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log("Testing database connection...")

  const itemTypes = await prisma.itemType.findMany()
  console.log(`Connected. Found ${itemTypes.length} system item types:`)
  itemTypes.forEach((t) => console.log(` ${t.icon}  ${t.name}`))
}

main()
  .catch((e) => {
    console.error("Connection failed:", e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
