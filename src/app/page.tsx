'use client'

import { ButtonGroup } from '@/components/parts/home-buttons'
import Image from 'next/image'

export default function Home() {
  return (
    <>
      <div className="pt-10 lg:pt-0 flex flex-col lg:flex-row gap-3 items-center justify-center ">
        <ButtonGroup />

        <Image
          src="/images/home/wordenstein-portrait.webp"
          alt="portrait of professor wordenstein"
          width={700}
          height={700}
          className="lg:w-2/3"
        />
      </div>
    </>
  )
}
