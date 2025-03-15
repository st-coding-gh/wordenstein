'use client'

import { api } from '@/services/api'
import { TTrainingSettingReq } from '@/types/api.types'
import { TCard } from '@/types/card'
import { TQuestionsType } from '@/types/training'
import { Button, Input, InputNumber, Radio } from 'antd'
import React, { useEffect, useState } from 'react'
import {
  Card,
  CardWord,
  CardImage,
  CardTranslation,
} from '@/components/particles/card'

export default function Train() {
  const [settingLeastKnown, setSettingLeastKnown] = useState(15)
  const [settingRandomCards, setSettingRandomCards] = useState(5)
  const [settingQuestionsType, setSettingQuestionsType] =
    useState<TQuestionsType>('english')
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
            <SettingsLabel text="number of the least known words" />

            <InputNumber
              value={settingLeastKnown}
              onChange={e => setSettingLeastKnown(e as number)}
              size="large"
            />
          </div>

          <div className="flex flex-col gap-3">
            <SettingsLabel text="number of random cards" />

            <InputNumber
              value={settingRandomCards}
              onChange={e => setSettingRandomCards(e as number)}
              size="large"
            />
          </div>

          <div className="flex flex-col gap-3">
            <SettingsLabel text="what is shown as a question" />

            <Radio.Group
              onChange={e => setSettingQuestionsType(e.target.value)}
              value={settingQuestionsType}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
              }}
            >
              <Radio value="english">english</Radio>
              <Radio value="russian">russian and image</Radio>
              <Radio value="random">random</Radio>
            </Radio.Group>
          </div>

          <Button
            type="primary"
            size="large"
            loading={cardsSetIsLoading}
            onClick={async () => {
              setCardsSetIsLoading(true)
              const res = await api.trainingSet({
                cardsLeastKnown: settingLeastKnown,
                randomCards: settingRandomCards,
              })
              setCards(res)
              setCardsSetIsLoading(false)
              setIsSettingsDone(true)
            }}
          >
            Start training
          </Button>
        </div>
      )}

      {isSettingsDone && !isTrainingDone && (
        <div className="flex flex-col gap-5">
          <p className="text-app-info font-bold">{`${
            currentCardIndex + 1
          } card of ${cards?.length}`}</p>
          <TrainingCard
            card={cards?.[currentCardIndex]}
            currentCardIndex={currentCardIndex}
            settingQuestionsType={settingQuestionsType}
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
  settingQuestionsType: TQuestionsType
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
  settingQuestionsType: TQuestionsType
}) {
  switch (settingQuestionsType) {
    case 'english':
      return <QuestionEnglish card={card} />
    case 'russian':
      return <QuestionRussian card={card} />
    case 'random':
      const isEnglish = Math.random() > 0.5
      return isEnglish ? (
        <QuestionEnglish card={card} />
      ) : (
        <QuestionRussian card={card} />
      )
  }
}

function QuestionEnglish({ card }: { card: TCard }) {
  return <CardWord card={card} />
}

function QuestionRussian({ card }: { card: TCard }) {
  return (
    <>
      <CardImage card={card} />
      <CardTranslation card={card} />
    </>
  )
}
