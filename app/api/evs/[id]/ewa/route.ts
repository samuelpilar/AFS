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

    const records = await prisma.eWA.findMany({
      where: { evId },
      orderBy: { year: 'desc' },
    })

    return NextResponse.json(records)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch EWA records' }, { status: 500 })
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

    if (year === undefined || year === null) {
      return NextResponse.json({ error: 'year is required' }, { status: 400 })
    }

    const data = {
      score: score ?? null,
      sending: sending ?? null,
      preparation: preparation ?? null,
      hosting: hosting ?? null,
      devVolunt: devVolunt ?? null,
      leadership: leadership ?? null,
      communityEd: communityEd ?? null,
      finances: finances ?? null,
      marketing: marketing ?? null,
      rrii: rrii ?? null,
      notes: notes ?? '',
    }

    const record = await prisma.eWA.upsert({
      where: { evId_year: { evId, year: Number(year) } },
      update: data,
      create: { evId, year: Number(year), ...data },
    })

    return NextResponse.json(record, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create/update EWA record' }, { status: 500 })
  }
}
