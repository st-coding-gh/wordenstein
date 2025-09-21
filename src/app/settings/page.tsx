'use client'

import { api } from '@/services/api'
import { Button, Skeleton, message, Collapse, Divider } from 'antd'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function SettingsPage() {
  const [loading, setLoading] = useState(true)
  const [isOxfordRecorded, setIsOxfordRecorded] = useState(false)
  const [isCardsRecorded, setIsCardsRecorded] = useState(false)
  const router = useRouter()
  const [messageApi, contextHolder] = message.useMessage()

  async function checkSettings(): Promise<{
    isOxfordRecorded: boolean
    isCardsRecorded: boolean
  }> {
    const isOxfordRecorded = (await api.isOxfordRecorded()).isOxfordRecorded
    const isCardsRecorded = (await api.isCardsRecorded()).isCardsRecorded
    return { isOxfordRecorded, isCardsRecorded }
  }

  useEffect(() => {
    checkSettings().then(res => {
      setIsOxfordRecorded(res.isOxfordRecorded)
      setIsCardsRecorded(res.isCardsRecorded)
      setLoading(false)
    })
  }, [])

  return (
    <Skeleton loading={loading} active>
      {contextHolder}
      <div className="flex flex-col gap-10">
        <DownloadDatabase />
        <Spoilers />

        <Collapse
          items={[
            {
              key: '1',
              label: '⚡ danger actions',
              children: (
                <div className="flex flex-col gap-10">
                  <DeleteDuplicateCards />
                  <FixNewLines />
                  <MigrateCardImages />
                  <CleanupOrphanedImages />
                  <DeleteUnknown />
                  <DeletePossiblyUnknown />
                </div>
              ),
            },
          ]}
        />

        {/*  */}
        {!isOxfordRecorded && <RecordOxford />}
        {!isCardsRecorded && <RecordCards />}
      </div>
    </Skeleton>
  )
}

function DeleteDuplicateCards() {
  const [loading, setLoading] = useState(false)
  const [messageApi, contextHolder] = message.useMessage()
  return (
    <div>
      {contextHolder}
      <SettingHeading>delete duplicates</SettingHeading>

      <Button
        type="primary"
        danger
        loading={loading}
        onClick={async () => {
          setLoading(true)
          const res = await api.deleteDuplicateCards()
          messageApi.open({ type: 'success', content: res.message })
          setLoading(false)
        }}
      >
        delete
      </Button>
    </div>
  )
}

function FixNewLines() {
  const [loading, setLoading] = useState(false)
  const [messageApi, contextHolder] = message.useMessage()

  return (
    <div>
      {contextHolder}
      <SettingHeading>fix new lines</SettingHeading>
      <Button
        type="primary"
        loading={loading}
        danger
        onClick={async () => {
          setLoading(true)
          const res = await api.fixNewLines()
          setLoading(false)
          messageApi.open({ type: 'success', content: res.message })
          console.log(res)
        }}
      >
        fix
      </Button>
    </div>
  )
}

function DeletePossiblyUnknown() {
  const [messageApi, contextHolder] = message.useMessage()
  const [loading, setLoading] = useState(false)

  return (
    <div>
      {contextHolder}
      <SettingHeading>delete all possibly unknown</SettingHeading>
      <Button
        type="primary"
        loading={loading}
        danger
        onClick={async () => {
          setLoading(true)
          const res = await api.deleteAllPossiblyUnknown()
          if (res) {
            messageApi.open({
              type: 'success',
              content: 'deleted successfully',
            })
          }
          setLoading(false)
        }}
      >
        delete
      </Button>
    </div>
  )
}

