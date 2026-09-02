'use client'

import { api } from '@/services/api'
import { Button, Skeleton } from 'antd'
import { CheckCircleFilled, CloseCircleFilled } from '@ant-design/icons'
import React, { useEffect, useState } from 'react'
import { TGetPossiblyUnknownRes, TWord } from '@/types/api.types'

export default function PossiblyUnknown() {
  const [loading, setLoading] = useState(true)
  const [possiblyUnknown, setPossiblyUnknown] =
    useState<TGetPossiblyUnknownRes>([])
  const [checkedValues, setCheckedValues] = useState<TGetPossiblyUnknownRes>([])
  const [total, setTotal] = useState(0)
  const limit = 100
  const allDisplayedSelected =
    possiblyUnknown.length > 0 &&
    possiblyUnknown.every(word =>
      checkedValues.some(checked => checked.id === word.id)
    )

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
          <div className="flex items-center justify-center gap-2 py-3">
            <p className="text-xs font-black">
              {possiblyUnknown.length} of {total}
            </p>
            <Button
              type="text"
              shape="circle"
              size="small"
              className="!h-5 !w-5 !border-0 !p-0 !text-app-primary"
              disabled={possiblyUnknown.length === 0}
              aria-label={allDisplayedSelected ? 'deselect all' : 'select all'}
              title={allDisplayedSelected ? 'deselect all' : 'select all'}
              icon={
                allDisplayedSelected ? <CloseCircleFilled /> : <CheckCircleFilled />
              }
              onClick={() => {
                setCheckedValues(allDisplayedSelected ? [] : possiblyUnknown)
              }}
            />
          </div>
          <ul className="flex flex-row gap-2 flex-wrap">
            {possiblyUnknown.map(word => (
              <li key={word.id}>
                <Word
                  word={word}
                  checked={checkedValues.some(checked => checked.id === word.id)}
                  setCheckedValues={setCheckedValues}
                />
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
  checked,
  setCheckedValues,
}: {
  word: TWord
  checked: boolean
  setCheckedValues: React.Dispatch<React.SetStateAction<TGetPossiblyUnknownRes>>
}) {
  const color = checked ? 'bg-app-danger' : 'bg-app-info'

  return (
    <button
      className={`px-6 py-3  rounded-full text-app-contrast text-sm font-bold ${color} active:translate-y-0.5`}
      onClick={() => {
        if (checked) {
          setCheckedValues(prev => prev.filter(w => w.id !== word.id))
        } else {
          setCheckedValues(prev => [...prev, word])
        }
      }}
    >
      {word.word}
    </button>
  )
}
