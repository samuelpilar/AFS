import 'dotenv/config'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const COORDINATION_AREAS = [
  'Sending',
  'Hosting',
  'Desarrollo Voluntario',
  'Apoyo al Participante',
  'Relaciones Institucionales',
  'CEL',
  'COL',
  'Finanzas',
  'Visibilidad',
]

const EV_STATUSES = [
  { key: 'Activa', label: 'Activa', color: '#16a34a' },
  { key: 'Asistida', label: 'Asistida', color: '#2563eb' },
  { key: 'Grupo en Desarrollo', label: 'Grupo en Desarrollo', color: '#d97706' },
]

const HOSTING_STATUSES = [
  { key: 'Pendiente', label: 'Pendiente', color: '#6b7280' },
  { key: 'Confirmado', label: 'Confirmado', color: '#16a34a' },
  { key: 'En proceso', label: 'En proceso', color: '#2563eb' },
  { key: 'Cancelado', label: 'Cancelado', color: '#dc2626' },
]

const EVS = [
  // Activas
  { name: 'Eldorado', region: 'Misiones', country: 'Argentina', status: 'Activa' },
  { name: 'Mar del Plata', region: 'Buenos Aires', country: 'Argentina', status: 'Activa' },
  { name: 'Montecarlo', region: 'Misiones', country: 'Argentina', status: 'Activa' },
  { name: 'Posadas', region: 'Misiones', country: 'Argentina', status: 'Activa' },
  { name: 'Recoleta', region: 'Buenos Aires', country: 'Argentina', status: 'Activa' },
  { name: 'Redes BUE', region: 'Buenos Aires', country: 'Argentina', status: 'Activa' },
  { name: 'Río Gallegos', region: 'Santa Cruz', country: 'Argentina', status: 'Activa' },
  // Asistidas
  { name: 'Paysandú', region: 'Paysandú', country: 'Uruguay', status: 'Asistida' },
  { name: 'Montevideo', region: 'Montevideo', country: 'Uruguay', status: 'Asistida' },
  { name: 'Tandil', region: 'Buenos Aires', country: 'Argentina', status: 'Asistida' },
  // Grupos en Desarrollo
  { name: 'Melo', region: 'Cerro Largo', country: 'Uruguay', status: 'Grupo en Desarrollo' },
  { name: 'Maldonado', region: 'Maldonado', country: 'Uruguay', status: 'Grupo en Desarrollo' },
  { name: 'La Plata', region: 'Buenos Aires', country: 'Argentina', status: 'Grupo en Desarrollo' },
  { name: 'Canelones', region: 'Canelones', country: 'Uruguay', status: 'Grupo en Desarrollo' },
  { name: 'Treinta y Tres', region: 'Treinta y Tres', country: 'Uruguay', status: 'Grupo en Desarrollo' },
  { name: 'Trinidad', region: 'Flores', country: 'Uruguay', status: 'Grupo en Desarrollo' },
  { name: 'Catamarca', region: 'Catamarca', country: 'Argentina', status: 'Grupo en Desarrollo' },
  { name: 'GBA Norte', region: 'Buenos Aires', country: 'Argentina', status: 'Grupo en Desarrollo' },
]

const EWA_SCORES_2025: Record<string, number> = {
  'Eldorado': 2.4,
  'Mar del Plata': 2.6,
  'Recoleta': 2.6,
  'Redes BUE': 2.8,
  'Posadas': 2.9,
  'Río Gallegos': 2.9,
  'Montevideo': 2.6,
  'Paysandú': 2.5,
  'Melo': 2.1,
  'La Plata': 2.3,
  'Canelones': 2.4,
  'Maldonado': 1.4,
}

