'use client'

import { api } from '@/services/api'
import { Button } from 'antd'
import { useRouter } from 'next/navigation'

export default function SettingsPage() {
  const router = useRouter()
  return (
    <div className="flex flex-col gap-10">
      <div>
        <SettingHeading>download database</SettingHeading>
        <Button
          type="primary"
          onClick={async () => {
            const response = await api.downloadDatabase()

            const blob = await response.blob()
            const url = window.URL.createObjectURL(blob)
            const contentDisposition = response.headers.get(
              'Content-Disposition'
            )
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

      <div>
        <SettingHeading>find spoilers</SettingHeading>
        <Button
          type="primary"
          onClick={async () => router.push('/settings/spoilers')}
        >
          find
        </Button>
      </div>
    </div>
  )
}

function SettingHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="font-black text-app-secondary text-2xl mb-2">{children}</h2>
  )
}
