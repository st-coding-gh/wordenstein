import { TVocabularUnknownReq } from '@/types/api.types'
import { NextRequest, NextResponse } from 'next/server'
import { OXFORD_3000 } from './oxford-3000'
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
  const lemmas = await lemmatize({
    text: JSON.stringify(OXFORD_3000, null, 2),
  })

  // record all lemmas to Vocabulary
  const recordLemmas = await prisma.vocabulary.createMany({
    data: lemmas.map(lemma => ({ word: lemma })),
  })

  if (recordLemmas.count !== lemmas.length) {
    throw new Error('Failed to record lemmas to Vocabulary')
  }

  const updateSettings = await prisma.settings.create({
    data: {
      isOxfordRecorded: true,
    },
  })

  return {
    lemmas: lemmas,
    lemmasLength: lemmas.length,
    oxford3000Length: OXFORD_3000.length,
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
