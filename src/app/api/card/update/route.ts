import { prisma } from '@/services/prisma'
import { TCard } from '@/types/card'
import { NextResponse, NextRequest } from 'next/server'

export async function POST(req: NextRequest) {
  const body = (await req.json()) as TCard

  try {
    const res = await handler(body)

    return NextResponse.json(res)
  } catch (e) {
    const error = e as Error
    return NextResponse.json({ message: error.message }, { status: 500 })
  }
}

async function handler(body: TCard) {
  // Extract and process the data to ensure proper types for Prisma
  const { id, image, ...updateData } = body

  const card = await prisma.card.update({
    where: { id },
    data: {
      ...updateData,
      // Handle image field properly for Prisma JsonValue
      ...(image !== undefined && { image: image as any })
    },
  })

  return card
}
