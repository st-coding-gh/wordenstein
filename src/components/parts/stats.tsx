'use client'

import { api } from '@/services/api'
import { TStatsRes } from '@/types/api.types'
import { TStatsDisplay } from '@/types/stats.types'
import { Skeleton, Table } from 'antd'
import { useEffect, useState } from 'react'

export function StatsComponent({ display = {
  'total_cards': true,
  'correct_answers': true,
  'vocabulary': true,
  'database_size': true,
  'images_size': true,
} }: { display: TStatsDisplay }) {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<TStatsRes>()


  'total_cards'
  'correct_answers'
  'vocabulary'
  'database_size'
  'images_size'
  'all'

  useEffect(() => {
    api.stats().then(res => {
      setStats(res)
      setLoading(false)
    })
  }, [])


  return (
    <div>
      <Skeleton loading={loading} active className="px-10">
        <div className="flex flex-col gap-10">


          {display.total_cards && <div>
            <StatsHeading>total cards</StatsHeading>
            <p>{stats?.totalCards}</p>
          </div>}

          {display.correct_answers && <div>
            <StatsHeading>correct answers</StatsHeading>
            <div className="w-[30ch]">
              <Table
                columns={[
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
                ]}
                dataSource={stats?.correctAnswersGroups}
                rowKey={'correctAnswers'}
                size="small"
                pagination={false}
              ></Table>
            </div>
          </div>}

          {display.vocabulary && <div>
            <StatsHeading>vocabulary</StatsHeading>
            <div className="w-[30ch]">
              <Table
                columns={[
                  {
                    title: 'parameter',
                    dataIndex: 'parameter',
                    key: 'parameter',
                  },
                  {
                    title: 'value',
                    dataIndex: 'value',
                    key: 'value',
                  },
                ]}
                dataSource={[
                  {
                    parameter: 'vocabulary',
                    value: stats?.vocabularyLength,
                  },
                  {
                    parameter: 'unknown',
                    value: stats?.unknownLength,
                  },
                  {
                    parameter: 'possibly unknown',
                    value: stats?.possiblyUnknownLength,
                  },
                  {
                    parameter: 'ignored',
                    value: stats?.ignoredLength,
                  },
                ]}
                rowKey={'parameter'}
                size="small"
                pagination={false}
              ></Table>
            </div>
          </div>}

          {display.database_size && <div>
            <StatsHeading>database size</StatsHeading>
            <p>{stats?.databaseSize.toFixed(2) + ' MB'}</p>
          </div>}

          {display.images_size && <div>
            <StatsHeading>images size</StatsHeading>
            <p>{stats?.imagesSize.toFixed(2) + ' MB'}</p>
          </div>}
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