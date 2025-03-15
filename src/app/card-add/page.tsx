'use client'

import { Button, Input } from 'antd'
import { useRef, useState } from 'react'
import { message } from 'antd'
import { Card } from '@/components/particles/card'
import { TCard } from '@/types/card'
import { api } from '@/services/api'

export default function CardAdd() {
  const [textAreaValue, setTextAreaValue] = useState()
  const [card, setCard] = useState<TCard>()
  const [file, setFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [messageApi, contextHolder] = message.useMessage()

  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const selectedFile = event.target.files[0]
      setFile(selectedFile)
      setImagePreview(URL.createObjectURL(selectedFile)) // Generate preview
    }
  }

  const handleUpload = async () => {
    if (!file)
      return messageApi.open({ type: 'error', content: 'No file selected' })

    const formData = new FormData()
    formData.append('image', file)
    formData.append('card', JSON.stringify(card))

    try {
      const response = await api.cardUpload(formData)

      const data = await response.json()

      if (response.ok) {
        messageApi.open({
          type: 'success',
          content: 'Upload successful! File saved',
        })
        window.location.reload()
      } else {
        messageApi.open({
          type: 'error',
          content: 'Upload failed: ' + data.error,
        })
      }
    } catch (error) {
      console.error('Error uploading file:', error)
      messageApi.open({ type: 'error', content: 'Upload error' })
    }
  }

  function handleTextAreaChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    try {
      const parsed = JSON.parse(e.target.value.trim())
      setCard(parsed)
    } catch (e) {
      console.log({
        error: e,
      })
    }
  }

  return (
    <div className="flex flex-col gap-5">
      {contextHolder}

      <Input.TextArea
        placeholder="paste JSON"
        rows={3}
        value={textAreaValue}
        onChange={handleTextAreaChange}
      ></Input.TextArea>

      {card && <Card card={card} />}

      <input
        type="file"
        accept="image/png, image/jpeg, image/jpg, image/webp, image/gif, image/avif"
        multiple={false}
        ref={fileInputRef}
        className="hidden"
        onChange={handleFileChange}
      />

      {imagePreview && (
        <div className="">
          <img
            src={imagePreview}
            alt="Preview"
            className="max-w-xs rounded-lg border-2 border-app-primary-500"
          />
        </div>
      )}

      <Button
        type="dashed"
        className="w-fit"
        onClick={() => fileInputRef.current && fileInputRef.current.click()}
      >
        choose image
      </Button>

      <Button
        type="primary"
        className="w-fit"
        onClick={() => {
          handleUpload()
        }}
      >
        add
      </Button>
    </div>
  )
}
