import { prisma } from "@/lib/prisma"

export type SidebarUser = {
  id: string
  name: string | null
  email: string
  image: string | null
}

export async function getSidebarUser(userId: string): Promise<SidebarUser | null> {
  return prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true, image: true },
  })
}
