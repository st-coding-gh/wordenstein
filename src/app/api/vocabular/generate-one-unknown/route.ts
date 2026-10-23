import { after, NextResponse } from 'next/server'
import { GenerationError, prepareGeneration, runGeneration } from '@/services/vocabular/card-generation'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    if (typeof body?.id !== 'string' || !body.id.trim()) {
      return NextResponse.json({ message: 'Select an unknown word' }, { status: 400 })
    }
    const generation = await prepareGeneration(body.id)
    after(() => runGeneration(generation))
    return NextResponse.json({ message: `Generation started for ${generation.words[0].word}`, log: generation.log }, { status: 202 })
  } catch (error) {
    return NextResponse.json({ message: error instanceof Error ? error.message : 'Generation failed' },
      { status: error instanceof GenerationError ? error.status : error instanceof SyntaxError ? 400 : 500 })
  }
}
