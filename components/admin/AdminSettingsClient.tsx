'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { ChevronUp, ChevronDown, Pencil, Trash2, Plus, Check, X, Loader2 } from 'lucide-react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

// ─── Types ──────────────────────────────────────────────────────────────────

interface AppSetting {
  id: number
  key: string
  value: unknown
  group: string
  label: string | null
}

interface CatalogItem {
  id: number
  type: string
  key: string
  label: string
  color: string | null
  sortOrder: number
  isActive: boolean
}

interface Props {
  settings: AppSetting[]
  evStatuses: CatalogItem[]
  coordinationAreas: CatalogItem[]
  hostingStatuses: CatalogItem[]
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function getSetting(settings: AppSetting[], key: string, fallback: unknown = '') {
  const s = settings.find((s) => s.key === key)
  return s ? s.value : fallback
}

function getStringVal(settings: AppSetting[], key: string, fallback = '') {
  const v = getSetting(settings, key, fallback)
  return typeof v === 'string' ? v : String(v ?? fallback)
}

function getNumberVal(settings: AppSetting[], key: string, fallback = 0) {
  const v = getSetting(settings, key, fallback)
  return typeof v === 'number' ? v : Number(v ?? fallback)
}

function getBoolVal(settings: AppSetting[], key: string, fallback = false) {
  const v = getSetting(settings, key, fallback)
  return typeof v === 'boolean' ? v : Boolean(v ?? fallback)
}

function getObjectVal(settings: AppSetting[], key: string, fallback: Record<string, string> = {}) {
  const v = getSetting(settings, key, fallback)
  return (typeof v === 'object' && v !== null && !Array.isArray(v))
    ? (v as Record<string, string>)
    : fallback
}

function getArrayVal(settings: AppSetting[], key: string, fallback: string[] = []) {
  const v = getSetting(settings, key, fallback)
  return Array.isArray(v) ? (v as string[]) : fallback
}

// ─── Save helper ────────────────────────────────────────────────────────────

async function saveSetting(key: string, value: unknown, group: string, label?: string) {
  const res = await fetch('/api/admin/settings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ key, value, group, label }),
  })
  if (!res.ok) throw new Error('Failed to save')
}

// ─── Feedback ───────────────────────────────────────────────────────────────

type FeedbackState = { type: 'success' | 'error'; message: string } | null

function useFeedback() {
  const [feedback, setFeedback] = useState<FeedbackState>(null)
  const show = (type: 'success' | 'error', message: string) => {
    setFeedback({ type, message })
    setTimeout(() => setFeedback(null), 3000)
  }
  return { feedback, show }
}

