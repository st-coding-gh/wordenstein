import {
  TAuthStatusRes,
  TCardAllRes,
  TCardByIdReq,
  TCreateUserReq,
  TGenerateUnknownLogs,
  TGetPossiblyUnknownRes,
  TLoginReq,
  TRecordIgnoredReq,
  TRecordKnownReq,
  TRecordUnknownReq,
  TStatsRes,
  TTrainingSettingReq,
  TVocabularUnknownReq,
  TWord,
} from '@/types/api.types'
import { TCard } from '@/types/card'

class Api {
  async fetch(
    apiRoute: string,
    body: Object = {},
    output: 'output-json' | 'output-raw' = 'output-json'
  ) {
    const location = window.location.origin
    const url = new URL(`${location}/api/${apiRoute}`)

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    if (output === 'output-json') {
      return await res.json()
    } else {
      return res
    }
  }

  async authStatus() {
    const res = (await this.fetch('auth/status')) as TAuthStatusRes
    return res
  }

  async createUser(query: TCreateUserReq) {
    return await this.fetch('auth/create-user', query)
  }

  async login(query: TLoginReq) {
    return await this.fetch('auth/login', query, 'output-raw')
  }

  async logout() {
    return await this.fetch('auth/logout')
  }

  async cardUpload(formData: FormData) {
    return await fetch('/api/card/upload', {
      method: 'POST',
      body: formData,
    })
  }

  async cardAll() {
    return (await this.fetch('card/all')) as TCardAllRes[]
  }

  async cardById(id: string) {
    return await this.fetch('card/by-id', { id })
  }

  async trainingSet(query: TTrainingSettingReq) {
    return (await this.fetch('training/set', query)) as TCard[]
  }

  async answerCorrect(query: { id: string }) {
    return await this.fetch('training/answer/correct', query)
  }

  async answerIncorrect(query: { id: string }) {
    return await this.fetch('training/answer/incorrect', query)
  }

  async stats() {
    return (await this.fetch('stats')) as TStatsRes
  }

  async downloadDatabase() {
    return await this.fetch('settings/download-database', {}, 'output-raw')
  }

  async cardUpdate(card: TCard) {
    return await this.fetch('card/update', card)
  }

  async findSpoilers() {
    return await this.fetch('settings/find-spoilers')
  }

  async findUnknownFromInput(query: TVocabularUnknownReq) {
    return (await this.fetch('vocabular/unknown-from-input', query)) as string[]
  }

  async isOxfordRecorded() {
    return (await this.fetch('settings/is-oxford-recorded')) as {
      isOxfordRecorded: boolean
    }
  }

  async recordOxford() {
    return await this.fetch('vocabular/record-oxford')
  }

  async isCardsRecorded() {
    return (await this.fetch('settings/is-cards-recorded')) as {
      isCardsRecorded: boolean
    }
  }

  async recordCards() {
    return await this.fetch('vocabular/record-cards')
  }

  async getPossiblyUnknown() {
    return (await this.fetch(
      'vocabular/get-possibly-unknown'
    )) as TGetPossiblyUnknownRes
  }

  async recordKnown(query: TRecordKnownReq) {
    return (await this.fetch('vocabular/record-known', query)) as TWord[]
  }

  async recordUnknown(query: TRecordUnknownReq) {
    return (await this.fetch('vocabular/record-unknown', query)) as TWord[]
  }

  async recordIgnored(query: TRecordIgnoredReq) {
    return (await this.fetch('vocabular/record-ignore', query)) as TWord[]
  }

  async getUnknown() {
    return (await this.fetch('vocabular/get-unknown')) as TWord[]
  }

  async deleteUnknown(query: TWord[]) {
    return await this.fetch('vocabular/delete-unknown', query)
  }

  async deleteCard(query: TCardByIdReq) {
    return await this.fetch('card/delete', query)
  }

  async gptTest() {
    return await this.fetch('gpt/test')
  }

  async deleteAllUnknown() {
    return await this.fetch('vocabular/delete-unknown-all')
  }

  async deleteAllPossiblyUnknown() {
    return await this.fetch('vocabular/delete-possibly-unknown-all')
  }

  async generateAllUnknown() {
    return await this.fetch('vocabular/generate-all-unknown')
  }

  async getGenerateUnknownLogs() {
    return (await this.fetch(
      'vocabular/generate-unknown-log'
    )) as TGenerateUnknownLogs
  }

  async fixNewLines() {
    return await this.fetch('settings/fix-new-lines')
  }
}

export const api = new Api()
