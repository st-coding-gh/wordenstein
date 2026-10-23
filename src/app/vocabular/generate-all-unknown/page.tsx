'use client'

import { api } from '@/services/api'
import { Alert, Button, Input, Modal, Table, message } from 'antd'
import { useCallback, useEffect, useState } from 'react'
import { TGenerateUnknownLogs, TWord } from '@/types/api.types'
import { ReloadOutlined } from '@ant-design/icons'

export default function GenerateUnknown() {
  const [starting, setStarting] = useState(false)
  const [loadingLogs, setLoadingLogs] = useState(true)
  const [logs, setLogs] = useState<TGenerateUnknownLogs>([])
  const [pickerOpen, setPickerOpen] = useState(false)
  const [loadingWords, setLoadingWords] = useState(false)
  const [words, setWords] = useState<TWord[]>([])
  const [selectedId, setSelectedId] = useState<string>()
  const [search, setSearch] = useState('')
  const [error, setError] = useState<string>()
  const [messageApi, contextHolder] = message.useMessage()
  const running = logs.some(log => !log.isFinished)

  const refreshLogs = useCallback(async () => {
    try {
      const result = await api.getGenerateUnknownLogs()
      if (!Array.isArray(result)) throw new Error('Could not load generation logs')
      setLogs(result)
      setError(undefined)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Could not load generation logs')
    } finally {
      setLoadingLogs(false)
    }
  }, [])

  useEffect(() => { void refreshLogs() }, [refreshLogs])
  useEffect(() => {
    if (!running) return
    const timer = setInterval(() => { void refreshLogs() }, 3000)
    return () => clearInterval(timer)
  }, [running, refreshLogs])

  async function openPicker() {
    setPickerOpen(true)
    setLoadingWords(true)
    setSelectedId(undefined)
    setSearch('')
    setWords([])
    try {
      const result = await api.getUnknown()
      if (!Array.isArray(result)) throw new Error('Could not load unknown words')
      setWords(result.sort((a, b) => a.word.localeCompare(b.word)))
    } catch (error) {
      messageApi.error(error instanceof Error ? error.message : 'Could not load unknown words')
    } finally {
      setLoadingWords(false)
    }
  }

  async function generate(id?: string, limit?: number) {
    setStarting(true)
    try {
      const result = id ? await api.generateOneUnknown(id) : await api.generateAllUnknown(limit)
      if (!result.log) throw new Error(result.message || 'Could not start generation')
      setLogs(previous => [result.log, ...previous.filter(log => log.id !== result.log.id)])
      setPickerOpen(false)
      messageApi.success(result.message)
      await refreshLogs()
    } catch (error) {
      messageApi.error(error instanceof Error ? error.message : 'Could not start generation')
    } finally {
      setStarting(false)
    }
  }

  const minutes = (value: number | null) => value == null ? '—' : (value / 60000).toFixed(1)

  return (
    <div className="flex flex-col gap-5">
      {contextHolder}
      <h1 className="font-black text-app-secondary text-2xl">generate unknown</h1>
      <div className="flex flex-wrap gap-3">
        <Button type="primary" danger loading={starting} disabled={running} onClick={() => generate()}>
          generate all
        </Button>
        <Button disabled={starting || running} onClick={() => generate(undefined, 3)}>
          test batch (3 cards)
        </Button>
        <Button type="primary" disabled={starting || running} onClick={openPicker}>
          generate one card
        </Button>
      </div>
      {running && <Alert type="info" showIcon message="Generation in progress. Logs update automatically." />}
      {error && <Alert type="error" showIcon message={error} />}
      <Modal title="Generate one card" open={pickerOpen} onCancel={() => !starting && setPickerOpen(false)}
        closable={!starting} maskClosable={!starting}
        okText="generate selected card" confirmLoading={starting}
        okButtonProps={{ disabled: !selectedId || loadingWords || running }}
        onOk={() => selectedId && generate(selectedId)}>
        <Input.Search placeholder="Search unknown words" value={search} onChange={event => setSearch(event.target.value)}
          allowClear className="mb-4" disabled={starting} />
        <Table<TWord> rowKey="id" size="small" loading={loadingWords}
          dataSource={words.filter(word => word.word.toLowerCase().includes(search.trim().toLowerCase()))}
          columns={[{ title: 'word', dataIndex: 'word' }]}
          pagination={{ pageSize: 10, showSizeChanger: false }}
          locale={{ emptyText: search ? 'No matching words' : 'No unknown words available' }}
          rowSelection={{ type: 'radio', selectedRowKeys: selectedId ? [selectedId] : [],
            onChange: keys => setSelectedId(keys[0] as string), getCheckboxProps: () => ({ disabled: starting }) }}
          onRow={word => ({ onClick: () => !starting && setSelectedId(word.id), style: { cursor: 'pointer' } })} />
      </Modal>
      <div className="flex items-center gap-3">
        <h2 className="font-black text-app-secondary text-2xl">logs</h2>
        <Button aria-label="Refresh generation logs" icon={<ReloadOutlined />} onClick={() => { void refreshLogs() }} />
      </div>
      <Table<TGenerateUnknownLogs[number]> dataSource={logs} rowKey="id" loading={loadingLogs} scroll={{ x: true }}
        columns={[
          { title: 'id', dataIndex: 'id' },
          { title: 'date, time', dataIndex: 'dateTime', render: value => new Date(value).toLocaleString() },
          { title: 'status', render: (_, log) => !log.isFinished ? 'in progress' : log.isSuccess ? 'success' : 'failed' },
          { title: 'total cards', dataIndex: 'totalCards' },
          { title: 'generated cards', dataIndex: 'generatedCards' },
          { title: 'total time, min', dataIndex: 'totalTimeMs', render: minutes },
          { title: 'remaining time, min', dataIndex: 'estimatedEndTimeMs', render: minutes },
          { title: 'error message', dataIndex: 'errorMessage' },
        ]} />
    </div>
  )
}
