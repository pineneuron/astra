import { prisma } from '@/lib/db'
import type { Prisma } from '@prisma/client'
import CouponsClient from './CouponsClient'

export const dynamic = 'force-dynamic'

export default async function AdminCouponsPage({ searchParams }: { searchParams: Promise<{ q?: string; sort?: string; dir?: 'asc' | 'desc' }> }) {
  const sp = await searchParams
  const q = (sp?.q || '').trim()
  const sort = (sp?.sort || '').trim()
  const dir = (sp?.dir === 'asc' || sp?.dir === 'desc') ? sp?.dir : 'desc'
  const allowed = new Set(['code','name','type','value','startDate','endDate','isActive'])
  const dirVal: Prisma.SortOrder = dir === 'asc' ? 'asc' : 'desc'
  const orderBy: Prisma.CouponOrderByWithRelationInput[] = allowed.has(sort)
    ? [{ [sort]: dirVal } as Prisma.CouponOrderByWithRelationInput]
    : [{ createdAt: 'desc' }]
  const coupons = await prisma.coupon.findMany({
    where: q ? {
      OR: [
        { code: { contains: q, mode: 'insensitive' } },
        { name: { contains: q, mode: 'insensitive' } },
      ]
    } : undefined,
    orderBy,
  })
  const uiCoupons = coupons.map(c => ({
    id: c.id,
    code: c.code,
    name: c.name,
    description: c.description || '',
    type: c.type,
    value: Number(c.value as unknown as number),
    minOrderAmount: c.minOrderAmount != null ? Number(c.minOrderAmount as unknown as number) : null,
    maxDiscountAmount: c.maxDiscountAmount != null ? Number(c.maxDiscountAmount as unknown as number) : null,
    startDate: c.startDate ? c.startDate.toISOString() : null,
    endDate: c.endDate ? c.endDate.toISOString() : null,
    isActive: c.isActive,
    usageLimit: c.usageLimit ?? null,
  }))
  return (
    <CouponsClient q={q} coupons={uiCoupons} />
  )
}
