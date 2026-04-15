export const dynamic = 'force-dynamic'

import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; hostingId: string } }
) {
  try {
    const evId = parseInt(params.id, 10)
    const hostingId = parseInt(params.hostingId, 10)
    if (isNaN(evId) || isNaN(hostingId)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })
    }

    const body = await request.json()
    const { year, totalQuota, shQuota, nhQuota, shStatus, nhStatus, notes } = body

    const data: Record<string, unknown> = {}
    if (year !== undefined) data.year = Number(year)
    if (totalQuota !== undefined) data.totalQuota = totalQuota
    if (shQuota !== undefined) data.shQuota = shQuota
    if (nhQuota !== undefined) data.nhQuota = nhQuota
    if (shStatus !== undefined) data.shStatus = shStatus
    if (nhStatus !== undefined) data.nhStatus = nhStatus
    if (notes !== undefined) data.notes = notes

    const record = await prisma.hosting.update({
      where: { id: hostingId, evId },
      data,
    })

    return NextResponse.json(record)
  } catch (error: unknown) {
    if ((error as { code?: string }).code === 'P2025') {
      return NextResponse.json({ error: 'Hosting record not found' }, { status: 404 })
    }
    return NextResponse.json({ error: 'Failed to update hosting record' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; hostingId: string } }
) {
  try {
    const evId = parseInt(params.id, 10)
    const hostingId = parseInt(params.hostingId, 10)
    if (isNaN(evId) || isNaN(hostingId)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })
    }

    await prisma.hosting.delete({ where: { id: hostingId, evId } })

    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    if ((error as { code?: string }).code === 'P2025') {
      return NextResponse.json({ error: 'Hosting record not found' }, { status: 404 })
    }
    return NextResponse.json({ error: 'Failed to delete hosting record' }, { status: 500 })
  }
}
