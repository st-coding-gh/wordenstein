'use client'

import { api } from '@/services/api'
import { Button } from 'antd'
import { test_image } from './temp'
import { useState } from 'react'

function base64ToImageSrc(b64: string, mimeType = 'image/png'): string {
  return `data:${mimeType};base64,${b64}`
}

export default function GptTestPage() {
  const [image, setImage] = useState()
  const [loading, setLoading] = useState(false)
  return (
    <>
      <Button
        type="primary"
        loading={loading}
        onClick={async () => {
          setLoading(true)
          const res = await api.gptTest()
          setLoading(false)
          console.log(res)
          setImage(res.response)
        }}
      >
        test
      </Button>

      {image && (
        <div className="w-[500px] py-10">
          <img src={base64ToImageSrc(image)} className="w-full object-cover" />
        </div>
      )}
    </>
  )
}
