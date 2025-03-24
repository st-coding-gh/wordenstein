import { NextResponse } from 'next/server'
import { IncomingForm } from 'formidable'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import sharp from 'sharp'
import { TCard } from '@/types/card'
import { prisma } from '@/services/prisma'

// Ensure the upload directory exists
const uploadDir = path.join(process.cwd(), 'uploads/images/cards')

export async function POST(req: Request) {
  try {
    const formData = await req.formData()

    // Extract file
    const file = formData.get('image') as File | null
    if (!file)
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })

    // Extract card
    const cardJson = formData.get('card') as string | null
    const card = cardJson ? (JSON.parse(cardJson) as TCard) : null

    if (!card) {
      return NextResponse.json({ error: 'Missing card data' }, { status: 400 })
    }

    // create card record in the database
    const cardRecord = await prisma.card.create({
      data: {
        ...card,
        correctAnswers: 0,
      },
    })

    // remove card word from unkwnown words
    await prisma.wordsUnknown.deleteMany({ where: { word: card.word } })

    // write to vocabulary
    await prisma.vocabulary.create({
      data: {
        word: card.word,
      },
    })

    // Convert file to Buffer
    const fileBuffer = Buffer.from(await file.arrayBuffer())

    // Generate final filename
    const finalFileName = `${cardRecord.id}.webp`
    const finalFilePath = path.join(uploadDir, finalFileName)

    // Process image: Resize and convert to WebP
    const processedImage = await sharp(fileBuffer)
      .resize({ width: 500 })
      .webp({ quality: 80, effort: 6 })
      .toBuffer()

    // Save processed image
    await writeFile(finalFilePath, processedImage)

    return NextResponse.json({
      message: 'Upload successful',
      card,
    })
  } catch (error) {
    console.error('Error uploading file:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
