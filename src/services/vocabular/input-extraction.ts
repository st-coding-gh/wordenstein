import { gpt } from '@/services/gpt'
import {
  TLemmaCandidate,
  lemmatizeCandidates,
} from '@/services/lemma'
import { prisma } from '@/services/prisma'

const CHUNK_SIZE_CHARS = 50_000
const GPT_CANDIDATE_BATCH_SIZE = 250

type TStartInputExtraction = {
  text: string
  sourceName?: string
}

export async function startInputExtraction({
  text,
  sourceName,
}: TStartInputExtraction) {
  const normalizedText = text.trim()

  if (!normalizedText) {
    throw new Error('Input text is empty')
  }

  const activeLog = await prisma.vocabularInputExtractionLog.findFirst({
    where: {
      isFinished: false,
    },
  })

  if (activeLog) {
    return {
      message: 'there is already an extraction in process',
      log: activeLog,
    }
  }

  const chunks = splitTextIntoChunks(normalizedText, CHUNK_SIZE_CHARS)
  const log = await prisma.vocabularInputExtractionLog.create({
    data: {
      dateTime: new Date().toISOString(),
      sourceName,
      totalChunks: chunks.length,
      totalChars: normalizedText.length,
      chunkSizeChars: CHUNK_SIZE_CHARS,
      isFinished: false,
    },
  })

  processInputExtraction({
    logId: log.id,
    chunks,
    totalChars: normalizedText.length,
  })

  return {
    message: 'the extraction has been started',
    log,
  }
}

export async function getInputExtractionLogs() {
  return await prisma.vocabularInputExtractionLog.findMany({
    orderBy: {
      dateTime: 'desc',
    },
  })
}

function splitTextIntoChunks(text: string, maxChars: number) {
  const chunks: string[] = []
  let start = 0

  while (start < text.length) {
    let end = Math.min(start + maxChars, text.length)

    if (end < text.length) {
      const boundary = findChunkBoundary(text, start, end)
      if (boundary > start) {
        end = boundary
      }
    }

    const chunk = text.slice(start, end).trim()
    if (chunk) {
      chunks.push(chunk)
    }

    start = end
  }

  return chunks
}

function findChunkBoundary(text: string, start: number, end: number) {
  const paragraphBoundary = text.lastIndexOf('\n\n', end)
  if (paragraphBoundary > start) {
    return paragraphBoundary
  }

  const lineBoundary = text.lastIndexOf('\n', end)
  if (lineBoundary > start) {
    return lineBoundary
  }

  const whitespaceBoundary = text.lastIndexOf(' ', end)
  if (whitespaceBoundary > start) {
    return whitespaceBoundary
  }

  return end
}

