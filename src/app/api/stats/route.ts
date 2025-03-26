import { prisma } from '@/services/prisma'
import { TStatsRes } from '@/types/api.types'
import { NextResponse } from 'next/server'
import path from 'path'
import dotenv from 'dotenv'
import fs from 'fs'

dotenv.config()

export async function POST(req: Request) {
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
  const totalCards = await prisma.card.count()
  const allCards = await prisma.card.findMany()

  const correctAnswersGroupsObject: { [key: string]: number } = {}
  allCards.forEach(card => {
    if (correctAnswersGroupsObject[card.correctAnswers]) {
      correctAnswersGroupsObject[card.correctAnswers] += 1
    } else {
      correctAnswersGroupsObject[card.correctAnswers] = 1
    }
  })

  const correctAnswersGroupsArray = Object.entries(correctAnswersGroupsObject)
  const correctAnswersGroups = correctAnswersGroupsArray
    .map(group => ({
      correctAnswers: +group[0],
      count: group[1],
    }))
    .sort((a, b) => a.correctAnswers - b.correctAnswers)

  const vocabularyLength = await prisma.vocabulary.count()
  const unknownLength = await prisma.wordsUnknown.count()
  const possiblyUnknownLength = await prisma.wordsPossiblyUnknown.count()
  const ignoredLength = await prisma.wordsIgnored.count()
  const databaseSize = calculateDatabaseSize()
  const imagesSize = calculateSizeOfImages()

  const res: TStatsRes = {
    totalCards,
    correctAnswersGroups,
    vocabularyLength,
    unknownLength,
    possiblyUnknownLength,
    ignoredLength,
    databaseSize,
    imagesSize,
  }

  return res
}

function calculateDatabaseSize() {
  const databaseNameFromEnv = process.env.DATABASE_URL
  // extract name of the file from a string lile: "file:./dev.db"
  const match = databaseNameFromEnv?.match(/file:\.\/(.+\.db)/)
  const databaseName = match ? match[1] : ''
  const databasePath = path.join(process.cwd(), 'database', databaseName)

  const stats = fs.statSync(databasePath)
  const sizeInBytes = stats.size
  const sizeInMB = sizeInBytes / (1024 * 1024)

  return sizeInMB
}

function calculateSizeOfImages() {
  const imagesPath = path.join(process.cwd(), 'uploads/images/cards')

  const files = fs.readdirSync(imagesPath)
  let size = 0

  for (const file of files) {
    const filePath = path.join(imagesPath, file)
    const stats = fs.statSync(filePath)
    size += stats.size
  }

  const sizeInMb = size / (1024 * 1024)

  return sizeInMb
}
