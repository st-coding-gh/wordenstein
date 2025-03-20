'use client'

import { api } from '@/services/api'
import { TCard } from '@/types/card'
import { Button, Input, message, Skeleton } from 'antd'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Card } from '@/components/particles/card'
import { EditOutlined } from '@ant-design/icons'

export default function CardDetail() {
  const [loading, setLoading] = useState(true)
  const [card, setCard] = useState<TCard>()
  const [isEditing, setIsEditing] = useState(false)
  const { id } = useParams()

  useEffect(() => {
    console.log({ card })
  }, [card])

  useEffect(() => {
    if (id) {
      api.cardById(id as string).then(res => {
        setCard(res)
        setLoading(false)
      })
    }
  }, [])

  return (
    <div>
      <Skeleton loading={loading} active>
        <div className="relative">
          <div className="absolute z-10 top-0 right-0">
            <Button
              type="default"
              shape="circle"
              icon={<EditOutlined />}
              onClick={() => {
                setIsEditing(prev => !prev)
              }}
            />
          </div>

          {card && !isEditing && <Card card={card} />}

          {isEditing && (
            <Editing
              card={card as TCard}
              setCard={setCard as React.Dispatch<React.SetStateAction<TCard>>}
              setIsEditing={setIsEditing}
            />
          )}
        </div>
      </Skeleton>
    </div>
  )
}

function Editing({
  card,
  setCard,
  setIsEditing,
}: {
  card: TCard
  setCard: React.Dispatch<React.SetStateAction<TCard>>
  setIsEditing: React.Dispatch<React.SetStateAction<boolean>>
}) {
  // connect to message api of antd
  const [messageApi, contextHolder] = message.useMessage()

  return (
    <div className="flex flex-col gap-5">
      {contextHolder}
      <h1 className="text-4xl font-black text-app-secondary">editing mode</h1>

      <div>
        <EditHeading text="word" />
        <Input
          value={card.word}
          onChange={e => setCard(prev => ({ ...prev, word: e.target.value }))}
        />
      </div>

      <div>
        <EditHeading text="transcription" />
        <Input
          value={card.transcription}
          onChange={e =>
            setCard(prev => ({ ...prev, transcription: e.target.value }))
          }
        />
      </div>

      <div>
        <EditHeading text="definition" />
        <Input.TextArea
          rows={3}
          value={card.definition}
          onChange={e =>
            setCard(prev => ({ ...prev, definition: e.target.value }))
          }
        />
      </div>

      <div>
        <EditHeading text="translation" />
        <Input.TextArea
          rows={3}
          value={card.translation}
          onChange={e =>
            setCard(prev => ({ ...prev, translation: e.target.value }))
          }
        />
      </div>

      <div>
        <EditHeading text="comparison" />
        <Input.TextArea
          rows={3}
          value={card.comparison}
          onChange={e =>
            setCard(prev => ({ ...prev, comparison: e.target.value }))
          }
        />
      </div>

      <div>
        <EditHeading text="best choice" />
        <Input.TextArea
          rows={3}
          value={card.examplesBestChoice}
          onChange={e =>
            setCard(prev => ({ ...prev, examplesBestChoice: e.target.value }))
          }
        />
      </div>

      <div>
        <EditHeading text="not best choice" />
        <Input.TextArea
          rows={3}
          value={card.examplesNotBestChoice}
          onChange={e =>
            setCard(prev => ({
              ...prev,
              examplesNotBestChoice: e.target.value,
            }))
          }
        />
      </div>

      <Button
        type="primary"
        className="w-fit"
        onClick={async () => {
          const res = await api.cardUpdate(card)
          if (res) {
            messageApi.open({
              type: 'success',
              content: 'saved',
              duration: 1,
              onClose: () => setIsEditing(false),
            })
          } else {
            messageApi.open({ type: 'error', content: 'error' })
          }
        }}
      >
        save
      </Button>
    </div>
  )
}

function EditHeading({ text }: { text: string }) {
  return <h3 className="pl-1 font-black text-xs mb-1">{text}</h3>
}
