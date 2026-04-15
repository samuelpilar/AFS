export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { Settings, BookOpen, Zap, ChevronRight, Database, ToggleLeft } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { TopBar } from '@/components/layout/TopBar'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

export default async function AdminPage() {
  const [evCount, settingsCount, catalogCount] = await Promise.all([
    prisma.eV.count(),
    prisma.appSetting.count(),
    prisma.catalogItem.count(),
  ])

  return (
    <div className="flex flex-col h-full">
      <TopBar
        title="Administración"
        description="Configuración y catálogos del sistema"
      />
      <div className="p-6">
        {/* Summary cards */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="pt-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Total EVs</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{evCount}</p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Configuraciones</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{settingsCount}</p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-violet-50 flex items-center justify-center">
                  <ToggleLeft className="w-5 h-5 text-violet-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Catálogos</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{catalogCount}</p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center">
                  <Database className="w-5 h-5 text-emerald-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main action cards */}
        <div className="grid grid-cols-2 gap-5">
          <Link href="/admin/settings">
            <Card className="hover:border-gray-200 hover:shadow-sm transition-all cursor-pointer group">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="w-9 h-9 rounded-lg bg-violet-50 flex items-center justify-center">
                    <Settings className="w-4 h-4 text-violet-600" />
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition-colors" />
                </div>
                <CardTitle className="mt-3">Configuración del sistema</CardTitle>
                <CardDescription>
                  Parámetros operacionales, umbrales EWA, etiquetas de interfaz y preferencias de exportación.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-1.5">
                  {['Operacional', 'EWA', 'UI', 'Catálogos'].map((tab) => (
                    <span
                      key={tab}
                      className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-600"
                    >
                      {tab}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          </Link>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center">
                  <BookOpen className="w-4 h-4 text-emerald-600" />
                </div>
              </div>
              <CardTitle className="mt-3">Gestión de catálogos</CardTitle>
              <CardDescription>
                Estados de EV, áreas de coordinación y estados de hosting. Disponible desde Configuración → Catálogos.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {[
                  { label: 'Estados de EV', type: 'ev_status' },
                  { label: 'Áreas de coordinación', type: 'coordination_area' },
                  { label: 'Estados de hosting', type: 'hosting_status' },
                ].map((item) => (
                  <div key={item.type} className="flex items-center gap-2 text-xs text-gray-500">
                    <div className="w-1.5 h-1.5 rounded-full bg-gray-300" />
                    {item.label}
                  </div>
                ))}
              </div>
              <Link
                href="/admin/settings?tab=catalogos"
                className="inline-flex items-center gap-1 mt-4 text-xs text-blue-600 hover:text-blue-700 font-medium"
              >
                Gestionar catálogos
                <ChevronRight className="w-3 h-3" />
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
