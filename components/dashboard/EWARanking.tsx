'use client'

import Link from 'next/link'
import { cn, getEWABadgeClasses, getEWAColor } from '@/lib/utils'
import { getStatusColor } from '@/lib/utils'

interface EVWithEWA {
  id: number
  name: string
  status: string
  latestEwa: { score: number | null; year: number } | null
}

interface EWARankingProps {
  evs: EVWithEWA[]
}

export function EWARanking({ evs }: EWARankingProps) {
  const sorted = [...evs]
    .sort((a, b) => {
      const sa = a.latestEwa?.score ?? null
      const sb = b.latestEwa?.score ?? null
      if (sa === null && sb === null) return 0
      if (sa === null) return 1
      if (sb === null) return -1
      return sb - sa
    })
    .slice(0, 10)

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5 h-full">
      <h2 className="text-sm font-semibold text-gray-900 mb-4">Ranking EWA</h2>

      {sorted.length === 0 ? (
        <p className="text-xs text-gray-400 py-4 text-center">Sin datos disponibles.</p>
      ) : (
        <div className="space-y-0">
          {sorted.map((ev, idx) => {
            const score = ev.latestEwa?.score ?? null
            const barWidth = score !== null ? (score / 4) * 100 : 0

            return (
              <Link
                key={ev.id}
                href={`/ev/${ev.id}`}
                className="flex items-center gap-3 py-2.5 border-b border-gray-50 last:border-0 hover:bg-gray-50 -mx-2 px-2 rounded-md transition-colors group"
              >
                <span className="text-xs text-gray-300 w-4 flex-shrink-0 tabular-nums">
                  {idx + 1}
                </span>

                <span
                  className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: getStatusColor(ev.status) }}
                />

                <span className="flex-1 min-w-0 text-xs text-gray-700 font-medium truncate group-hover:text-gray-900 transition-colors">
                  {ev.name}
                </span>

                <div className="flex items-center gap-2 flex-shrink-0">
                  {score !== null ? (
                    <>
                      <div className="w-16 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${barWidth}%`,
                            backgroundColor: getEWAColor(score),
                          }}
                        />
                      </div>
                      <span
                        className={cn(
                          'text-xs font-semibold px-1.5 py-0.5 rounded-md',
                          getEWABadgeClasses(score)
                        )}
                      >
                        {score.toFixed(1)}
                      </span>
                    </>
                  ) : (
                    <span className="text-xs text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded-md">
                      Sin eval.
                    </span>
                  )}
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
