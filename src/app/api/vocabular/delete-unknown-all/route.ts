import { TErrorRes } from '@/types/api.types'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/services/prisma'

export async function POST(req: NextRequest) {
  const body = await req.json()

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
  const deleted = await prisma.wordsUnknown.deleteMany({})

  return {
    deleted: deleted.count,
  }
}
