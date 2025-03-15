import { prisma } from '@/services/prisma'

export async function GET(req: Request) {
  const prismaTest = await prisma.user.create({
    data: {
      email: 'oVq1236@example.com',
      password: '12345678',
    },
  })

  const res = JSON.stringify({
    message: 'from test',
    prismaTest,
  })

  return new Response(res, {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
    },
  })
}