async function processInputExtraction({
  logId,
  chunks,
  totalChars,
}: {
  logId: number
  chunks: string[]
  totalChars: number
}) {
  const totalTimeStart = Date.now()
  const timeForEachChunkMs: number[] = []
  const runAccepted = new Set<string>()
  let processedChars = 0

  try {
    for (const chunk of chunks) {
      const startTimeForChunkMs = Date.now()
      const lemmaCandidates = await lemmatizeCandidates({ text: chunk })
      const excludedWords = await getExcludedWords()

      for (const acceptedWord of runAccepted) {
        excludedWords.add(acceptedWord)
      }

      const candidateLemmas = dedupeCandidates(lemmaCandidates)
        .filter(candidate => !isKnownCandidate(candidate, excludedWords))
        .map(candidate => candidate.word)
      const rejectedLemmas = await findRejectedLemmas(candidateLemmas)
      const rejectedSet = new Set(rejectedLemmas)
      const acceptedLemmas = candidateLemmas.filter(
        lemma => !rejectedSet.has(lemma)
      )

      if (acceptedLemmas.length > 0) {
        await prisma.wordsPossiblyUnknown.createMany({
          data: acceptedLemmas.map(word => ({ word })),
        })

        for (const lemma of acceptedLemmas) {
          runAccepted.add(lemma)
        }
      }

      processedChars += chunk.length
      timeForEachChunkMs.push(Date.now() - startTimeForChunkMs)

      const processedChunks = timeForEachChunkMs.length
      const chunksLeft = chunks.length - processedChunks
      const averageTime =
        timeForEachChunkMs.reduce((a, b) => a + b, 0) /
        timeForEachChunkMs.length

      await prisma.vocabularInputExtractionLog.update({
        where: {
          id: logId,
        },
        data: {
          processedChunks,
          processedChars: Math.min(processedChars, totalChars),
          totalLemmas: {
            increment: candidateLemmas.length,
          },
          acceptedWords: {
            increment: acceptedLemmas.length,
          },
          rejectedWords: {
            increment: rejectedLemmas.length,
          },
          estimatedEndTimeMs: Math.round(averageTime * chunksLeft),
        },
      })
    }

    await prisma.vocabularInputExtractionLog.update({
      where: {
        id: logId,
      },
      data: {
        isFinished: true,
        isSuccess: true,
        totalTimeMs: Date.now() - totalTimeStart,
        estimatedEndTimeMs: 0,
      },
    })
  } catch (e) {
    const error = e as Error

    await prisma.vocabularInputExtractionLog.update({
      where: {
        id: logId,
      },
      data: {
        isFinished: true,
        isSuccess: false,
        totalTimeMs: Date.now() - totalTimeStart,
        estimatedEndTimeMs: 0,
        errorMessage: error.message,
      },
    })
  }
}

async function getExcludedWords() {
  const [vocabulary, ignored, unknown, possiblyUnknown] = await Promise.all([
    prisma.vocabulary.findMany({
      select: {
        word: true,
      },
    }),
    prisma.wordsIgnored.findMany({
      select: {
        word: true,
      },
    }),
    prisma.wordsUnknown.findMany({
      select: {
        word: true,
      },
    }),
    prisma.wordsPossiblyUnknown.findMany({
      select: {
        word: true,
      },
    }),
  ])

  return new Set(
    [...vocabulary, ...ignored, ...unknown, ...possiblyUnknown].map(
      item => normalizeWord(item.word)
    )
  )
}

function dedupeCandidates(candidates: TLemmaCandidate[]) {
  const candidatesByWord = new Map<string, TLemmaCandidate>()

  for (const candidate of candidates) {
    const word = normalizeWord(candidate.word)

    if (!word) {
      continue
    }

    const baseForms = candidate.baseForms.map(normalizeWord).filter(Boolean)
    const existingCandidate = candidatesByWord.get(word)

    if (existingCandidate) {
      existingCandidate.baseForms = [
        ...new Set([...existingCandidate.baseForms, ...baseForms]),
      ]
    } else {
      candidatesByWord.set(word, {
        ...candidate,
        word,
        baseForms,
      })
    }
  }

  return [...candidatesByWord.values()]
}

function isKnownCandidate(
  candidate: TLemmaCandidate,
  excludedWords: Set<string>
) {
  if (excludedWords.has(candidate.word)) {
    return true
  }

  return candidate.baseForms.some(baseForm => excludedWords.has(baseForm))
}

function normalizeWord(word: string) {
  return word.trim().toLowerCase()
}

async function findRejectedLemmas(lemmas: string[]) {
  if (lemmas.length === 0) {
    return []
  }

  const rejectedLemmas: string[] = []

  for (const batch of chunkWords(lemmas, GPT_CANDIDATE_BATCH_SIZE)) {
    rejectedLemmas.push(...(await findRejectedLemmaBatch(batch)))
  }

  return rejectedLemmas
}

async function findRejectedLemmaBatch(lemmas: string[]) {
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

function chunkWords(words: string[], size: number) {
  const chunks: string[][] = []

  for (let i = 0; i < words.length; i += size) {
    chunks.push(words.slice(i, i + size))
  }

  return chunks
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
