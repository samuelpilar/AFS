export const dynamic = 'force-dynamic'

import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { OrgChart } from '@/components/organigrama/OrgChart'

interface PageProps {
  params: { id: string }
}

export default async function OrganigramaPage({ params }: PageProps) {
  const id = parseInt(params.id)
  if (isNaN(id)) notFound()

  const [ev, coordinationAreas] = await Promise.all([
    prisma.eV.findUnique({
      where: { id },
      include: {
        coordinators: {
          include: { teamMembers: true },
          orderBy: { area: 'asc' },
        },
        teamMembers: { where: { coordinatorId: null } },
      },
    }),
    prisma.catalogItem.findMany({
      where: { type: 'coordination_area', isActive: true },
      orderBy: { sortOrder: 'asc' },
    }),
  ])

  if (!ev) notFound()

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Top bar */}
      <div className="h-14 flex items-center px-4 bg-white border-b border-gray-100 gap-3 flex-shrink-0">
        <Link
          href={`/ev/${params.id}`}
          className="text-sm text-gray-500 hover:text-gray-900 flex items-center gap-1 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver
        </Link>
        <span className="text-gray-200">|</span>
        <h1 className="text-sm font-semibold text-gray-900">
          {ev.name} — Organigrama
        </h1>
      </div>

      {/* Chart area */}
      <div className="flex-1 relative overflow-hidden">
        <OrgChart ev={ev} coordinationAreas={coordinationAreas} />
      </div>
    </div>
  )
}
