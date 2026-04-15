export const dynamic = 'force-dynamic'

import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; coordId: string } }
) {
  try {
    const evId = parseInt(params.id, 10)
    const coordId = parseInt(params.coordId, 10)
    if (isNaN(evId) || isNaN(coordId)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })
    }

    const members = await prisma.teamMember.findMany({
      where: { evId, coordinatorId: coordId },
      orderBy: { name: 'asc' },
    })

    return NextResponse.json(members)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch team members' }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string; coordId: string } }
) {
  try {
    const evId = parseInt(params.id, 10)
    const coordId = parseInt(params.coordId, 10)
    if (isNaN(evId) || isNaN(coordId)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })
    }

    const body = await request.json()
    const { name, role, email, phone } = body

    if (!name) {
      return NextResponse.json({ error: 'name is required' }, { status: 400 })
    }

    const member = await prisma.teamMember.create({
      data: {
        evId,
        coordinatorId: coordId,
        name,
        role: role ?? null,
        email: email ?? null,
        phone: phone ?? null,
      },
    })

    return NextResponse.json(member, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create team member' }, { status: 500 })
  }
}
