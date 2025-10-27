"use client"

import { api } from "@/services/api"
import { Button, Input, Skeleton } from "antd"
import { CheckCircleFilled } from "@ant-design/icons"
import React, { useEffect, useState } from "react"
import { TGetPossiblyUnknownRes, TWord } from "@/types/api.types"

export default function Unknown() {
  const [loading, setLoading] = useState(true)
  const [unknown, setUnknown] = useState<TGetPossiblyUnknownRes>([])
  const [input, setInput] = useState("")
  const [checkedValues, setCheckedValues] = useState<TGetPossiblyUnknownRes>([])
  const [total, setTotal] = useState(0)
  const [searchResults, setSearchResults] = useState<string[]>([])
  const [searching, setSearching] = useState(false)

  useEffect(() => {
    api.getUnknown().then((res) => {
      setCheckedValues([])
      setTotal(res.length)
      setUnknown(res)
      setLoading(false)
    })
  }, [])

  // Debounced search effect
  useEffect(() => {
    if (!input.trim()) {
      setSearchResults([])
      return
    }

    setSearching(true)
    const timeoutId = setTimeout(() => {
      api.cardSearch(input).then((results) => {
        setSearchResults(results)
        setSearching(false)
      })
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [input])

  return (
    <Skeleton loading={loading} active>
      <div className="relative not-[]:flex flex-col gap-5">
        <div className="py-3 sticky z-10 top-0 bg-app-contrast ">
          <div className="flex flex-row flex-wrap justify-between gap-2">
            <div className="bg-app-success rounded-3xl">
              <Button
                type="text"
                className="w-fit"
                onClick={async () => {
                  await api.recordKnown(checkedValues)
                  await api.deleteUnknown(checkedValues)
                  window.location.reload()
                }}
              >
                known
              </Button>
            </div>

            <div>
              <div className="flex flex-col gap-1">
                <div className="flex flex-row gap-3">
                  <Input
                    placeholder="new unknown word"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                  />
                  <Button
                    type="primary"
                    className="w-fit"
                    onClick={async () => {
                      await api.recordUnknown([
                        {
                          word: input.toLowerCase().trim(),
                          id: Math.random().toString(36).substring(2, 15),
                        },
                      ])
                      window.location.reload()
                    }}
                  >
                    add
                  </Button>
                </div>
              </div>
            </div>

            <div className="bg-app-warning rounded-3xl">
              <Button
                className="w-fit"
                type="text"
                onClick={() => {
                  api.recordIgnored(checkedValues)
                  api.deleteUnknown(checkedValues)
                  window.location.reload()
                }}
              >
                ignore
              </Button>
            </div>
          </div>

          {input.trim() && !searching && (
            <div className="min-h-4 pt-2 flex flex flex-row flex-wrap justify-center">
              {searchResults.length > 0 ? (
                <span className="text-xs text-app-danger">
                  {searchResults.join(" ")}
                </span>
              ) : (
                <CheckCircleFilled className="text-app-success text-sm" />
              )}
            </div>
          )}
        </div>

        <div>
          <p className="w-full py-3 text-xs font-black text-center">
            {unknown.length} of {total}
          </p>
          <ul className="flex flex-row gap-2 flex-wrap">
            {unknown.map((word) => (
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

  const color = checked ? "bg-app-danger" : "bg-app-info"

  return (
    <button
      className={`px-6 py-3  rounded-full text-app-contrast text-sm font-bold ${color} active:translate-y-0.5`}
      onClick={() => {
        if (checked) {
          setChecked(false)
          setCheckedValues((prev) => prev.filter((w) => w.word !== word.word))
          navigator.clipboard.writeText(word.word)
        } else {
          setChecked(true)
          setCheckedValues((prev) => [...prev, word])
          navigator.clipboard.writeText(word.word)
        }
      }}
    >
      {word.word}
    </button>
  )
}