const DEFAULT_SETTINGS = [
  {
    key: 'mandate_alert_months',
    value: 3,
    group: 'operational',
    label: 'Meses de alerta de mandato',
  },
  {
    key: 'active_year',
    value: 2025,
    group: 'operational',
    label: 'Año activo',
  },
  {
    key: 'ewa_threshold_green',
    value: 2.6,
    group: 'ewa',
    label: 'Umbral EWA verde (≥)',
  },
  {
    key: 'ewa_threshold_yellow',
    value: 1.5,
    group: 'ewa',
    label: 'Umbral EWA amarillo (≥)',
  },
  {
    key: 'sending_cycles',
    value: ['2024-2025', '2025-2026', '2026-2027'],
    group: 'operational',
    label: 'Ciclos de Sending disponibles',
  },
  {
    key: 'default_filters',
    value: { country: 'all', status: 'all' },
    group: 'ui',
    label: 'Filtros por defecto del dashboard',
  },
  {
    key: 'chart_visibility',
    value: { sending_chart: true, ewa_ranking: true, mandate_alerts: true },
    group: 'ui',
    label: 'Visibilidad de gráficos',
  },
  {
    key: 'exports_enabled',
    value: true,
    group: 'features',
    label: 'Exportaciones habilitadas',
  },
  {
    key: 'app_name',
    value: 'AFS EV Manager',
    group: 'ui',
    label: 'Nombre de la aplicación',
  },
  {
    key: 'sidebar_labels',
    value: {
      dashboard: 'Dashboard',
      directorio: 'Directorio',
      admin: 'Administración',
    },
    group: 'ui',
    label: 'Etiquetas del sidebar',
  },
  {
    key: 'dashboard_kpi_labels',
    value: {
      total_evs: 'Total EVs',
      activas: 'Activas',
      asistidas: 'Asistidas',
      en_desarrollo: 'En Desarrollo',
    },
    group: 'ui',
    label: 'Etiquetas KPI del dashboard',
  },
  {
    key: 'empty_state_messages',
    value: {
      no_evs: 'No se encontraron EVs con los filtros actuales.',
      no_ewa: 'Sin evaluación EWA registrada.',
      no_notes: 'Sin notas registradas. Agregá una nota arriba.',
    },
    group: 'ui',
    label: 'Mensajes de estado vacío',
  },
]

