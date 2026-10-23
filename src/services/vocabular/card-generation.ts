import { prisma } from '@/services/prisma'
import { gpt } from '@/services/gpt'
import { randomUUID } from 'crypto'
import { mkdir, writeFile, unlink } from 'fs/promises'
import path from 'path'
import sharp from 'sharp'

export class GenerationError extends Error {
  constructor(message: string, public status: number) {
    super(message)
  }
}

export async function prepareGeneration(unknownId?: string, limit?: number) {
  return prisma.$transaction(async tx => {
    if (await tx.cardsGenerationLog.findFirst({ where: { isFinished: false } })) {
      throw new GenerationError('There is already a generation in progress', 409)
    }
    const words = await tx.wordsUnknown.findMany({
      where: unknownId ? { id: unknownId } : undefined,
      orderBy: [{ word: 'asc' }, { id: 'asc' }],
      take: limit,
    })
    if (!words.length) {
      throw new GenerationError(unknownId ? 'Unknown word not found' : 'There are no unknown words to generate', 404)
    }
    const log = await tx.cardsGenerationLog.create({
      data: { dateTime: new Date().toISOString(), totalCards: words.length, generatedCards: 0 },
    })
    return { words, log }
  })
}

export async function runGeneration({ words, log }: Awaited<ReturnType<typeof prepareGeneration>>) {
  const started = Date.now()
  let generated = 0
  const errors: string[] = []
  try {
    for (const word of words) {
      try {
        await generateCard(word)
        generated++
      } catch (error) {
        errors.push(`${word.word}: ${error instanceof Error ? error.message : String(error)}`)
      }
      const processed = generated + errors.length
      await prisma.cardsGenerationLog.update({
        where: { id: log.id },
        data: {
          generatedCards: generated,
          estimatedEndTimeMs: Math.round((Date.now() - started) / processed * (words.length - processed)),
          errorMessage: errors.length ? errors.join('\n') : null,
        },
      })
    }
  } catch (error) {
    errors.push(error instanceof Error ? error.message : String(error))
  } finally {
    await prisma.cardsGenerationLog.update({
      where: { id: log.id },
      data: { isFinished: true, isSuccess: errors.length === 0, generatedCards: generated,
        estimatedEndTimeMs: 0, totalTimeMs: Date.now() - started,
        errorMessage: errors.length ? errors.join('\n') : null },
    })
  }
}

async function generateCard(unknown: { id: string; word: string }) {
  const card = await gpt.wordToCard(unknown.word)
  if (!card) throw new Error('Card generation returned no content')
  const image = await gpt.imageForCard(card.imagePrompt)
  if (!image) throw new Error('Image generation returned no image')
  const imageId = randomUUID()
  const directory = path.join(process.cwd(), 'uploads/images/cards')
  const file = path.join(directory, `${imageId}.webp`)
  const buffer = await sharp(Buffer.from(image, 'base64')).resize({ width: 500 })
    .webp({ quality: 80, effort: 6 }).toBuffer()
  await mkdir(directory, { recursive: true })
  await writeFile(file, buffer)
  try {
    await prisma.$transaction(async tx => {
      // Do not save a card if the word was removed while generation was running.
      await tx.wordsUnknown.delete({ where: { id: unknown.id } })
      await tx.card.create({ data: { ...card, word: unknown.word, correctAnswers: 0, image: [imageId] } })
      if (!await tx.vocabulary.findFirst({ where: { word: unknown.word } })) {
        await tx.vocabulary.create({ data: { word: unknown.word } })
      }
    })
  } catch (error) {
    await unlink(file).catch(() => {})
    throw error
  }
}
