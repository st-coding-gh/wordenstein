import { prisma } from '@/services/prisma'
import { TCreateUserReq } from '@/types/api.types'
import bcrypt from 'bcryptjs'

export async function POST(req: Request) {
  const body = await req.json()

  try {
    const res = await handler(body)

    return new Response(JSON.stringify(res), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    })
  } catch (e) {
    return new Response(JSON.stringify(e), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    })
  }
}

async function handler(body: TCreateUserReq) {
  const hashedPassword = await bcrypt.hash(body.password, 10)

  const email = 'st-coding@yandex.ru'

  const user = await prisma.user.create({
    data: {
      email: email,
      password: hashedPassword,
    },
  })
  return { user }
}
