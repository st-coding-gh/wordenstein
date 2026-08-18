import { NextRequest, NextResponse } from 'next/server'

const AGENT_SITE_TOKEN = 'WbAzYALGxa60ChN0B6ZsuZ8zCVgce3G9Wwk48M-fSjY'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  if (!isLocalRequest(req)) {
    return NextResponse.json({ ok: false, message: 'not found' }, { status: 404 })
  }

  if (req.headers.get('authorization') !== `Bearer ${AGENT_SITE_TOKEN}`) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
  }

  return NextResponse.json({ ok: true })
}

function isLocalRequest(req: NextRequest) {
  const host = normalizeHost(req.headers.get('host'))

  return Boolean(host && isLoopbackHost(host))
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
