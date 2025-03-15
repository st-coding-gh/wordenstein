import { NextRequest, NextResponse } from 'next/server'
import { createReadStream } from 'fs'
import { join } from 'path'
import fs from 'fs/promises'
import { Readable } from 'stream'

export const dynamic = 'force-dynamic'
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> } // Note the Promise wrapper
) {
  const { id } = await params
  const filePath = join(process.cwd(), 'uploads/images/cards', `${id}.webp`) // Path to stored images

  try {
    await fs.access(filePath) // Ensure file exists

    const stream = createReadStream(filePath)
    const readableStream = Readable.toWeb(stream) as ReadableStream // Convert to Web Stream

    return new NextResponse(readableStream, {
      headers: { 'Content-Type': 'image/webp' }, // Ensure correct MIME type
    })
  } catch {
    return new NextResponse('Image not found', { status: 404 })
  }
}
