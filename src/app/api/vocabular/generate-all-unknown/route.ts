import { after, NextResponse } from 'next/server'
import { GenerationError, prepareGeneration, runGeneration } from '@/services/vocabular/card-generation'

export async function POST(req: Request) {
  try {
    const text = await req.text()
    const body = text ? JSON.parse(text) : {}
    const limit = body?.limit
    if (limit !== undefined && (!Number.isSafeInteger(limit) || limit < 1)) {
      return NextResponse.json({ message: 'Limit must be a positive integer' }, { status: 400 })
    }
    const generation = await prepareGeneration(undefined, limit)
    after(() => runGeneration(generation))
    return NextResponse.json({ message: 'Generation started', log: generation.log }, { status: 202 })
  } catch (error) {
    return NextResponse.json({ message: error instanceof Error ? error.message : 'Generation failed' },
      { status: error instanceof GenerationError ? error.status : error instanceof SyntaxError ? 400 : 500 })
  }
}
