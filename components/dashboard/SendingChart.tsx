'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'

interface SendingDataPoint {
  name: string
  total: number
}

interface SendingChartProps {
  data: SendingDataPoint[]
}

interface TooltipPayloadEntry {
  value: number
  name: string
}

interface CustomTooltipProps {
  active?: boolean
  payload?: TooltipPayloadEntry[]
  label?: string
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload || payload.length === 0) return null
  return (
    <div className="bg-white border border-gray-100 rounded-lg shadow-sm px-3 py-2 text-xs">
      <p className="font-medium text-gray-700 mb-0.5 max-w-[200px] truncate">{label}</p>
      <p className="text-blue-600 font-semibold">{payload[0].value} estudiantes</p>
    </div>
  )
}

export function SendingChart({ data }: SendingChartProps) {
  const sorted = [...data].sort((a, b) => b.total - a.total)

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5">
      <h2 className="text-sm font-semibold text-gray-900 mb-4">Envíos por EV</h2>

      {sorted.length === 0 ? (
        <div className="flex items-center justify-center h-[260px]">
          <p className="text-xs text-gray-400">Sin datos de envíos registrados.</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={260}>
          <BarChart
            data={sorted}
            margin={{ top: 4, right: 16, left: 0, bottom: 4 }}
          >
            <XAxis
              dataKey="name"
              tick={{ fontSize: 11, fill: '#9ca3af' }}
              axisLine={false}
              tickLine={false}
              interval={0}
              angle={-35}
              textAnchor="end"
              height={60}
            />
            <YAxis
              tick={{ fontSize: 11, fill: '#9ca3af' }}
              axisLine={false}
              tickLine={false}
              width={30}
            />
            <Tooltip
              content={<CustomTooltip />}
              cursor={{ fill: '#f9fafb' }}
            />
            <Bar dataKey="total" radius={[4, 4, 0, 0]} maxBarSize={40}>
              {sorted.map((_, index) => (
                <Cell key={`cell-${index}`} fill="#2563eb" />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
