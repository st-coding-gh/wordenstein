'use client'

import { api } from '@/services/api'
import { TCard } from '@/types/card'
import { Skeleton } from 'antd'
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Card } from '@/components/particles/card'

export default function CardDetail() {
  const [loading, setLoading] = useState(true)
  const [card, setCard] = useState<TCard>()
  const { id } = useParams()

  useEffect(() => {
    if (id) {
      api.cardById(id as string).then(res => {
        setCard(res)
        setLoading(false)
      })
    }
  }, [])

  return (
    <div>
      <Skeleton loading={loading} active>
        {card && <Card card={card} />}
      </Skeleton>
    </div>
  )
}
