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

interface HostingTabProps {
  evId: number
  hosting: Hosting[]
}

const STATUS_OPTIONS = ['Pendiente', 'Confirmado', 'Cancelado', 'Completo']

interface FormState {
  year: string
  totalQuota: string
  shQuota: string
  nhQuota: string
  shStatus: string
  nhStatus: string
  notes: string
}

const emptyForm = (): FormState => ({
  year: new Date().getFullYear().toString(),
  totalQuota: '0',
  shQuota: '0',
  nhQuota: '0',
  shStatus: 'Pendiente',
  nhStatus: 'Pendiente',
  notes: '',
})

function statusBadge(status: string) {
  const map: Record<string, string> = {
    Pendiente: 'bg-gray-100 text-gray-600',
    Confirmado: 'bg-green-50 text-green-700',
    Cancelado: 'bg-red-50 text-red-600',
    Completo: 'bg-blue-50 text-blue-700',
  }
  return (
    <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${map[status] ?? 'bg-gray-100 text-gray-600'}`}>
      {status}
    </span>
  )
}

export function HostingTab({ evId, hosting: initialHosting }: HostingTabProps) {
  const [records, setRecords] = useState<Hosting[]>(initialHosting)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editForm, setEditForm] = useState<FormState>(emptyForm())
  const [dialogOpen, setDialogOpen] = useState(false)
  const [addForm, setAddForm] = useState<FormState>(emptyForm())
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function startEdit(h: Hosting) {
    setEditingId(h.id)
    setEditForm({
      year: h.year.toString(),
      totalQuota: h.totalQuota.toString(),
      shQuota: h.shQuota.toString(),
      nhQuota: h.nhQuota.toString(),
      shStatus: h.shStatus,
      nhStatus: h.nhStatus,
      notes: h.notes,
    })
    setError(null)
  }

  async function saveEdit(id: number) {
    setSaving(true)
    setError(null)
    try {
      const res = await fetch(`/api/evs/${evId}/hosting/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          year: parseInt(editForm.year),
          totalQuota: parseInt(editForm.totalQuota),
          shQuota: parseInt(editForm.shQuota),
          nhQuota: parseInt(editForm.nhQuota),
          shStatus: editForm.shStatus,
          nhStatus: editForm.nhStatus,
          notes: editForm.notes,
        }),
      })
      if (!res.ok) throw new Error('Error al guardar')
      const updated: Hosting = await res.json()
      setRecords((prev) => prev.map((r) => (r.id === id ? updated : r)))
      setEditingId(null)
    } catch {
      setError('No se pudo guardar el registro.')
    } finally {
      setSaving(false)
    }
  }

  async function deleteRecord(id: number) {
    if (!confirm('¿Eliminar este registro de hosting?')) return
    try {
      const res = await fetch(`/api/evs/${evId}/hosting/${id}`, { method: 'DELETE' })
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
      const res = await fetch(`/api/evs/${evId}/hosting`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          year: parseInt(addForm.year),
          totalQuota: parseInt(addForm.totalQuota),
          shQuota: parseInt(addForm.shQuota),
          nhQuota: parseInt(addForm.nhQuota),
          shStatus: addForm.shStatus,
          nhStatus: addForm.nhStatus,
          notes: addForm.notes,
        }),
      })
      if (!res.ok) throw new Error('Error al crear')
      const created: Hosting = await res.json()
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
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-700">Registros de Hosting</h3>
        <Button
          size="sm"
          onClick={() => {
            setAddForm(emptyForm())
            setError(null)
            setDialogOpen(true)
          }}
        >
          <Plus className="h-4 w-4 mr-1" />
          Agregar registro
        </Button>
      </div>

      {records.length === 0 ? (
        <div className="text-center py-12 text-gray-400 text-sm">
          No hay registros de hosting aún.
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wide px-4 py-3">Año</th>
                <th className="text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wide px-4 py-3">Total Cupo</th>
                <th className="text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wide px-4 py-3">SH Cupo</th>
                <th className="text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wide px-4 py-3">NH Cupo</th>
                <th className="text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wide px-4 py-3">SH Estado</th>
                <th className="text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wide px-4 py-3">NH Estado</th>
                <th className="text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wide px-4 py-3">Notas</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {records.map((h) =>
                editingId === h.id ? (
                  <tr key={h.id} className="border-b border-gray-100 bg-blue-50/30">
                    <td className="px-4 py-2">
                      <Input
                        type="number"
                        value={editForm.year}
                        onChange={(e) => setEditForm({ ...editForm, year: e.target.value })}
                        className="h-7 w-20 text-xs"
                      />
                    </td>
                    <td className="px-4 py-2">
                      <Input
                        type="number"
                        value={editForm.totalQuota}
                        onChange={(e) => setEditForm({ ...editForm, totalQuota: e.target.value })}
                        className="h-7 w-20 text-xs"
                      />
                    </td>
                    <td className="px-4 py-2">
                      <Input
                        type="number"
                        value={editForm.shQuota}
                        onChange={(e) => setEditForm({ ...editForm, shQuota: e.target.value })}
                        className="h-7 w-20 text-xs"
                      />
                    </td>
                    <td className="px-4 py-2">
                      <Input
                        type="number"
                        value={editForm.nhQuota}
                        onChange={(e) => setEditForm({ ...editForm, nhQuota: e.target.value })}
                        className="h-7 w-20 text-xs"
                      />
                    </td>
                    <td className="px-4 py-2">
                      <select
                        value={editForm.shStatus}
                        onChange={(e) => setEditForm({ ...editForm, shStatus: e.target.value })}
                        className="h-7 rounded border border-input bg-white px-2 text-xs"
                      >
                        {STATUS_OPTIONS.map((s) => (
                          <option key={s}>{s}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-2">
                      <select
                        value={editForm.nhStatus}
                        onChange={(e) => setEditForm({ ...editForm, nhStatus: e.target.value })}
                        className="h-7 rounded border border-input bg-white px-2 text-xs"
                      >
                        {STATUS_OPTIONS.map((s) => (
                          <option key={s}>{s}</option>
                        ))}
                      </select>
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
                          onClick={() => saveEdit(h.id)}
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
                  <tr key={h.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-medium">{h.year}</td>
                    <td className="px-4 py-3">{h.totalQuota}</td>
                    <td className="px-4 py-3">{h.shQuota}</td>
                    <td className="px-4 py-3">{h.nhQuota}</td>
                    <td className="px-4 py-3">{statusBadge(h.shStatus)}</td>
                    <td className="px-4 py-3">{statusBadge(h.nhStatus)}</td>
                    <td className="px-4 py-3 text-gray-500 text-[12px] max-w-[160px] truncate">
                      {h.notes || '—'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => startEdit(h)}
                          className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-700"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => deleteRecord(h.id)}
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
            <DialogTitle>Agregar registro de hosting</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Año</Label>
              <Input
                type="number"
                value={addForm.year}
                onChange={(e) => setAddForm({ ...addForm, year: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Total Cupo</Label>
              <Input
                type="number"
                value={addForm.totalQuota}
                onChange={(e) => setAddForm({ ...addForm, totalQuota: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label>SH Cupo</Label>
              <Input
                type="number"
                value={addForm.shQuota}
                onChange={(e) => setAddForm({ ...addForm, shQuota: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label>NH Cupo</Label>
              <Input
                type="number"
                value={addForm.nhQuota}
                onChange={(e) => setAddForm({ ...addForm, nhQuota: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label>SH Estado</Label>
              <select
                value={addForm.shStatus}
                onChange={(e) => setAddForm({ ...addForm, shStatus: e.target.value })}
                className="flex h-9 w-full rounded-md border border-input bg-white px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                {STATUS_OPTIONS.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label>NH Estado</Label>
              <select
                value={addForm.nhStatus}
                onChange={(e) => setAddForm({ ...addForm, nhStatus: e.target.value })}
                className="flex h-9 w-full rounded-md border border-input bg-white px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                {STATUS_OPTIONS.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div className="col-span-2 space-y-1.5">
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
            <Button onClick={addRecord} disabled={saving}>
              {saving ? 'Guardando...' : 'Agregar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
