export type EVStatus = 'Activa' | 'Asistida' | 'Grupo en Desarrollo'

export interface EVWithRelations {
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
  createdAt: Date
  updatedAt: Date
  hosting: Hosting[]
  sending: Sending[]
  ewa: EWA[]
  coordinators: Coordinator[]
  teamMembers: TeamMember[]
  notes: EVNote[]
  tags: EVTagOnEV[]
}

export interface Hosting {
  id: number
  evId: number
  year: number
  totalQuota: number
  shQuota: number
  nhQuota: number
  shStatus: string
  nhStatus: string
  notes: string
  createdAt: Date
  updatedAt: Date
}

export interface Sending {
  id: number
  evId: number
  cycle: string
  students: number
  notes: string
  createdAt: Date
  updatedAt: Date
}

export interface EWA {
  id: number
  evId: number
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
  createdAt: Date
  updatedAt: Date
}

export interface Coordinator {
  id: number
  evId: number
  area: string
  name: string
  email: string | null
  phone: string | null
  since: Date | null
  teamMembers: TeamMember[]
  createdAt: Date
  updatedAt: Date
}

export interface TeamMember {
  id: number
  evId: number
  coordinatorId: number | null
  name: string
  role: string | null
  email: string | null
  phone: string | null
  createdAt: Date
  updatedAt: Date
}

export interface EVNote {
  id: number
  evId: number
  title: string
  content: string
  createdAt: Date
  updatedAt: Date
}

export interface EVTag {
  id: number
  name: string
  color: string | null
}

export interface EVTagOnEV {
  evId: number
  tagId: number
  tag: EVTag
}

export interface CatalogItem {
  id: number
  type: string
  key: string
  label: string
  color: string | null
  sortOrder: number
  isActive: boolean
  metadata: Record<string, unknown> | null
}

export interface AppSetting {
  id: number
  key: string
  value: unknown
  group: string
  label: string | null
}

export interface DashboardStats {
  total: number
  activas: number
  asistidas: number
  enDesarrollo: number
}

export interface EVSummary {
  id: number
  name: string
  region: string
  country: string
  status: string
  leaderName: string | null
  electionDate: Date | null
  totalVolunteers: number
  idoneidad: boolean
  planAnual: boolean
  visitaPlanif: boolean
  visitaRealizada: boolean
  latestEwa: { score: number | null; year: number } | null
  sendingTotal: number
  tags: { id: number; name: string; color: string | null }[]
}
