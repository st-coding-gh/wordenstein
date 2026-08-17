import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/services/prisma'
import dotenv from 'dotenv'
import { lemmatize } from '@/services/lemma'

dotenv.config()

export async function POST(req: NextRequest) {
  await req.json()

  try {
    const res = await handler()
    return NextResponse.json(res)
  } catch (e) {
    const error = e as Error
    return NextResponse.json({ message: error.message }, { status: 500 })
  }
}

async function handler() {
  const cards = (
    await prisma.card.findMany({
      select: {
        word: true,
      },
    })
  ).map(card => card.word)

  const lemmas = await lemmatize({
    text: JSON.stringify(cards, null, 2),
  })

  const vocabulary = (
    await prisma.vocabulary.findMany({
      select: {
        word: true,
      },
    })
  ).map(vocab => vocab.word)

  const filteredLemmas = lemmas.filter(lemma => !vocabulary.includes(lemma))

  // record all filteredLemmas to Vocabulary
  const recordLemmas = await prisma.vocabulary.createMany({
    data: filteredLemmas.map(lemma => ({ word: lemma })),
  })

  if (recordLemmas.count !== filteredLemmas.length) {
    throw new Error('Failed to record lemmas to Vocabulary')
  }

  const updateSettings = await prisma.settings.create({
    data: {
      isCardsRecordedToVocabular: true,
    },
  })

  return {
    recordLemmas: recordLemmas,
    updateSettings: updateSettings,
  }
}
