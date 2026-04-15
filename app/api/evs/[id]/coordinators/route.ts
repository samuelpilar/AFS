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

    const coordinators = await prisma.coordinator.findMany({
      where: { evId },
      include: { teamMembers: true },
      orderBy: { area: 'asc' },
    })

    return NextResponse.json(coordinators)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch coordinators' }, { status: 500 })
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
    const { area, name, email, phone, since } = body

    if (!area || !name) {
      return NextResponse.json({ error: 'area and name are required' }, { status: 400 })
    }

    const data = {
      name,
      email: email ?? null,
      phone: phone ?? null,
      since: since ? new Date(since) : null,
    }

    const coordinator = await prisma.coordinator.upsert({
      where: { evId_area: { evId, area } },
      update: data,
      create: { evId, area, ...data },
      include: { teamMembers: true },
    })

    return NextResponse.json(coordinator, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create coordinator' }, { status: 500 })
  }
}
