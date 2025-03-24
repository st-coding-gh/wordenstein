import {
  TErrorRes,
  TRecordKnownReq,
  TRecordUnknownReq,
} from '@/types/api.types'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/services/prisma'

export async function POST(req: NextRequest) {
  const body = (await req.json()) as TRecordUnknownReq

  try {
    const res = await handler(body)
    return NextResponse.json(res)
  } catch (e) {
    const error = e as Error
    const errorResponse: TErrorRes = {
      message: `${error.message}`,
    }
    return NextResponse.json(errorResponse, { status: 500 })
  }
}

async function handler(body: TRecordUnknownReq) {
  const ids = body.map(lemma => lemma.id)
  const res = await prisma.wordsUnknown.deleteMany({
    where: {
      id: { in: ids },
    },
  })

  return res
}
