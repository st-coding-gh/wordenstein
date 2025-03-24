'use client'

import { api } from '@/services/api'
import { Button, Input } from 'antd'
import { useState } from 'react'

export default function Vocabular() {
  const [loading, setLoading] = useState(false)
  const [input, setInput] = useState('')
  const [output, setOutput] = useState<string[] | null>()

  return (
    <div className="flex flex-col gap-5">
      <Input.TextArea
        rows={5}
        value={input}
        onChange={e => setInput(e.target.value)}
      />

      <Button
        type="primary"
        loading={loading}
        className="w-fit"
        onClick={async () => {
          setLoading(true)
          const res = await api.findUnknownFromInput({
            text: input,
          })

          setOutput(res)
          setLoading(false)
        }}
      >
        extract
      </Button>

      {output && (
        <>
          <p className="text-sm">
            <span className="font-bold">{output.length}</span> possibly unknown
            words identified
          </p>
          <div className="flex flex-row gap-2 flex-wrap">
            {output.map((word, index) => (
              <span
                key={index}
                className="px-1 bg-app-success-700 rounded-full text-xs font-bold"
              >
                {word}
              </span>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
