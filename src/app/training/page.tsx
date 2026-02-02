'use client'

import { api } from '@/services/api'
import { TCard } from '@/types/card'
import { TTrainingQuestionType } from '@/types/training'
import { Button, InputNumber, Radio } from 'antd'
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
  const [settingQuestionType, setSettingQuestionType] =
    useState<TTrainingQuestionType>('english')
  const [minLevel, setMinLevel] = useState<number | null>(null)
  const [maxLevel, setMaxLevel] = useState<number | null>(null)
  const [isLevelRangeInvalid, setIsLevelRangeInvalid] = useState(false)
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
  }, [currentCardIndex, isSettingsDone, cards?.length])

  useEffect(() => {
    if (minLevel === null || maxLevel === null) {
      setIsLevelRangeInvalid(false)
      return
    }
    setIsLevelRangeInvalid(minLevel > maxLevel)
  }, [minLevel, maxLevel])

  return (
    <>
      {!isSettingsDone && (
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-3">
            <SettingsLabel text="question type" />

            <Radio.Group
              onChange={e => setSettingQuestionType(e.target.value)}
              value={settingQuestionType}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
              }}
            >
              <Radio value="english">english</Radio>
              <Radio value="russian">russian</Radio>
              <Radio value="image">image</Radio>
              <Radio value="definition">definition</Radio>
            </Radio.Group>
          </div>

          <div className="flex flex-col gap-3">
            <SettingsLabel text="levels range (inclusive)" />
            <div className="flex flex-row gap-2">
              <InputNumber
                value={minLevel}
                onChange={e => setMinLevel(e as number)}
                size="large"
                placeholder="min"
                className="w-full"
              />
              <InputNumber
                value={maxLevel}
                onChange={e => setMaxLevel(e as number)}
                size="large"
                placeholder="max"
                className="w-full"
              />
            </div>
            {isLevelRangeInvalid && (
              <p className="text-app-danger font-bold">
                Min level must be less than or equal to max level.
              </p>
            )}
          </div>

          <Button
            type="primary"
            size="large"
            loading={cardsSetIsLoading}
            disabled={isLevelRangeInvalid}
            onClick={async () => {
              setCardsSetIsLoading(true)
              const res = await api.trainingSet({
                questionType: settingQuestionType,
                minLevel: minLevel === null ? undefined : minLevel,
                maxLevel: maxLevel === null ? undefined : maxLevel,
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
            settingQuestionsType={settingQuestionType}
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
  settingQuestionsType: TTrainingQuestionType
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
  settingQuestionsType: TTrainingQuestionType
}) {
  switch (settingQuestionsType) {
    case 'english':
      return <QuestionEnglish card={card} />

    case 'russian':
      return <QuestionRussian card={card} />

    case 'image':
      return <QuestionImageOnly card={card} />

    case 'definition':
      return <QuestionDefinition card={card} />
  }
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

function QuestionImageOnly({ card }: { card: TCard }) {
  return <CardImage card={card} />
}
