'use client'

import { api } from '@/services/api'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Button, Input, Skeleton } from 'antd'
import { useRouter } from 'next/navigation'
import { message } from 'antd'
import { TErrorRes } from '@/types/api.types'

export function Auth({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isInitiated, setIsInitiated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    api.authStatus().then(res => {
      setIsAuthenticated(res.isAuthenticated)
      setIsInitiated(res.isInitiated)
      setIsLoading(false)
    })
  }, [])

  return (
    <>
      <Skeleton
        loading={isLoading}
        active
        round
        className="h-svh px-10 pt-[44vh] bg-app-primary-700"
      >
        {!isInitiated && <CreateUser />}
        {!isAuthenticated && isInitiated && <Login />}
        {isAuthenticated && <div>{children}</div>}
      </Skeleton>
    </>
  )
}

function Login() {
  const [passwordInput, setPasswordInput] = useState('')
  const [messageApi, contextHolder] = message.useMessage()

  return (
    <div className="p-10 h-svh flex flex-col gap-5 items-center justify-center bg-app-primary-700">
      <h1 className="text-3xl font-black text-app-contrast">Login</h1>
      <div className="w-[40ch]">
        <Input.Password
          placeholder="Password"
          onChange={e => setPasswordInput(e.target.value)}
          value={passwordInput}
        />
      </div>
      <Button
        type="primary"
        onClick={async () => {
          try {
            const req = await api.login({ password: passwordInput })
            const res = await req.json()

            if (!req.ok) {
              const errorResponse = res as TErrorRes
              throw new Error(
                `Error code ${req.status}: ${errorResponse.message}`
              )
            }

            if (req.status === 200) {
              window.location.reload()
            }
          } catch (e) {
            messageApi.open({
              type: 'error',
              content: (e as Error).message,
            })
          }
        }}
      >
        submit
      </Button>

      {contextHolder}
    </div>
  )
}

function CreateUser() {
  const [passwordInput, setPasswordInput] = useState('')
  const [confirmPasswordInput, setConfirmPasswordInput] = useState('')

  return (
    <div className="p-10 h-svh flex flex-col gap-5 items-center justify-center bg-app-primary-700">
      <h1 className="text-3xl font-black text-app-contrast">Create User</h1>
      <div className="flex flex-col gap-5 w-[40ch]">
        <Input.Password
          placeholder="Password"
          onChange={e => setPasswordInput(e.target.value)}
          value={passwordInput}
        />
        <Input.Password
          placeholder="Confirm Password"
          onChange={e => setConfirmPasswordInput(e.target.value)}
          value={confirmPasswordInput}
        />
      </div>
      <div>
        <Button
          type="primary"
          onClick={async () => {
            const res = await api.createUser({ password: passwordInput })
            window.location.reload()
          }}
          disabled={
            passwordInput === '' || passwordInput !== confirmPasswordInput
          }
        >
          Create User
        </Button>
      </div>
    </div>
  )
}
