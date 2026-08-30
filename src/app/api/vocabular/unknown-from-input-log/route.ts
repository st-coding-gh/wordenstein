import { TErrorRes } from '@/types/api.types'
import { NextResponse } from 'next/server'
import { getInputExtractionLogs } from '@/services/vocabular/input-extraction'

export async function POST() {
  try {
    const res = await getInputExtractionLogs()

    return NextResponse.json(res)
  } catch (e) {
    const error = e as Error
    const errorResponse: TErrorRes = {
      message: `${error.message}`,
    }

    return NextResponse.json(errorResponse, { status: 500 })
  }
}
