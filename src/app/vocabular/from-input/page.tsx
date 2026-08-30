'use client'

import { api } from '@/services/api'
import { TVocabularInputExtractionLog } from '@/types/api.types'
import { ReloadOutlined } from '@ant-design/icons'
import { Button, Input, Progress, Skeleton, Table, message } from 'antd'
import { useEffect, useState } from 'react'

export default function Vocabular() {
  const [loadingStart, setLoadingStart] = useState(false)
  const [loadingLogs, setLoadingLogs] = useState(true)
  const [input, setInput] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [logs, setLogs] = useState<TVocabularInputExtractionLog[]>([])
  const [error, setError] = useState<string | null>(null)
  const [messageApi, contextHolder] = message.useMessage()

  async function fetchLogs() {
    setLoadingLogs(true)
    const res = await api.getUnknownFromInputLogs()
    setLogs(res)
    setLoadingLogs(false)
    return res
  }

  async function startTextExtraction() {
    await startExtraction(async () => {
      return await api.findUnknownFromInput({
        text: input,
      })
    })
  }

  async function startFileExtraction() {
    if (!file) {
      setError('Select a txt file first')
      return
    }

    const formData = new FormData()
    formData.append('file', file)

    await startExtraction(async () => {
      return await api.findUnknownFromInputFile(formData)
    })
  }

  async function startExtraction(
    request: () => ReturnType<typeof api.findUnknownFromInput>
  ) {
    setLoadingStart(true)
    setError(null)

    try {
      const res = await request()

      if (!('log' in res)) {
        const message = getErrorMessage(res)

        throw new Error(message)
      }

      messageApi.open({ type: 'success', content: res.message })
      await fetchLogs()
    } catch (e) {
      const error = e as Error
      setError(error.message)
    } finally {
      setLoadingStart(false)
    }
  }

  useEffect(() => {
    fetchLogs()
  }, [])

  return (
    <div className="flex flex-col gap-5">
      {contextHolder}

      <Input.TextArea
        rows={5}
        value={input}
        onChange={e => setInput(e.target.value)}
      />

      <div className="flex flex-row flex-wrap gap-3 items-center">
        <Button
          type="primary"
          loading={loadingStart}
          className="w-fit"
          onClick={startTextExtraction}
        >
          extract text
        </Button>

        <input
          type="file"
          accept=".txt,text/plain"
          onChange={e => setFile(e.target.files?.[0] ?? null)}
        />

        <Button
          type="primary"
          loading={loadingStart}
          className="w-fit"
          onClick={startFileExtraction}
        >
          extract file
        </Button>
      </div>

      {error && <p className="text-sm text-app-danger-700">{error}</p>}

      <div>
        <div className="py-4 flex flex-row items-center gap-3">
          <h2 className="w-fit font-black text-app-secondary text-2xl mb-2">
            logs
          </h2>
          <Button
            type="dashed"
            shape="circle"
            icon={<ReloadOutlined />}
            onClick={fetchLogs}
          ></Button>
        </div>

        <Skeleton loading={loadingLogs} active>
          <div className="overflow-auto">
            <div className="w-fit">
              <Table
                dataSource={logs.map(formatLog)}
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
                    title: 'source',
                    dataIndex: 'sourceName',
                    key: 'sourceName',
                  },
                  {
                    title: 'progress',
                    dataIndex: 'progress',
                    key: 'progress',
                  },
                  {
                    title: 'chunks',
                    dataIndex: 'chunks',
                    key: 'chunks',
                  },
                  {
                    title: 'candidates',
                    dataIndex: 'totalLemmas',
                    key: 'totalLemmas',
                  },
                  {
                    title: 'accepted',
                    dataIndex: 'acceptedWords',
                    key: 'acceptedWords',
                  },
                  {
                    title: 'rejected',
                    dataIndex: 'rejectedWords',
                    key: 'rejectedWords',
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
                    title: 'status',
                    dataIndex: 'status',
                    key: 'status',
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
        </Skeleton>
      </div>
    </div>
  )
}

function formatLog(log: TVocabularInputExtractionLog) {
  const percent =
    log.totalChunks === 0
      ? 0
      : Math.round((log.processedChunks / log.totalChunks) * 100)

  return {
    ...log,
    dateTime: new Date(log.dateTime).toLocaleString(),
    sourceName: log.sourceName ?? 'text input',
    progress: <Progress percent={percent} size="small" />,
    chunks: `${log.processedChunks} of ${log.totalChunks}`,
    totalTimeMin: log.totalTimeMs
      ? (log.totalTimeMs / 1000 / 60).toFixed(1)
      : '',
    estimatedEndTimeMin: log.estimatedEndTimeMs
      ? (log.estimatedEndTimeMs / 1000 / 60).toFixed(1)
      : '',
    status: getStatus(log),
    errorMessage: log.errorMessage ?? '',
  }
}

function getStatus(log: TVocabularInputExtractionLog) {
  if (!log.isFinished) {
    return 'running'
  }

  return log.isSuccess ? 'success' : 'failed'
}

function getErrorMessage(res: unknown) {
  if (
    typeof res === 'object' &&
    res !== null &&
    'message' in res &&
    typeof res.message === 'string'
  ) {
    return res.message
  }

  return 'Unexpected API response'
}
