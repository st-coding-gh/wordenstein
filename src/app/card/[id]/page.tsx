'use client'

import { api } from '@/services/api'
import { TCard } from '@/types/card'
import { Button, Input, message, Skeleton, Upload } from 'antd'
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Card, CardImage } from '@/components/particles/card'
import { EditOutlined, UploadOutlined } from '@ant-design/icons'
import type { UploadFile } from 'antd'

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
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [uploadLoading, setUploadLoading] = useState(false)

  const handleImageUpload = async (file: File) => {
    if (!card.id) return false

    setUploadLoading(true)
    try {
      const formData = new FormData()
      formData.append('image', file)
      formData.append('cardId', card.id)

      const response = await api.cardAddImage(formData)
      const result = await response.json()

      if (response.ok) {
        messageApi.open({
          type: 'success',
          content: `Image added successfully! Total: ${result.totalImages} images`,
        })

        // Refresh card data to show new image
        if (card.id) {
          const updatedCard = await api.cardById(card.id)
          setCard(updatedCard)
        }
      } else {
        messageApi.open({
          type: 'error',
          content: 'Failed to add image: ' + result.error,
        })
      }
    } catch (error) {
      messageApi.open({
        type: 'error',
        content: 'Error uploading image',
      })
    }
    setUploadLoading(false)
    return false // Prevent default upload behavior
  }

  return (
    <div className="flex flex-col gap-5">
      {contextHolder}
      <h1 className="text-4xl font-black text-app-secondary">editing mode</h1>

      {/* Image Upload Section */}
      <div>
        <EditHeading text="add new image" />
        <Upload
          beforeUpload={handleImageUpload}
          showUploadList={false}
          accept="image/*"
          disabled={uploadLoading}
        >
          <Button
            icon={<UploadOutlined />}
            loading={uploadLoading}
            className="w-full"
          >
            {uploadLoading ? 'Uploading...' : 'Add Image'}
          </Button>
        </Upload>
        <div className="text-xs text-gray-500 mt-1">
          Current images: {card.image && Array.isArray(card.image) ? card.image.length : (card.id ? 1 : 0)}
        </div>
      </div>

      {/* Current Images with Delete Option */}
      <div>
        <EditHeading text="current images" />
        <CardImage
          card={card}
          isEditing={true}
          onImageDeleted={async () => {
            // Refresh card data to show updated image count
            if (card.id) {
              const updatedCard = await api.cardById(card.id)
              setCard(updatedCard)
            }
          }}
        />
      </div>

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

      <div className="w-full flex flex-row justify-between">
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

        <Button
          type="primary"
          loading={deleteLoading}
          danger
          onClick={async () => {
            setDeleteLoading(true)
            if (!card.id) return
            const res = await api.deleteCard({
              id: card.id,
            })

            console.log({ deleted: res })
            setDeleteLoading(false)
            window.location.href = '/cards-list'
          }}
        >
          delete
        </Button>
      </div>
    </div>
  )
}

function EditHeading({ text }: { text: string }) {
  return <h3 className="pl-1 font-black text-xs mb-1">{text}</h3>
}
