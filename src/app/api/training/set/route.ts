import { prisma } from '@/services/prisma'
import { TErrorRes, TTrainingSettingReq } from '@/types/api.types'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const body = (await req.json()) as TTrainingSettingReq

  try {
    const res = await handler(body)

    return NextResponse.json(res)
  } catch (e) {
    const error = e as Error
    return NextResponse.json({ message: error.message }, { status: 500 })
  }
}

async function handler(query: TTrainingSettingReq) {
  const cards = await prisma.card.findMany({
    orderBy: { correctAnswers: 'asc' },
  })
  const totalCardsRequested = query.cardsLeastKnown + query.randomCards

  if (cards.length <= totalCardsRequested) {
    const shuffled = cards.sort(() => Math.random() - 0.5)
    return shuffled
  }

  const leastKnownCards = cards.slice(0, query.cardsLeastKnown)
  const restOfCards = cards.slice(query.cardsLeastKnown)
  const randomCards = restOfCards
    .sort(() => Math.random() - 0.5)
    .slice(0, query.randomCards)
  const combined = [...leastKnownCards, ...randomCards]
  const shuffled = combined.sort(() => Math.random() - 0.5)
  return shuffled
}
