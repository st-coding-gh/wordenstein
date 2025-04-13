import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { AntdRegistry } from '@ant-design/nextjs-registry'
import { Auth } from '@/components/parts/auth'
import '@ant-design/v5-patch-for-react-19'
import './globals.css'
import { AntdConfig } from '@/components/antd-config'
import { Logo } from '@/components/particles/logo'
import Link from 'next/link'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Wordenstein Method',
  description: 'A method to learn words invented by professor Wordenstein',
  robots: 'noindex, nofollow',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AntdRegistry>
          <AntdConfig>
            <Auth>
              <div className="absolute w-full top-0 py-2 flex items-center justify-center border-b-4 border-app-primary">
                <Link href={'/'}>
                  <Logo />
                </Link>
              </div>
              <div className="pt-30 px-3 lg:px-10 pb-10">
                <div className="max-w-[1000px] mx-auto">{children}</div>
              </div>
            </Auth>
          </AntdConfig>
        </AntdRegistry>
      </body>
    </html>
  )
}
