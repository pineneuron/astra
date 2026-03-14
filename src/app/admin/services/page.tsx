import { prisma } from '@/lib/db'
import {
  createService,
  updateService,
  deleteService,
  toggleServiceActive,
  reorderServices,
} from './actions'
import ServicesClient from './ServicesClient'

export const dynamic = 'force-dynamic'

export default async function AdminServicesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const sp = await searchParams
  const q = (sp?.q || '').trim()

  const services = await prisma.service.findMany({
    where: q
      ? {
          OR: [
            { title: { contains: q, mode: 'insensitive' } },
            { slug: { contains: q, mode: 'insensitive' } },
          ],
        }
      : {},
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
  })

  type ServiceRow = (typeof services)[number]
  const servicesForClient = services.map((s: ServiceRow) => ({
    ...s,
    price: Number(s.price),
    salePrice: s.salePrice != null ? Number(s.salePrice) : null,
  }))

  return (
    <ServicesClient
      q={q}
      services={servicesForClient}
      actions={{
        createService,
        updateService,
        deleteService,
        toggleServiceActive,
        reorderServices,
      }}
    />
  )
}
