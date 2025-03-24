import { api } from '@/services/api'
import { Button } from 'antd'
import { useRouter } from 'next/navigation'
import {
  AimOutlined,
  BarChartOutlined,
  LogoutOutlined,
  PlusCircleOutlined,
  SearchOutlined,
  SettingOutlined,
  SortAscendingOutlined,
} from '@ant-design/icons'

export function ButtonGroup() {
  return (
    <div className="lg:w-1/3 flex justify-end">
      <div className="w-52 flex flex-col gap-3">
        <CardsTrainButton />
        <CardAddButton />
        <CardsListButton />
        <VocabularButton />
        <StatsButton />
        <SettingsButton />
        <Logout />
      </div>
    </div>
  )
}

function HomeButton({
  icon,
  label,
  action,
}: {
  icon: React.ReactNode
  label: string
  action: () => void
}) {
  return (
    <Button type="primary" onClick={action}>
      <div className="w-full flex gap-2 justify-start">
        <div>{icon}</div>
        <div className="w-full text-center">{label}</div>
      </div>
    </Button>
  )
}

function Logout() {
  return (
    // <Button
    //   type="primary"
    //   onClick={async () => {
    //     const res = await api.logout()
    //     if (res) window.location.reload()
    //   }}
    // >
    //     <LogoutOutlined />
    //     logout
    // </Button>
    <HomeButton
      icon={<LogoutOutlined />}
      label="logout"
      action={async () => {
        const res = await api.logout()
        if (res) window.location.reload()
      }}
    />
  )
}

function CardAddButton() {
  const router = useRouter()

  return (
    // <Button
    //   type="primary"
    //   onClick={() => {
    //     router.push('/card-add')
    //   }}
    // >
    //   <PlusCircleOutlined />
    //   add word
    // </Button>

    <HomeButton
      icon={<PlusCircleOutlined />}
      label="add word"
      action={() => {
        router.push('/card-add')
      }}
    />
  )
}

function CardsListButton() {
  const router = useRouter()

  return (
    // <Button type="primary" onClick={() => router.push('/cards-list')}>
    //   <SearchOutlined />
    //   cards list
    // </Button>

    <HomeButton
      icon={<SearchOutlined />}
      label="cards list"
      action={() => router.push('/cards-list')}
    />
  )
}

function CardsTrainButton() {
  const router = useRouter()
  return (
    // <Button type="primary" onClick={() => router.push('/training')}>
    //   <AimOutlined />
    //   training
    // </Button>

    <HomeButton
      icon={<AimOutlined />}
      label="training"
      action={() => router.push('/training')}
    />
  )
}

function StatsButton() {
  const router = useRouter()
  return (
    // <Button type="primary" onClick={() => router.push('/stats')}>
    //   <BarChartOutlined />
    //   stats
    // </Button>

    <HomeButton
      icon={<BarChartOutlined />}
      label="stats"
      action={() => router.push('/stats')}
    />
  )
}

function SettingsButton() {
  const router = useRouter()
  return (
    // <Button type="primary" onClick={() => router.push('/settings')}>
    //   <SettingOutlined />
    //   settings
    // </Button>

    <HomeButton
      icon={<SettingOutlined />}
      label="settings"
      action={() => router.push('/settings')}
    />
  )
}

function VocabularButton() {
  const router = useRouter()
  return (
    // <Button type="primary" onClick={() => router.push('/vocabular')}>
    //   <SortAscendingOutlined />
    //   vocabular
    // </Button>

    <HomeButton
      icon={<SortAscendingOutlined />}
      label="vocabular"
      action={() => router.push('/vocabular')}
    />
  )
}
