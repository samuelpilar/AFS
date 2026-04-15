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

    const records = await prisma.sending.findMany({
      where: { evId },
      orderBy: { cycle: 'desc' },
    })

    return NextResponse.json(records)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch sending records' }, { status: 500 })
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
    const { cycle, students, notes } = body

    if (!cycle) {
      return NextResponse.json({ error: 'cycle is required' }, { status: 400 })
    }

    const record = await prisma.sending.create({
      data: {
        evId,
        cycle,
        students: students ?? 0,
        notes: notes ?? '',
      },
    })

    return NextResponse.json(record, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create sending record' }, { status: 500 })
  }
}
