import type { Question } from '@/shared/simulation'

import { CheckboxGroupField, NumberField, RadioGroupField } from './form-fields'

// Fields of the follow-up questions step (#13): each question of the chosen conflict type is
// rendered from its config, according to its `kind` (single or multiple choice, number, yes/no).
export function FollowUpFields({ questions }: { questions: readonly Question[] }) {
  return (
    <div className="space-y-8">
      {questions.map((question) => (
        <QuestionField key={question.id} question={question} />
      ))}
    </div>
  )
}

const YES_NO_OPTIONS = [
  { value: 'yes', label: 'Oui' },
  { value: 'no', label: 'Non' },
]

// Help text of the question, then what the person needs to know to type the number.
function numberHint(question: Extract<Question, { kind: 'number' }>) {
  const parts = [
    question.help,
    question.unit && `Unité : ${question.unit}.`,
    question.min !== undefined && `Valeur minimale : ${question.min}.`,
    question.max !== undefined && `Valeur maximale : ${question.max}.`,
  ].filter(Boolean)
  return parts.length > 0 ? parts.join(' ') : undefined
}

function QuestionField({ question }: { question: Question }) {
  const common = { name: question.id, required: question.required }

  switch (question.kind) {
    case 'choice': {
      const group = {
        ...common,
        legend: question.label,
        hint: question.help,
        options: question.options,
      }
      return question.multiple ? <CheckboxGroupField {...group} /> : <RadioGroupField {...group} />
    }
    case 'number':
      return <NumberField {...common} label={question.label} hint={numberHint(question)} />
    case 'yesNo':
      return (
        <RadioGroupField
          {...common}
          legend={question.label}
          hint={question.help}
          options={YES_NO_OPTIONS}
        />
      )
  }
}
