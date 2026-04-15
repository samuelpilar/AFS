export const dynamic = 'force-dynamic'

import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; ewaId: string } }
) {
  try {
    const evId = parseInt(params.id, 10)
    const ewaId = parseInt(params.ewaId, 10)
    if (isNaN(evId) || isNaN(ewaId)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })
    }

    const body = await request.json()
    const {
      year,
      score,
      sending,
      preparation,
      hosting,
      devVolunt,
      leadership,
      communityEd,
      finances,
      marketing,
      rrii,
      notes,
    } = body

    const data: Record<string, unknown> = {}
    if (year !== undefined) data.year = Number(year)
    if (score !== undefined) data.score = score
    if (sending !== undefined) data.sending = sending
    if (preparation !== undefined) data.preparation = preparation
    if (hosting !== undefined) data.hosting = hosting
    if (devVolunt !== undefined) data.devVolunt = devVolunt
    if (leadership !== undefined) data.leadership = leadership
    if (communityEd !== undefined) data.communityEd = communityEd
    if (finances !== undefined) data.finances = finances
    if (marketing !== undefined) data.marketing = marketing
    if (rrii !== undefined) data.rrii = rrii
    if (notes !== undefined) data.notes = notes

    const record = await prisma.eWA.update({
      where: { id: ewaId, evId },
      data,
    })

    return NextResponse.json(record)
  } catch (error: unknown) {
    if ((error as { code?: string }).code === 'P2025') {
      return NextResponse.json({ error: 'EWA record not found' }, { status: 404 })
    }
    return NextResponse.json({ error: 'Failed to update EWA record' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; ewaId: string } }
) {
  try {
    const evId = parseInt(params.id, 10)
    const ewaId = parseInt(params.ewaId, 10)
    if (isNaN(evId) || isNaN(ewaId)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })
    }

    await prisma.eWA.delete({ where: { id: ewaId, evId } })

    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    if ((error as { code?: string }).code === 'P2025') {
      return NextResponse.json({ error: 'EWA record not found' }, { status: 404 })
    }
    return NextResponse.json({ error: 'Failed to delete EWA record' }, { status: 500 })
  }
}
