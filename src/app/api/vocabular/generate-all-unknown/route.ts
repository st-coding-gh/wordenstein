import { TErrorRes } from '@/types/api.types'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/services/prisma'
import { gpt } from '@/services/gpt'
import { TCard } from '@/types/card'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import sharp from 'sharp'
import { message } from 'antd'

export async function POST(req: NextRequest) {
  const body = await req.json()

  try {
    const res = await handler()
    return NextResponse.json(res)
  } catch (e) {
    const error = e as Error
    const errorResponse: TErrorRes = {
      message: `${error.message}`,
    }
    return NextResponse.json(errorResponse, { status: 500 })
  }
}

async function handler() {
  //check if there is a generation in process:
  const isGenerationProcess = await isGenerationInProcess()
  if (isGenerationProcess) {
    return {
      message: 'there is already a generation in process',
    }
  }

  //start the process which will continue on the background:
  generateAllUnknown()
  return {
    message: 'the generation has been started',
  }
}

async function isGenerationInProcess() {
  const isFinishedExist = await prisma.cardsGenerationLog.findFirst({
    where: {
      isFinished: false,
    },
  })

  return !!isFinishedExist
}

async function generateAllUnknown() {
  const unknownAll = await prisma.wordsUnknown.findMany()
  const totalTimeStart = Date.now()
  let cardsGenerated = 0
  const timeForEachCardMs: number[] = []

  //log start
  const log = await prisma.cardsGenerationLog.create({
    data: {
      dateTime: new Date().toISOString(),
      totalCards: unknownAll.length,
      isFinished: false,
      generatedCards: 0,
    },
  })

  for (let unknown of unknownAll) {
    try {
      const startTimeForCardMs = Date.now()
      const card = await generateCard(unknown.word)

      const addToVocabular = await prisma.vocabulary.create({
        data: {
          word: unknown.word,
        },
      })

      const removeFromUnknown = await prisma.wordsUnknown.deleteMany({
        where: {
          id: unknown.id,
        },
      })

      //calculate time left
      cardsGenerated++
      const endTimeForCardMs = Date.now()
      const timeForCard = endTimeForCardMs - startTimeForCardMs
      timeForEachCardMs.push(timeForCard)
      const cardsLeft = unknownAll.length - cardsGenerated
      const averageTime =
        timeForEachCardMs.reduce((a, b) => a + b, 0) / timeForEachCardMs.length
      const estimatedEndTimeMs = averageTime * cardsLeft

      //update log
      const updateLog = await prisma.cardsGenerationLog.update({
        where: {
          id: log.id,
        },
        data: {
          generatedCards: { increment: 1 },
          estimatedEndTimeMs: estimatedEndTimeMs,
        },
      })
    } catch (e) {
      const error = e as Error

      const messageToLog = {
        generatedCardWord: unknown.word,
        error: error.message,
      }

      const updateLog = await prisma.cardsGenerationLog.update({
        where: {
          id: log.id,
        },
        data: {
          isFinished: true,
          isSuccess: false,
          totalTimeMs: Date.now() - totalTimeStart,
          errorMessage: error.message,
          estimatedEndTimeMs: 0,
        },
      })
    }
  }

  //log end
  const updateLog = await prisma.cardsGenerationLog.update({
    where: {
      id: log.id,
    },
    data: {
      isFinished: true,
      isSuccess: true,
      totalTimeMs: Date.now() - totalTimeStart,
    },
  })

  return
}

async function generateCard(word: string) {
  const serverRateLimit = 2010 //ms
  const startTimeCard = Date.now()
  const card = (await gpt.wordToCard(word)) as TCard

  const cardRecord = await prisma.card.create({
    data: {
      ...card,
      correctAnswers: 0,
    },
  })

  //ensure that no less than 2 seconds passed from startTimeCard to this moment
  const timePassed = Date.now() - startTimeCard
  if (timePassed < serverRateLimit) {
    await new Promise(resolve =>
      setTimeout(resolve, serverRateLimit - timePassed)
    )
  }

  const startTimeImage = Date.now()
  const image_b64_json = await gpt.imageForCard(card.imagePrompt)

  const writeImageToUploadsRes = await writeImageToUploads({
    image_b64_json,
    id: cardRecord.id,
  })

  //ensure that no less than 2 seconds passed from startTimeImage to this moment
  const timePassedImage = Date.now() - startTimeImage
  if (timePassedImage < serverRateLimit) {
    await new Promise(resolve =>
      setTimeout(resolve, serverRateLimit - timePassedImage)
    )
  }

  return {
    card: card,
    ...writeImageToUploadsRes,
  }
}

async function writeImageToUploads({
  image_b64_json,
  id,
}: {
  image_b64_json: string
  id: string
}) {
  try {
    const uploadDir = path.join(process.cwd(), 'uploads/images/cards')
    const imageBuffer = Buffer.from(image_b64_json, 'base64')
    const finalFileName = `${id}.webp`
    const finalFilePath = path.join(uploadDir, finalFileName)

    const processedImage = await sharp(imageBuffer)
      .resize({ width: 500 })
      .webp({ quality: 80, effort: 6 })
      .toBuffer()

    await writeFile(finalFilePath, processedImage)
    return {
      imageSaved: true,
      error: null,
    }
  } catch (e) {
    const error = e as Error
    return {
      imageSaved: false,
      error: error.message,
    }
  }
}
