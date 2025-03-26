'use client'

import { api } from '@/services/api'
import { Button, Skeleton, Table } from 'antd'
import { useEffect, useState } from 'react'
import { message } from 'antd'
import { TGenerateUnknownLogs } from '@/types/api.types'
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  ReloadOutlined,
} from '@ant-design/icons'

export default function GenerateAllUnknown() {
  const [loadingGenerate, setLoadingGenerate] = useState(false)
  const [loadingLogs, setLoadingLogs] = useState(true)
  const [messageApi, contextHolder] = message.useMessage()
  const [logs, setLogs] = useState<
    {
      id: number
      dateTime: string
      isFinished: React.ReactNode
      isSuccess: React.ReactNode
      totalCards: number
      generatedCards: number
      totalTimeMin: string
      estimatedEndTimeMin: string
      errorMessage: string
    }[]
  >()

  async function fetchLogs() {
    setLoadingLogs(true)
    const logs = await api.getGenerateUnknownLogs()
    const successIcon = (
      <span className="text-app-success text-lg">
        <CheckCircleOutlined />
      </span>
    )
    const errorIcon = (
      <span className="text-app-danger text-lg">
        <CloseCircleOutlined />
      </span>
    )

    // change dateTime from ISO date to local date with map
    const logsWithLocalDate = logs.map(log => ({
      ...log,
      estimatedEndTimeMin: (log.estimatedEndTimeMs / 1000 / 60).toFixed(1),
      totalTimeMin: (log.totalTimeMs / 1000 / 60).toFixed(1),
      isFinished: log.isFinished ? successIcon : errorIcon,
      isSuccess: log.isSuccess ? successIcon : errorIcon,
      dateTime: new Date(log.dateTime).toLocaleString(),
    }))
    setLoadingLogs(false)
    return logsWithLocalDate
  }

  function reloadButtonHandler() {
    setLoadingLogs(true)
    fetchLogs().then(res => {
      setLogs(res)
      setLoadingLogs(false)
    })
  }

  useEffect(() => {
    fetchLogs().then(res => setLogs(res))
  }, [])

  return (
    <div className="flex flex-col gap-5">
      {contextHolder}
      <Button
        type="primary"
        loading={loadingGenerate}
        danger
        className="w-fit"
        onClick={async () => {
          setLoadingGenerate(true)
          const res = await api.generateAllUnknown()
          setLoadingGenerate(false)

          messageApi.open({
            type: 'success',
            content: res.message,
          })
        }}
      >
        generate
      </Button>

      <Skeleton loading={loadingLogs} active>
        <div>
          <div className="py-4 flex flex-row items-center gap-3">
            <h2 className="w-fit font-black text-app-secondary text-2xl mb-2">
              logs
            </h2>
            <Button
              type="dashed"
              shape="circle"
              icon={<ReloadOutlined />}
              onClick={reloadButtonHandler}
            ></Button>
          </div>

          <div className="overflow-auto">
            <div className="w-fit">
              <Table
                dataSource={logs}
                rowKey={'id'}
                columns={[
                  {
                    title: 'id',
                    dataIndex: 'id',
                    key: 'id',
                  },
                  {
                    title: 'date, time',
                    dataIndex: 'dateTime',
                    key: 'dateTime',
                  },
                  {
                    title: 'finished',
                    dataIndex: 'isFinished',
                    key: 'isFinished',
                  },
                  {
                    title: 'success',
                    dataIndex: 'isSuccess',
                    key: 'isSuccess',
                  },
                  {
                    title: 'total cards',
                    dataIndex: 'totalCards',
                    key: 'totalCards',
                  },
                  {
                    title: 'generated cards',
                    dataIndex: 'generatedCards',
                    key: 'generatedCards',
                  },
                  {
                    title: 'total time, min',
                    dataIndex: 'totalTimeMin',
                    key: 'totalTimeMin',
                  },
                  {
                    title: 'remaining time, min',
                    dataIndex: 'estimatedEndTimeMin',
                    key: 'estimatedEndTimeMin',
                  },
                  {
                    title: 'error message',
                    dataIndex: 'errorMessage',
                    key: 'errorMessage',
                  },
                ]}
              />
            </div>
          </div>
        </div>
      </Skeleton>
    </div>
  )
}
