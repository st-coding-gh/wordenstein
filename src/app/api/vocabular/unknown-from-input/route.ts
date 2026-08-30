import { TErrorRes, TVocabularUnknownReq } from '@/types/api.types'
import { NextRequest, NextResponse } from 'next/server'
import dotenv from 'dotenv'
import { startInputExtraction } from '@/services/vocabular/input-extraction'

dotenv.config()

export async function POST(req: NextRequest) {
  try {
    const body = await parseRequest(req)
    const res = await startInputExtraction(body)

    return NextResponse.json(res)
  } catch (e) {
    const error = e as Error
    const errorResponse: TErrorRes = {
      message: error.message,
    }

    return NextResponse.json(errorResponse, { status: 500 })
  }
}

async function parseRequest(req: NextRequest): Promise<TVocabularUnknownReq> {
  const contentType = req.headers.get('content-type') ?? ''

  if (contentType.includes('multipart/form-data')) {
    const formData = await req.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      throw new Error('No txt file uploaded')
    }

    const isTxtFile = file.name.toLowerCase().endsWith('.txt')
    const isPlainText = !file.type || file.type === 'text/plain'

    if (!isTxtFile && !isPlainText) {
      throw new Error('Only txt files are supported')
    }

    return {
      text: await file.text(),
      sourceName: file.name,
    }
  }

  return (await req.json()) as TVocabularUnknownReq
}
