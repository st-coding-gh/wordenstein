import { TVocabularUnknownReq } from '@/types/api.types'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/services/prisma'
import dotenv from 'dotenv'

dotenv.config()

export async function POST(req: NextRequest) {
  const body = await req.json()

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

async function lemmatize(query: TVocabularUnknownReq) {
  const apiKey = process.env.LEMMA_API_KEY
  const authorization = `Bearer ${apiKey}`

  const apiReq = await fetch('https://lemma.st-coding.com/filter-lemmas', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: authorization,
    },
    body: JSON.stringify(query),
  })

  if (!apiReq.ok) {
    throw new Error('API request failed')
  }

  const res = (await apiReq.json()) as { 'filtered-lemmas': string[] }
  return res['filtered-lemmas']
}
