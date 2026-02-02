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
  const correctAnswersFilter: { gte?: number; lte?: number } = {}
  if (query.minLevel !== undefined) {
    correctAnswersFilter.gte = query.minLevel
  }
  if (query.maxLevel !== undefined) {
    correctAnswersFilter.lte = query.maxLevel
  }

  const cards: TCard[] = await prisma.card.findMany({
    where:
      correctAnswersFilter.gte !== undefined ||
      correctAnswersFilter.lte !== undefined
        ? { correctAnswers: correctAnswersFilter }
        : undefined,
    orderBy: { correctAnswers: 'asc' },
  })

  const shuffled = cards.sort(() => Math.random() - 0.5)

  return shuffled
}