function DeleteUnknown() {
  const [loading, setLoading] = useState(false)
  const [messageApi, contextHolder] = message.useMessage()

  return (
    <div>
      {contextHolder}
      <SettingHeading>delete all unknown</SettingHeading>
      <Button
        type="primary"
        loading={loading}
        danger
        onClick={async () => {
          setLoading(true)
          const res = await api.deleteAllUnknown()

          if (res) {
            messageApi.open({
              type: 'success',
              content: 'deleted successfully',
            })
          }

          setLoading(false)
        }}
      >
        delete
      </Button>
    </div>
  )
}

function RecordCards() {
  return (
    <div>
      <SettingHeading>record cards</SettingHeading>
      <Button
        type="primary"
        danger
        onClick={async () => {
          const res = await api.recordCards()
          console.log(res)
        }}
      >
        record
      </Button>
    </div>
  )
}

function RecordOxford() {
  const [loading, setLoading] = useState(false)
  return (
    <div>
      <SettingHeading>record oxford</SettingHeading>
      <Button
        type="primary"
        danger
        loading={loading}
        onClick={async () => {
          setLoading(true)
          const res = await api.recordOxford()
          setLoading(false)
          console.log(res)
        }}
      >
        record
      </Button>
    </div>
  )
}

function Spoilers() {
  const router = useRouter()
  return (
    <div>
      <SettingHeading>find spoilers</SettingHeading>
      <Button
        type="primary"
        onClick={async () => router.push('/settings/spoilers')}
      >
        find
      </Button>
    </div>
  )
}

function DownloadDatabase() {
  return (
    <div>
      <SettingHeading>download database</SettingHeading>
      <Button
        type="primary"
        onClick={async () => {
          const response = await api.downloadDatabase()

          const blob = await response.blob()
          const url = window.URL.createObjectURL(blob)
          const contentDisposition = response.headers.get('Content-Disposition')
          const match = contentDisposition.match(/filename="?([^"]+)"?/)
          const filename = match[1] // Extracted filename

          const a = document.createElement('a')
          a.href = url
          a.download = filename
          document.body.appendChild(a)
          a.click()
          document.body.removeChild(a)
          window.URL.revokeObjectURL(url)
        }}
      >
        download
      </Button>
    </div>
  )
}

function MigrateCardImages() {
  const [loading, setLoading] = useState(false)
  const [messageApi, contextHolder] = message.useMessage()

  return (
    <div>
      {contextHolder}
      <SettingHeading>migrate card images</SettingHeading>
      <div className="text-sm text-gray-600 mb-2">
        Migrates current card IDs to new image array format. Safe to run multiple times.
      </div>
      <Button
        type="primary"
        loading={loading}
        danger
        onClick={async () => {
          setLoading(true)
          try {
            const res = await api.migrateCardImages()
            messageApi.open({
              type: 'success',
              content: res.message || `Migrated ${res.migratedCount} cards`
            })
          } catch (error) {
            messageApi.open({
              type: 'error',
              content: 'Failed to migrate card images'
            })
          }
          setLoading(false)
        }}
      >
        migrate
      </Button>
    </div>
  )
}

function CleanupOrphanedImages() {
  const [loading, setLoading] = useState(false)
  const [messageApi, contextHolder] = message.useMessage()

  return (
    <div>
      {contextHolder}
      <SettingHeading>cleanup orphaned images</SettingHeading>
      <div className="text-sm text-gray-600 mb-2">
        Removes image files that are no longer referenced by any cards. This operation cannot be undone.
      </div>
      <Button
        type="primary"
        loading={loading}
        danger
        onClick={async () => {
          setLoading(true)
          try {
            const res = await api.cleanupOrphanedImages()
            messageApi.open({
              type: 'success',
              content: res.message || `Cleaned up ${res.deletedCount} orphaned images`
            })
          } catch (error) {
            messageApi.open({
              type: 'error',
              content: 'Failed to cleanup orphaned images'
            })
          }
          setLoading(false)
        }}
      >
        cleanup
      </Button>
    </div>
  )
}

function SettingHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="font-black text-app-secondary text-2xl mb-2">{children}</h2>
  )
}
