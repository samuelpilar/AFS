'use client'

import { useState } from 'react'
import { Plus, Pencil } from 'lucide-react'
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
} from 'recharts'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { getEWAColor, getEWABadgeClasses } from '@/lib/utils'

interface EWA {
  id: number
  year: number
  score: number | null
  sending: number | null
  preparation: number | null
  hosting: number | null
  devVolunt: number | null
  leadership: number | null
  communityEd: number | null
  finances: number | null
  marketing: number | null
  rrii: number | null
  notes: string
}

interface EWATabProps {
  evId: number
  ewa: EWA[]
}

type EWAField = 'sending' | 'preparation' | 'hosting' | 'devVolunt' | 'leadership' | 'communityEd' | 'finances' | 'marketing' | 'rrii'

const EWA_FIELDS: { key: EWAField; label: string }[] = [
  { key: 'sending', label: 'Sending' },
  { key: 'preparation', label: 'Preparación' },
  { key: 'hosting', label: 'Hosting' },
  { key: 'devVolunt', label: 'Des. Voluntarios' },
  { key: 'leadership', label: 'Liderazgo' },
  { key: 'communityEd', label: 'Ed. Comunitaria' },
  { key: 'finances', label: 'Finanzas' },
  { key: 'marketing', label: 'Marketing' },
  { key: 'rrii', label: 'RRII' },
]

interface FormState {
  year: string
  score: string
  notes: string
  sending: string
  preparation: string
  hosting: string
  devVolunt: string
  leadership: string
  communityEd: string
  finances: string
  marketing: string
  rrii: string
}

function ewaToForm(ewa?: Partial<EWA>): FormState {
  return {
    year: ewa?.year?.toString() ?? new Date().getFullYear().toString(),
    score: ewa?.score?.toString() ?? '',
    notes: ewa?.notes ?? '',
    sending: ewa?.sending?.toString() ?? '',
    preparation: ewa?.preparation?.toString() ?? '',
    hosting: ewa?.hosting?.toString() ?? '',
    devVolunt: ewa?.devVolunt?.toString() ?? '',
    leadership: ewa?.leadership?.toString() ?? '',
    communityEd: ewa?.communityEd?.toString() ?? '',
    finances: ewa?.finances?.toString() ?? '',
    marketing: ewa?.marketing?.toString() ?? '',
    rrii: ewa?.rrii?.toString() ?? '',
  }
}

function parseFloatOrNull(val: string): number | null {
  const n = parseFloat(val)
  return isNaN(n) ? null : n
}

