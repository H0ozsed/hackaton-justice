import type { ConflictType, Question } from '@/shared/simulation'

import { getChosenConflictType } from './conflict-type'
import { FOLLOW_UP_STEP_ID } from './follow-up'
import type { SimulationAnswers } from './types'

// What the person answered, written for the result screen: one { label, value } per answer, in the
// order of the steps. Pure: it only reads the answers and the content (labels of the chosen
// conflict type, of its questions and of the options).

export type AnswerLine = { label: string; value: string }

const numberFormat = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 2 })

const labelOf = (options: readonly { value: string; label: string }[], value: unknown) =>
  options.find((option) => option.value === value)?.label ?? String(value)

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

  return lines
}
