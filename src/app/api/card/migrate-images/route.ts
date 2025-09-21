import { prisma } from '@/services/prisma'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    // Get all cards that don't have the image field populated
    const cards = await prisma.card.findMany({
      select: {
        id: true,
        image: true
      }
    })

    let migratedCount = 0

    // Update each card to have its ID in the image array
    for (const card of cards) {
      // Only migrate cards that don't already have the image field populated
      if (!card.image) {
        await prisma.card.update({
          where: { id: card.id },
          data: {
            image: [card.id]
          }
        })
        migratedCount++
      }
    }

    return NextResponse.json({
      success: true,
      message: `Successfully migrated ${migratedCount} cards`,
      migratedCount
    })

  } catch (error) {
    console.error('Error migrating card images:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to migrate card images',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}