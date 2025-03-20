import { prisma } from '@/services/prisma'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
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
  const allCards = await prisma.card.findMany({
    select: {
      word: true,
      definition: true,
    },
  })

  // filter cards where the definition contains the word
  const filteredCards = allCards.filter(card => {
    return card.definition.toLowerCase().includes(card.word.toLowerCase())
  })

  return filteredCards.map(card => card.word)
}
