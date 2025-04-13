import { TErrorRes } from '@/types/api.types'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/services/prisma'

export async function POST(req: NextRequest) {
  const body = (await req.json()) as TErrorRes

  try {
    const res = await handler()
    return NextResponse.json(res)
  } catch (e) {
    const error = e as Error
    const errorResponse: TErrorRes = {
      message: `${error.message}`,
    }
    return NextResponse.json(errorResponse, { status: 500 })
  }
}

async function handler() {
  const cardsWithZeroAnswers = await prisma.card.findMany({
    where: {
      correctAnswers: {
        in: [-1, 0],
      },
    },
  })

  const duplicates = cardsWithZeroAnswers.filter(
    (card, index, self) => self.findIndex(c => c.word === card.word) !== index
  )

  const deleteDuplicates = await prisma.card.deleteMany({
    where: { id: { in: duplicates.map(c => c.id) } },
  })

  return {
    message: `deleted ${deleteDuplicates.count} duplicates`,
  }
}