export function EWATab({ evId, ewa: initialEwa }: EWATabProps) {
  const [records, setRecords] = useState<EWA[]>(initialEwa)
  const [editingRecord, setEditingRecord] = useState<EWA | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [isAdding, setIsAdding] = useState(false)
  const [form, setForm] = useState<FormState>(ewaToForm())
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const latest = records[0] ?? null

  const radarData = latest
    ? EWA_FIELDS.map(({ key, label }) => ({
        subject: label,
        value: latest[key] ?? 0,
      }))
    : []

  function openEdit(record: EWA) {
    setEditingRecord(record)
    setForm(ewaToForm(record))
    setIsAdding(false)
    setError(null)
    setDialogOpen(true)
  }

  function openAdd() {
    setEditingRecord(null)
    setForm(ewaToForm())
    setIsAdding(true)
    setError(null)
    setDialogOpen(true)
  }

  async function saveRecord() {
    setSaving(true)
    setError(null)
    try {
      const body = {
        year: parseInt(form.year),
        score: parseFloatOrNull(form.score),
        notes: form.notes,
        sending: parseFloatOrNull(form.sending),
        preparation: parseFloatOrNull(form.preparation),
        hosting: parseFloatOrNull(form.hosting),
        devVolunt: parseFloatOrNull(form.devVolunt),
        leadership: parseFloatOrNull(form.leadership),
        communityEd: parseFloatOrNull(form.communityEd),
        finances: parseFloatOrNull(form.finances),
        marketing: parseFloatOrNull(form.marketing),
        rrii: parseFloatOrNull(form.rrii),
      }

      if (isAdding) {
        const res = await fetch(`/api/evs/${evId}/ewa`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        })
        if (!res.ok) throw new Error()
        const created: EWA = await res.json()
        setRecords((prev) => [created, ...prev].sort((a, b) => b.year - a.year))
      } else if (editingRecord) {
        const res = await fetch(`/api/evs/${evId}/ewa/${editingRecord.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        })
        if (!res.ok) throw new Error()
        const updated: EWA = await res.json()
        setRecords((prev) =>
          prev.map((r) => (r.id === editingRecord.id ? updated : r))
        )
      }
      setDialogOpen(false)
    } catch {
      setError('No se pudo guardar la evaluación.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-700">Evaluaciones EWA</h3>
        <Button size="sm" onClick={openAdd}>
          <Plus className="h-4 w-4 mr-1" />
          Nueva evaluación
        </Button>
      </div>

      {/* Latest EWA radar chart */}
      {latest && (
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-[12px] text-gray-400">Evaluación más reciente</p>
              <p className="text-sm font-semibold text-gray-900">EWA {latest.year}</p>
            </div>
            <div className="flex items-center gap-2">
              {latest.score != null && (
                <span
                  className={`text-sm font-semibold px-3 py-1 rounded-full ${getEWABadgeClasses(latest.score)}`}
                >
                  {latest.score.toFixed(2)}
                </span>
              )}
              <button
                onClick={() => openEdit(latest)}
                className="p-1.5 rounded-md hover:bg-gray-100 text-gray-400 hover:text-gray-700"
              >
                <Pencil className="h-4 w-4" />
              </button>
            </div>
          </div>

          {radarData.some((d) => d.value > 0) && (
            <ResponsiveContainer width="100%" height={280}>
              <RadarChart data={radarData}>
                <PolarGrid />
                <PolarAngleAxis
                  dataKey="subject"
                  tick={{ fontSize: 11, fill: '#9ca3af' }}
                />
                <Radar
                  dataKey="value"
                  stroke={getEWAColor(latest.score)}
                  fill={getEWAColor(latest.score)}
                  fillOpacity={0.2}
                  strokeWidth={2}
                />
              </RadarChart>
            </ResponsiveContainer>
          )}

          {/* Dimension scores */}
          <div className="grid grid-cols-3 gap-2 mt-4">
            {EWA_FIELDS.map(({ key, label }) => (
              <div key={key} className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-gray-50">
                <span className="text-[11px] text-gray-500">{label}</span>
                <span
                  className="text-[12px] font-semibold"
                  style={{ color: getEWAColor(latest[key]) }}
                >
                  {latest[key] != null ? latest[key]!.toFixed(1) : '—'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All records table */}
      {records.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wide px-4 py-3">Año</th>
                <th className="text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wide px-4 py-3">Score</th>
                {EWA_FIELDS.map(({ key, label }) => (
                  <th key={key} className="text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wide px-3 py-3">
                    {label}
                  </th>
                ))}
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {records.map((r) => (
                <tr key={r.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-medium">{r.year}</td>
                  <td className="px-4 py-3">
                    {r.score != null ? (
                      <span
                        className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${getEWABadgeClasses(r.score)}`}
                      >
                        {r.score.toFixed(2)}
                      </span>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                  {EWA_FIELDS.map(({ key }) => (
                    <td key={key} className="px-3 py-3 text-[12px]" style={{ color: getEWAColor(r[key]) }}>
                      {r[key] != null ? r[key]!.toFixed(1) : '—'}
                    </td>
                  ))}
                  <td className="px-4 py-3">
                    <button
                      onClick={() => openEdit(r)}
                      className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-700"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {records.length === 0 && (
        <div className="text-center py-12 text-gray-400 text-sm">
          No hay evaluaciones EWA registradas aún.
        </div>
      )}

      {/* Add/Edit dialog */}
      <Dialog open={dialogOpen} onOpenChange={(open: boolean) => !open && setDialogOpen(false)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{isAdding ? 'Nueva evaluación EWA' : `Editar EWA ${editingRecord?.year}`}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3 max-h-[65vh] overflow-y-auto pr-1">
            <div className="space-y-1.5">
              <Label>Año</Label>
              <Input
                type="number"
                value={form.year}
                onChange={(e) => setForm({ ...form, year: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Score global</Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                max="4"
                value={form.score}
                onChange={(e) => setForm({ ...form, score: e.target.value })}
                placeholder="0.00 – 4.00"
              />
            </div>
            {EWA_FIELDS.map(({ key, label }) => (
              <div key={key} className="space-y-1.5">
                <Label>{label}</Label>
                <Input
                  type="number"
                  step="0.1"
                  min="0"
                  max="4"
                  value={form[key]}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                  placeholder="0.0 – 4.0"
                />
              </div>
            ))}
            <div className="col-span-2 space-y-1.5">
              <Label>Notas</Label>
              <Textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="Observaciones..."
                className="min-h-[60px]"
              />
            </div>
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={saveRecord} disabled={saving || !form.year.trim()}>
              {saving ? 'Guardando...' : 'Guardar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
