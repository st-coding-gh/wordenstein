'use client'

import {
  FileUnknownOutlined,
  FireOutlined,
  FormOutlined,
  VerifiedOutlined,
} from '@ant-design/icons'
import { Button } from 'antd'
import { useRouter } from 'next/navigation'

export default function Vocabular() {
  const router = useRouter()

  return (
    <div className="flex flex-col gap-5">
      <VocabularButton
        icon={<FormOutlined />}
        label="from input"
        action={() => router.push('/vocabular/from-input')}
      />

      <VocabularButton
        icon={<FileUnknownOutlined />}
        label="possibly unknown"
        action={() => router.push('/vocabular/possibly-unknown')}
      />

      <VocabularButton
        icon={<VerifiedOutlined />}
        label="unknown"
        action={() => router.push('/vocabular/unknown')}
      />

      <VocabularButton
        icon={<FireOutlined />}
        label="generate all unknown"
        action={() => router.push('/vocabular/generate-all-unknown')}
      />
    </div>
  )
}

function VocabularButton({
  icon,
  label,
  action,
}: {
  icon: React.ReactNode
  label: string
  action: () => void
}) {
  return (
    <Button type="primary" onClick={action} className="w-fit">
      <div className="w-full flex gap-2 justify-start">
        <div>{icon}</div>
        <div className="w-full text-center">{label}</div>
      </div>
    </Button>
  )
}
