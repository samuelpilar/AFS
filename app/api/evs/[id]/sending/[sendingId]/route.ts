export const dynamic = 'force-dynamic'

import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; sendingId: string } }
) {
  try {
    const evId = parseInt(params.id, 10)
    const sendingId = parseInt(params.sendingId, 10)
    if (isNaN(evId) || isNaN(sendingId)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })
    }

    const body = await request.json()
    const { cycle, students, notes } = body

    const data: Record<string, unknown> = {}
    if (cycle !== undefined) data.cycle = cycle
    if (students !== undefined) data.students = students
    if (notes !== undefined) data.notes = notes

    const record = await prisma.sending.update({
      where: { id: sendingId, evId },
      data,
    })

    return NextResponse.json(record)
  } catch (error: unknown) {
    if ((error as { code?: string }).code === 'P2025') {
      return NextResponse.json({ error: 'Sending record not found' }, { status: 404 })
    }
    return NextResponse.json({ error: 'Failed to update sending record' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; sendingId: string } }
) {
  try {
    const evId = parseInt(params.id, 10)
    const sendingId = parseInt(params.sendingId, 10)
    if (isNaN(evId) || isNaN(sendingId)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })
    }

    await prisma.sending.delete({ where: { id: sendingId, evId } })

    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    if ((error as { code?: string }).code === 'P2025') {
      return NextResponse.json({ error: 'Sending record not found' }, { status: 404 })
    }
    return NextResponse.json({ error: 'Failed to delete sending record' }, { status: 500 })
  }
}
