'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ExternalLink } from 'lucide-react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { getDaysUntilDate, formatDate } from '@/lib/utils'
import { CoordinacionesTab } from '@/components/ev/tabs/CoordinacionesTab'
import { HostingTab } from '@/components/ev/tabs/HostingTab'
import { SendingTab } from '@/components/ev/tabs/SendingTab'
import { EWATab } from '@/components/ev/tabs/EWATab'
import { NotasTab } from '@/components/ev/tabs/NotasTab'

interface CatalogItem {
  id: number
  type: string
  key: string
  label: string
  color: string | null
  sortOrder: number
  isActive: boolean
}

interface TeamMember {
  id: number
  name: string
  role: string | null
  email: string | null
  phone: string | null
  coordinatorId: number | null
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

interface Sending {
  id: number
  cycle: string
  students: number
  notes: string
}

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

interface EVNote {
  id: number
  title: string
  content: string
  createdAt: Date
  updatedAt: Date
}

interface EVTag {
  tagId: number
  tag: { id: number; name: string; color: string | null }
}

interface EV {
  id: number
  name: string
  region: string
  country: string
  status: string
  leaderName: string | null
  leaderRole: string | null
  electionDate: Date | null
  totalVolunteers: number
  idoneidad: boolean
  planAnual: boolean
  visitaPlanif: boolean
  visitaRealizada: boolean
  hosting: Hosting[]
  sending: Sending[]
  ewa: EWA[]
  coordinators: Coordinator[]
  teamMembers: TeamMember[]
  notes: EVNote[]
  tags: EVTag[]
}

interface EVDetailClientProps {
  ev: EV
  coordinationAreas: CatalogItem[]
}

function getMandateProgressColor(daysRemaining: number): string {
  const totalDays = 365 * 2
  const ratio = daysRemaining / totalDays
  if (ratio > 0.5) return '#16a34a'
  if (ratio > 0.25) return '#d97706'
  return '#dc2626'
}

function GeneralTab({ ev }: { ev: EV }) {
  const [form, setForm] = useState({
    name: ev.name,
    region: ev.region,
    country: ev.country,
    status: ev.status,
    leaderName: ev.leaderName ?? '',
    leaderRole: ev.leaderRole ?? '',
    electionDate: ev.electionDate
      ? new Date(ev.electionDate).toISOString().split('T')[0]
      : '',
    totalVolunteers: ev.totalVolunteers,
    idoneidad: ev.idoneidad,
    planAnual: ev.planAnual,
    visitaPlanif: ev.visitaPlanif,
    visitaRealizada: ev.visitaRealizada,
  })
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Mandate countdown
  let mandateDaysRemaining: number | null = null
  let mandateProgress = 0
  let mandateProgressColor = '#6b7280'

  if (form.electionDate) {
    const electionDate = new Date(form.electionDate)
    const mandateEnd = new Date(electionDate)
    mandateEnd.setFullYear(mandateEnd.getFullYear() + 2)
    const daysUntilEnd = getDaysUntilDate(mandateEnd)
    if (daysUntilEnd !== null && daysUntilEnd > 0) {
      mandateDaysRemaining = daysUntilEnd
      mandateProgress = Math.min(100, (daysUntilEnd / (365 * 2)) * 100)
      mandateProgressColor = getMandateProgressColor(daysUntilEnd)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setMessage(null)
    try {
      const res = await fetch(`/api/evs/${ev.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error('Error al guardar')
      setMessage({ type: 'success', text: 'Cambios guardados correctamente.' })
    } catch {
      setMessage({ type: 'error', text: 'No se pudo guardar. Intente nuevamente.' })
    } finally {
      setSaving(false)
      setTimeout(() => setMessage(null), 4000)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
      {/* Basic info */}
      <div className="bg-white rounded-xl border border-gray-100 p-5 space-y-4">
        <h3 className="text-sm font-semibold text-gray-700">Información básica</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2 space-y-1.5">
            <Label htmlFor="name">Nombre</Label>
            <Input
              id="name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="region">Región</Label>
            <Input
              id="region"
              value={form.region}
              onChange={(e) => setForm({ ...form, region: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="country">País</Label>
            <select
              id="country"
              value={form.country}
              onChange={(e) => setForm({ ...form, country: e.target.value })}
              className="flex h-9 w-full rounded-md border border-input bg-white px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="Argentina">Argentina</option>
              <option value="Uruguay">Uruguay</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="status">Estado</Label>
            <select
              id="status"
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              className="flex h-9 w-full rounded-md border border-input bg-white px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="Activa">Activa</option>
              <option value="Asistida">Asistida</option>
              <option value="Grupo en Desarrollo">Grupo en Desarrollo</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="totalVolunteers">Total de voluntarios</Label>
            <Input
              id="totalVolunteers"
              type="number"
              min={0}
              value={form.totalVolunteers}
              onChange={(e) =>
                setForm({ ...form, totalVolunteers: parseInt(e.target.value) || 0 })
              }
            />
          </div>
        </div>
      </div>

      {/* Leader */}
      <div className="bg-white rounded-xl border border-gray-100 p-5 space-y-4">
        <h3 className="text-sm font-semibold text-gray-700">Liderazgo</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="leaderName">Nombre del líder</Label>
            <Input
              id="leaderName"
              value={form.leaderName}
              onChange={(e) => setForm({ ...form, leaderName: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="leaderRole">Rol</Label>
            <Input
              id="leaderRole"
              value={form.leaderRole}
              onChange={(e) => setForm({ ...form, leaderRole: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="electionDate">Fecha de elección</Label>
            <Input
              id="electionDate"
              type="date"
              value={form.electionDate}
              onChange={(e) => setForm({ ...form, electionDate: e.target.value })}
            />
          </div>
        </div>

        {/* Mandate countdown */}
        {mandateDaysRemaining !== null && (
          <div className="mt-3 p-3 rounded-lg bg-gray-50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[12px] text-gray-500">Días restantes de mandato</span>
              <span className="text-[12px] font-medium" style={{ color: mandateProgressColor }}>
                {mandateDaysRemaining} días
              </span>
            </div>
            <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${mandateProgress}%`, backgroundColor: mandateProgressColor }}
              />
            </div>
            {form.electionDate && (
              <p className="text-[11px] text-gray-400 mt-1.5">
                Vence:{' '}
                {formatDate(
                  new Date(
                    new Date(form.electionDate).setFullYear(
                      new Date(form.electionDate).getFullYear() + 2
                    )
                  )
                )}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Checklist */}
      <div className="bg-white rounded-xl border border-gray-100 p-5 space-y-4">
        <h3 className="text-sm font-semibold text-gray-700">Estado de la EV</h3>
        <div className="grid grid-cols-2 gap-3">
          {(
            [
              { key: 'idoneidad', label: 'Idoneidad' },
              { key: 'planAnual', label: 'Plan Anual' },
              { key: 'visitaPlanif', label: 'Visita Planificada' },
              { key: 'visitaRealizada', label: 'Visita Realizada' },
            ] as const
          ).map(({ key, label }) => (
            <label
              key={key}
              className="flex items-center gap-2.5 cursor-pointer select-none"
            >
              <input
                type="checkbox"
                checked={form[key]}
                onChange={(e) => setForm({ ...form, [key]: e.target.checked })}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">{label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Save */}
      <div className="flex items-center gap-3">
        <Button type="submit" disabled={saving}>
          {saving ? 'Guardando...' : 'Guardar cambios'}
        </Button>
        {message && (
          <span
            className={`text-sm ${
              message.type === 'success' ? 'text-emerald-600' : 'text-red-600'
            }`}
          >
            {message.text}
          </span>
        )}
      </div>
    </form>
  )
}

export function EVDetailClient({ ev, coordinationAreas }: EVDetailClientProps) {
  return (
    <Tabs defaultValue="general">
      <TabsList className="mb-2">
        <TabsTrigger value="general">General</TabsTrigger>
        <TabsTrigger value="coordinaciones">Coordinaciones</TabsTrigger>
        <TabsTrigger value="hosting">Hosting</TabsTrigger>
        <TabsTrigger value="sending">Sending</TabsTrigger>
        <TabsTrigger value="ewa">EWA</TabsTrigger>
        <TabsTrigger value="organigrama">Organigrama</TabsTrigger>
        <TabsTrigger value="notas">Notas</TabsTrigger>
      </TabsList>

      <TabsContent value="general">
        <GeneralTab ev={ev} />
      </TabsContent>

      <TabsContent value="coordinaciones">
        <CoordinacionesTab
          evId={ev.id}
          coordinators={ev.coordinators}
          coordinationAreas={coordinationAreas}
        />
      </TabsContent>

      <TabsContent value="hosting">
        <HostingTab evId={ev.id} hosting={ev.hosting} />
      </TabsContent>

      <TabsContent value="sending">
        <SendingTab evId={ev.id} sending={ev.sending} />
      </TabsContent>

      <TabsContent value="ewa">
        <EWATab evId={ev.id} ewa={ev.ewa} />
      </TabsContent>

      <TabsContent value="organigrama">
        <div className="bg-white rounded-xl border border-gray-100 p-8 max-w-sm">
          <h3 className="text-sm font-semibold text-gray-800 mb-2">Organigrama de la EV</h3>
          <p className="text-[13px] text-gray-500 mb-4">
            Visualizá la estructura completa de coordinaciones y miembros del equipo.
          </p>
          <Link
            href={`/ev/${ev.id}/organigrama`}
            className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            Abrir organigrama completo
            <ExternalLink className="h-4 w-4" />
          </Link>
        </div>
      </TabsContent>

      <TabsContent value="notas">
        <NotasTab evId={ev.id} notes={ev.notes} />
      </TabsContent>
    </Tabs>
  )
}
