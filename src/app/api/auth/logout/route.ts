import { prisma } from '@/services/prisma'
import { TCreateUserReq, TErrorRes, TLoginReq } from '@/types/api.types'
import bcrypt from 'bcryptjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

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
  const user = await prisma.user.findFirst()

  const cookieStore = await cookies()

  // reset cookie
  cookieStore.set('sessionId', '', {
    path: '/',
    httpOnly: true,
    maxAge: 0,
  })

  const sessionIdRecord = await prisma.user.update({
    where: { email: user!.email },
    data: { sessionId: null },
  })

  return { message: 'success', session: sessionIdRecord }
}
