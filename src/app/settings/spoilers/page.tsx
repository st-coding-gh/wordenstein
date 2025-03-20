'use client'

import { api } from '@/services/api'
import { Skeleton } from 'antd'
import { useEffect, useState } from 'react'

export default function Spoilers() {
  const [spoilers, setSpoilers] = useState([])

  useEffect(() => {
    api.findSpoilers().then(res => {
      setSpoilers(res)
    })
  }, [])

  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-4xl font-black text-app-secondary">spoilers</h1>
      <Skeleton loading={spoilers.length === 0} active>
        <ul className="flex flex-row gap-2 flex-wrap">
          {spoilers.map(spoiler => (
            <li
              key={spoiler}
              className="px-3 py-1 bg-app-info rounded-full text-app-contrast font-bold"
            >
              {spoiler}
            </li>
          ))}
        </ul>
      </Skeleton>
    </div>
  )
}
