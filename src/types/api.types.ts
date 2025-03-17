import { TCard } from './card'

export type TAuthStatusRes = {
  isAuthenticated: boolean
  isInitiated: boolean
  message?: string
}

export type TCreateUserReq = { password: string }

export type TLoginReq = { password: string }

export type TErrorRes = { message: string }

export type TCardUploadReq = TCard

export type TCardAllRes = {
  id: string
  word: string
  definition: string
  correctAnswers: number
}

export type TCardByIdReq = { id: string }

export type TTrainingSettingReq = {
  cardsLeastKnown: number
  randomCards: number
}

export type TAnswerResultReq = {
  id: string
}

export type TStatsRes = {
  totalCards: number
  correctAnswersGroups: { correctAnswers: number; count: number }[]
}
