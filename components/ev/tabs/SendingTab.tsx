'use client'

import { useState } from 'react'
import { Plus, Pencil, Trash2, X, Check } from 'lucide-react'
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

interface Sending {
  id: number
  cycle: string
  students: number
  notes: string
}

interface SendingTabProps {
  evId: number
  sending: Sending[]
}

interface FormState {
  cycle: string
  students: string
  notes: string
}

const emptyForm = (): FormState => ({
  cycle: '',
  students: '0',
  notes: '',
})

function Sparkline({ data }: { data: number[] }) {
  if (data.length < 2) return null
  const max = Math.max(...data, 1)
  const w = 120
  const h = 32
  const step = w / (data.length - 1)
  const points = data
    .map((v, i) => `${i * step},${h - (v / max) * h}`)
    .join(' ')

  return (
    <svg width={w} height={h} className="text-blue-400">
      <polyline
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  )
}

export function SendingTab({ evId, sending: initialSending }: SendingTabProps) {
  const [records, setRecords] = useState<Sending[]>(initialSending)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editForm, setEditForm] = useState<FormState>(emptyForm())
  const [dialogOpen, setDialogOpen] = useState(false)
  const [addForm, setAddForm] = useState<FormState>(emptyForm())
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const totalStudents = records.reduce((sum, r) => sum + r.students, 0)
  const sparklineData = [...records].reverse().map((r) => r.students)

  function startEdit(s: Sending) {
    setEditingId(s.id)
    setEditForm({ cycle: s.cycle, students: s.students.toString(), notes: s.notes })
    setError(null)
  }

  async function saveEdit(id: number) {
    setSaving(true)
    setError(null)
    try {
      const res = await fetch(`/api/evs/${evId}/sending/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cycle: editForm.cycle,
          students: parseInt(editForm.students) || 0,
          notes: editForm.notes,
        }),
      })
      if (!res.ok) throw new Error()
      const updated: Sending = await res.json()
      setRecords((prev) => prev.map((r) => (r.id === id ? updated : r)))
      setEditingId(null)
    } catch {
      setError('No se pudo guardar el registro.')
    } finally {
      setSaving(false)
    }
  }

  async function deleteRecord(id: number) {
    if (!confirm('¿Eliminar este registro de sending?')) return
    try {
      const res = await fetch(`/api/evs/${evId}/sending/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      setRecords((prev) => prev.filter((r) => r.id !== id))
    } catch {
      alert('No se pudo eliminar el registro.')
    }
  }

  async function addRecord() {
    setSaving(true)
    setError(null)
    try {
      const res = await fetch(`/api/evs/${evId}/sending`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cycle: addForm.cycle,
          students: parseInt(addForm.students) || 0,
          notes: addForm.notes,
        }),
      })
      if (!res.ok) throw new Error()
      const created: Sending = await res.json()
      setRecords((prev) => [created, ...prev])
      setDialogOpen(false)
      setAddForm(emptyForm())
    } catch {
      setError('No se pudo crear el registro.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      {/* Header + totals */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <h3 className="text-sm font-semibold text-gray-700">Registros de Sending</h3>
          {records.length > 0 && (
            <div className="flex items-center gap-3">
              <span className="text-[12px] text-gray-400">
                Total acumulado:{' '}
                <span className="font-semibold text-gray-700">{totalStudents}</span>
              </span>
              <Sparkline data={sparklineData} />
            </div>
          )}
        </div>
        <Button
          size="sm"
          onClick={() => {
            setAddForm(emptyForm())
            setError(null)
            setDialogOpen(true)
          }}
        >
          <Plus className="h-4 w-4 mr-1" />
          Agregar ciclo
        </Button>
      </div>

      {records.length === 0 ? (
        <div className="text-center py-12 text-gray-400 text-sm">
          No hay registros de sending aún.
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wide px-4 py-3">Ciclo</th>
                <th className="text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wide px-4 py-3">Estudiantes</th>
                <th className="text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wide px-4 py-3">Notas</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {records.map((s) =>
                editingId === s.id ? (
                  <tr key={s.id} className="border-b border-gray-100 bg-blue-50/30">
                    <td className="px-4 py-2">
                      <Input
                        value={editForm.cycle}
                        onChange={(e) => setEditForm({ ...editForm, cycle: e.target.value })}
                        className="h-7 w-28 text-xs"
                        placeholder="Ej: 2025-1"
                      />
                    </td>
                    <td className="px-4 py-2">
                      <Input
                        type="number"
                        value={editForm.students}
                        onChange={(e) => setEditForm({ ...editForm, students: e.target.value })}
                        className="h-7 w-20 text-xs"
                      />
                    </td>
                    <td className="px-4 py-2">
                      <Input
                        value={editForm.notes}
                        onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                        className="h-7 text-xs"
                        placeholder="Notas..."
                      />
                    </td>
                    <td className="px-4 py-2">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => saveEdit(s.id)}
                          disabled={saving}
                          className="p-1 rounded hover:bg-green-100 text-green-600"
                        >
                          <Check className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="p-1 rounded hover:bg-gray-100 text-gray-400"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  <tr key={s.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-medium">{s.cycle}</td>
                    <td className="px-4 py-3">
                      <span className="font-semibold">{s.students}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-[12px] max-w-[200px] truncate">
                      {s.notes || '—'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => startEdit(s)}
                          className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-700"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => deleteRecord(s.id)}
                          className="p-1 rounded hover:bg-red-50 text-gray-400 hover:text-red-600"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
          {error && <p className="px-4 py-2 text-sm text-red-500">{error}</p>}
        </div>
      )}

      {/* Add dialog */}
      <Dialog open={dialogOpen} onOpenChange={(open: boolean) => !open && setDialogOpen(false)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Agregar ciclo de sending</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label>Ciclo</Label>
              <Input
                value={addForm.cycle}
                onChange={(e) => setAddForm({ ...addForm, cycle: e.target.value })}
                placeholder="Ej: 2025-1, Primer semestre 2025..."
              />
            </div>
            <div className="space-y-1.5">
              <Label>Cantidad de estudiantes</Label>
              <Input
                type="number"
                min={0}
                value={addForm.students}
                onChange={(e) => setAddForm({ ...addForm, students: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Notas</Label>
              <Textarea
                value={addForm.notes}
                onChange={(e) => setAddForm({ ...addForm, notes: e.target.value })}
                placeholder="Observaciones opcionales..."
                className="min-h-[60px]"
              />
            </div>
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={addRecord} disabled={saving || !addForm.cycle.trim()}>
              {saving ? 'Guardando...' : 'Agregar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
