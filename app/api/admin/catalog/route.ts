export const dynamic = 'force-dynamic'

import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')

    const where: Record<string, unknown> = {}
    if (type) where.type = type

    const items = await prisma.catalogItem.findMany({
      where,
      orderBy: [{ type: 'asc' }, { sortOrder: 'asc' }, { label: 'asc' }],
    })

    return NextResponse.json(items)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch catalog items' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, key, label, color, sortOrder, isActive, metadata } = body

    if (!type || !key || !label) {
      return NextResponse.json({ error: 'type, key, and label are required' }, { status: 400 })
    }

    const item = await prisma.catalogItem.create({
      data: {
        type,
        key,
        label,
        color: color ?? null,
        sortOrder: sortOrder ?? 0,
        isActive: isActive ?? true,
        metadata: metadata ?? null,
      },
    })

    return NextResponse.json(item, { status: 201 })
  } catch (error: unknown) {
    if ((error as { code?: string }).code === 'P2002') {
      return NextResponse.json(
        { error: 'A catalog item with this type+key combination already exists' },
        { status: 409 }
      )
    }
    return NextResponse.json({ error: 'Failed to create catalog item' }, { status: 500 })
  }
}
