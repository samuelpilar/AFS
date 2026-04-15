export const dynamic = 'force-dynamic'

import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  try {
    const settings = await prisma.appSetting.findMany({
      orderBy: [{ group: 'asc' }, { key: 'asc' }],
    })

    const grouped = settings.reduce<Record<string, typeof settings>>(
      (acc, setting) => {
        if (!acc[setting.group]) acc[setting.group] = []
        acc[setting.group].push(setting)
        return acc
      },
      {}
    )

    return NextResponse.json(grouped)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { key, value, group, label } = body

    if (!key || value === undefined || !group) {
      return NextResponse.json({ error: 'key, value, and group are required' }, { status: 400 })
    }

    const setting = await prisma.appSetting.upsert({
      where: { key },
      update: { value, group, label: label ?? null },
      create: { key, value, group, label: label ?? null },
    })

    return NextResponse.json(setting, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create/update setting' }, { status: 500 })
  }
}
