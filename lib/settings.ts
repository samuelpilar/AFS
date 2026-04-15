import { prisma } from './prisma'

export type SettingValue = string | number | boolean | Record<string, unknown> | unknown[]

interface SettingDefaults {
  mandate_alert_months: number
  active_year: number
  ewa_threshold_green: number
  ewa_threshold_yellow: number
  sending_cycles: string[]
  exports_enabled: boolean
  app_name: string
  chart_visibility: { sending_chart: boolean; ewa_ranking: boolean; mandate_alerts: boolean }
  dashboard_kpi_labels: Record<string, string>
  sidebar_labels: Record<string, string>
  empty_state_messages: Record<string, string>
  default_filters: Record<string, string>
}

const DEFAULTS: SettingDefaults = {
  mandate_alert_months: 3,
  active_year: 2025,
  ewa_threshold_green: 2.6,
  ewa_threshold_yellow: 1.5,
  sending_cycles: ['2024-2025', '2025-2026', '2026-2027'],
  exports_enabled: true,
  app_name: 'AFS EV Manager',
  chart_visibility: { sending_chart: true, ewa_ranking: true, mandate_alerts: true },
  dashboard_kpi_labels: {
    total_evs: 'Total EVs',
    activas: 'Activas',
    asistidas: 'Asistidas',
    en_desarrollo: 'En Desarrollo',
  },
  sidebar_labels: {
    dashboard: 'Dashboard',
    directorio: 'Directorio',
    admin: 'Administración',
  },
  empty_state_messages: {
    no_evs: 'No se encontraron EVs con los filtros actuales.',
    no_ewa: 'Sin evaluación EWA registrada.',
    no_notes: 'Sin notas registradas.',
  },
  default_filters: { country: 'all', status: 'all' },
}

export async function getSetting<K extends keyof SettingDefaults>(
  key: K
): Promise<SettingDefaults[K]> {
  try {
    const row = await prisma.appSetting.findUnique({ where: { key } })
    if (!row) return DEFAULTS[key]
    return row.value as SettingDefaults[K]
  } catch {
    return DEFAULTS[key]
  }
}

export async function getAllSettings(): Promise<Record<string, SettingValue>> {
  try {
    const rows = await prisma.appSetting.findMany()
    const result: Record<string, SettingValue> = { ...DEFAULTS }
    for (const row of rows) {
      result[row.key] = row.value as SettingValue
    }
    return result
  } catch {
    return DEFAULTS as unknown as Record<string, SettingValue>
  }
}

export async function setSetting(key: string, value: SettingValue, group: string, label?: string) {
  // Prisma Json type requires a serializable value
  const jsonValue = value as Parameters<typeof prisma.appSetting.create>[0]['data']['value']
  return prisma.appSetting.upsert({
    where: { key },
    update: { value: jsonValue, group, label },
    create: { key, value: jsonValue, group, label: label ?? key },
  })
}

export async function getCatalog(type: string) {
  try {
    return prisma.catalogItem.findMany({
      where: { type, isActive: true },
      orderBy: { sortOrder: 'asc' },
    })
  } catch {
    return []
  }
}
