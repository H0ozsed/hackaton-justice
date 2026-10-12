import { LOSS_KIND_LABELS, type ConflictType, type Question } from '@/shared/simulation'

import { getChosenConflictType } from './conflict-type'
import { FOLLOW_UP_STEP_ID } from './follow-up'
import { FREQUENCY_OPTIONS, IMPACT_OPTIONS, TIME_UNIT_OPTIONS } from './loss-frequency'
import { LOSS_FREQUENCY_STEP_ID } from './loss-frequency-step'
import { OPENNESS_STEP_ID, OTHER_PARTY_OPENNESS_OPTIONS, USER_OPENNESS_OPTIONS } from './openness'
import type { SimulationAnswers } from './types'

// What the person answered, written for the result screen: one { label, value } per answer, in the
// order of the steps. Pure: it only reads the answers and the content (labels of the chosen
// conflict type, of its questions and of the options).

export type AnswerLine = { label: string; value: string }

const numberFormat = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 2 })

const labelOf = (options: readonly { value: string; label: string }[], value: unknown) =>
  options.find((option) => option.value === value)?.label ?? String(value)

// Singular below 2, as in French: "1,5 heure", "2 heures".
const timeUnitLabel = (unit: unknown, amount: number) => {
  const plural = Math.abs(amount) >= 2
  if (unit === 'hours') return plural ? 'heures' : 'heure'
  if (unit === 'days') return plural ? 'jours' : 'jour'
  return labelOf(TIME_UNIT_OPTIONS, unit).toLowerCase()
}

function formatFollowUp(question: Question, answer: unknown): string | undefined {
  switch (question.kind) {
    case 'choice': {
      const values = Array.isArray(answer) ? answer : [answer]
      const labels = values.map((value) => labelOf(question.options, value))
      return labels.length > 0 ? labels.join(', ') : undefined
    }
    case 'number':
      return typeof answer === 'number'
        ? [numberFormat.format(answer), question.unit].filter(Boolean).join(' ')
        : undefined
    case 'yesNo':
      return answer === 'yes' ? 'Oui' : answer === 'no' ? 'Non' : undefined
  }
}

export function summarizeAnswers(
  answers: SimulationAnswers,
  conflictTypes: readonly ConflictType[],
): AnswerLine[] {
  const lines: AnswerLine[] = []
  const add = (label: string, value: string | undefined) => {
    if (value !== undefined && value !== '') lines.push({ label, value })
  }

  // Conflict type and its follow-up questions.
  const conflictType = getChosenConflictType(answers, conflictTypes)
  if (conflictType) {
    add('Type de conflit', conflictType.label)
    const followUp = answers[FOLLOW_UP_STEP_ID]
    for (const question of conflictType.followUpQuestions) {
      const answer = followUp?.[question.id]
      if (answer !== undefined) add(question.label, formatFollowUp(question, answer))
    }
  }

  // Losses: only what was asked, that is the kinds the conflict type declares.
  const losses = answers[LOSS_FREQUENCY_STEP_ID]
  if (losses) {
    for (const kind of conflictType?.lossKinds ?? []) {
      const label = LOSS_KIND_LABELS[kind]
      if (kind === 'money' && typeof losses.money === 'number') {
        add(label, `${numberFormat.format(losses.money)} €`)
      } else if (kind === 'time' && typeof losses.time === 'number') {
        add(
          label,
          `${numberFormat.format(losses.time)} ${timeUnitLabel(losses.timeUnit, losses.time)}`,
        )
      } else if (kind === 'health' || kind === 'relationship') {
        const level = losses[kind]
        if (level !== undefined) add(label, labelOf(IMPACT_OPTIONS, level))
      }
    }
    if (losses.frequency !== undefined) {
      add('Fréquence du conflit', labelOf(FREQUENCY_OPTIONS, losses.frequency))
    }
  }

  // Openness to discussion.
  const openness = answers[OPENNESS_STEP_ID]
  if (openness?.userOpenness !== undefined) {
    add(
      'Prêt(e) à discuter avec l’autre partie',
      labelOf(USER_OPENNESS_OPTIONS, openness.userOpenness),
    )
  }
  if (openness?.otherPartyOpenness !== undefined) {
    add(
      'L’autre partie serait prête à discuter',
      labelOf(OTHER_PARTY_OPENNESS_OPTIONS, openness.otherPartyOpenness),
    )
  }

  return lines
}
