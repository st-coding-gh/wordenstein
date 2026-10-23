import { NextResponse } from 'next/server'
import { gpt } from '@/services/gpt'

export async function POST() {
  try {
    const response = await gpt.imageForCard(
      'A confident person walking with a noticeable and exaggerated stride, chest slightly puffed out, head held high, in an urban setting with people watching.'
    )
    return NextResponse.json({ response })
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Image generation failed' },
      { status: 500 }
    )
  }
}
