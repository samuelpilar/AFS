export const dynamic = 'force-dynamic'

import { prisma } from '@/lib/prisma'
import { EVGrid } from '@/components/directorio/EVGrid'
import { TopBar } from '@/components/layout/TopBar'

export default async function DirectorioPage() {
  const evs = await prisma.eV.findMany({
    include: {
      ewa: { orderBy: { year: 'desc' }, take: 1 },
      sending: true,
      hosting: { orderBy: { year: 'desc' }, take: 1 },
      tags: { include: { tag: true } },
    },
    orderBy: { name: 'asc' },
  })

  const processedEvs = evs.map((ev) => ({
    ...ev,
    latestEwa: ev.ewa[0] ?? null,
    sendingTotal: ev.sending.reduce((sum, s) => sum + s.students, 0),
    hostingSummary: ev.hosting[0] ?? null,
  }))

  return (
    <div className="flex flex-col h-full">
      <TopBar
        title="Directorio de EVs"
        description="Gestión de todas las Estaciones de Voluntarios"
      />
      <div className="flex-1 overflow-auto p-6">
        <EVGrid evs={processedEvs} />
      </div>
    </div>
  )
}
