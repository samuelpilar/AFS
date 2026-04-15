export const dynamic = 'force-dynamic'

import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; memberId: string } }
) {
  try {
    const evId = parseInt(params.id, 10)
    const memberId = parseInt(params.memberId, 10)
    if (isNaN(evId) || isNaN(memberId)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })
    }

    const body = await request.json()
    const { name, role, email, phone, coordinatorId } = body

    const data: Record<string, unknown> = {}
    if (name !== undefined) data.name = name
    if (role !== undefined) data.role = role
    if (email !== undefined) data.email = email
    if (phone !== undefined) data.phone = phone
    if (coordinatorId !== undefined) data.coordinatorId = coordinatorId

    const member = await prisma.teamMember.update({
      where: { id: memberId, evId },
      data,
    })

    return NextResponse.json(member)
  } catch (error: unknown) {
    if ((error as { code?: string }).code === 'P2025') {
      return NextResponse.json({ error: 'Team member not found' }, { status: 404 })
    }
    return NextResponse.json({ error: 'Failed to update team member' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; memberId: string } }
) {
  try {
    const evId = parseInt(params.id, 10)
    const memberId = parseInt(params.memberId, 10)
    if (isNaN(evId) || isNaN(memberId)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })
    }

    await prisma.teamMember.delete({ where: { id: memberId, evId } })

    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    if ((error as { code?: string }).code === 'P2025') {
      return NextResponse.json({ error: 'Team member not found' }, { status: 404 })
    }
    return NextResponse.json({ error: 'Failed to delete team member' }, { status: 500 })
  }
}
