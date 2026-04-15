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

    const coordinator = await prisma.coordinator.findUnique({
      where: { id: coordId, evId },
      include: { teamMembers: true },
    })

    if (!coordinator) {
      return NextResponse.json({ error: 'Coordinator not found' }, { status: 404 })
    }

    return NextResponse.json(coordinator)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch coordinator' }, { status: 500 })
  }
}

export async function PUT(
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
    const { area, name, email, phone, since } = body

    const data: Record<string, unknown> = {}
    if (area !== undefined) data.area = area
    if (name !== undefined) data.name = name
    if (email !== undefined) data.email = email
    if (phone !== undefined) data.phone = phone
    if (since !== undefined) data.since = since ? new Date(since) : null

    const coordinator = await prisma.coordinator.update({
      where: { id: coordId, evId },
      data,
      include: { teamMembers: true },
    })

    return NextResponse.json(coordinator)
  } catch (error: unknown) {
    if ((error as { code?: string }).code === 'P2025') {
      return NextResponse.json({ error: 'Coordinator not found' }, { status: 404 })
    }
    return NextResponse.json({ error: 'Failed to update coordinator' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; coordId: string } }
) {
  try {
    const evId = parseInt(params.id, 10)
    const coordId = parseInt(params.coordId, 10)
    if (isNaN(evId) || isNaN(coordId)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })
    }

    await prisma.coordinator.delete({ where: { id: coordId, evId } })

    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    if ((error as { code?: string }).code === 'P2025') {
      return NextResponse.json({ error: 'Coordinator not found' }, { status: 404 })
    }
    return NextResponse.json({ error: 'Failed to delete coordinator' }, { status: 500 })
  }
}
