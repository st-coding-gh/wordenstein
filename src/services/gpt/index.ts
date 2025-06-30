import OpenAI from 'openai'
import dotenv from 'dotenv'
import { TGptTextToImage, TGptTextToText, TModel } from '@/types/gpt'
import { zodResponseFormat } from 'openai/helpers/zod'
import { z } from 'zod'
import { wordCardPrompt } from './word-card-prompt'

dotenv.config()

class GPT {
  private vseGpt = new OpenAI({
    baseURL: 'https://api.vsegpt.ru/v1',
    apiKey: process.env['VSEGPT_API_KEY'],
  })

  async textToText(query: TGptTextToText) {
    const req = await this.vseGpt.chat.completions.create({
      model: query.model,
      messages: [
        {
          role: 'user',
          content: query.prompt,
        },
      ],
    })

    return req.choices[0].message.content
  }

  async wordToCard(word: string) {
    const schemaCard = z.object({
      word: z.string(),
      transcription: z.string(),
      definition: z.string(),
      translation: z.string(),
      comparison: z.string(),
      examplesBestChoice: z.string(),
      examplesNotBestChoice: z.string(),
      imagePrompt: z.string(),
    })

    const model: TModel = 'openai/gpt-4o-mini'

    const req = await this.vseGpt.beta.chat.completions.parse({
      model: model,
      messages: [
        { role: 'system', content: wordCardPrompt },
        { role: 'user', content: word },
      ],
      response_format: zodResponseFormat(schemaCard, 'card'),
    })

    return req.choices[0].message.parsed
  }

  async imageForCard(prompt: string) {
    const req = (await this.vseGpt.images.generate({
      model: 'img-stable/stable-diffusion-xl-1024',
      prompt: prompt,
      response_format: 'b64_json',
    })) as unknown as {
      created: number
      data: { b64_json: string }[]
      model: string
    }

    const imageJson = req.data[0].b64_json

    return imageJson
  }

  async textToImage(query: TGptTextToImage) {
    const req = await this.vseGpt.images.generate({
      model: query.model,
      prompt: query.prompt,
      response_format: 'b64_json',
    })

    return req
  }
}

export const gpt = new GPT()
