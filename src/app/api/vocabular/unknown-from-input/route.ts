import { TVocabularUnknownReq } from '@/types/api.types'
import { NextRequest, NextResponse } from 'next/server'
import dotenv from 'dotenv'
import { prisma } from '@/services/prisma'
import { lemmatize } from '@/services/lemma'
import { gpt } from '@/services/gpt'

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
  const rejectedLemmas = await findRejectedLemmas(filteredLemmas)
  const finalFilteredLemmas = filteredLemmas.filter(
    lemma => !rejectedLemmas.includes(lemma)
  )

  // record all filtered lemmas to possibly unknown words
  const recordLemmas = await prisma.wordsPossiblyUnknown.createMany({
    data: finalFilteredLemmas.map(lemma => ({ word: lemma })),
  })

  return finalFilteredLemmas
}

async function findRejectedLemmas(lemmas: string[]) {
  if (lemmas.length === 0) {
    return []
  }

  const prompt = [
    'You clean a candidate English vocabulary list extracted from fiction.',
    'Return only a JSON array of strings.',
    'Include only items from the provided list that should be removed.',
    'Remove proper names, fictional names, malformed tokens, punctuation artifacts, possessives, non-English words, and tokens that are not useful standalone English vocabulary words.',
    'Do not remove normal English vocabulary words, even if uncommon.',
    `Candidates: ${JSON.stringify(lemmas)}`,
  ].join('\n')

  const response = await gpt.textToText({
    model: 'openai/gpt-4o-mini',
    prompt,
  })

  if (!response) {
    throw new Error('GPT cleanup returned an empty response')
  }

  const parsed = parseJsonArray(response)
  const knownLemmas = new Set(lemmas)

  return parsed.filter(lemma => knownLemmas.has(lemma))
}

function parseJsonArray(response: string) {
  const json = response.match(/\[[\s\S]*\]/)?.[0]

  if (!json) {
    throw new Error('GPT cleanup response did not contain a JSON array')
  }

  const parsed = JSON.parse(json) as unknown

  if (!Array.isArray(parsed) || !parsed.every(item => typeof item === 'string')) {
    throw new Error('GPT cleanup response was not a string array')
  }

  return parsed
}
