import { prisma } from '@/services/prisma'
import { TStatsRes } from '@/types/api.types'
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
  const totalCards = await prisma.card.count()
  const allCards = await prisma.card.findMany()

  const correctAnswersGroupsObject: { [key: string]: number } = {}
  allCards.forEach(card => {
    if (correctAnswersGroupsObject[card.correctAnswers]) {
      correctAnswersGroupsObject[card.correctAnswers] += 1
    } else {
      correctAnswersGroupsObject[card.correctAnswers] = 1
    }
  })

  const correctAnswersGroupsArray = Object.entries(correctAnswersGroupsObject)
  const correctAnswersGroups = correctAnswersGroupsArray
    .map(group => ({
      correctAnswers: +group[0],
      count: group[1],
    }))
    .sort((a, b) => a.correctAnswers - b.correctAnswers)

  const vocabularyLength = await prisma.vocabulary.count()
  const unknownLength = await prisma.wordsUnknown.count()
  const possiblyUnknownLength = await prisma.wordsPossiblyUnknown.count()
  const ignoredLength = await prisma.wordsIgnored.count()

  const res: TStatsRes = {
    totalCards,
    correctAnswersGroups,
    vocabularyLength,
    unknownLength,
    possiblyUnknownLength,
    ignoredLength,
  }

  return res
}
