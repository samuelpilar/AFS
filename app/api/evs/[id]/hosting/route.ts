export const dynamic = 'force-dynamic'

import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const evId = parseInt(params.id, 10)
    if (isNaN(evId)) {
      return NextResponse.json({ error: 'Invalid EV ID' }, { status: 400 })
    }

    const records = await prisma.hosting.findMany({
      where: { evId },
      orderBy: { year: 'desc' },
    })

    return NextResponse.json(records)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch hosting records' }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const evId = parseInt(params.id, 10)
    if (isNaN(evId)) {
      return NextResponse.json({ error: 'Invalid EV ID' }, { status: 400 })
    }

    const body = await request.json()
    const { year, totalQuota, shQuota, nhQuota, shStatus, nhStatus, notes } = body

    if (year === undefined || year === null) {
      return NextResponse.json({ error: 'year is required' }, { status: 400 })
    }

    const record = await prisma.hosting.create({
      data: {
        evId,
        year: Number(year),
        totalQuota: totalQuota ?? 0,
        shQuota: shQuota ?? 0,
        nhQuota: nhQuota ?? 0,
        shStatus: shStatus ?? 'Pendiente',
        nhStatus: nhStatus ?? 'Pendiente',
        notes: notes ?? '',
      },
    })

    return NextResponse.json(record, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create hosting record' }, { status: 500 })
  }
}
