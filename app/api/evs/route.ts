export const dynamic = 'force-dynamic'

import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const country = searchParams.get('country')
    const search = searchParams.get('search')

    const where: Record<string, unknown> = {}
    if (status) where.status = status
    if (country) where.country = country
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { region: { contains: search, mode: 'insensitive' } },
        { leaderName: { contains: search, mode: 'insensitive' } },
      ]
    }

    const evs = await prisma.eV.findMany({
      where,
      include: {
        hosting: true,
        sending: true,
        ewa: true,
        tags: { include: { tag: true } },
      },
      orderBy: { name: 'asc' },
    })

    const result = evs.map((ev) => {
      const latestEwa =
        ev.ewa.length > 0
          ? ev.ewa.reduce((prev, curr) => (curr.year > prev.year ? curr : prev))
          : null

      const sendingTotal = ev.sending.reduce((sum, s) => sum + s.students, 0)

      return {
        id: ev.id,
        name: ev.name,
        region: ev.region,
        country: ev.country,
        status: ev.status,
        leaderName: ev.leaderName,
        leaderRole: ev.leaderRole,
        electionDate: ev.electionDate,
        totalVolunteers: ev.totalVolunteers,
        idoneidad: ev.idoneidad,
        planAnual: ev.planAnual,
        visitaPlanif: ev.visitaPlanif,
        visitaRealizada: ev.visitaRealizada,
        createdAt: ev.createdAt,
        updatedAt: ev.updatedAt,
        latestEwa: latestEwa ? { score: latestEwa.score, year: latestEwa.year } : null,
        sendingTotal,
        tags: ev.tags.map((t) => ({ id: t.tag.id, name: t.tag.name, color: t.tag.color })),
      }
    })

    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch EVs' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, region, country, status, leaderName, leaderRole, electionDate, totalVolunteers, idoneidad, planAnual, visitaPlanif, visitaRealizada } = body

    if (!name || !region || !country || !status) {
      return NextResponse.json(
        { error: 'name, region, country, and status are required' },
        { status: 400 }
      )
    }

    const ev = await prisma.eV.create({
      data: {
        name,
        region,
        country,
        status,
        leaderName: leaderName ?? null,
        leaderRole: leaderRole ?? null,
        electionDate: electionDate ? new Date(electionDate) : null,
        totalVolunteers: totalVolunteers ?? 0,
        idoneidad: idoneidad ?? false,
        planAnual: planAnual ?? false,
        visitaPlanif: visitaPlanif ?? false,
        visitaRealizada: visitaRealizada ?? false,
      },
    })

    return NextResponse.json(ev, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create EV' }, { status: 500 })
  }
}
