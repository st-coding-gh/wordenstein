'use client'

import { api } from '@/services/api'
import { useEffect, useState } from 'react'
import { Input, Skeleton } from 'antd'
import { TCardAllRes } from '@/types/api.types'
import { Table, TableProps } from 'antd'
import { useRouter } from 'next/navigation'

export default function CardsList() {
  const [loading, isLoading] = useState(true)
  const [cards, setCards] = useState<TCardAllRes[]>()
  const [searchText, setSearchText] = useState('')
  const router = useRouter()

  useEffect(() => {
    api.cardAll().then(res => {
      isLoading(false)
      setCards(res)
    })
  }, [])

  const filteredCards = cards?.filter(card => {
    return (
      card.word.toLowerCase().includes(searchText.toLowerCase()) ||
      card.definition.toLowerCase().includes(searchText.toLowerCase())
    )
  })

  const columns: TableProps<TCardAllRes>['columns'] = [
    {
      title: 'word',
      dataIndex: 'word',
      key: 'word',
      render: text => <span className="font-black">{text}</span>,
    },
    {
      title: 'definition',
      dataIndex: 'definition',
      key: 'definition',
      render: text => <span className="text-xs">{text}</span>,
    },
    {
      title: 'answers',
      dataIndex: 'correctAnswers',
      key: 'correctAnswers',
      render: text => (
        <span className="flex items-center justify-center">{text}</span>
      ),
    },
  ]

  return (
    <>
      <Skeleton loading={loading} active round>
        <div className="flex flex-col gap-3">
          <Input
            placeholder="Search word or definition..."
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
          />

          <Table
            columns={columns}
            dataSource={filteredCards}
            rowKey={'id'}
            className="cursor-pointer"
            onRow={record => ({
              onClick: () => router.push(`/card/${record.id}`),
            })}
          />
        </div>
      </Skeleton>
    </>
  )
}
