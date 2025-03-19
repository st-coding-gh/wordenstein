import { NextRequest, NextResponse } from 'next/server'
import archiver from 'archiver'
import fs from 'fs'
import path from 'path'
import dotenv from 'dotenv'

dotenv.config()

export async function POST(req: NextRequest) {
  const body = await req.json()

  try {
    const dbUrl = process.env.DATABASE_URL || ''
    const match = dbUrl.match(/file:\.\/(.+\.db)/) as string[]
    const dbFileName = match[1]
    const dbPath = path.join(process.cwd(), 'database', dbFileName)
    const uploadsPath = path.join(process.cwd(), 'uploads')
    const backupIdentifier = new Date().toISOString()
    const zipFileName = `backup-${backupIdentifier}.zip`
    const archive = archiver('zip', { zlib: { level: 9 } })

    const headers = new Headers()
    headers.set('Content-Type', 'application/zip')
    headers.set('Content-Disposition', `attachment; filename="${zipFileName}"`)

    // Stream response
    const stream = new ReadableStream({
      start(controller) {
        archive.on('data', chunk => controller.enqueue(chunk))
        archive.on('end', () => controller.close())
        archive.on('error', err => controller.error(err))

        // Add files to archive
        archive.file(dbPath, { name: dbFileName }) // Use dynamic filename
        archive.directory(uploadsPath, 'uploads')

        // Finalize the archive
        archive.finalize()
      },
    })

    return new NextResponse(stream, { headers })
  } catch (error) {
    console.error('Error creating archive:', error)
    return NextResponse.json(
      { error: 'Failed to create archive' },
      { status: 500 }
    )
  }
}

function handler() {
  const dbUrl = process.env.DATABASE_URL || ''

  return { dbUrl: dbUrl }
}
