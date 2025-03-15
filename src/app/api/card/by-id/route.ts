import { prisma } from '@/services/prisma'
import { TErrorRes, TCardByIdReq } from '@/types/api.types'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const body = (await req.json()) as TCardByIdReq

  try {
    const res = await handler(body)
    return NextResponse.json(res)
  } catch (e) {
    const error = e as Error
    return NextResponse.json({ message: error.message }, { status: 500 })
  }
}

async function handler(body: TCardByIdReq) {
  const card = await prisma.card.findUniqueOrThrow({
    where: { id: body.id },
  })

  return card
}
