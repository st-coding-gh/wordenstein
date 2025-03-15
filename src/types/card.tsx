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
  correctAnswers?: number
}
