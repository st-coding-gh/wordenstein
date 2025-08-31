'use client'

import { api } from '@/services/api'
import { TTrainingSettingReq } from '@/types/api.types'
import { TCard } from '@/types/card'
import { TTrainingType } from '@/types/training'
import { Button, Input, InputNumber, Radio } from 'antd'
import React, { useEffect, useState } from 'react'
import {
  Card,
  CardWord,
  CardImage,
  CardTranslation,
  CardDefinition,
} from '@/components/particles/card'
import { StatsComponent } from '@/components/parts/stats'

export default function Train() {
  const [settingLimit, setSettingLimit] = useState<number | null>(null)
  const [settingTrainingType, setSettingTrainingType] = useState<TTrainingType>(
    'beginner-from-english'
  )
  const [isSettingsDone, setIsSettingsDone] = useState(false)
  const [cardsSetIsLoading, setCardsSetIsLoading] = useState(false)
  const [cards, setCards] = useState<TCard[]>()
  const [currentCardIndex, setCurrentCardIndex] = useState(0)
  const [isTrainingDone, setIsTrainingDone] = useState(false)

  useEffect(() => {
    if (!isSettingsDone) return

    if (currentCardIndex === cards?.length) {
      setIsTrainingDone(true)
      setCurrentCardIndex(0)
    }
  }, [currentCardIndex])

  return (
    <>
      {!isSettingsDone && (
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-3">
            <SettingsLabel text="training type" />

            <Radio.Group
              onChange={e => setSettingTrainingType(e.target.value)}
              value={settingTrainingType}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
              }}
            >
              <Radio value="beginner-from-english">beginner, english</Radio>
              <Radio value="beginner-from-image-russian">
                beginner, russian and image
              </Radio>
              <Radio value="intermediate-from-image-russian">
                intermediate, russian and image
              </Radio>
              <Radio value="advanced-from-russian">advanced, russian</Radio>
              <Radio value="advanced-from-definition">
                advanced, definition
              </Radio>
              <Radio value='advanced-from-english'>advanced, english</Radio>
            </Radio.Group>
          </div>

          <div className="flex flex-col gap-3">
            <SettingsLabel text="limit number of cards" />

            <InputNumber
              value={settingLimit}
              onChange={e => setSettingLimit(e as number)}
              size="large"
            />
          </div>

          <Button
            type="primary"
            size="large"
            loading={cardsSetIsLoading}
            onClick={async () => {
              setCardsSetIsLoading(true)
              const res = await api.trainingSet({
                trainingType: settingTrainingType,
                limit: settingLimit ? settingLimit : undefined,
              })

              setCards(res)
              setCardsSetIsLoading(false)
              setIsSettingsDone(true)
            }}
          >
            Start training
          </Button>

          <StatsComponent display={{
            correct_answers: true,
            database_size: false,
            images_size: false,
            total_cards: false,
            vocabulary: false,
            generation_log: false
          }} />
        </div>
      )}

      {isSettingsDone && !isTrainingDone && (
        <div className="flex flex-col gap-5">
          <p className="text-app-info font-bold">{`${currentCardIndex + 1
            } card of ${cards?.length}`}</p>
          <TrainingCard
            card={cards?.[currentCardIndex]}
            currentCardIndex={currentCardIndex}
            settingQuestionsType={settingTrainingType}
            setCurrentCardIndex={setCurrentCardIndex}
          />
        </div>
      )}

      {isTrainingDone && (
        <div className="flex flex-col gap-5">
          <p>Training completed!</p>
          <Button
            type="primary"
            onClick={() => {
              window.location.reload()
            }}
          >
            new training
          </Button>
        </div>
      )}
      <div></div>
    </>
  )
}

function SettingsLabel({ text }: { text: string }) {
  return <p className="text-lg font-bold">{text}</p>
}

function TrainingCard({
  card,
  currentCardIndex,
  settingQuestionsType,
  setCurrentCardIndex,
}: {
  card?: TCard
  currentCardIndex: number
  settingQuestionsType: TTrainingType
  setCurrentCardIndex: React.Dispatch<React.SetStateAction<number>>
}) {
  const [isQuestion, setIsQuestion] = useState(true)

  if (!card)
    return (
      <>
        <div>out of cards</div>
      </>
    )

  return (
    <>
      {isQuestion && (
        <div className="flex flex-col gap-5">
          <Button type="primary" onClick={() => setIsQuestion(false)}>
            show answer
          </Button>

          <TrainingQuestion
            card={card}
            settingQuestionsType={settingQuestionsType}
          />
        </div>
      )}

      {!isQuestion && (
        <div className="flex flex-col gap-5">
          <div className="flex flex-row gap-2">
            <Button
              type="primary"
              danger
              onClick={async () => {
                await api.answerIncorrect({ id: card.id as string })
                setCurrentCardIndex(prev => prev + 1)
                setIsQuestion(true)
              }}
              className="w-full"
            >
              wrong
            </Button>

            <Button
              type="primary"
              onClick={async () => {
                await api.answerCorrect({ id: card.id as string })
                setCurrentCardIndex(prev => prev + 1)
                setIsQuestion(true)
              }}
              className="w-full"
            >
              right
            </Button>
          </div>
          <Card card={card} />
        </div>
      )}
    </>
  )
}

function TrainingQuestion({
  card,
  settingQuestionsType,
}: {
  card: TCard
  settingQuestionsType: TTrainingType
}) {
  switch (settingQuestionsType) {
    case 'beginner-from-english':
      return <QuestionBeginnerEnglish card={card} />

    case 'beginner-from-image-russian':
      return <QuestionImageRussian card={card} />

    case 'intermediate-from-image-russian':
      return <QuestionImageRussian card={card} />

    case 'advanced-from-russian':
      return <QuestionRussian card={card} />

    case 'advanced-from-definition':
      return <QuestionDefinition card={card} />

    case 'advanced-from-english':
      return <QuestionEnglish card={card} />
  }
}

function QuestionBeginnerEnglish({ card }: { card: TCard }) {
  return <CardWord card={card} />
}

function QuestionImageRussian({ card }: { card: TCard }) {
  return (
    <>
      <CardImage card={card} />
      <CardTranslation card={card} />
    </>
  )
}

function QuestionRussian({ card }: { card: TCard }) {
  return (
    <>
      <CardTranslation card={card} />
    </>
  )
}

function QuestionDefinition({ card }: { card: TCard }) {
  return <CardDefinition card={card} />
}

function QuestionEnglish({ card }: { card: TCard }) {
  return <CardWord card={card} />
}
