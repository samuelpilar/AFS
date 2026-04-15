export const dynamic = 'force-dynamic'

import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id, 10)
    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })
    }

    const ev = await prisma.eV.findUnique({
      where: { id },
      include: {
        hosting: { orderBy: { year: 'desc' } },
        sending: { orderBy: { cycle: 'desc' } },
        ewa: { orderBy: { year: 'desc' } },
        coordinators: {
          include: { teamMembers: true },
          orderBy: { area: 'asc' },
        },
        teamMembers: { orderBy: { name: 'asc' } },
        notes: { orderBy: { createdAt: 'desc' } },
        tags: { include: { tag: true } },
      },
    })

    if (!ev) {
      return NextResponse.json({ error: 'EV not found' }, { status: 404 })
    }

    return NextResponse.json(ev)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch EV' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id, 10)
    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })
    }

    const body = await request.json()
    const {
      name,
      region,
      country,
      status,
      leaderName,
      leaderRole,
      electionDate,
      totalVolunteers,
      idoneidad,
      planAnual,
      visitaPlanif,
      visitaRealizada,
    } = body

    const data: Record<string, unknown> = {}
    if (name !== undefined) data.name = name
    if (region !== undefined) data.region = region
    if (country !== undefined) data.country = country
    if (status !== undefined) data.status = status
    if (leaderName !== undefined) data.leaderName = leaderName
    if (leaderRole !== undefined) data.leaderRole = leaderRole
    if (electionDate !== undefined) data.electionDate = electionDate ? new Date(electionDate) : null
    if (totalVolunteers !== undefined) data.totalVolunteers = totalVolunteers
    if (idoneidad !== undefined) data.idoneidad = idoneidad
    if (planAnual !== undefined) data.planAnual = planAnual
    if (visitaPlanif !== undefined) data.visitaPlanif = visitaPlanif
    if (visitaRealizada !== undefined) data.visitaRealizada = visitaRealizada

    const ev = await prisma.eV.update({
      where: { id },
      data,
    })

    return NextResponse.json(ev)
  } catch (error: unknown) {
    if ((error as { code?: string }).code === 'P2025') {
      return NextResponse.json({ error: 'EV not found' }, { status: 404 })
    }
    return NextResponse.json({ error: 'Failed to update EV' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id, 10)
    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })
    }

    await prisma.eV.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    if ((error as { code?: string }).code === 'P2025') {
      return NextResponse.json({ error: 'EV not found' }, { status: 404 })
    }
    return NextResponse.json({ error: 'Failed to delete EV' }, { status: 500 })
  }
}
