import { NextRequest, NextResponse } from 'next/server'
import { unlink } from 'fs/promises'
import { join } from 'path'
import { prisma } from '@/services/prisma'

export async function POST(req: NextRequest) {
  try {
    const { cardId, imageId } = await req.json()

    if (!cardId || !imageId) {
      return NextResponse.json(
        { error: 'Missing cardId or imageId' },
        { status: 400 }
      )
    }

    // Get current card data
    const card = await prisma.card.findUnique({
      where: { id: cardId },
      select: { id: true, image: true }
    })

    if (!card) {
      return NextResponse.json({ error: 'Card not found' }, { status: 404 })
    }

    // Check if image exists in card's image array
    const currentImages = card.image && Array.isArray(card.image)
      ? card.image
      : []

    if (!currentImages.includes(imageId)) {
      return NextResponse.json(
        { error: 'Image not found in card' },
        { status: 404 }
      )
    }

    // Remove image ID from card's image array
    const updatedImages = currentImages.filter(id => id !== imageId)

    // Update card in database
    await prisma.card.update({
      where: { id: cardId },
      data: { image: updatedImages.length > 0 ? updatedImages as any : null }
    })

    // Delete image file from filesystem
    const uploadsDir = join(process.cwd(), 'uploads/images/cards')
    const imageFileName = `${imageId}.webp`
    const imagePath = join(uploadsDir, imageFileName)

    try {
      await unlink(imagePath)
      console.log(`Deleted image file: ${imageFileName}`)
    } catch (fileError) {
      console.warn(`Could not delete image file ${imageFileName}:`, fileError)
      // Don't fail the API call if file deletion fails
    }

    return NextResponse.json({
      success: true,
      message: 'Image deleted successfully',
      remainingImages: updatedImages.length
    })

  } catch (error) {
    console.error('Error deleting image:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to delete image',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}