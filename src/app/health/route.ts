import { NextRequest, NextResponse } from 'next/server'

const WEBSITE_HEARTBEAT = 'website_heartbeat'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  if (!isLocalRequest(req)) {
    return NextResponse.json({ ok: false, message: 'not found' }, { status: 404 })
  }

  const type = req.nextUrl.searchParams.get('type') ?? WEBSITE_HEARTBEAT

  if (type !== WEBSITE_HEARTBEAT) {
    return NextResponse.json(
      { ok: false, message: 'unsupported health check type' },
      { status: 400 },
    )
  }

  return NextResponse.json({ ok: true, type: WEBSITE_HEARTBEAT })
}

function isLocalRequest(req: NextRequest) {
  const host = normalizeHost(req.headers.get('host'))
  const forwardedFor = req.headers.get('x-forwarded-for')

  if (!host || !isLoopbackHost(host)) {
    return false
  }

  if (!forwardedFor) {
    return true
  }

  return forwardedFor
    .split(',')
    .map(value => value.trim())
    .every(isLoopbackHost)
}

function normalizeHost(host: string | null) {
  if (!host) {
    return null
  }

  const normalizedHost = host.toLowerCase()
  const ipv6Match = normalizedHost.match(/^\[(.*)](?::\d+)?$/)

  if (ipv6Match) {
    return ipv6Match[1]
  }

  return normalizedHost.split(':')[0]
}

function isLoopbackHost(host: string) {
  return (
    host === 'localhost' ||
    host === '127.0.0.1' ||
    host === '::1' ||
    host === '::ffff:127.0.0.1'
  )
}
