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

    const notes = await prisma.eVNote.findMany({
      where: { evId },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(notes)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch notes' }, { status: 500 })
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
    const { title, content } = body

    if (!title || !content) {
      return NextResponse.json({ error: 'title and content are required' }, { status: 400 })
    }

    const note = await prisma.eVNote.create({
      data: { evId, title, content },
    })

    return NextResponse.json(note, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create note' }, { status: 500 })
  }
}
