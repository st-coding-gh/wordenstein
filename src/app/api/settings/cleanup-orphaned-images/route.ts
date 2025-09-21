import { NextRequest, NextResponse } from 'next/server'
import { readdir, unlink } from 'fs/promises'
import { join } from 'path'
import { prisma } from '@/services/prisma'

export async function POST(req: NextRequest) {
  try {
    const result = await cleanupOrphanedImages()
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error cleaning up orphaned images:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to cleanup orphaned images',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

async function cleanupOrphanedImages() {
  const uploadsDir = join(process.cwd(), 'uploads/images/cards')

  try {
    // Get all image files from filesystem
    const files = await readdir(uploadsDir)
    const imageFiles = files.filter(file => file.endsWith('.webp'))

    // Get all referenced image IDs from database
    const cards = await prisma.card.findMany({
      select: { id: true, image: true }
    })

    const referencedImages = new Set<string>()

    // Collect all image references
    for (const card of cards) {
      // Add legacy card ID reference
      referencedImages.add(`${card.id}.webp`)

      // Add new image ID references
      if (card.image && Array.isArray(card.image)) {
        for (const imageId of card.image) {
          referencedImages.add(`${imageId}.webp`)
        }
      }
    }

    // Find orphaned files
    const orphanedFiles = imageFiles.filter(file => !referencedImages.has(file))

    let deletedCount = 0
    const errors: string[] = []

    // Delete orphaned files
    for (const file of orphanedFiles) {
      try {
        const filePath = join(uploadsDir, file)
        await unlink(filePath)
        deletedCount++
        console.log(`Deleted orphaned image: ${file}`)
      } catch (error) {
        const errorMsg = `Failed to delete ${file}: ${error}`
        errors.push(errorMsg)
        console.error(errorMsg)
      }
    }

    return {
      success: true,
      message: `Cleanup completed. Deleted ${deletedCount} orphaned images.`,
      totalFiles: imageFiles.length,
      referencedFiles: referencedImages.size,
      orphanedFiles: orphanedFiles.length,
      deletedCount,
      errors: errors.length > 0 ? errors : undefined
    }

  } catch (error) {
    throw new Error(`Failed to access uploads directory: ${error}`)
  }
}