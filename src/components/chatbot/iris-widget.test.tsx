import { act, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { IRIS, IRIS_ERRORS, starterQuestions, type ChatStreamEvent } from '@/shared/chatbot'

import { IrisWidget } from './iris-widget'
import { STORAGE_KEY } from './use-iris'

function ndjson(events: ChatStreamEvent[], status = 200) {
  return new Response(events.map((e) => JSON.stringify(e)).join('\n'), {
    status,
    headers: { 'Content-Type': 'application/x-ndjson' },
  })
}

const ANSWER: ChatStreamEvent[] = [
  { type: 'status', step: 'search' },
  { type: 'status', step: 'read', count: 2 },
  { type: 'status', step: 'write' },
  {
    type: 'answer',
    text: 'La médiation est **amiable** :\n- gratuite\n- rapide',
    sources: [{ title: 'Médiation', url: '/apprendre/lexique#mediation' }],
    suggestions: ['La médiation est-elle payante ?'],
  },
]

/** A response whose body stays open until `finish` is called: IRIS is still working. */
function pendingResponse(events: ChatStreamEvent[]) {
  const encoder = new TextEncoder()
  let controller!: ReadableStreamDefaultController<Uint8Array>
  const body = new ReadableStream<Uint8Array>({
    start(c) {
      controller = c
      for (const e of events) c.enqueue(encoder.encode(`${JSON.stringify(e)}\n`))
    },
  })
  return {
    response: new Response(body, { status: 200 }),
    finish: (event: ChatStreamEvent) => {
      controller.enqueue(encoder.encode(`${JSON.stringify(event)}\n`))
      controller.close()
    },
  }
}

let fetchMock: ReturnType<typeof vi.fn>

beforeEach(() => {
  sessionStorage.clear()
  fetchMock = vi.fn(async () => ndjson(ANSWER))
  vi.stubGlobal('fetch', fetchMock)
})

afterEach(() => vi.unstubAllGlobals())

async function openIris(page?: 'home' | 'learn') {
  const user = userEvent.setup()
  render(<IrisWidget page={page} />)
  await user.click(screen.getByRole('button', { name: 'Poser une question à IRIS' }))
  return user
}

async function ask(user: ReturnType<typeof userEvent.setup>, question: string) {
  await user.type(screen.getByLabelText('Votre question'), question)
  await user.keyboard('{Enter}')
}

const conversation = () => screen.getByRole('list', { name: 'Conversation avec IRIS' })

describe('IrisWidget', () => {
  it('opens a labelled panel, moves the focus into it and closes with Escape', async () => {
    const user = await openIris()
    const launcher = screen.getByRole('button', { name: 'Fermer IRIS', expanded: true })
    expect(screen.getByRole('dialog', { name: 'IRIS' })).toBeVisible()
    expect(screen.getByLabelText('Votre question')).toHaveFocus()

    await user.keyboard('{Escape}')
    expect(screen.queryByRole('dialog')).toBeNull()
    expect(launcher).toHaveFocus()
  })

  it('greets, reminds it is not legal advice and suggests questions of the page', async () => {
    await openIris('learn')
    const panel = screen.getByRole('dialog')
    expect(within(panel).getByText(IRIS.greeting)).toBeInTheDocument()
    expect(within(panel).getByText(IRIS.notice)).toBeInTheDocument()
    for (const question of starterQuestions('learn')) {
      expect(within(panel).getByRole('button', { name: question })).toBeInTheDocument()
    }
  })

  it('shows what IRIS is doing while it works, then announces the answer', async () => {
    const pending = pendingResponse([
      { type: 'status', step: 'search' },
      { type: 'status', step: 'read', count: 2 },
    ])
    fetchMock.mockResolvedValueOnce(pending.response)
    const user = await openIris()
    await ask(user, 'C’est quoi la médiation ?')

    expect(await within(conversation()).findByText('Lecture de 2 extraits du site…')).toBeVisible()
    expect(screen.getByRole('status')).toHaveTextContent('Lecture de 2 extraits du site…')

    act(() => pending.finish(ANSWER[3]))
    await within(conversation()).findByText('gratuite')
    expect(screen.getByRole('status')).toHaveTextContent('IRIS : La médiation est amiable')
  })

  it('formats the answer: bold, list, sources and follow-up questions', async () => {
    const user = await openIris()
    await ask(user, 'C’est quoi la médiation ?')

    const item = await within(conversation()).findByText('gratuite')
    expect(item.tagName).toBe('SPAN')
    expect(item.closest('ul')?.querySelectorAll('li')).toHaveLength(2)
    expect(within(conversation()).getByText('amiable').tagName).toBe('STRONG')
    expect(within(conversation()).getByRole('link', { name: 'Médiation' })).toHaveAttribute(
      'href',
      '/apprendre/lexique#mediation',
    )
    expect(screen.getByRole('button', { name: 'La médiation est-elle payante ?' })).toBeEnabled()
    expect(conversation().textContent).not.toMatch(/\*\*/)
  })

  it('makes a glossary term of the answer open its definition', async () => {
    const user = await openIris()
    await ask(user, 'C’est quoi la médiation ?')
    expect(
      await screen.findByRole('button', { name: /médiation \(voir la définition\)/i }),
    ).toBeInTheDocument()
  })

  it('stops an answer in progress and offers to try again', async () => {
    const pending = pendingResponse([{ type: 'status', step: 'write' }])
    fetchMock.mockResolvedValueOnce(pending.response)
    const user = await openIris()
    await ask(user, 'C’est quoi la médiation ?')

    await user.click(await screen.findByRole('button', { name: 'Arrêter la réponse' }))
    expect(within(conversation()).getByText('Réponse arrêtée.')).toBeInTheDocument()
    expect((fetchMock.mock.calls[0][1] as RequestInit).signal?.aborted).toBe(true)

    await user.click(screen.getByRole('button', { name: 'Réessayer' }))
    expect(await within(conversation()).findByText('gratuite')).toBeInTheDocument()
    expect(fetchMock).toHaveBeenCalledTimes(2)
    expect(within(conversation()).getAllByText('C’est quoi la médiation ?')).toHaveLength(1)
  })

  it('copies the answer as plain text', async () => {
    const user = await openIris()
    // userEvent.setup() installs its own clipboard: spy on it.
    const writeText = vi.spyOn(navigator.clipboard, 'writeText')
    await ask(user, 'C’est quoi la médiation ?')

    await user.click(await screen.findByRole('button', { name: 'Copier la réponse' }))
    expect(writeText).toHaveBeenCalledWith('La médiation est amiable :\n\n- gratuite\n- rapide')
    expect(screen.getByRole('button', { name: 'Copié la réponse' })).toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent('Réponse copiée.')
  })

  it('sends only completed exchanges with a follow-up question', async () => {
    const user = await openIris()
    await ask(user, 'C’est quoi la médiation ?')
    await within(conversation()).findByText('gratuite')
    await user.click(screen.getByRole('button', { name: 'La médiation est-elle payante ?' }))

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2))
    expect(JSON.parse(fetchMock.mock.calls[1][1].body).history).toEqual([
      { role: 'user', content: 'C’est quoi la médiation ?' },
      { role: 'assistant', content: 'La médiation est **amiable** :\n- gratuite\n- rapide' },
    ])
  })

  it('shows the fixed answer, without sources, when the site has no information', async () => {
    fetchMock.mockResolvedValueOnce(
      ndjson([{ type: 'no-answer', text: IRIS.noAnswer, suggestions: [] }]),
    )
    const user = await openIris()
    await ask(user, 'Quelle est la capitale du Pérou ?')
    expect(await within(conversation()).findByText(IRIS.noAnswer)).toBeInTheDocument()
    expect(within(conversation()).queryByText('Sources')).toBeNull()
    expect(within(conversation()).queryByRole('button', { name: 'Copier la réponse' })).toBeNull()
  })

  it('says IRIS is unavailable, points to the FAQ and offers to try again', async () => {
    fetchMock.mockRejectedValueOnce(new TypeError('fetch failed'))
    const user = await openIris()
    await ask(user, 'Bonjour')
    expect(await within(conversation()).findByText(IRIS_ERRORS.unavailable)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Voir les questions fréquentes' })).toHaveAttribute(
      'href',
      '/apprendre#questions-frequentes',
    )
    expect(screen.getByRole('button', { name: 'Réessayer' })).toBeInTheDocument()
  })

  it('keeps the conversation in this tab only, and forgets it on "Nouvelle conversation"', async () => {
    const user = await openIris()
    await ask(user, 'C’est quoi la médiation ?')
    await within(conversation()).findByText('gratuite')
    expect(sessionStorage.getItem(STORAGE_KEY)).toContain('C’est quoi la médiation ?')

    await user.click(screen.getByRole('button', { name: 'Nouvelle conversation' }))
    expect(screen.queryByText('C’est quoi la médiation ?')).toBeNull()
    await waitFor(() => expect(sessionStorage.getItem(STORAGE_KEY)).toBeNull())
  })

  it('counts the characters and does not send an empty question', async () => {
    const user = await openIris()
    const field = screen.getByLabelText('Votre question')
    expect(field).toHaveAccessibleDescription('0/500 caractères')
    expect(screen.getByRole('button', { name: 'Envoyer' })).toBeDisabled()
    await user.keyboard('{Enter}')
    expect(fetchMock).not.toHaveBeenCalled()

    await user.type(field, 'Bonjour')
    expect(field).toHaveAccessibleDescription('7/500 caractères')
  })
})