async function main() {
  console.log('🌱 Seeding database...')

  // Catalog: EV statuses
  for (let i = 0; i < EV_STATUSES.length; i++) {
    const s = EV_STATUSES[i]
    await prisma.catalogItem.upsert({
      where: { type_key: { type: 'ev_status', key: s.key } },
      update: { label: s.label, color: s.color, sortOrder: i },
      create: { type: 'ev_status', key: s.key, label: s.label, color: s.color, sortOrder: i },
    })
  }

  // Catalog: Coordination areas
  for (let i = 0; i < COORDINATION_AREAS.length; i++) {
    const area = COORDINATION_AREAS[i]
    await prisma.catalogItem.upsert({
      where: { type_key: { type: 'coordination_area', key: area } },
      update: { label: area, sortOrder: i },
      create: { type: 'coordination_area', key: area, label: area, sortOrder: i },
    })
  }

  // Catalog: Hosting statuses
  for (let i = 0; i < HOSTING_STATUSES.length; i++) {
    const hs = HOSTING_STATUSES[i]
    await prisma.catalogItem.upsert({
      where: { type_key: { type: 'hosting_status', key: hs.key } },
      update: { label: hs.label, color: hs.color, sortOrder: i },
      create: { type: 'hosting_status', key: hs.key, label: hs.label, color: hs.color, sortOrder: i },
    })
  }

  // Default settings
  for (const setting of DEFAULT_SETTINGS) {
    await prisma.appSetting.upsert({
      where: { key: setting.key },
      update: { value: setting.value, group: setting.group, label: setting.label },
      create: {
        key: setting.key,
        value: setting.value,
        group: setting.group,
        label: setting.label,
      },
    })
  }

  // EVs
  const evMap: Record<string, number> = {}
  for (const ev of EVS) {
    const created = await prisma.eV.upsert({
      where: { id: (await prisma.eV.findFirst({ where: { name: ev.name } }))?.id ?? 0 },
      update: {},
      create: {
        name: ev.name,
        region: ev.region,
        country: ev.country,
        status: ev.status,
        totalVolunteers: Math.floor(Math.random() * 30) + 5,
        idoneidad: Math.random() > 0.5,
        planAnual: Math.random() > 0.4,
        visitaPlanif: Math.random() > 0.5,
        visitaRealizada: Math.random() > 0.6,
      },
    })
    evMap[ev.name] = created.id
  }

  // EWA 2025 scores
  for (const [evName, score] of Object.entries(EWA_SCORES_2025)) {
    const evId = evMap[evName]
    if (!evId) continue
    await prisma.eWA.upsert({
      where: { evId_year: { evId, year: 2025 } },
      update: { score },
      create: {
        evId,
        year: 2025,
        score,
        sending: +(Math.random() * 4).toFixed(1),
        hosting: +(Math.random() * 4).toFixed(1),
        preparation: +(Math.random() * 4).toFixed(1),
        devVolunt: +(Math.random() * 4).toFixed(1),
        leadership: +(Math.random() * 4).toFixed(1),
        communityEd: +(Math.random() * 4).toFixed(1),
        finances: +(Math.random() * 4).toFixed(1),
        marketing: +(Math.random() * 4).toFixed(1),
        rrii: +(Math.random() * 4).toFixed(1),
      },
    })
  }

  // Seed some sending records
  const sendingData = [
    { evName: 'Eldorado', cycle: '2024-2025', students: 4 },
    { evName: 'Posadas', cycle: '2024-2025', students: 6 },
    { evName: 'Recoleta', cycle: '2024-2025', students: 8 },
    { evName: 'Redes BUE', cycle: '2024-2025', students: 5 },
    { evName: 'Mar del Plata', cycle: '2024-2025', students: 3 },
    { evName: 'Montevideo', cycle: '2024-2025', students: 4 },
    { evName: 'Paysandú', cycle: '2024-2025', students: 2 },
    { evName: 'Río Gallegos', cycle: '2024-2025', students: 1 },
    { evName: 'Tandil', cycle: '2024-2025', students: 2 },
    { evName: 'La Plata', cycle: '2024-2025', students: 1 },
  ]
  for (const s of sendingData) {
    const evId = evMap[s.evName]
    if (!evId) continue
    const existing = await prisma.sending.findFirst({ where: { evId, cycle: s.cycle } })
    if (!existing) {
      await prisma.sending.create({ data: { evId, cycle: s.cycle, students: s.students } })
    }
  }

  // Seed hosting records
  const hostingData = [
    { evName: 'Eldorado', year: 2025, totalQuota: 4, shQuota: 2, nhQuota: 2 },
    { evName: 'Posadas', year: 2025, totalQuota: 6, shQuota: 3, nhQuota: 3 },
    { evName: 'Recoleta', year: 2025, totalQuota: 8, shQuota: 5, nhQuota: 3 },
    { evName: 'Redes BUE', year: 2025, totalQuota: 5, shQuota: 3, nhQuota: 2 },
    { evName: 'Mar del Plata', year: 2025, totalQuota: 3, shQuota: 2, nhQuota: 1 },
    { evName: 'Montevideo', year: 2025, totalQuota: 4, shQuota: 2, nhQuota: 2 },
  ]
  for (const h of hostingData) {
    const evId = evMap[h.evName]
    if (!evId) continue
    const existing = await prisma.hosting.findFirst({ where: { evId, year: h.year } })
    if (!existing) {
      await prisma.hosting.create({
        data: {
          evId,
          year: h.year,
          totalQuota: h.totalQuota,
          shQuota: h.shQuota,
          nhQuota: h.nhQuota,
          shStatus: 'Confirmado',
          nhStatus: 'En proceso',
        },
      })
    }
  }

  console.log('✅ Seed complete.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
