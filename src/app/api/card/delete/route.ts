import { TErrorRes, TCardByIdReq } from '@/types/api.types'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/services/prisma'

export async function POST(req: NextRequest) {
  const body = (await req.json()) as TCardByIdReq

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

async function handler(body: TCardByIdReq) {
  const deleted = await prisma.card.delete({
    where: {
      id: body.id,
    },
  })

  return deleted
}
