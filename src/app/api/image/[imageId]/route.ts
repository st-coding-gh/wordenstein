import { NextRequest, NextResponse } from 'next/server'
import { createReadStream } from 'fs'
import { join } from 'path'
import fs from 'fs/promises'
import { Readable } from 'stream'

export const dynamic = 'force-dynamic'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ imageId: string }> }
) {
  const { imageId } = await params
  const filePath = join(process.cwd(), 'uploads/images/cards', `${imageId}.webp`)

  try {
    // Check if file exists
    await fs.access(filePath)

    const stream = createReadStream(filePath)
    const readableStream = Readable.toWeb(stream) as ReadableStream

    return new NextResponse(readableStream, {
      headers: { 'Content-Type': 'image/webp' }
    })
  } catch (error) {
    return new NextResponse('Image not found', { status: 404 })
  }
}