'use client'

import { useState } from 'react'
import { Plus, Pencil, UserPlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { formatDate, getInitials } from '@/lib/utils'

interface CatalogItem {
  id: number
  key: string
  label: string
}

interface TeamMember {
  id: number
  name: string
  role: string | null
  email: string | null
  phone: string | null
}

interface Coordinator {
  id: number
  area: string
  name: string
  email: string | null
  phone: string | null
  since: Date | null
  teamMembers: TeamMember[]
}

interface CoordinacionesTabProps {
  evId: number
  coordinators: Coordinator[]
  coordinationAreas: CatalogItem[]
}

interface CoordFormState {
  name: string
  email: string
  phone: string
  since: string
}

interface MemberFormState {
  name: string
  role: string
  email: string
  phone: string
}

function CoordCard({
  area,
  coordinator,
  onEdit,
  onAddMember,
}: {
  area: CatalogItem
  coordinator: Coordinator | undefined
  onEdit: () => void
  onAddMember: () => void
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 flex flex-col gap-3">
      <div className="flex items-start justify-between">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">
            {area.label}
          </p>
          {coordinator ? (
            <>
              <p className="text-sm font-semibold text-gray-900 mt-0.5">{coordinator.name}</p>
              {coordinator.email && (
                <p className="text-[11px] text-gray-400 truncate">{coordinator.email}</p>
              )}
              {coordinator.phone && (
                <p className="text-[11px] text-gray-400">{coordinator.phone}</p>
              )}
              {coordinator.since && (
                <p className="text-[11px] text-gray-400">
                  Desde {formatDate(coordinator.since)}
                </p>
              )}
            </>
          ) : (
            <p className="text-sm text-gray-400 mt-0.5 italic">Sin asignar</p>
          )}
        </div>
        <button
          onClick={onEdit}
          className="p-1.5 rounded-md hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors flex-shrink-0"
        >
          <Pencil className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Team members */}
      {coordinator && coordinator.teamMembers.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {coordinator.teamMembers.map((m) => (
            <div
              key={m.id}
              title={`${m.name}${m.role ? ` · ${m.role}` : ''}`}
              className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 text-[10px] font-semibold flex items-center justify-center cursor-default"
            >
              {getInitials(m.name)}
            </div>
          ))}
        </div>
      )}

      {coordinator && (
        <button
          onClick={onAddMember}
          className="flex items-center gap-1 text-[11px] text-blue-500 hover:text-blue-700 transition-colors"
        >
          <UserPlus className="h-3.5 w-3.5" />
          Agregar miembro
        </button>
      )}
    </div>
  )
}

