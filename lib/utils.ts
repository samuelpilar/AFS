import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { differenceInDays, differenceInMonths, format, isValid } from 'date-fns'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getEWAColor(score: number | null | undefined): string {
  if (score === null || score === undefined) return '#6b7280'
  if (score >= 2.6) return '#1D9E75'
  if (score >= 1.5) return '#BA7517'
  return '#E24B4A'
}

export function getEWABadgeClasses(score: number | null | undefined): string {
  if (score === null || score === undefined) return 'bg-gray-100 text-gray-500'
  if (score >= 2.6) return 'bg-emerald-50 text-emerald-700'
  if (score >= 1.5) return 'bg-amber-50 text-amber-700'
  return 'bg-red-50 text-red-700'
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'Activa': return '#16a34a'
    case 'Asistida': return '#2563eb'
    case 'Grupo en Desarrollo': return '#d97706'
    default: return '#6b7280'
  }
}

export function getStatusBadgeClasses(status: string): string {
  switch (status) {
    case 'Activa': return 'bg-green-50 text-green-700 border-green-200'
    case 'Asistida': return 'bg-blue-50 text-blue-700 border-blue-200'
    case 'Grupo en Desarrollo': return 'bg-amber-50 text-amber-700 border-amber-200'
    default: return 'bg-gray-100 text-gray-600 border-gray-200'
  }
}

export function getMandateUrgencyClasses(monthsRemaining: number): string {
  if (monthsRemaining <= 1) return 'text-red-600 bg-red-50'
  if (monthsRemaining <= 2) return 'text-amber-600 bg-amber-50'
  return 'text-blue-600 bg-blue-50'
}

export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return '—'
  const d = typeof date === 'string' ? new Date(date) : date
  if (!isValid(d)) return '—'
  return format(d, 'dd/MM/yyyy')
}

export function getMonthsUntilDate(date: Date | string | null | undefined): number | null {
  if (!date) return null
  const d = typeof date === 'string' ? new Date(date) : date
  if (!isValid(d)) return null
  return differenceInMonths(d, new Date())
}

export function getDaysUntilDate(date: Date | string | null | undefined): number | null {
  if (!date) return null
  const d = typeof date === 'string' ? new Date(date) : date
  if (!isValid(d)) return null
  return differenceInDays(d, new Date())
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()
}

export function truncate(str: string, n: number): string {
  return str.length > n ? str.slice(0, n - 1) + '…' : str
}
