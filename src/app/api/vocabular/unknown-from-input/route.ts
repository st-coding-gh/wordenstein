import { TVocabularUnknownReq } from '@/types/api.types'
import { NextRequest, NextResponse } from 'next/server'
import dotenv from 'dotenv'
import { prisma } from '@/services/prisma'
import { lemmatize } from '@/services/lemma'

dotenv.config()

export async function POST(req: NextRequest) {
  const body = (await req.json()) as TVocabularUnknownReq

  try {
    const res = await handler(body)
    return NextResponse.json(res)
  } catch (e) {
    const error = e as Error
    return NextResponse.json({ message: error.message }, { status: 500 })
  }
}

async function handler(body: TVocabularUnknownReq) {
  const lemmas = await lemmatize(body)

  // filter lemmas that are already in Vocabulary table
  const vocabulary = (
    await prisma.vocabulary.findMany({
      select: {
        word: true,
      },
    })
  ).map(vocab => vocab.word)

  const ignored = (
    await prisma.wordsIgnored.findMany({
      select: {
        word: true,
      },
    })
  ).map(lemma => lemma.word)

  const combined = [...vocabulary, ...ignored]

  const filteredLemmas = lemmas.filter(lemma => !combined.includes(lemma))

  // record all filtered lemmas to possibly unknown words
  const recordLemmas = await prisma.wordsPossiblyUnknown.createMany({
    data: filteredLemmas.map(lemma => ({ word: lemma })),
  })

  return filteredLemmas
}
