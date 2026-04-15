export const dynamic = 'force-dynamic'

import { prisma } from '@/lib/prisma'
import { TopBar } from '@/components/layout/TopBar'
import { AdminSettingsClient } from '@/components/admin/AdminSettingsClient'

export default async function AdminSettingsPage() {
  const [settings, evStatuses, coordinationAreas, hostingStatuses] = await Promise.all([
    prisma.appSetting.findMany({ orderBy: { group: 'asc' } }),
    prisma.catalogItem.findMany({ where: { type: 'ev_status' }, orderBy: { sortOrder: 'asc' } }),
    prisma.catalogItem.findMany({ where: { type: 'coordination_area' }, orderBy: { sortOrder: 'asc' } }),
    prisma.catalogItem.findMany({ where: { type: 'hosting_status' }, orderBy: { sortOrder: 'asc' } }),
  ])

  return (
    <div className="flex flex-col h-full">
      <TopBar
        title="Configuración del sistema"
        description="Parámetros operacionales, EWA, interfaz y catálogos"
      />
      <div className="flex-1 overflow-auto p-6">
        <AdminSettingsClient
          settings={settings}
          evStatuses={evStatuses}
          coordinationAreas={coordinationAreas}
          hostingStatuses={hostingStatuses}
        />
      </div>
    </div>
  )
}
