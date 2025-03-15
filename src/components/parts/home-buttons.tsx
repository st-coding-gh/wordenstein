import { api } from '@/services/api'
import { Button } from 'antd'
import { useRouter } from 'next/navigation'
import {
  AimOutlined,
  LogoutOutlined,
  PlusCircleOutlined,
  SearchOutlined,
} from '@ant-design/icons'

export function ButtonGroup() {
  return (
    <div className="lg:w-1/3 flex justify-end">
      <div className="w-40 flex flex-col gap-3">
        <CardsTrainButton />
        <CardAddButton />
        <CardsListButton />
        <Logout />
      </div>
    </div>
  )
}

function Logout() {
  return (
    <Button
      type="primary"
      onClick={async () => {
        const res = await api.logout()
        if (res) window.location.reload()
      }}
    >
      <LogoutOutlined />
      logout
    </Button>
  )
}

function CardAddButton() {
  const router = useRouter()

  return (
    <Button
      type="primary"
      onClick={() => {
        router.push('/card-add')
      }}
    >
      <PlusCircleOutlined />
      add word
    </Button>
  )
}

function CardsListButton() {
  const router = useRouter()

  return (
    <Button type="primary" onClick={() => router.push('/cards-list')}>
      <SearchOutlined />
      cards list
    </Button>
  )
}

function CardsTrainButton() {
  const router = useRouter()
  return (
    <Button type="primary" onClick={() => router.push('/training')}>
      <AimOutlined />
      training
    </Button>
  )
}
