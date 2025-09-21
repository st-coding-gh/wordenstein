import { TErrorRes, TCardByIdReq } from '@/types/api.types'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/services/prisma'
import { unlink } from 'fs/promises'
import { join } from 'path'

export async function POST(req: NextRequest) {
  const body = (await req.json()) as TCardByIdReq

  try {
    const res = await handler(body)
    return NextResponse.json(res)
  } catch (e) {
    const error = e as Error
    const errorResponse: TErrorRes = {
      message: `${error.message}`,
    }
    return NextResponse.json(errorResponse, { status: 500 })
  }
}

async function handler(body: TCardByIdReq) {
  const uploadsDir = join(process.cwd(), 'uploads/images/cards')

  // First, get the card data before deletion to access image information
  const card = await prisma.card.findUnique({
    where: { id: body.id },
    select: { id: true, image: true }
  })

  if (!card) {
    throw new Error('Card not found')
  }

  // Delete the card from database
  const deleted = await prisma.card.delete({
    where: { id: body.id }
  })

  // Delete associated image files
  await deleteCardImages(card, uploadsDir)

  return deleted
}

async function deleteCardImages(
  card: { id: string; image: any },
  uploadsDir: string
) {
  const filesToDelete: string[] = []

  // If card has image IDs in the new system
  if (card.image && Array.isArray(card.image) && card.image.length > 0) {
    // Add all image IDs from the array
    for (const imageId of card.image) {
      filesToDelete.push(`${imageId}.webp`)
    }
  }

  // Always try to delete legacy file (card ID as filename) for backward compatibility
  filesToDelete.push(`${card.id}.webp`)

  // Remove duplicates
  const uniqueFiles = [...new Set(filesToDelete)]

  // Delete each file, but don't fail if some files don't exist
  for (const filename of uniqueFiles) {
    try {
      const filePath = join(uploadsDir, filename)
      await unlink(filePath)
      console.log(`Deleted image file: ${filename}`)
    } catch (error) {
      // File might not exist or already be deleted - log but don't fail
      console.warn(`Could not delete image file ${filename}:`, error)
    }
  }
}
