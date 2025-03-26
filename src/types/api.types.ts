import { TCard } from './card'
import { TTrainingType } from './training'

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
  trainingType: TTrainingType
  limit?: number
}

export type TAnswerResultReq = {
  id: string
}

export type TStatsRes = {
  totalCards: number
  correctAnswersGroups: { correctAnswers: number; count: number }[]
  vocabularyLength: number
  unknownLength: number
  possiblyUnknownLength: number
  ignoredLength: number
}

export type TVocabularUnknownReq = { text: string }

export type TWord = { id: string; word: string }

export type TGetPossiblyUnknownRes = TWord[]

export type TRecordKnownReq = TWord[]

export type TRecordUnknownReq = TWord[]

export type TRecordIgnoredReq = TWord[]

export type TGenerateUnknownLog = {
  id: number
  dateTime: string
  isFinished: boolean
  isSuccess: boolean
  totalCards: number
  generatedCards: number
  totalTimeMs: number
  estimatedEndTimeMs: number
  errorMessage: string
}

export type TGenerateUnknownLogs = TGenerateUnknownLog[]
