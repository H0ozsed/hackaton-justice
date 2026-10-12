import { z } from 'zod'

// Contract between the IRIS widget and POST /api/chatbot. The API validates its
// input with chatRequestSchema; the widget validates each streamed event with
// chatStreamEventSchema.

/** Previous messages sent with a question (4 exchanges): enough for follow-ups. */
export const MAX_HISTORY = 8
export const MAX_QUESTION_LENGTH = 500

export const chatMessageSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string().trim().min(1).max(4000),
})

export const chatRequestSchema = z.object({
  question: z.string().trim().min(1).max(MAX_QUESTION_LENGTH),
  history: z.array(chatMessageSchema).max(MAX_HISTORY).default([]),
})

export const chatSourceSchema = z.object({
  title: z.string().min(1),
  /** Page of the site, always internal. */
  url: z.string().startsWith('/'),
})

export const chatErrorCodeSchema = z.enum(['unavailable', 'invalid', 'rate-limited'])

/** Progress of an answer, shown live in the widget. */
export const chatStepSchema = z.enum(['search', 'read', 'think', 'write'])

/**
 * One NDJSON line of the /api/chatbot answer: "status" lines while IRIS works, then
 * exactly one final line ("answer", "no-answer" or "error").
 */
export const chatStreamEventSchema = z.discriminatedUnion('type', [
  /** search: looking in the site · read: `count` extracts kept · think/write: the model works. */
  z.object({
    type: z.literal('status'),
    step: chatStepSchema,
    count: z.number().int().nonnegative().optional(),
  }),
  /**
   * The answer, cleaned of any model reasoning, with the pages it comes from (added
   * by the code, never by the model) and follow-up questions.
   */
  z.object({
    type: z.literal('answer'),
    text: z.string().min(1),
    sources: z.array(chatSourceSchema),
    suggestions: z.array(z.string()),
  }),
  /** Nothing relevant on the site: fixed answer, no sources. */
  z.object({ type: z.literal('no-answer'), text: z.string(), suggestions: z.array(z.string()) }),
  z.object({ type: z.literal('error'), code: chatErrorCodeSchema }),
])

export type ChatMessage = z.output<typeof chatMessageSchema>
export type ChatRequest = z.output<typeof chatRequestSchema>
export type ChatRequestInput = z.input<typeof chatRequestSchema>
export type ChatSource = z.output<typeof chatSourceSchema>
export type ChatErrorCode = z.output<typeof chatErrorCodeSchema>
export type ChatStep = z.output<typeof chatStepSchema>
export type ChatStreamEvent = z.output<typeof chatStreamEventSchema>
