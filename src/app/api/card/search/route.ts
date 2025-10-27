import { prisma } from '@/services/prisma'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const body = await req.json()
  const { searchTerm } = body

  try {
    if (!searchTerm || searchTerm.trim() === '') {
      return NextResponse.json([])
    }

    const searchTermLower = searchTerm.toLowerCase().trim()

    // SQLite doesn't support case-insensitive contains directly
    // So we fetch all cards and filter in JavaScript
    const allCards = await prisma.card.findMany({
      select: {
        word: true,
      },
      orderBy: {
        word: 'asc',
      },
    })

    const cards = allCards.filter(card =>
      card.word.toLowerCase().includes(searchTermLower)
    )

    const words = cards.map(card => card.word)
    return NextResponse.json(words)
  } catch (e) {
    const error = e as Error
    return NextResponse.json({ message: error.message }, { status: 500 })
  }
}
