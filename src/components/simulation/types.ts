import type { ComponentType } from 'react'
import type { FieldValues } from 'react-hook-form'
import type { z } from 'zod'

// Values of one step, as its zod schema outputs them once validated.
export type StepValues = FieldValues

// Validated answers, keyed by step id (in memory only, never persisted).
export type SimulationAnswers = Record<string, StepValues | undefined>

// Answers of the ACTIVE steps only: this is what the result screen receives.
export type SimulationResult = Record<string, StepValues>

export type SimulationStep = {
  /** Unique, stable identifier of the step: key of its answers. */
  id: string
  /** Step title, rendered as an h2 (the h1 belongs to the page). */
  title: string
  /** Optional help text shown under the title. */
  description?: string
  /** zod schema of the step fields. One schema per step: it validates before moving on. */
  schema: z.ZodType<StepValues, StepValues>
  /**
   * Should the step be asked? Absent = always active.
   * Receives the answers of the ACTIVE steps that come before it (never its own, nor those of an
   * inactive step). While the previous step is being filled in, those values are raw, not yet
   * validated: read them defensively (`answers.x?.y === 'yes'`).
   */
  isActive?: (answers: SimulationAnswers) => boolean
  /** Step fields. They read the form with react-hook-form's `useFormContext()`. */
  Fields: ComponentType
}

// Contract of the result screen, provided by the page (the final result belongs to #16).
export type ResultViewProps = {
  result: SimulationResult
  onRestart: () => void
}
