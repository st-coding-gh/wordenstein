import { prisma } from '@/services/prisma'
import { TAuthStatusRes } from '@/types/api.types'
import { RequestCookie } from 'next/dist/compiled/@edge-runtime/cookies'
import { cookies } from 'next/headers'

export async function POST(req: Request) {
  const cookieStore = await cookies()
  const cookie = cookieStore.get('sessionId')

  const res = await handler(cookie)

  return new Response(JSON.stringify(res), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
    },
  })
}

async function handler(cookie?: RequestCookie): Promise<TAuthStatusRes> {
  const isInitiated = (await prisma.user.count()) != 0
  if (!isInitiated) {
    return {
      isAuthenticated: false,
      isInitiated: false,
      message: 'the user is not initiated',
    }
  }

  if (!cookie) {
    return {
      isAuthenticated: false,
      isInitiated: true,
      message: 'not logged in',
    }
  }

  const user = await prisma.user.findFirst({
    where: { sessionId: cookie.value },
  })
  if (!user) {
    return {
      isAuthenticated: false,
      isInitiated: true,
      message: 'not logged in',
    }
  }

  return { isAuthenticated: true, isInitiated: true }
}
