'use client'

import { api } from '@/services/api'
import { TStatsRes } from '@/types/api.types'
import { Skeleton, Table } from 'antd'
import { useEffect, useState } from 'react'

export default function Stats() {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<TStatsRes>()

  useEffect(() => {
    api.stats().then(res => {
      setStats(res)
      setLoading(false)
    })
  }, [])

  const columns = [
    {
      title: 'correct answers',
      dataIndex: 'correctAnswers',
      key: 'correctAnswers',
    },
    {
      title: 'count',
      dataIndex: 'count',
      key: 'count',
    },
  ]

  return (
    <div>
      <Skeleton loading={loading} active className="px-10">
        <div className="flex flex-col gap-10">
          <div>
            <StatsHeading>total cards</StatsHeading>
            <p>{stats?.totalCards}</p>
          </div>

          <div>
            <StatsHeading>correct answers</StatsHeading>
            <div className="w-[30ch]">
              <Table
                columns={columns}
                dataSource={stats?.correctAnswersGroups}
                rowKey={'correctAnswers'}
                size="small"
                pagination={false}
              ></Table>
            </div>
          </div>
        </div>
      </Skeleton>
    </div>
  )
}

function StatsHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="font-black text-app-secondary text-2xl mb-2">{children}</h2>
  )
}