function FeedbackBanner({ feedback }: { feedback: FeedbackState }) {
  if (!feedback) return null
  return (
    <div
      className={cn(
        'flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm mb-4',
        feedback.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
      )}
    >
      {feedback.type === 'success' ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
      {feedback.message}
    </div>
  )
}

// ─── Setting Row ─────────────────────────────────────────────────────────────

function SettingRow({ label, keyName, children }: { label: string; keyName: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
      <div>
        <p className="text-sm font-medium text-gray-900">{label}</p>
        <p className="text-xs text-gray-400">{keyName}</p>
      </div>
      <div className="w-64">{children}</div>
    </div>
  )
}

// ─── Section wrapper ─────────────────────────────────────────────────────────

function Section({ title, children, action }: { title: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 mb-5">
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-50">
        <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
        {action}
      </div>
      <div className="px-5 divide-y divide-gray-50">{children}</div>
    </div>
  )
}

// ─── JSON Object Editor ──────────────────────────────────────────────────────

function JsonObjectEditor({
  value,
  onChange,
}: {
  value: Record<string, string>
  onChange: (v: Record<string, string>) => void
}) {
  return (
    <div className="space-y-2">
      {Object.entries(value).map(([k, v]) => (
        <div key={k} className="flex flex-col gap-0.5">
          <span className="text-[10px] text-gray-400 uppercase tracking-wide">{k}</span>
          <Input
            value={v}
            onChange={(e) => onChange({ ...value, [k]: e.target.value })}
            className="h-7 text-xs"
          />
        </div>
      ))}
    </div>
  )
}

// ─── Tab: Operacional ────────────────────────────────────────────────────────

function OperacionalTab({ settings }: { settings: AppSetting[] }) {
  const { feedback, show } = useFeedback()
  const [mandateMonths, setMandateMonths] = useState(getNumberVal(settings, 'mandate_alert_months', 3))
  const [activeYear, setActiveYear] = useState(getNumberVal(settings, 'active_year', 2025))
  const [sendingCycles, setSendingCycles] = useState(
    getArrayVal(settings, 'sending_cycles', ['2024-2025', '2025-2026']).join('\n')
  )
  const [exportsEnabled, setExportsEnabled] = useState(getBoolVal(settings, 'exports_enabled', true))
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    try {
      const cycles = sendingCycles.split('\n').map((s) => s.trim()).filter(Boolean)
      await Promise.all([
        saveSetting('mandate_alert_months', mandateMonths, 'operational', 'Meses alerta mandato'),
        saveSetting('active_year', activeYear, 'operational', 'Año activo'),
        saveSetting('sending_cycles', cycles, 'operational', 'Ciclos de envío'),
        saveSetting('exports_enabled', exportsEnabled, 'operational', 'Exportaciones habilitadas'),
      ])
      show('success', 'Configuración guardada correctamente')
    } catch {
      show('error', 'Error al guardar la configuración')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <FeedbackBanner feedback={feedback} />
      <Section title="Parámetros operacionales">
        <SettingRow label="Meses alerta mandato" keyName="mandate_alert_months">
          <Input
            type="number"
            value={mandateMonths}
            onChange={(e) => setMandateMonths(Number(e.target.value))}
            min={1}
            max={24}
            className="h-8 text-sm"
          />
        </SettingRow>
        <SettingRow label="Año activo" keyName="active_year">
          <Input
            type="number"
            value={activeYear}
            onChange={(e) => setActiveYear(Number(e.target.value))}
            min={2020}
            max={2030}
            className="h-8 text-sm"
          />
        </SettingRow>
        <SettingRow label="Ciclos de envío" keyName="sending_cycles">
          <Textarea
            value={sendingCycles}
            onChange={(e) => setSendingCycles(e.target.value)}
            rows={4}
            className="text-xs resize-none"
            placeholder="Un ciclo por línea, ej: 2024-2025"
          />
        </SettingRow>
        <SettingRow label="Exportaciones habilitadas" keyName="exports_enabled">
          <Switch checked={exportsEnabled} onCheckedChange={setExportsEnabled} />
        </SettingRow>
      </Section>
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving} size="sm">
          {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" /> : null}
          Guardar
        </Button>
      </div>
    </div>
  )
}

// ─── Tab: EWA ────────────────────────────────────────────────────────────────

function EwaTab({ settings }: { settings: AppSetting[] }) {
  const { feedback, show } = useFeedback()
  const [thresholdGreen, setThresholdGreen] = useState(
    getNumberVal(settings, 'ewa_threshold_green', 2.6)
  )
  const [thresholdYellow, setThresholdYellow] = useState(
    getNumberVal(settings, 'ewa_threshold_yellow', 1.5)
  )
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    try {
      await Promise.all([
        saveSetting('ewa_threshold_green', thresholdGreen, 'ewa', 'Umbral EWA verde'),
        saveSetting('ewa_threshold_yellow', thresholdYellow, 'ewa', 'Umbral EWA amarillo'),
      ])
      show('success', 'Umbrales EWA guardados')
    } catch {
      show('error', 'Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  const getPreviewColor = (score: number) => {
    if (score >= thresholdGreen) return '#1D9E75'
    if (score >= thresholdYellow) return '#BA7517'
    return '#E24B4A'
  }

  return (
    <div>
      <FeedbackBanner feedback={feedback} />
      <Section title="Umbrales EWA">
        <SettingRow label="Umbral verde (≥)" keyName="ewa_threshold_green">
          <div className="flex items-center gap-2">
            <Input
              type="number"
              value={thresholdGreen}
              onChange={(e) => setThresholdGreen(Number(e.target.value))}
              min={0}
              max={4}
              step={0.1}
              className="h-8 text-sm"
            />
            <div className="w-4 h-4 rounded-full flex-shrink-0" style={{ backgroundColor: '#1D9E75' }} />
          </div>
        </SettingRow>
        <SettingRow label="Umbral amarillo (≥)" keyName="ewa_threshold_yellow">
          <div className="flex items-center gap-2">
            <Input
              type="number"
              value={thresholdYellow}
              onChange={(e) => setThresholdYellow(Number(e.target.value))}
              min={0}
              max={4}
              step={0.1}
              className="h-8 text-sm"
            />
            <div className="w-4 h-4 rounded-full flex-shrink-0" style={{ backgroundColor: '#BA7517' }} />
          </div>
        </SettingRow>
      </Section>

      {/* Preview */}
      <div className="bg-white rounded-xl border border-gray-100 mb-5 p-5">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">Vista previa de colores</p>
        <div className="flex gap-4">
          {[0, 0.5, 1.0, 1.5, 2.0, 2.5, 3.0, 3.5, 4.0].map((score) => (
            <div key={score} className="flex flex-col items-center gap-1">
              <div
                className="w-6 h-6 rounded-full"
                style={{ backgroundColor: getPreviewColor(score) }}
              />
              <span className="text-[10px] text-gray-400">{score}</span>
            </div>
          ))}
        </div>
        <div className="flex gap-6 mt-3">
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            Verde: ≥ {thresholdGreen}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            Amarillo: ≥ {thresholdYellow}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
            Rojo: &lt; {thresholdYellow}
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving} size="sm">
          {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" /> : null}
          Guardar
        </Button>
      </div>
    </div>
  )
}

// ─── Tab: UI ─────────────────────────────────────────────────────────────────

function UiTab({ settings }: { settings: AppSetting[] }) {
  const { feedback, show } = useFeedback()
  const [appName, setAppName] = useState(getStringVal(settings, 'app_name', 'AFS EV Manager'))
  const [sidebarLabels, setSidebarLabels] = useState(
    getObjectVal(settings, 'sidebar_labels', { dashboard: 'Dashboard', directorio: 'Directorio', admin: 'Administración' })
  )
  const [kpiLabels, setKpiLabels] = useState(
    getObjectVal(settings, 'dashboard_kpi_labels', {
      total_evs: 'Total EVs',
      activas: 'Activas',
      asistidas: 'Asistidas',
      en_desarrollo: 'En Desarrollo',
    })
  )
  const [emptyMessages, setEmptyMessages] = useState(
    getObjectVal(settings, 'empty_state_messages', {
      no_evs: 'No se encontraron EVs.',
      no_ewa: 'Sin evaluación EWA.',
      no_notes: 'Sin notas.',
    })
  )
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    try {
      await Promise.all([
        saveSetting('app_name', appName, 'ui', 'Nombre de la aplicación'),
        saveSetting('sidebar_labels', sidebarLabels, 'ui', 'Etiquetas del sidebar'),
        saveSetting('dashboard_kpi_labels', kpiLabels, 'ui', 'Etiquetas KPI del dashboard'),
        saveSetting('empty_state_messages', emptyMessages, 'ui', 'Mensajes de estado vacío'),
      ])
      show('success', 'Configuración UI guardada')
    } catch {
      show('error', 'Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <FeedbackBanner feedback={feedback} />
      <Section title="General">
        <SettingRow label="Nombre de la aplicación" keyName="app_name">
          <Input
            value={appName}
            onChange={(e) => setAppName(e.target.value)}
            className="h-8 text-sm"
          />
        </SettingRow>
      </Section>

      <Section title="Etiquetas del sidebar">
        <div className="py-3">
          <JsonObjectEditor value={sidebarLabels} onChange={setSidebarLabels} />
        </div>
      </Section>

      <Section title="Etiquetas KPI del dashboard">
        <div className="py-3">
          <JsonObjectEditor value={kpiLabels} onChange={setKpiLabels} />
        </div>
      </Section>

      <Section title="Mensajes de estado vacío">
        <div className="py-3">
          <JsonObjectEditor value={emptyMessages} onChange={setEmptyMessages} />
        </div>
      </Section>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving} size="sm">
          {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" /> : null}
          Guardar
        </Button>
      </div>
    </div>
  )
}

// ─── Catalog Item Row ────────────────────────────────────────────────────────

interface CatalogRowProps {
  item: CatalogItem
  showColor?: boolean
  showOrder?: boolean
  isFirst?: boolean
  isLast?: boolean
  onUpdate: (id: number, data: Partial<CatalogItem>) => Promise<void>
  onDelete?: (id: number) => Promise<void>
  onMoveUp?: () => void
  onMoveDown?: () => void
}

function CatalogRow({
  item,
  showColor = false,
  showOrder = false,
  isFirst = false,
  isLast = false,
  onUpdate,
  onDelete,
  onMoveUp,
  onMoveDown,
}: CatalogRowProps) {
  const [editing, setEditing] = useState(false)
  const [label, setLabel] = useState(item.label)
  const [color, setColor] = useState(item.color ?? '#6b7280')
  const [saving, setSaving] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    try {
      await onUpdate(item.id, { label, color: showColor ? color : undefined })
      setEditing(false)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirmDelete) {
      setConfirmDelete(true)
      setTimeout(() => setConfirmDelete(false), 3000)
      return
    }
    await onDelete?.(item.id)
  }

  return (
    <div className="flex items-center gap-3 py-2.5">
      {showOrder && (
        <div className="flex flex-col gap-0.5">
          <button
            onClick={onMoveUp}
            disabled={isFirst}
            className="p-0.5 text-gray-300 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronUp className="w-3 h-3" />
          </button>
          <button
            onClick={onMoveDown}
            disabled={isLast}
            className="p-0.5 text-gray-300 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronDown className="w-3 h-3" />
          </button>
        </div>
      )}
      {showColor && !editing && (
        <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
      )}
      {editing ? (
        <div className="flex items-center gap-2 flex-1">
          {showColor && (
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="w-7 h-7 rounded cursor-pointer border border-gray-200"
            />
          )}
          <Input
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            className="h-7 text-sm flex-1"
            autoFocus
          />
          <button
            onClick={handleSave}
            disabled={saving}
            className="p-1 text-emerald-600 hover:text-emerald-700"
          >
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
          </button>
          <button onClick={() => setEditing(false)} className="p-1 text-gray-400 hover:text-gray-600">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <>
          <span className="text-sm text-gray-700 flex-1">{item.label}</span>
          <span className="text-xs text-gray-400">{item.key}</span>
          <button onClick={() => setEditing(true)} className="p-1 text-gray-300 hover:text-gray-600">
            <Pencil className="w-3.5 h-3.5" />
          </button>
          {onDelete && (
            <button
              onClick={handleDelete}
              className={cn(
                'p-1 transition-colors',
                confirmDelete ? 'text-red-500 hover:text-red-700' : 'text-gray-300 hover:text-red-400'
              )}
              title={confirmDelete ? 'Confirmar eliminación' : 'Eliminar'}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </>
      )}
    </div>
  )
}

// ─── Add Catalog Form ────────────────────────────────────────────────────────

function AddCatalogForm({
  type,
  onAdd,
  showColor = false,
}: {
  type: string
  onAdd: (item: CatalogItem) => void
  showColor?: boolean
}) {
  const [open, setOpen] = useState(false)
  const [label, setLabel] = useState('')
  const [key, setKey] = useState('')
  const [color, setColor] = useState('#6b7280')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    if (!label.trim() || !key.trim()) {
      setError('Etiqueta y clave son obligatorias')
      return
    }
    setSaving(true)
    setError('')
    try {
      const res = await fetch('/api/admin/catalog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, key: key.trim(), label: label.trim(), color: showColor ? color : null }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? 'Error al crear')
      }
      const newItem = await res.json()
      onAdd(newItem)
      setLabel('')
      setKey('')
      setColor('#6b7280')
      setOpen(false)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al crear')
    } finally {
      setSaving(false)
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700 py-2"
      >
        <Plus className="w-3.5 h-3.5" />
        Agregar
      </button>
    )
  }

  return (
    <div className="pt-3 pb-1 space-y-2">
      {error && <p className="text-xs text-red-500">{error}</p>}
      <div className="flex items-center gap-2">
        {showColor && (
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="w-7 h-7 rounded cursor-pointer border border-gray-200"
          />
        )}
        <Input
          placeholder="Etiqueta"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          className="h-7 text-sm flex-1"
        />
        <Input
          placeholder="Clave (snake_case)"
          value={key}
          onChange={(e) => setKey(e.target.value)}
          className="h-7 text-sm flex-1"
        />
        <Button size="sm" onClick={handleSubmit} disabled={saving} className="h-7 text-xs px-2">
          {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Crear'}
        </Button>
        <button onClick={() => setOpen(false)} className="p-1 text-gray-400 hover:text-gray-600">
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  )
}

// ─── Tab: Catálogos ──────────────────────────────────────────────────────────

function CatalogosTab({
  evStatuses: initialEvStatuses,
  coordinationAreas: initialCoordAreas,
  hostingStatuses: initialHostingStatuses,
}: {
  evStatuses: CatalogItem[]
  coordinationAreas: CatalogItem[]
  hostingStatuses: CatalogItem[]
}) {
  const { feedback, show } = useFeedback()
  const [evStatuses, setEvStatuses] = useState(initialEvStatuses)
  const [coordAreas, setCoordAreas] = useState(initialCoordAreas)
  const [hostingStatuses, setHostingStatuses] = useState(initialHostingStatuses)

  const updateItem = async (id: number, data: Partial<CatalogItem>) => {
    try {
      const res = await fetch(`/api/admin/catalog/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error()
      const updated = await res.json()
      setEvStatuses((prev) => prev.map((i) => (i.id === id ? updated : i)))
      setCoordAreas((prev) => prev.map((i) => (i.id === id ? updated : i)))
      setHostingStatuses((prev) => prev.map((i) => (i.id === id ? updated : i)))
      show('success', 'Ítem actualizado')
    } catch {
      show('error', 'Error al actualizar')
    }
  }

  const deleteItem = async (id: number, type: string) => {
    try {
      const res = await fetch(`/api/admin/catalog/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      if (type === 'ev_status') setEvStatuses((prev) => prev.filter((i) => i.id !== id))
      else if (type === 'coordination_area') setCoordAreas((prev) => prev.filter((i) => i.id !== id))
      else if (type === 'hosting_status') setHostingStatuses((prev) => prev.filter((i) => i.id !== id))
      show('success', 'Ítem eliminado')
    } catch {
      show('error', 'Error al eliminar')
    }
  }

  const moveCoordArea = async (index: number, direction: 'up' | 'down') => {
    const newList = [...coordAreas]
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= newList.length) return
    ;[newList[index], newList[targetIndex]] = [newList[targetIndex], newList[index]]
    // Update sortOrder for both
    const itemA = { ...newList[index], sortOrder: index }
    const itemB = { ...newList[targetIndex], sortOrder: targetIndex }
    setCoordAreas(newList.map((item, i) => ({ ...item, sortOrder: i })))
    await Promise.all([
      fetch(`/api/admin/catalog/${itemA.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sortOrder: index }),
      }),
      fetch(`/api/admin/catalog/${itemB.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sortOrder: targetIndex }),
      }),
    ])
  }

  return (
    <div>
      <FeedbackBanner feedback={feedback} />

      {/* EV Statuses */}
      <Section title="Estados de EV">
        <div className="divide-y divide-gray-50">
          {evStatuses.map((item) => (
            <CatalogRow
              key={item.id}
              item={item}
              showColor
              onUpdate={updateItem}
              onDelete={(id) => deleteItem(id, 'ev_status')}
            />
          ))}
        </div>
        <AddCatalogForm
          type="ev_status"
          showColor
          onAdd={(item) => setEvStatuses((prev) => [...prev, item])}
        />
      </Section>

      {/* Coordination Areas */}
      <Section title="Áreas de coordinación">
        <div className="divide-y divide-gray-50">
          {coordAreas.map((item, index) => (
            <CatalogRow
              key={item.id}
              item={item}
              showOrder
              isFirst={index === 0}
              isLast={index === coordAreas.length - 1}
              onUpdate={updateItem}
              onMoveUp={() => moveCoordArea(index, 'up')}
              onMoveDown={() => moveCoordArea(index, 'down')}
            />
          ))}
        </div>
        <AddCatalogForm
          type="coordination_area"
          onAdd={(item) => setCoordAreas((prev) => [...prev, item])}
        />
      </Section>

      {/* Hosting Statuses */}
      <Section title="Estados de hosting">
        <div className="divide-y divide-gray-50">
          {hostingStatuses.map((item) => (
            <CatalogRow
              key={item.id}
              item={item}
              showColor
              onUpdate={updateItem}
              onDelete={(id) => deleteItem(id, 'hosting_status')}
            />
          ))}
        </div>
        <AddCatalogForm
          type="hosting_status"
          showColor
          onAdd={(item) => setHostingStatuses((prev) => [...prev, item])}
        />
      </Section>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function AdminSettingsClient({ settings, evStatuses, coordinationAreas, hostingStatuses }: Props) {
  const searchParams = useSearchParams()
  const defaultTab = searchParams.get('tab') === 'catalogos' ? 'catalogos' : 'operacional'

  return (
    <Tabs defaultValue={defaultTab} className="w-full">
      <TabsList className="mb-5">
        <TabsTrigger value="operacional">Operacional</TabsTrigger>
        <TabsTrigger value="ewa">EWA</TabsTrigger>
        <TabsTrigger value="ui">UI</TabsTrigger>
        <TabsTrigger value="catalogos">Catálogos</TabsTrigger>
      </TabsList>

      <TabsContent value="operacional">
        <OperacionalTab settings={settings} />
      </TabsContent>

      <TabsContent value="ewa">
        <EwaTab settings={settings} />
      </TabsContent>

      <TabsContent value="ui">
        <UiTab settings={settings} />
      </TabsContent>

      <TabsContent value="catalogos">
        <CatalogosTab
          evStatuses={evStatuses}
          coordinationAreas={coordinationAreas}
          hostingStatuses={hostingStatuses}
        />
      </TabsContent>
    </Tabs>
  )
}
