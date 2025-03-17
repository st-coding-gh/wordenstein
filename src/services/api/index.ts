import {
  TAuthStatusRes,
  TCardAllRes,
  TCreateUserReq,
  TLoginReq,
  TStatsRes,
  TTrainingSettingReq,
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
}

export const api = new Api()
