import { TErrorRes } from '@/types/api.types'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/services/prisma'
import { gpt } from '@/services/gpt'
import { TGptTextToText } from '@/types/gpt'

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

const prompt =
  'A confident person walking with a noticeable and exaggerated stride, chest slightly puffed out, head held high, in an urban setting with people watching.'

async function handler() {
  const res = (await gpt.textToImage({
    model: 'img-stable/stable-diffusion-xl-1024',
    prompt: prompt,
  })) as unknown as string

  const resToJson = JSON.parse(res) as {
    created: number
    data: { b64_json: string }[]
    model: string
  }

  return {
    response: resToJson.data[0].b64_json,
  }
}
