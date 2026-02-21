import { prisma } from '@/lib/db'
import type { Prisma } from '@prisma/client'
import { createUser, updateUser, deleteUser } from './actions'
import UsersClient from './UsersClient'

export const dynamic = 'force-dynamic'

export default async function AdminUsersPage({ searchParams }: { searchParams: Promise<{ q?: string; sort?: string; dir?: 'asc' | 'desc' }> }) {
  const sp = await searchParams
  const q = (sp?.q || '').trim()
  const sort = (sp?.sort || '').trim()
  const dir = (sp?.dir === 'asc' || sp?.dir === 'desc') ? sp?.dir : 'asc'
  const allowedSorts = new Set(['name', 'email', 'role'])
  const dirVal: Prisma.SortOrder = dir === 'desc' ? 'desc' : 'asc'
  const orderBy: Prisma.UserOrderByWithRelationInput[] = allowedSorts.has(sort)
    ? [{ [sort]: dirVal } as Prisma.UserOrderByWithRelationInput]
    : [{ createdAt: 'desc' }]
  const users = await prisma.user.findMany({
    where: q ? { OR: [{ name: { contains: q, mode: 'insensitive' } }, { email: { contains: q, mode: 'insensitive' } }] } : undefined,
    orderBy,
  })
  return (
    <UsersClient q={q} users={users} actions={{ createUser, updateUser, deleteUser }} />
  )
}
