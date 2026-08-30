import { PrismaClient } from '@prisma/client'
import dotenv from 'dotenv'

dotenv.config()

const prisma = new PrismaClient()
const BATCH_SIZE = 100
const args = new Set(process.argv.slice(2))
const isApply = args.has('--apply')
const limit = getNumberArg('--limit')
const maxAdditions = getNumberArg('--max-additions')

main()
  .catch(error => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

async function main() {
  const apiUrl = process.env.LEMMA_API_URL
  const apiKey = process.env.LEMMA_API_KEY

  if (!apiUrl) {
    throw new Error('LEMMA_API_URL is not configured')
  }

  if (!apiKey) {
    throw new Error('LEMMA_API_KEY is not configured')
  }

  const vocabulary = await prisma.vocabulary.findMany({
    select: {
      word: true,
    },
    orderBy: {
      word: 'asc',
    },
  })

  const existingWords = new Set(vocabulary.map(item => normalizeWord(item.word)))
  const cleanWords = vocabulary
    .map(item => normalizeWord(item.word))
    .filter(isCleanSingleWord)
  const wordsToCheck = [...new Set(cleanWords)].slice(
    0,
    limit ?? cleanWords.length
  )

  const additionsBySource = new Map()
  const acceptedBaseCache = new Map()

  for (const batch of chunk(wordsToCheck, BATCH_SIZE)) {
    const candidates = await fetchLemmaCandidates({
      apiUrl,
      apiKey,
      words: batch,
    })

    for (const candidate of candidates) {
      const source = normalizeWord(candidate.word)
      const possibleAdditions = candidate.baseForms
        .map(normalizeWord)
        .filter(isCleanSingleWord)
        .filter(isLikelyBaseForm)
        .filter(baseForm => baseForm !== source)
        .filter(baseForm => !existingWords.has(baseForm))
      const additions = []

      for (const possibleAddition of possibleAdditions) {
        const isAccepted = await isAcceptedBaseForm({
          apiUrl,
          apiKey,
          cache: acceptedBaseCache,
          word: possibleAddition,
        })

        if (isAccepted) {
          additions.push(possibleAddition)
        }
      }

      if (additions.length === 0) {
        continue
      }

      const existingAdditions = additionsBySource.get(source) ?? new Set()

      for (const addition of additions) {
        existingAdditions.add(addition)
        existingWords.add(addition)
      }

      additionsBySource.set(source, existingAdditions)
    }
  }

  const additions = [...additionsBySource.entries()].map(
    ([source, wordsSet]) => ({
      source,
      add: [...wordsSet].sort(),
    })
  )
  const wordsToAdd = [...new Set(additions.flatMap(item => item.add))].sort()

  if (maxAdditions !== null && wordsToAdd.length > maxAdditions) {
    throw new Error(
      `Refusing to add ${wordsToAdd.length} words because --max-additions=${maxAdditions}`
    )
  }

  console.log(
    JSON.stringify(
      {
        mode: isApply ? 'apply' : 'dry-run',
        totalVocabularyRows: vocabulary.length,
        checkedCleanSingleWords: wordsToCheck.length,
        sourcesWithAdditions: additions.length,
        wordsToAddCount: wordsToAdd.length,
        wordsToAdd,
        additions,
      },
      null,
      2
    )
  )

  if (!isApply || wordsToAdd.length === 0) {
    return
  }

  const res = await prisma.vocabulary.createMany({
    data: wordsToAdd.map(word => ({ word })),
  })

  console.log(`Added ${res.count} base words to Vocabulary.`)
}

async function fetchLemmaCandidates({ apiUrl, apiKey, words }) {
  const res = await fetch(`${apiUrl.replace(/\/$/, '')}/filter-lemmas`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      text: words.join('\n'),
    }),
  })

  if (!res.ok) {
    throw new Error(`Lemma API request failed with status ${res.status}`)
  }

  const body = await res.json()

  if (Array.isArray(body.candidates)) {
    return body.candidates.filter(isLemmaCandidate)
  }

  return []
}

async function isAcceptedBaseForm({ apiUrl, apiKey, cache, word }) {
  if (cache.has(word)) {
    return cache.get(word)
  }

  const candidates = await fetchLemmaCandidates({
    apiUrl,
    apiKey,
    words: [word],
  })
  const isAccepted =
    candidates.length === 1 &&
    normalizeWord(candidates[0].word) === word &&
    candidates[0].baseForms.length === 0

  cache.set(word, isAccepted)
  return isAccepted
}

function isLemmaCandidate(candidate) {
  return (
    typeof candidate === 'object' &&
    candidate !== null &&
    typeof candidate.word === 'string' &&
    Array.isArray(candidate.baseForms) &&
    candidate.baseForms.every(baseForm => typeof baseForm === 'string')
  )
}

function normalizeWord(word) {
  return word.trim().toLowerCase()
}

function isCleanSingleWord(word) {
  return /^[a-z]+$/.test(word) && word.length > 1
}

function isLikelyBaseForm(word) {
  if (word.length <= 3) {
    return true
  }

  return !(
    word.endsWith('s') ||
    word.endsWith('ed') ||
    word.endsWith('ing') ||
    word.endsWith('er') ||
    word.endsWith('ers') ||
    word.endsWith('ness') ||
    word.endsWith('nesses') ||
    word.endsWith('ship') ||
    word.endsWith('ships') ||
    word.endsWith('tion') ||
    word.endsWith('tions')
  )
}

function chunk(items, size) {
  const chunks = []

  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size))
  }

  return chunks
}

function getNumberArg(name) {
  const arg = process.argv.find(item => item.startsWith(`${name}=`))

  if (!arg) {
    return null
  }

  const value = Number(arg.split('=')[1])

  if (!Number.isInteger(value) || value <= 0) {
    throw new Error(`${name} must be a positive integer`)
  }

  return value
}
