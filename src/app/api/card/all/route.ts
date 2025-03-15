import { prisma } from '@/services/prisma'
import { TErrorRes } from '@/types/api.types'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const body = await req.json()

  try {
    const res = await handler()
    return NextResponse.json(res)
  } catch (e) {
    const error = e as Error
    return NextResponse.json({ message: error.message }, { status: 500 })
  }
}

async function handler() {
  const cards = await prisma.card.findMany({
    select: {
      id: true,
      word: true,
      definition: true,
    },
    orderBy: { word: 'asc' },
  })
  return cards
}
