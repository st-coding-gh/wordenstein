import { TVocabularUnknownReq } from '@/types/api.types'
import { NextRequest, NextResponse } from 'next/server'
import dotenv from 'dotenv'
import { prisma } from '@/services/prisma'
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

  // check if all filtered lemmas are real English words
  const prompt = `I have a list of words where some words are normal but other are mispelled or not even real English words. I want you to check the list and identify mispelled words and non-English real words. In your response return the single array of those not normal words as JSON. There must only be one array in the response. Words: ${filteredLemmas.join(
    ', '
  )}`
  const response = (await gpt.textToText({
    model: 'openai/gpt-3.5-turbo',
    prompt: prompt,
  })) as string

  // get the response the extract the array from it with regex
  const nonRealWords = response.match(/\[[\s\S]*?\]/)
  const nonRealWordsJson = nonRealWords
    ? JSON.parse(nonRealWords[0])
    : ['no non-real words found']

  // make the final filtered lemmas array where remove all non real words from the filteredLemmas array
  const finalFilteredLemmas = filteredLemmas.filter(lemma => {
    return !nonRealWordsJson.includes(lemma)
  })

  // record all filtered lemmas to possibly unknown words
  const recordLemmas = await prisma.wordsPossiblyUnknown.createMany({
    data: finalFilteredLemmas.map(lemma => ({ word: lemma })),
  })

  return finalFilteredLemmas
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
