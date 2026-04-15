export const dynamic = 'force-dynamic'

import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { TopBar } from '@/components/layout/TopBar'
import { EVDetailClient } from '@/components/ev/EVDetailClient'

interface PageProps {
  params: { id: string }
}

export default async function EVDetailPage({ params }: PageProps) {
  const id = parseInt(params.id)
  if (isNaN(id)) notFound()

  const [ev, coordinationAreas] = await Promise.all([
    prisma.eV.findUnique({
      where: { id },
      include: {
        hosting: { orderBy: { year: 'desc' } },
        sending: { orderBy: { cycle: 'desc' } },
        ewa: { orderBy: { year: 'desc' } },
        coordinators: { include: { teamMembers: true }, orderBy: { area: 'asc' } },
        teamMembers: { where: { coordinatorId: null } },
        notes: { orderBy: { createdAt: 'desc' } },
        tags: { include: { tag: true } },
      },
    }),
    prisma.catalogItem.findMany({
      where: { type: 'coordination_area', isActive: true },
      orderBy: { sortOrder: 'asc' },
    }),
  ])

  if (!ev) {
    return (
      <div className="flex flex-col h-full">
        <TopBar title="EV no encontrada" description="El recurso solicitado no existe" />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-500 mb-4">No se encontró la EV con el ID especificado.</p>
            <Link
              href="/directorio"
              className="text-sm text-blue-600 hover:underline inline-flex items-center gap-1"
            >
              <ArrowLeft className="h-4 w-4" />
              Volver al directorio
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <TopBar
        title={ev.name}
        description={`${ev.region} · ${ev.country}`}
        actions={
          <Link
            href="/directorio"
            className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors px-3 py-1.5 rounded-md hover:bg-gray-100"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver
          </Link>
        }
      />
      <div className="flex-1 overflow-auto p-6">
        <EVDetailClient ev={ev} coordinationAreas={coordinationAreas} />
      </div>
    </div>
  )
}
