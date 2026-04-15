'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { getEWAColor, getStatusBadgeClasses } from '@/lib/utils'

interface EWA {
  id: number
  year: number
  score: number | null
}

interface Hosting {
  id: number
  year: number
  totalQuota: number
  shQuota: number
  nhQuota: number
  shStatus: string
  nhStatus: string
  notes: string
}

interface Tag {
  tagId: number
  tag: { id: number; name: string; color: string | null }
}

interface ProcessedEV {
  id: number
  name: string
  region: string
  country: string
  status: string
  leaderName: string | null
  totalVolunteers: number
  latestEwa: EWA | null
  sendingTotal: number
  hostingSummary: Hosting | null
  tags: Tag[]
}

interface EVGridProps {
  evs: ProcessedEV[]
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`text-[11px] px-2 py-0.5 rounded-full border font-medium ${getStatusBadgeClasses(status)}`}
    >
      {status}
    </span>
  )
}

export function EVGrid({ evs }: EVGridProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('Todos')
  const [filterCountry, setFilterCountry] = useState('Todos')

  const filtered = evs.filter((ev) => {
    const matchesSearch =
      searchTerm === '' ||
      ev.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ev.region.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (ev.leaderName ?? '').toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = filterStatus === 'Todos' || ev.status === filterStatus
    const matchesCountry = filterCountry === 'Todos' || ev.country === filterCountry

    return matchesSearch && matchesStatus && matchesCountry
  })

  return (
    <div>
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          <Input
            placeholder="Buscar EV..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="h-9 rounded-md border border-input bg-white px-3 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring min-w-[160px]"
        >
          <option value="Todos">Todos los estados</option>
          <option value="Activa">Activa</option>
          <option value="Asistida">Asistida</option>
          <option value="Grupo en Desarrollo">Grupo en Desarrollo</option>
        </select>
        <select
          value={filterCountry}
          onChange={(e) => setFilterCountry(e.target.value)}
          className="h-9 rounded-md border border-input bg-white px-3 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring min-w-[130px]"
        >
          <option value="Todos">Todos los países</option>
          <option value="Argentina">Argentina</option>
          <option value="Uruguay">Uruguay</option>
        </select>
      </div>

      {/* Result count */}
      <p className="text-[12px] text-gray-400 mb-4">
        {filtered.length} {filtered.length === 1 ? 'EV encontrada' : 'EVs encontradas'}
      </p>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <p className="text-sm font-medium text-gray-600">No se encontraron EVs</p>
          <p className="text-[12px] text-gray-400 mt-1">
            No se encontraron EVs con los filtros actuales.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((ev) => (
            <Link key={ev.id} href={`/ev/${ev.id}`}>
              <div className="bg-white rounded-xl border border-gray-100 p-5 hover:border-blue-200 hover:shadow-sm transition-all cursor-pointer">
                <div className="flex items-start justify-between mb-3">
                  <div className="min-w-0 flex-1 mr-3">
                    <h3 className="font-semibold text-gray-900 text-[14px] truncate">{ev.name}</h3>
                    <p className="text-[12px] text-gray-400">
                      {ev.region} · {ev.country}
                    </p>
                  </div>
                  <StatusBadge status={ev.status} />
                </div>

                {/* EWA score bar */}
                <div className="mb-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] text-gray-400">EWA {new Date().getFullYear()}</span>
                    <span
                      className="text-[12px] font-medium"
                      style={{ color: getEWAColor(ev.latestEwa?.score) }}
                    >
                      {ev.latestEwa?.score != null
                        ? ev.latestEwa.score.toFixed(1)
                        : 'Sin eval.'}
                    </span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${((ev.latestEwa?.score ?? 0) / 4) * 100}%`,
                        backgroundColor: getEWAColor(ev.latestEwa?.score),
                      }}
                    />
                  </div>
                </div>

                {/* Leader */}
                {ev.leaderName && (
                  <p className="text-[12px] text-gray-600 mb-2">
                    <span className="text-gray-400">Líder:</span> {ev.leaderName}
                  </p>
                )}

                {/* Stats row */}
                <div className="flex items-center gap-4 text-[11px] text-gray-400 mt-3 pt-3 border-t border-gray-50">
                  <span>{ev.totalVolunteers} voluntarios</span>
                  <span>Sending: {ev.sendingTotal}</span>
                  {ev.hostingSummary && (
                    <span>Hosting: {ev.hostingSummary.totalQuota}</span>
                  )}
                </div>

                {/* Tags */}
                {ev.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {ev.tags.map((t) => (
                      <span
                        key={t.tagId}
                        className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-500"
                      >
                        {t.tag.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
