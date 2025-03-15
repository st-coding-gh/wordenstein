import { prisma } from '@/services/prisma'
import { TCreateUserReq, TErrorRes, TLoginReq } from '@/types/api.types'
import bcrypt from 'bcryptjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const body = (await req.json()) as TLoginReq

  try {
    const res = await handler(body)

    return NextResponse.json(res)
  } catch (e) {
    const error = e as Error

    if (error.message === 'unauthorized') {
      const errorResponse: TErrorRes = {
        message: `${error.message}: ${error.cause}`,
      }
      return NextResponse.json(errorResponse, { status: 401 })
    } else {
      return NextResponse.json({ message: error.message }, { status: 500 })
    }
  }
}

async function handler(body: TLoginReq) {
  const email = 'st-coding@yandex.ru'
  const user = await prisma.user.findFirst()
  const isPasswordCorrect = await bcrypt.compare(body.password, user!.password)

  if (!isPasswordCorrect)
    throw new Error('unauthorized', { cause: 'incorrect password' })

  const cookieStore = await cookies()
  const sessionId = crypto.randomUUID()
  cookieStore.set('sessionId', sessionId, {
    path: '/',
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 7,
  })

  const sessionIdRTecord = await prisma.user.update({
    where: { email: email },
    data: { sessionId: sessionId },
  })

  return { message: 'success', session: sessionIdRTecord }
}
