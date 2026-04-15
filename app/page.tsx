export const dynamic = 'force-dynamic'

import { Suspense } from 'react'
import { prisma } from '@/lib/prisma'
import { getSetting } from '@/lib/settings'
import { TopBar } from '@/components/layout/TopBar'
import { MetricCards } from '@/components/dashboard/MetricCards'
import { EWARanking } from '@/components/dashboard/EWARanking'
import { MandateAlerts } from '@/components/dashboard/MandateAlerts'
import { OperationalChecklist } from '@/components/dashboard/OperationalChecklist'
import { SendingChart } from '@/components/dashboard/SendingChart'

interface EVRow {
  id: number
  name: string
  status: string
  leaderName: string | null
  electionDate: Date | null
  idoneidad: boolean
  planAnual: boolean
  visitaPlanif: boolean
  visitaRealizada: boolean
  ewa: Array<{ score: number | null; year: number }>
  sending: Array<{ students: number }>
}

async function DashboardContent() {
  const [rawEvs, alertMonths, kpiLabels] = await Promise.all([
    prisma.eV.findMany({
      include: {
        ewa: { orderBy: { year: 'desc' } },
        sending: true,
      },
      orderBy: { name: 'asc' },
    }),
    getSetting('mandate_alert_months'),
    getSetting('dashboard_kpi_labels'),
  ])

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const evs = rawEvs as EVRow[]

  // Stats
  const stats = {
    total: evs.length,
    activas: evs.filter((ev) => ev.status === 'Activa').length,
    asistidas: evs.filter((ev) => ev.status === 'Asistida').length,
    enDesarrollo: evs.filter((ev) => ev.status === 'Grupo en Desarrollo').length,
  }

  // EWA Ranking
  const ewaRanking = evs.map((ev) => {
    const latestEwa =
      ev.ewa.length > 0
        ? ev.ewa.reduce((prev, curr) => (curr.year > prev.year ? curr : prev))
        : null
    return {
      id: ev.id,
      name: ev.name,
      status: ev.status,
      latestEwa: latestEwa ? { score: latestEwa.score, year: latestEwa.year } : null,
    }
  })

  // Mandate Alerts
  const mandateEvs = evs.map((ev) => ({
    id: ev.id,
    name: ev.name,
    leaderName: ev.leaderName,
    electionDate: ev.electionDate,
  }))

  // Operational Checklist
  const checklistEvs = evs.map((ev) => ({
    id: ev.id,
    name: ev.name,
    status: ev.status,
    idoneidad: ev.idoneidad,
    planAnual: ev.planAnual,
    visitaPlanif: ev.visitaPlanif,
    visitaRealizada: ev.visitaRealizada,
  }))

  // Sending Chart
  const sendingData = evs
    .map((ev) => ({
      name: ev.name,
      total: ev.sending.reduce((sum, s) => sum + s.students, 0),
    }))
    .filter((d) => d.total > 0)

  return (
    <div className="p-6 space-y-6">
      <MetricCards stats={stats} labels={kpiLabels} />

      <div className="grid grid-cols-3 gap-5">
        <div className="col-span-1">
          <EWARanking evs={ewaRanking} />
        </div>
        <div className="col-span-1">
          <MandateAlerts evs={mandateEvs} alertMonths={alertMonths} />
        </div>
        <div className="col-span-1">
          <OperationalChecklist evs={checklistEvs} />
        </div>
      </div>

      <SendingChart data={sendingData} />
    </div>
  )
}

function DashboardSkeleton() {
  return (
    <div className="p-6 space-y-6 animate-pulse">
      {/* Metric Cards */}
      <div className="grid grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-100 p-5 h-24">
            <div className="h-3 bg-gray-100 rounded w-1/2 mb-3" />
            <div className="h-8 bg-gray-100 rounded w-1/3" />
          </div>
        ))}
      </div>

      {/* Middle Row */}
      <div className="grid grid-cols-3 gap-5">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-100 p-5 h-64">
            <div className="h-4 bg-gray-100 rounded w-1/3 mb-4" />
            <div className="space-y-3">
              {[...Array(5)].map((_, j) => (
                <div key={j} className="h-3 bg-gray-100 rounded w-full" />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="bg-white rounded-xl border border-gray-100 p-5 h-[320px]">
        <div className="h-4 bg-gray-100 rounded w-1/4 mb-4" />
        <div className="h-[260px] bg-gray-50 rounded-lg" />
      </div>
    </div>
  )
}

export default function DashboardPage() {
  return (
    <>
      <TopBar
        title="Dashboard"
        description="Resumen general de EVs AFS Argentina & Uruguay"
      />
      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardContent />
      </Suspense>
    </>
  )
}