export function CoordinacionesTab({
  evId,
  coordinators: initialCoordinators,
  coordinationAreas,
}: CoordinacionesTabProps) {
  const [coordinators, setCoordinators] = useState<Coordinator[]>(initialCoordinators)
  const [editingArea, setEditingArea] = useState<CatalogItem | null>(null)
  const [addingMemberCoord, setAddingMemberCoord] = useState<Coordinator | null>(null)
  const [coordForm, setCoordForm] = useState<CoordFormState>({
    name: '',
    email: '',
    phone: '',
    since: '',
  })
  const [memberForm, setMemberForm] = useState<MemberFormState>({
    name: '',
    role: '',
    email: '',
    phone: '',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function openEdit(area: CatalogItem) {
    const coord = coordinators.find((c) => c.area === area.key)
    setCoordForm({
      name: coord?.name ?? '',
      email: coord?.email ?? '',
      phone: coord?.phone ?? '',
      since: coord?.since ? new Date(coord.since).toISOString().split('T')[0] : '',
    })
    setEditingArea(area)
    setError(null)
  }

  async function saveCoordinator() {
    if (!editingArea) return
    setSaving(true)
    setError(null)
    try {
      const existing = coordinators.find((c) => c.area === editingArea.key)
      const url = existing
        ? `/api/evs/${evId}/coordinators/${existing.id}`
        : `/api/evs/${evId}/coordinators`
      const method = existing ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...coordForm, area: editingArea.key }),
      })
      if (!res.ok) throw new Error('Error al guardar')
      const updated: Coordinator = await res.json()

      setCoordinators((prev) =>
        existing
          ? prev.map((c) =>
              c.id === existing.id
                ? { ...updated, teamMembers: existing.teamMembers }
                : c
            )
          : [...prev, { ...updated, teamMembers: [] }]
      )
      setEditingArea(null)
    } catch {
      setError('No se pudo guardar el coordinador.')
    } finally {
      setSaving(false)
    }
  }

  async function saveMember() {
    if (!addingMemberCoord) return
    setSaving(true)
    setError(null)
    try {
      const res = await fetch(
        `/api/evs/${evId}/coordinators/${addingMemberCoord.id}/members`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(memberForm),
        }
      )
      if (!res.ok) throw new Error('Error al agregar miembro')
      const newMember: TeamMember = await res.json()

      setCoordinators((prev) =>
        prev.map((c) =>
          c.id === addingMemberCoord.id
            ? { ...c, teamMembers: [...c.teamMembers, newMember] }
            : c
        )
      )
      setAddingMemberCoord(null)
      setMemberForm({ name: '', role: '', email: '', phone: '' })
    } catch {
      setError('No se pudo agregar el miembro.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <div className="grid grid-cols-3 gap-4">
        {coordinationAreas.map((area) => {
          const coord = coordinators.find((c) => c.area === area.key)
          return (
            <CoordCard
              key={area.key}
              area={area}
              coordinator={coord}
              onEdit={() => openEdit(area)}
              onAddMember={() => {
                if (coord) {
                  setAddingMemberCoord(coord)
                  setMemberForm({ name: '', role: '', email: '', phone: '' })
                  setError(null)
                }
              }}
            />
          )
        })}
      </div>

      {/* Edit coordinator dialog */}
      <Dialog open={!!editingArea} onOpenChange={(open: boolean) => !open && setEditingArea(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingArea
                ? `${coordinators.find((c) => c.area === editingArea.key) ? 'Editar' : 'Asignar'} coordinador · ${editingArea.label}`
                : ''}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label>Nombre</Label>
              <Input
                value={coordForm.name}
                onChange={(e) => setCoordForm({ ...coordForm, name: e.target.value })}
                placeholder="Nombre completo"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Email</Label>
              <Input
                type="email"
                value={coordForm.email}
                onChange={(e) => setCoordForm({ ...coordForm, email: e.target.value })}
                placeholder="correo@ejemplo.com"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Teléfono</Label>
              <Input
                value={coordForm.phone}
                onChange={(e) => setCoordForm({ ...coordForm, phone: e.target.value })}
                placeholder="+54 9 ..."
              />
            </div>
            <div className="space-y-1.5">
              <Label>En el cargo desde</Label>
              <Input
                type="date"
                value={coordForm.since}
                onChange={(e) => setCoordForm({ ...coordForm, since: e.target.value })}
              />
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingArea(null)}>
              Cancelar
            </Button>
            <Button onClick={saveCoordinator} disabled={saving || !coordForm.name.trim()}>
              {saving ? 'Guardando...' : 'Guardar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add member dialog */}
      <Dialog
        open={!!addingMemberCoord}
        onOpenChange={(open: boolean) => !open && setAddingMemberCoord(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Agregar miembro de equipo</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label>Nombre</Label>
              <Input
                value={memberForm.name}
                onChange={(e) => setMemberForm({ ...memberForm, name: e.target.value })}
                placeholder="Nombre completo"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Rol</Label>
              <Input
                value={memberForm.role}
                onChange={(e) => setMemberForm({ ...memberForm, role: e.target.value })}
                placeholder="Ej: Asistente, Colaborador..."
              />
            </div>
            <div className="space-y-1.5">
              <Label>Email</Label>
              <Input
                type="email"
                value={memberForm.email}
                onChange={(e) => setMemberForm({ ...memberForm, email: e.target.value })}
                placeholder="correo@ejemplo.com"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Teléfono</Label>
              <Input
                value={memberForm.phone}
                onChange={(e) => setMemberForm({ ...memberForm, phone: e.target.value })}
                placeholder="+54 9 ..."
              />
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddingMemberCoord(null)}>
              Cancelar
            </Button>
            <Button onClick={saveMember} disabled={saving || !memberForm.name.trim()}>
              {saving ? 'Guardando...' : 'Agregar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
