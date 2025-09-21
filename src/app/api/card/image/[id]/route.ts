import { NextRequest, NextResponse } from 'next/server'
import { createReadStream } from 'fs'
import { join } from 'path'
import fs from 'fs/promises'
import { Readable } from 'stream'
import { prisma } from '@/services/prisma'

export const dynamic = 'force-dynamic'
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> } // Note the Promise wrapper
) {
  const { id } = await params
  const uploadsDir = join(process.cwd(), 'uploads/images/cards')

  try {
    let imageFileName: string

    // First, try to find the card and get its image ID(s)
    const card = await prisma.card.findUnique({
      where: { id },
      select: { image: true }
    })

    if (card?.image && Array.isArray(card.image) && card.image.length > 0) {
      // Use the first image ID from the array
      imageFileName = `${card.image[0]}.webp`
    } else {
      // Fallback to old system: use card ID as filename
      imageFileName = `${id}.webp`
    }

    const filePath = join(uploadsDir, imageFileName)

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
