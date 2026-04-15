'use client'

import Link from 'next/link'
import { cn, getMonthsUntilDate } from '@/lib/utils'
import { addYears } from 'date-fns'

interface EVForMandateAlert {
  id: number
  name: string
  leaderName: string | null
  electionDate: Date | string | null
}

interface MandateAlertsProps {
  evs: EVForMandateAlert[]
  alertMonths?: number
}

function getUrgencyClasses(months: number): string {
  if (months <= 1) return 'text-red-700 bg-red-50'
  if (months <= 2) return 'text-amber-700 bg-amber-50'
  return 'text-blue-700 bg-blue-50'
}

function getMonthLabel(months: number): string {
  if (months <= 0) return 'Vencido'
  if (months === 1) return '1 mes'
  return `${months} meses`
}

export function MandateAlerts({ evs, alertMonths = 3 }: MandateAlertsProps) {
  const alerts = evs
    .filter((ev) => {
      if (!ev.electionDate) return false
      const d = typeof ev.electionDate === 'string' ? new Date(ev.electionDate) : ev.electionDate
      const mandateEnd = addYears(d, 2)
      const months = getMonthsUntilDate(mandateEnd)
      if (months === null) return false
      return months <= alertMonths
    })
    .map((ev) => {
      const d = typeof ev.electionDate === 'string' ? new Date(ev.electionDate!) : ev.electionDate!
      const mandateEnd = addYears(d, 2)
      const months = getMonthsUntilDate(mandateEnd) ?? 0
      return { ...ev, months }
    })
    .sort((a, b) => a.months - b.months)

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5 h-full">
      <h2 className="text-sm font-semibold text-gray-900 mb-4">Alertas de Mandato</h2>

      {alerts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-6 gap-2">
          <span className="text-xl">✓</span>
          <p className="text-xs text-gray-400 text-center">
            Sin alertas de mandato próximas.
          </p>
        </div>
      ) : (
        <div className="space-y-0">
          {alerts.map((ev) => (
            <Link
              key={ev.id}
              href={`/ev/${ev.id}`}
              className="flex items-center gap-3 py-2.5 border-b border-gray-50 last:border-0 hover:bg-gray-50 -mx-2 px-2 rounded-md transition-colors group"
            >
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-gray-700 truncate group-hover:text-gray-900 transition-colors">
                  {ev.name}
                </p>
                {ev.leaderName && (
                  <p className="text-[11px] text-gray-400 truncate mt-0.5">{ev.leaderName}</p>
                )}
              </div>
              <span
                className={cn(
                  'text-xs font-semibold px-2 py-0.5 rounded-md flex-shrink-0',
                  getUrgencyClasses(ev.months)
                )}
              >
                {getMonthLabel(ev.months)}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
