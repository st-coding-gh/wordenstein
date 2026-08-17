import { TVocabularUnknownReq } from '@/types/api.types'

type TLemmaResponse = {
  'filtered-lemmas': string[]
}

export async function lemmatize(query: TVocabularUnknownReq) {
  const apiUrl = process.env.LEMMA_API_URL
  const apiKey = process.env.LEMMA_API_KEY

  if (!apiUrl) {
    throw new Error('LEMMA_API_URL is not configured')
  }

  if (!apiKey) {
    throw new Error('LEMMA_API_KEY is not configured')
  }

  const apiReq = await fetch(`${apiUrl.replace(/\/$/, '')}/filter-lemmas`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(query),
  })

  if (!apiReq.ok) {
    throw new Error(`Lemma API request failed with status ${apiReq.status}`)
  }

  const res = (await apiReq.json()) as TLemmaResponse
  return res['filtered-lemmas']
}
