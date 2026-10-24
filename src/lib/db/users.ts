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

export type ProfileUser = SidebarUser & {
  createdAt: Date
  hasPassword: boolean
}

export async function getProfileUser(userId: string): Promise<ProfileUser | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true, image: true, createdAt: true, password: true },
  })
  if (!user) return null

  const { password, ...profile } = user
  return { ...profile, hasPassword: password !== null }
}
