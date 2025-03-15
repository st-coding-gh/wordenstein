import { prisma } from '@/services/prisma'
import { TAnswerResultReq } from '@/types/api.types'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const body = (await req.json()) as TAnswerResultReq

  try {
    const res = await handler(body)

    return NextResponse.json(res)
  } catch (e) {
    const error = e as Error
    return NextResponse.json({ message: error.message }, { status: 500 })
  }
}

async function handler(query: TAnswerResultReq) {
  const updateCorrectAnswers = await prisma.card.update({
    where: { id: query.id },
    data: { correctAnswers: { increment: 1 } },
  })

  return { message: 'success', card: updateCorrectAnswers }
}
