export type TCard = {
  id?: string
  word: string
  transcription: string
  definition: string
  translation: string
  comparison: string
  examplesBestChoice: string
  examplesNotBestChoice: string
  imagePrompt: string
  image?: any // JsonValue from Prisma - can be string[], null, or other JSON types
  correctAnswers?: number
}
