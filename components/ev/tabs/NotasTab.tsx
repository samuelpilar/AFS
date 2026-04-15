'use client'

import { useState } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
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
import { formatDate } from '@/lib/utils'

interface EVNote {
  id: number
  title: string
  content: string
  createdAt: Date
  updatedAt: Date
}

interface NotasTabProps {
  evId: number
  notes: EVNote[]
}

interface FormState {
  title: string
  content: string
}

export function NotasTab({ evId, notes: initialNotes }: NotasTabProps) {
  const [notes, setNotes] = useState<EVNote[]>(initialNotes)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingNote, setEditingNote] = useState<EVNote | null>(null)
  const [form, setForm] = useState<FormState>({ title: '', content: '' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function openAdd() {
    setEditingNote(null)
    setForm({ title: '', content: '' })
    setError(null)
    setDialogOpen(true)
  }

  function openEdit(note: EVNote) {
    setEditingNote(note)
    setForm({ title: note.title, content: note.content })
    setError(null)
    setDialogOpen(true)
  }

  async function saveNote() {
    if (!form.title.trim() || !form.content.trim()) {
      setError('El título y el contenido son obligatorios.')
      return
    }
    setSaving(true)
    setError(null)
    try {
      if (editingNote) {
        const res = await fetch(`/api/evs/${evId}/notes/${editingNote.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        })
        if (!res.ok) throw new Error()
        const updated: EVNote = await res.json()
        setNotes((prev) => prev.map((n) => (n.id === editingNote.id ? updated : n)))
      } else {
        const res = await fetch(`/api/evs/${evId}/notes`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        })
        if (!res.ok) throw new Error()
        const created: EVNote = await res.json()
        setNotes((prev) => [created, ...prev])
      }
      setDialogOpen(false)
    } catch {
      setError('No se pudo guardar la nota.')
    } finally {
      setSaving(false)
    }
  }

  async function deleteNote(id: number) {
    if (!confirm('¿Eliminar esta nota?')) return
    try {
      const res = await fetch(`/api/evs/${evId}/notes/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      setNotes((prev) => prev.filter((n) => n.id !== id))
    } catch {
      alert('No se pudo eliminar la nota.')
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-700">Notas</h3>
        <Button size="sm" onClick={openAdd}>
          <Plus className="h-4 w-4 mr-1" />
          Nueva nota
        </Button>
      </div>

      {notes.length === 0 ? (
        <div className="text-center py-12 text-gray-400 text-sm">
          No hay notas registradas aún.
        </div>
      ) : (
        <div className="space-y-3">
          {notes.map((note) => (
            <div
              key={note.id}
              className="bg-white rounded-xl border border-gray-100 p-4 hover:border-gray-200 transition-colors"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-sm font-semibold text-gray-900 truncate">{note.title}</h4>
                  </div>
                  <p className="text-sm text-gray-600 whitespace-pre-wrap leading-relaxed">
                    {note.content}
                  </p>
                  <p className="text-[11px] text-gray-400 mt-2">
                    {formatDate(note.createdAt)}
                    {note.updatedAt !== note.createdAt && (
                      <span className="ml-1">(editado {formatDate(note.updatedAt)})</span>
                    )}
                  </p>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={() => openEdit(note)}
                    className="p-1.5 rounded-md hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => deleteNote(note.id)}
                    className="p-1.5 rounded-md hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit dialog */}
      <Dialog open={dialogOpen} onOpenChange={(open: boolean) => !open && setDialogOpen(false)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingNote ? 'Editar nota' : 'Nueva nota'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label>Título</Label>
              <Input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Título de la nota..."
              />
            </div>
            <div className="space-y-1.5">
              <Label>Contenido</Label>
              <Textarea
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                placeholder="Escribí el contenido de la nota..."
                className="min-h-[140px]"
              />
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={saveNote}
              disabled={saving || !form.title.trim() || !form.content.trim()}
            >
              {saving ? 'Guardando...' : editingNote ? 'Guardar cambios' : 'Crear nota'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
