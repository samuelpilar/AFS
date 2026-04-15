'use client'

import Link from 'next/link'
import { cn } from '@/lib/utils'

interface EVForChecklist {
  id: number
  name: string
  status: string
  idoneidad: boolean
  planAnual: boolean
  visitaPlanif: boolean
  visitaRealizada: boolean
}

interface OperationalChecklistProps {
  evs: EVForChecklist[]
}

function CheckCell({ value }: { value: boolean }) {
  return (
    <td className="px-3 py-2.5 text-center">
      {value ? (
        <span className="text-[13px] font-semibold text-emerald-600">✓</span>
      ) : (
        <span className="text-[13px] text-gray-300">—</span>
      )}
    </td>
  )
}

export function OperationalChecklist({ evs }: OperationalChecklistProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5 h-full">
      <h2 className="text-sm font-semibold text-gray-900 mb-4">Checklist Operacional</h2>

      {evs.length === 0 ? (
        <p className="text-xs text-gray-400 py-4 text-center">Sin EVs registradas.</p>
      ) : (
        <div className="overflow-x-auto -mx-2">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="px-3 py-2 text-left font-medium text-gray-500 w-auto">EV</th>
                <th className="px-3 py-2 text-center font-medium text-gray-500 whitespace-nowrap">
                  Plan Anual
                </th>
                <th className="px-3 py-2 text-center font-medium text-gray-500 whitespace-nowrap">
                  Visita Planif.
                </th>
                <th className="px-3 py-2 text-center font-medium text-gray-500 whitespace-nowrap">
                  Idoneidad
                </th>
              </tr>
            </thead>
            <tbody>
              {evs.map((ev) => (
                <tr
                  key={ev.id}
                  className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors"
                >
                  <td className="px-3 py-2.5">
                    <Link
                      href={`/ev/${ev.id}`}
                      className="text-gray-700 font-medium hover:text-blue-600 transition-colors truncate block max-w-[120px]"
                    >
                      {ev.name}
                    </Link>
                  </td>
                  <CheckCell value={ev.planAnual} />
                  <CheckCell value={ev.visitaPlanif} />
                  <CheckCell value={ev.idoneidad} />
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
