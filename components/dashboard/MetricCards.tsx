'use client'

import { cn } from '@/lib/utils'

interface Stats {
  total: number
  activas: number
  asistidas: number
  enDesarrollo: number
}

interface MetricCardsProps {
  stats: Stats
  labels?: Record<string, string>
}

interface MetricCardProps {
  value: number
  label: string
  dotColor: string
  accentClass: string
}

function MetricCard({ value, label, dotColor, accentClass }: MetricCardProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5 flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <span
          className="inline-block w-2.5 h-2.5 rounded-full flex-shrink-0"
          style={{ backgroundColor: dotColor }}
        />
        <span className="text-xs text-gray-500 font-medium">{label}</span>
      </div>
      <span className={cn('text-3xl font-bold tracking-tight', accentClass)}>
        {value}
      </span>
    </div>
  )
}

export function MetricCards({ stats, labels }: MetricCardsProps) {
  const l = labels ?? {}

  const cards: MetricCardProps[] = [
    {
      value: stats.total,
      label: l['total_evs'] ?? 'Total EVs',
      dotColor: '#6b7280',
      accentClass: 'text-gray-900',
    },
    {
      value: stats.activas,
      label: l['activas'] ?? 'Activas',
      dotColor: '#16a34a',
      accentClass: 'text-green-700',
    },
    {
      value: stats.asistidas,
      label: l['asistidas'] ?? 'Asistidas',
      dotColor: '#2563eb',
      accentClass: 'text-blue-700',
    },
    {
      value: stats.enDesarrollo,
      label: l['en_desarrollo'] ?? 'En Desarrollo',
      dotColor: '#d97706',
      accentClass: 'text-amber-700',
    },
  ]

  return (
    <div className="grid grid-cols-4 gap-4">
      {cards.map((card) => (
        <MetricCard key={card.label} {...card} />
      ))}
    </div>
  )
}
