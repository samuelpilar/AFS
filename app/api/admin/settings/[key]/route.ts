export const dynamic = 'force-dynamic'

import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { key: string } }
) {
  try {
    const { key } = params

    const setting = await prisma.appSetting.findUnique({
      where: { key },
    })

    if (!setting) {
      return NextResponse.json({ error: 'Setting not found' }, { status: 404 })
    }

    return NextResponse.json(setting)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch setting' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { key: string } }
) {
  try {
    const { key } = params

    const body = await request.json()
    const { value, group, label } = body

    if (value === undefined) {
      return NextResponse.json({ error: 'value is required' }, { status: 400 })
    }

    const data: Record<string, unknown> = { value }
    if (group !== undefined) data.group = group
    if (label !== undefined) data.label = label

    const setting = await prisma.appSetting.update({
      where: { key },
      data,
    })

    return NextResponse.json(setting)
  } catch (error: unknown) {
    if ((error as { code?: string }).code === 'P2025') {
      return NextResponse.json({ error: 'Setting not found' }, { status: 404 })
    }
    return NextResponse.json({ error: 'Failed to update setting' }, { status: 500 })
  }
}
