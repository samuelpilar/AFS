export const dynamic = 'force-dynamic'

import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

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
    const { type, key, label, color, sortOrder, isActive, metadata } = body

    const data: Record<string, unknown> = {}
    if (type !== undefined) data.type = type
    if (key !== undefined) data.key = key
    if (label !== undefined) data.label = label
    if (color !== undefined) data.color = color
    if (sortOrder !== undefined) data.sortOrder = sortOrder
    if (isActive !== undefined) data.isActive = isActive
    if (metadata !== undefined) data.metadata = metadata

    const item = await prisma.catalogItem.update({
      where: { id },
      data,
    })

    return NextResponse.json(item)
  } catch (error: unknown) {
    if ((error as { code?: string }).code === 'P2025') {
      return NextResponse.json({ error: 'Catalog item not found' }, { status: 404 })
    }
    if ((error as { code?: string }).code === 'P2002') {
      return NextResponse.json(
        { error: 'A catalog item with this type+key combination already exists' },
        { status: 409 }
      )
    }
    return NextResponse.json({ error: 'Failed to update catalog item' }, { status: 500 })
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

    await prisma.catalogItem.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    if ((error as { code?: string }).code === 'P2025') {
      return NextResponse.json({ error: 'Catalog item not found' }, { status: 404 })
    }
    return NextResponse.json({ error: 'Failed to delete catalog item' }, { status: 500 })
  }
}
