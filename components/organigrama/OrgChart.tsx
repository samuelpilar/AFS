'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import ReactFlow, {
  Node,
  Edge,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  ReactFlowProvider,
  MarkerType,
  Panel,
  MiniMap,
  BackgroundVariant,
  NodeProps,
} from 'reactflow'
import 'reactflow/dist/style.css'
import html2canvas from 'html2canvas'
import { X, Plus, Trash2, Download, LayoutGrid, Loader2, Check } from 'lucide-react'
import { getInitials, cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

// ─── Types ────────────────────────────────────────────────────────────────────

interface TeamMember {
  id: number
  evId: number
  coordinatorId: number | null
  name: string
  role: string | null
  email: string | null
  phone: string | null
}

interface Coordinator {
  id: number
  evId: number
  area: string
  name: string
  email: string | null
  phone: string | null
  since: Date | null
  teamMembers: TeamMember[]
}

interface EV {
  id: number
  name: string
  status: string
  coordinators: Coordinator[]
  teamMembers: TeamMember[]
}

interface CatalogItem {
  id: number
  type: string
  key: string
  label: string
}

type PanelNode =
  | { kind: 'coord'; coord: Coordinator }
  | { kind: 'member'; member: TeamMember; coordId: number | null }

interface OrgChartProps {
  ev: EV
  coordinationAreas: CatalogItem[]
}

// ─── Custom Node Components ───────────────────────────────────────────────────

function EVNode({ data }: NodeProps) {
  return (
    <div
      className="bg-white border border-gray-200 rounded-xl shadow-md px-5 py-3.5 min-w-[200px] border-l-4"
      style={{ borderLeftColor: '#2563eb' }}
    >
      <div className="text-sm font-bold text-gray-900 leading-tight">{data.name}</div>
      <div className="mt-1.5">
        <span
          className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-50 text-blue-700"
        >
          {data.status}
        </span>
      </div>
    </div>
  )
}

function CoordNode({ data }: NodeProps) {
  return (
    <div
      className="bg-white border border-gray-200 rounded-xl shadow-sm px-4 py-3 min-w-[160px] cursor-pointer hover:border-blue-300 hover:shadow-md transition-all"
      onClick={data.onClick}
    >
      <div className="text-[10px] uppercase tracking-wide text-gray-400 font-medium mb-1">{data.area}</div>
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
          <span className="text-[9px] font-semibold text-gray-500">
            {data.name ? getInitials(data.name) : '?'}
          </span>
        </div>
        <span className={cn('text-xs font-medium leading-tight', data.name ? 'text-gray-800' : 'text-gray-400 italic')}>
          {data.name || 'Sin asignar'}
        </span>
      </div>
    </div>
  )
}

function MemberNode({ data }: NodeProps) {
  return (
    <div
      className="bg-gray-50 border border-gray-100 rounded-lg px-3 py-2.5 min-w-[140px] cursor-pointer hover:bg-white hover:border-gray-300 hover:shadow-sm transition-all"
      onClick={data.onClick}
    >
      <div className="text-xs font-medium text-gray-800 leading-tight">{data.name}</div>
      {data.role && (
        <div className="text-[10px] text-gray-400 mt-0.5 leading-tight">{data.role}</div>
      )}
    </div>
  )
}

const nodeTypes = {
  evNode: EVNode,
  coordNode: CoordNode,
  memberNode: MemberNode,
}

// ─── Layout builder ───────────────────────────────────────────────────────────

function buildLayout(ev: EV, onCoordClick: (coord: Coordinator) => void, onMemberClick: (member: TeamMember) => void) {
  const nodes: Node[] = []
  const edges: Edge[] = []

  const coords = ev.coordinators
  const totalWidth = Math.max(coords.length * 220, 600)
  const rootX = totalWidth / 2 - 100

  // Root EV node
  nodes.push({
    id: 'ev',
    type: 'evNode',
    position: { x: rootX, y: 0 },
    data: { name: ev.name, status: ev.status },
    draggable: true,
  })

  // Coordinator nodes
  coords.forEach((coord, i) => {
    const coordX = i * 220
    const coordId = `coord-${coord.id}`

    nodes.push({
      id: coordId,
      type: 'coordNode',
      position: { x: coordX, y: 150 },
      data: {
        area: coord.area,
        name: coord.name,
        onClick: () => onCoordClick(coord),
      },
      draggable: true,
    })

    edges.push({
      id: `ev-${coordId}`,
      source: 'ev',
      target: coordId,
      type: 'smoothstep',
      style: { stroke: '#e5e7eb', strokeWidth: 1.5 },
      markerEnd: { type: MarkerType.ArrowClosed, color: '#e5e7eb', width: 12, height: 12 },
    })

    // Team member nodes
    coord.teamMembers.forEach((member, j) => {
      const memberId = `member-${member.id}`
      nodes.push({
        id: memberId,
        type: 'memberNode',
        position: { x: coordX - 10, y: 290 + j * 90 },
        data: {
          name: member.name,
          role: member.role,
          onClick: () => onMemberClick(member),
        },
        draggable: true,
      })

      edges.push({
        id: `${coordId}-${memberId}`,
        source: coordId,
        target: memberId,
        type: 'smoothstep',
        style: { stroke: '#e5e7eb', strokeWidth: 1 },
      })
    })
  })

  // Unassigned team members
  const unassigned = ev.teamMembers
  if (unassigned.length > 0) {
    const unassignedX = coords.length * 220 + 20
    nodes.push({
      id: 'unassigned-group',
      type: 'evNode',
      position: { x: unassignedX, y: 150 },
      data: { name: 'Sin coordinador', status: `${unassigned.length} miembros` },
      draggable: true,
    })
    edges.push({
      id: 'ev-unassigned',
      source: 'ev',
      target: 'unassigned-group',
      type: 'smoothstep',
      style: { stroke: '#e5e7eb', strokeWidth: 1.5, strokeDasharray: '4 4' },
    })
    unassigned.forEach((member, j) => {
      const memberId = `member-unassigned-${member.id}`
      nodes.push({
        id: memberId,
        type: 'memberNode',
        position: { x: unassignedX - 10, y: 290 + j * 90 },
        data: {
          name: member.name,
          role: member.role,
          onClick: () => onMemberClick(member),
        },
        draggable: true,
      })
      edges.push({
        id: `unassigned-group-${memberId}`,
        source: 'unassigned-group',
        target: memberId,
        type: 'smoothstep',
        style: { stroke: '#e5e7eb', strokeWidth: 1 },
      })
    })
  }

  return { nodes, edges }
}

// ─── Side Panel ───────────────────────────────────────────────────────────────

interface SidePanelProps {
  panelNode: PanelNode | null
  evId: number
  onClose: () => void
  onCoordUpdated: (coord: Coordinator) => void
  onMemberUpdated: (member: TeamMember) => void
  onMemberDeleted: (memberId: number) => void
  onMemberAdded: (member: TeamMember) => void
}

function SidePanel({
  panelNode,
  evId,
  onClose,
  onCoordUpdated,
  onMemberUpdated,
  onMemberDeleted,
  onMemberAdded,
}: SidePanelProps) {
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(false)

  // Coord form state
  const [coordName, setCoordName] = useState('')
  const [coordEmail, setCoordEmail] = useState('')
  const [coordPhone, setCoordPhone] = useState('')

  // Member form state
  const [memberName, setMemberName] = useState('')
  const [memberRole, setMemberRole] = useState('')
  const [memberEmail, setMemberEmail] = useState('')

  // Add member form
  const [addingMember, setAddingMember] = useState(false)
  const [newMemberName, setNewMemberName] = useState('')
  const [newMemberRole, setNewMemberRole] = useState('')

  useEffect(() => {
    setSuccess(false)
    setError('')
    setConfirmDelete(false)
    setAddingMember(false)
    setNewMemberName('')
    setNewMemberRole('')

    if (!panelNode) return
    if (panelNode.kind === 'coord') {
      setCoordName(panelNode.coord.name)
      setCoordEmail(panelNode.coord.email ?? '')
      setCoordPhone(panelNode.coord.phone ?? '')
    } else {
      setMemberName(panelNode.member.name)
      setMemberRole(panelNode.member.role ?? '')
      setMemberEmail(panelNode.member.email ?? '')
    }
  }, [panelNode])

  const showSuccess = () => {
    setSuccess(true)
    setTimeout(() => setSuccess(false), 2000)
  }

  const saveCoord = async () => {
    if (!panelNode || panelNode.kind !== 'coord') return
    setSaving(true)
    setError('')
    try {
      const res = await fetch(`/api/evs/${evId}/coordinators/${panelNode.coord.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: coordName, email: coordEmail || null, phone: coordPhone || null }),
      })
      if (!res.ok) throw new Error()
      const updated = await res.json()
      onCoordUpdated(updated)
      showSuccess()
    } catch {
      setError('Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  const saveMember = async () => {
    if (!panelNode || panelNode.kind !== 'member') return
    setSaving(true)
    setError('')
    try {
      const res = await fetch(`/api/evs/${evId}/members/${panelNode.member.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: memberName, role: memberRole || null, email: memberEmail || null }),
      })
      if (!res.ok) throw new Error()
      const updated = await res.json()
      onMemberUpdated(updated)
      showSuccess()
    } catch {
      setError('Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  const deleteMember = async () => {
    if (!panelNode || panelNode.kind !== 'member') return
    if (!confirmDelete) {
      setConfirmDelete(true)
      setTimeout(() => setConfirmDelete(false), 3000)
      return
    }
    setSaving(true)
    try {
      const res = await fetch(`/api/evs/${evId}/members/${panelNode.member.id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      onMemberDeleted(panelNode.member.id)
      onClose()
    } catch {
      setError('Error al eliminar')
      setSaving(false)
    }
  }

  const addMember = async () => {
    if (!panelNode || panelNode.kind !== 'coord') return
    if (!newMemberName.trim()) return
    setSaving(true)
    setError('')
    try {
      const res = await fetch(`/api/evs/${evId}/coordinators/${panelNode.coord.id}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newMemberName,
          role: newMemberRole || null,
        }),
      })
      if (!res.ok) throw new Error()
      const newMember = await res.json()
      onMemberAdded(newMember)
      setAddingMember(false)
      setNewMemberName('')
      setNewMemberRole('')
      showSuccess()
    } catch {
      setError('Error al agregar miembro')
    } finally {
      setSaving(false)
    }
  }

  const isVisible = !!panelNode

  return (
    <div
      className={cn(
        'fixed right-0 top-0 h-full w-80 bg-white border-l border-gray-100 shadow-xl z-50 flex flex-col transition-transform duration-200 ease-in-out',
        isVisible ? 'translate-x-0' : 'translate-x-full'
      )}
    >
      {panelNode && (
        <>
          {/* Panel header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-400 font-medium">
                {panelNode.kind === 'coord' ? 'Coordinador' : 'Miembro del equipo'}
              </p>
              <h3 className="text-sm font-semibold text-gray-900 mt-0.5">
                {panelNode.kind === 'coord' ? panelNode.coord.area : panelNode.member.name}
              </h3>
            </div>
            <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Feedback */}
          {success && (
            <div className="mx-5 mt-3 flex items-center gap-2 px-3 py-2 bg-emerald-50 text-emerald-700 rounded-lg text-xs">
              <Check className="w-3.5 h-3.5" /> Guardado
            </div>
          )}
          {error && (
            <div className="mx-5 mt-3 flex items-center gap-2 px-3 py-2 bg-red-50 text-red-600 rounded-lg text-xs">
              <X className="w-3.5 h-3.5" /> {error}
            </div>
          )}

          {/* Panel body */}
          <div className="flex-1 overflow-auto p-5 space-y-4">
            {panelNode.kind === 'coord' && (
              <>
                <div className="space-y-3">
                  <div className="space-y-1">
                    <Label className="text-xs text-gray-500">Nombre</Label>
                    <Input
                      value={coordName}
                      onChange={(e) => setCoordName(e.target.value)}
                      className="h-8 text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-gray-500">Email</Label>
                    <Input
                      type="email"
                      value={coordEmail}
                      onChange={(e) => setCoordEmail(e.target.value)}
                      className="h-8 text-sm"
                      placeholder="correo@ejemplo.com"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-gray-500">Teléfono</Label>
                    <Input
                      value={coordPhone}
                      onChange={(e) => setCoordPhone(e.target.value)}
                      className="h-8 text-sm"
                      placeholder="+54..."
                    />
                  </div>
                  <Button onClick={saveCoord} disabled={saving} size="sm" className="w-full">
                    {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" /> : null}
                    Guardar cambios
                  </Button>
                </div>

                {/* Add member section */}
                <div className="border-t border-gray-100 pt-4">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-semibold text-gray-700">
                      Miembros ({panelNode.coord.teamMembers.length})
                    </p>
                    <button
                      onClick={() => setAddingMember(!addingMember)}
                      className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700"
                    >
                      <Plus className="w-3 h-3" />
                      Agregar
                    </button>
                  </div>

                  {panelNode.coord.teamMembers.map((m) => (
                    <div key={m.id} className="flex items-center gap-2 py-1.5">
                      <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                        <span className="text-[8px] font-semibold text-gray-500">{getInitials(m.name)}</span>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-800 leading-none">{m.name}</p>
                        {m.role && <p className="text-[10px] text-gray-400 mt-0.5">{m.role}</p>}
                      </div>
                    </div>
                  ))}

                  {addingMember && (
                    <div className="mt-3 space-y-2 p-3 bg-gray-50 rounded-lg">
                      <Input
                        placeholder="Nombre del miembro"
                        value={newMemberName}
                        onChange={(e) => setNewMemberName(e.target.value)}
                        className="h-7 text-xs"
                        autoFocus
                      />
                      <Input
                        placeholder="Rol (opcional)"
                        value={newMemberRole}
                        onChange={(e) => setNewMemberRole(e.target.value)}
                        className="h-7 text-xs"
                      />
                      <div className="flex gap-2">
                        <Button size="sm" onClick={addMember} disabled={saving} className="flex-1 h-7 text-xs">
                          {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Agregar'}
                        </Button>
                        <button
                          onClick={() => { setAddingMember(false); setNewMemberName(''); setNewMemberRole('') }}
                          className="px-2 py-1 text-xs text-gray-500 hover:text-gray-700 border border-gray-200 rounded-md"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}

            {panelNode.kind === 'member' && (
              <div className="space-y-3">
                <div className="space-y-1">
                  <Label className="text-xs text-gray-500">Nombre</Label>
                  <Input
                    value={memberName}
                    onChange={(e) => setMemberName(e.target.value)}
                    className="h-8 text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-gray-500">Rol</Label>
                  <Input
                    value={memberRole}
                    onChange={(e) => setMemberRole(e.target.value)}
                    className="h-8 text-sm"
                    placeholder="Ej: Tesorero, Secretario..."
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-gray-500">Email</Label>
                  <Input
                    type="email"
                    value={memberEmail}
                    onChange={(e) => setMemberEmail(e.target.value)}
                    className="h-8 text-sm"
                    placeholder="correo@ejemplo.com"
                  />
                </div>
                <Button onClick={saveMember} disabled={saving} size="sm" className="w-full">
                  {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" /> : null}
                  Guardar cambios
                </Button>

                <div className="border-t border-gray-100 pt-3">
                  <button
                    onClick={deleteMember}
                    disabled={saving}
                    className={cn(
                      'flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-colors w-full justify-center',
                      confirmDelete
                        ? 'bg-red-500 text-white hover:bg-red-600'
                        : 'border border-red-200 text-red-500 hover:bg-red-50'
                    )}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    {confirmDelete ? 'Confirmar eliminación' : 'Eliminar miembro'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}

// ─── Inner Chart ──────────────────────────────────────────────────────────────

function InnerOrgChart({ ev, coordinationAreas }: OrgChartProps) {
  const [evData, setEvData] = useState<EV>(ev)
  const [panelNode, setPanelNode] = useState<PanelNode | null>(null)

  const handleCoordClick = useCallback((coord: Coordinator) => {
    setPanelNode({ kind: 'coord', coord })
  }, [])

  const handleMemberClick = useCallback((member: TeamMember) => {
    const coordId = member.coordinatorId ?? null
    setPanelNode({ kind: 'member', member, coordId })
  }, [])

  const getLayout = useCallback(() => {
    return buildLayout(evData, handleCoordClick, handleMemberClick)
  }, [evData, handleCoordClick, handleMemberClick])

  const { nodes: initialNodes, edges: initialEdges } = getLayout()
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)

  // Rebuild graph when evData changes
  useEffect(() => {
    const { nodes: newNodes, edges: newEdges } = getLayout()
    setNodes(newNodes)
    setEdges(newEdges)
  }, [evData, getLayout, setNodes, setEdges])

  const handleAutoLayout = () => {
    const { nodes: resetNodes } = getLayout()
    setNodes(resetNodes)
  }

  const handleExport = async () => {
    const el = document.querySelector('.react-flow') as HTMLElement
    if (!el) return
    try {
      const canvas = await html2canvas(el, { background: '#f9fafb', useCORS: true } as Parameters<typeof html2canvas>[1])
      const link = document.createElement('a')
      link.download = `organigrama-${evData.name.replace(/\s+/g, '-').toLowerCase()}.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
    } catch (err) {
      console.error('Export failed:', err)
    }
  }

  const handleCoordUpdated = useCallback((updated: Coordinator) => {
    setEvData((prev) => ({
      ...prev,
      coordinators: prev.coordinators.map((c) => (c.id === updated.id ? updated : c)),
    }))
    if (panelNode?.kind === 'coord' && panelNode.coord.id === updated.id) {
      setPanelNode({ kind: 'coord', coord: updated })
    }
  }, [panelNode])

  const handleMemberUpdated = useCallback((updated: TeamMember) => {
    setEvData((prev) => ({
      ...prev,
      coordinators: prev.coordinators.map((c) => ({
        ...c,
        teamMembers: c.teamMembers.map((m) => (m.id === updated.id ? updated : m)),
      })),
      teamMembers: prev.teamMembers.map((m) => (m.id === updated.id ? updated : m)),
    }))
    if (panelNode?.kind === 'member' && panelNode.member.id === updated.id) {
      setPanelNode({ kind: 'member', member: updated, coordId: updated.coordinatorId ?? null })
    }
  }, [panelNode])

  const handleMemberDeleted = useCallback((memberId: number) => {
    setEvData((prev) => ({
      ...prev,
      coordinators: prev.coordinators.map((c) => ({
        ...c,
        teamMembers: c.teamMembers.filter((m) => m.id !== memberId),
      })),
      teamMembers: prev.teamMembers.filter((m) => m.id !== memberId),
    }))
  }, [])

  const handleMemberAdded = useCallback((newMember: TeamMember) => {
    setEvData((prev) => ({
      ...prev,
      coordinators: prev.coordinators.map((c) => {
        if (c.id !== newMember.coordinatorId) return c
        return { ...c, teamMembers: [...c.teamMembers, newMember] }
      }),
    }))
    // Update panel with new member list
    if (panelNode?.kind === 'coord' && panelNode.coord.id === newMember.coordinatorId) {
      setPanelNode((prev) => {
        if (!prev || prev.kind !== 'coord') return prev
        return {
          kind: 'coord',
          coord: { ...prev.coord, teamMembers: [...prev.coord.teamMembers, newMember] },
        }
      })
    }
  }, [panelNode])

  return (
    <div className="w-full h-full relative">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.15 }}
        minZoom={0.3}
        maxZoom={2}
        attributionPosition="bottom-left"
        proOptions={{ hideAttribution: true }}
      >
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#e5e7eb" />
        <Controls showInteractive={false} className="!shadow-none !border !border-gray-100" />
        <MiniMap
          nodeStrokeWidth={2}
          nodeColor={(n) => {
            if (n.type === 'evNode') return '#dbeafe'
            if (n.type === 'coordNode') return '#f3f4f6'
            return '#f9fafb'
          }}
          className="!border !border-gray-100 !shadow-none !rounded-xl overflow-hidden"
          maskColor="rgba(243,244,246,0.6)"
        />
        <Panel position="top-right" className="flex gap-2">
          <button
            onClick={handleAutoLayout}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-white border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 shadow-sm transition-colors"
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            Resetear layout
          </button>
          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-white border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 shadow-sm transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            Exportar PNG
          </button>
        </Panel>
      </ReactFlow>

      <SidePanel
        panelNode={panelNode}
        evId={evData.id}
        onClose={() => setPanelNode(null)}
        onCoordUpdated={handleCoordUpdated}
        onMemberUpdated={handleMemberUpdated}
        onMemberDeleted={handleMemberDeleted}
        onMemberAdded={handleMemberAdded}
      />

      {/* Overlay backdrop when panel is open */}
      {panelNode && (
        <div
          className="fixed inset-0 z-40 bg-transparent"
          onClick={() => setPanelNode(null)}
          style={{ right: '320px' }}
        />
      )}
    </div>
  )
}

// ─── Export ───────────────────────────────────────────────────────────────────

export function OrgChart(props: OrgChartProps) {
  return (
    <ReactFlowProvider>
      <InnerOrgChart {...props} />
    </ReactFlowProvider>
  )
}
