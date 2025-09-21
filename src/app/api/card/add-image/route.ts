import { NextResponse } from 'next/server'
import { writeFile } from 'fs/promises'
import path from 'path'
import sharp from 'sharp'
import { prisma } from '@/services/prisma'
import { randomUUID } from 'crypto'

const uploadDir = path.join(process.cwd(), 'uploads/images/cards')

export async function POST(req: Request) {
  try {
    const formData = await req.formData()

    // Extract file
    const file = formData.get('image') as File | null
    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }

    // Extract card ID
    const cardId = formData.get('cardId') as string | null
    if (!cardId) {
      return NextResponse.json({ error: 'Missing card ID' }, { status: 400 })
    }

    // Verify card exists
    const existingCard = await prisma.card.findUnique({
      where: { id: cardId },
      select: { id: true, image: true }
    })

    if (!existingCard) {
      return NextResponse.json({ error: 'Card not found' }, { status: 404 })
    }

    // Generate unique image ID
    const imageId = randomUUID()

    // Convert file to Buffer
    const fileBuffer = Buffer.from(await file.arrayBuffer())

    // Generate final filename using unique image ID
    const finalFileName = `${imageId}.webp`
    const finalFilePath = path.join(uploadDir, finalFileName)

    // Process image: Resize and convert to WebP
    const processedImage = await sharp(fileBuffer)
      .resize({ width: 500 })
      .webp({ quality: 80, effort: 6 })
      .toBuffer()

    // Save processed image
    await writeFile(finalFilePath, processedImage)

    // Update card with new image ID
    const currentImages = existingCard.image && Array.isArray(existingCard.image)
      ? existingCard.image
      : []

    const updatedImages = [...currentImages, imageId]

    await prisma.card.update({
      where: { id: cardId },
      data: { image: updatedImages }
    })

    return NextResponse.json({
      success: true,
      message: 'Image added successfully',
      imageId,
      totalImages: updatedImages.length
    })

  } catch (error) {
    console.error('Error adding image to card:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}