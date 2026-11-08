import { prisma } from "@/lib/prisma"
import {
  parseEditorPreferences,
  type EditorPreferences,
} from "@/lib/validations/editor-preferences"

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

// Missing users and unset or invalid stored values fall back to the defaults.
export async function getEditorPreferences(userId: string): Promise<EditorPreferences> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { editorPreferences: true },
  })
  return parseEditorPreferences(user?.editorPreferences)
}

export async function updateEditorPreferences(
  userId: string,
  preferences: EditorPreferences
): Promise<EditorPreferences> {
  const user = await prisma.user.update({
    where: { id: userId },
    data: { editorPreferences: preferences },
    select: { editorPreferences: true },
  })
  return parseEditorPreferences(user.editorPreferences)
}
