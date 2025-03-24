'use client'

import { api } from '@/services/api'
import { Button, Checkbox, Skeleton } from 'antd'
import React, { useEffect, useState } from 'react'
import type { CheckboxProps } from 'antd'
import { genCheckboxStyle } from 'antd/es/checkbox/style'
import { TGetPossiblyUnknownRes, TWord } from '@/types/api.types'

export default function PossiblyUnknown() {
  const [loading, setLoading] = useState(true)
  const [possiblyUnknown, setPossiblyUnknown] =
    useState<TGetPossiblyUnknownRes>([])
  const [checkedValues, setCheckedValues] = useState<TGetPossiblyUnknownRes>([])
  const [total, setTotal] = useState(0)
  const limit = 100

  useEffect(() => {
    api.getPossiblyUnknown().then(res => {
      setCheckedValues([])
      setTotal(res.length)
      setPossiblyUnknown(res.slice(0, limit))
      setLoading(false)
    })
  }, [])

  return (
    <Skeleton loading={loading} active>
      <div className="relative not-[]:flex flex-col gap-5">
        <div className="py-3 sticky z-10 top-0 bg-app-contrast flex flex-row flex-wrap justify-between gap-2">
          <div className="bg-app-success rounded-3xl">
            <Button
              type="text"
              className="w-fit"
              onClick={async () => {
                const res = await api.recordKnown(checkedValues)
                window.location.reload()
              }}
            >
              known
            </Button>
          </div>

          <div className="bg-app-secondary rounded-3xl">
            <Button
              type="text"
              className="w-fit"
              onClick={() => {
                const res = api.recordUnknown(checkedValues)
                window.location.reload()
              }}
            >
              unknown
            </Button>
          </div>

          <div className="bg-app-warning rounded-3xl">
            <Button
              className="w-fit"
              type="text"
              onClick={() => {
                const res = api.recordIgnored(checkedValues)
                window.location.reload()
              }}
            >
              ignore
            </Button>
          </div>
        </div>

        <div>
          <p className="w-full py-3 text-xs font-black text-center">
            {possiblyUnknown.length} of {total}
          </p>
          <ul className="flex flex-row gap-2 flex-wrap">
            {possiblyUnknown.map(word => (
              <li key={word.id}>
                <Word word={word} setCheckedValues={setCheckedValues} />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Skeleton>
  )
}

function Word({
  word,
  setCheckedValues,
}: {
  word: TWord
  setCheckedValues: React.Dispatch<React.SetStateAction<TGetPossiblyUnknownRes>>
}) {
  const [checked, setChecked] = useState(false)

  const color = checked ? 'bg-app-danger' : 'bg-app-info'

  return (
    <button
      className={`px-6 py-3  rounded-full text-app-contrast text-sm font-bold ${color} active:translate-y-0.5`}
      onClick={() => {
        if (checked) {
          setChecked(false)
          setCheckedValues(prev => prev.filter(w => w.word !== word.word))
        } else {
          setChecked(true)
          setCheckedValues(prev => [...prev, word])
        }
      }}
    >
      {word.word}
    </button>
  )
}
