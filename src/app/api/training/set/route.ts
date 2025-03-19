import { prisma } from '@/services/prisma'
import { TErrorRes, TTrainingSettingReq } from '@/types/api.types'
import { TCard } from '@/types/card'
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
  let cards: TCard[] = []

  const level = {
    beginner: 0,
    intermediate: [1, 2, 3],
    advanced: 4,
  }

  switch (query.trainingType) {
    case 'beginner-from-english':
      cards = await prisma.card.findMany({
        // where correctAnswers equal or below 0
        where: { correctAnswers: { lte: level.beginner } },
        orderBy: { correctAnswers: 'asc' },
      })
      break

    case 'beginner-from-image-russian':
      cards = await prisma.card.findMany({
        // where correctAnswers equal or below 0
        where: { correctAnswers: { lte: level.beginner } },
        orderBy: { correctAnswers: 'asc' },
      })
      break

    case 'intermediate-from-image-russian':
      // where correctAnswers is 1,2 or 3
      cards = await prisma.card.findMany({
        where: { correctAnswers: { in: level.intermediate } },
        orderBy: { correctAnswers: 'asc' },
      })
      break

    case 'advanced-from-russian':
      // where correctAnswers is greater or equal to 4
      cards = await prisma.card.findMany({
        where: { correctAnswers: { gte: level.advanced } },
        orderBy: { correctAnswers: 'asc' },
      })
      break

    case 'advanced-from-definition':
      // where correctAnswers is greater or equal to 4
      cards = await prisma.card.findMany({
        where: { correctAnswers: { gte: level.advanced } },
        orderBy: { correctAnswers: 'asc' },
      })
      break
  }

  const shuffled = cards.sort(() => Math.random() - 0.5)

  if (query.limit && shuffled.length < query.limit) return shuffled
  if (query.limit) return shuffled.slice(0, query.limit)
  return shuffled
}
