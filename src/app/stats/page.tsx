'use client'

import { StatsComponent } from '@/components/parts/stats'

export default function Stats() {

  return <StatsComponent display={{
    correct_answers: true,
    database_size: true,
    images_size: true,
    total_cards: true,
    vocabulary: true,
    generation_log: true
  }} />
}