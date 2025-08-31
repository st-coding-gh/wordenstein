'use client'

import { api } from '@/services/api'
import { TStatsRes, TGenerateUnknownLogs } from '@/types/api.types'
import { TStatsDisplay } from '@/types/stats.types'
import { Skeleton, Table } from 'antd'
import { useEffect, useState } from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { Line } from 'react-chartjs-2'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
)

export function StatsComponent({ display = {
  'total_cards': true,
  'correct_answers': true,
  'vocabulary': true,
  'database_size': true,
  'images_size': true,
  'generation_log': true,
} }: { display: TStatsDisplay }) {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<TStatsRes>()
  const [generationLogs, setGenerationLogs] = useState<TGenerateUnknownLogs>([])


  'total_cards'
  'correct_answers'
  'vocabulary'
  'database_size'
  'images_size'
  'all'

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, logsRes] = await Promise.all([
          api.stats(),
          display.generation_log ? api.getGenerateUnknownLogs() : Promise.resolve([])
        ])
        setStats(statsRes)
        setGenerationLogs(logsRes)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [display.generation_log])


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

          {display.generation_log && <div>
            <StatsHeading>cards generation over time</StatsHeading>
            <div className="w-full max-w-4xl">
              <GenerationChart logs={generationLogs} />
            </div>
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

function GenerationChart({ logs }: { logs: TGenerateUnknownLogs }) {
  // Filter logs that have actual generated cards
  const validLogs = logs.filter(log => log.generatedCards > 0)
  
  // Sort by date
  validLogs.sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime())
  
  if (validLogs.length === 0) {
    return <p className="text-gray-500">No generation data available</p>
  }

  // Calculate linear trend line using least squares method
  const calculateTrendLine = (data: number[]) => {
    const n = data.length
    if (n < 2) return data
    
    const xValues = Array.from({ length: n }, (_, i) => i)
    const yValues = data
    
    const sumX = xValues.reduce((sum, x) => sum + x, 0)
    const sumY = yValues.reduce((sum, y) => sum + y, 0)
    const sumXY = xValues.reduce((sum, x, i) => sum + x * yValues[i], 0)
    const sumXX = xValues.reduce((sum, x) => sum + x * x, 0)
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX)
    const intercept = (sumY - slope * sumX) / n
    
    return xValues.map(x => slope * x + intercept)
  }

  const generatedCardsData = validLogs.map(log => log.generatedCards)
  const trendLineData = calculateTrendLine(generatedCardsData)

  const chartData = {
    labels: validLogs.map(log => {
      const date = new Date(log.dateTime)
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: '2-digit'
      })
    }),
    datasets: [
      {
        label: 'Cards Generated',
        data: generatedCardsData,
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.1,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
      {
        label: 'Trend',
        data: trendLineData,
        borderColor: 'rgb(239, 68, 68)',
        backgroundColor: 'transparent',
        borderWidth: 4,
        borderDash: [5, 5],
        pointRadius: 0,
        pointHoverRadius: 0,
        tension: 0,
      },
    ],
  }

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
        },
      },
    },
  }

  return <Line data={chartData} options={options} />
}