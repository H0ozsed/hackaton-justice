import { render, screen, waitFor, within } from '@testing-library/react'
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
  { type: 'sources', sources: [{ title: 'Médiation', url: '/apprendre/lexique#mediation' }] },
  { type: 'token', text: 'La médiation est ' },
  { type: 'token', text: 'une démarche amiable.' },
  { type: 'done', suggestions: ['La médiation est-elle payante ?'] },
]

let fetchMock: ReturnType<typeof vi.fn>

beforeEach(() => {
  sessionStorage.clear()
  fetchMock = vi.fn(async () => ndjson(ANSWER))
  vi.stubGlobal('fetch', fetchMock)
})

afterEach(() => vi.unstubAllGlobals())

async function openIris() {
  const user = userEvent.setup()
  render(<IrisWidget />)
  await user.click(screen.getByRole('button', { name: 'Poser une question à IRIS' }))
  return user
}

async function ask(user: ReturnType<typeof userEvent.setup>, question: string) {
  await user.type(screen.getByLabelText('Votre question'), question)
  await user.keyboard('{Enter}')
}

describe('IrisWidget', () => {
  it('opens a labelled panel, moves the focus into it and closes with Escape', async () => {
    const user = await openIris()
    const launcher = screen.getByRole('button', { name: 'Fermer IRIS', expanded: true })
    expect(screen.getByRole('dialog', { name: 'IRIS' })).toBeVisible()
    expect(screen.getByLabelText('Votre question')).toHaveFocus()

    await user.keyboard('{Escape}')
    expect(screen.queryByRole('dialog')).toBeNull()
    expect(launcher).toHaveFocus()
    expect(launcher).toHaveAttribute('aria-expanded', 'false')
  })

  it('greets, reminds it is not legal advice and suggests questions', async () => {
    await openIris()
    const panel = screen.getByRole('dialog')
    expect(within(panel).getByText(IRIS.greeting)).toBeInTheDocument()
    expect(within(panel).getByText(IRIS.notice)).toBeInTheDocument()
    for (const question of starterQuestions()) {
      expect(within(panel).getByRole('button', { name: question })).toBeInTheDocument()
    }
  })

  it('shows the streamed answer with its sources and follow-up questions', async () => {
    const user = await openIris()
    await ask(user, 'C’est quoi la médiation ?')

    const conversation = await screen.findByRole('list', { name: 'Conversation avec IRIS' })
    // The glossary term adds "(voir la définition)" for screen readers.
    await waitFor(() => expect(conversation).toHaveTextContent(/est une démarche amiable\./))
    expect(within(conversation).getByRole('link', { name: 'Médiation' })).toHaveAttribute(
      'href',
      '/apprendre/lexique#mediation',
    )
    expect(screen.getByRole('button', { name: 'La médiation est-elle payante ?' })).toBeEnabled()
    expect(screen.getByRole('status')).toHaveTextContent('La médiation est une démarche amiable.')

    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual({
      question: 'C’est quoi la médiation ?',
      history: [],
    })
  })

  it('makes a glossary term of the answer open its definition', async () => {
    const user = await openIris()
    await ask(user, 'C’est quoi la médiation ?')
    expect(
      await screen.findByRole('button', { name: /médiation \(voir la définition\)/i }),
    ).toBeInTheDocument()
  })

  it('sends the previous exchange with a follow-up question', async () => {
    const user = await openIris()
    await ask(user, 'C’est quoi la médiation ?')
    await screen.findByText('Médiation')
    await user.click(screen.getByRole('button', { name: 'La médiation est-elle payante ?' }))

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2))
    expect(JSON.parse(fetchMock.mock.calls[1][1].body)).toEqual({
      question: 'La médiation est-elle payante ?',
      history: [
        { role: 'user', content: 'C’est quoi la médiation ?' },
        { role: 'assistant', content: 'La médiation est une démarche amiable.' },
      ],
    })
  })

  it('shows the fixed answer when the site has no information', async () => {
    fetchMock.mockResolvedValueOnce(
      ndjson([{ type: 'no-answer', text: IRIS.noAnswer, suggestions: [] }]),
    )
    const user = await openIris()
    await ask(user, 'Quelle est la capitale du Pérou ?')
    expect(await screen.findByText(IRIS.noAnswer)).toBeInTheDocument()
  })

  it('says IRIS is unavailable and points to the FAQ when the server fails', async () => {
    fetchMock.mockRejectedValueOnce(new TypeError('fetch failed'))
    const user = await openIris()
    await ask(user, 'Bonjour')
    const conversation = screen.getByRole('list', { name: 'Conversation avec IRIS' })
    expect(await within(conversation).findByText(IRIS_ERRORS.unavailable)).toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent(IRIS_ERRORS.unavailable)
    expect(screen.getByRole('link', { name: 'Voir les questions fréquentes' })).toHaveAttribute(
      'href',
      '/apprendre#questions-frequentes',
    )
  })

  it('keeps the conversation in this tab only, and forgets it on "Nouvelle conversation"', async () => {
    const user = await openIris()
    await ask(user, 'C’est quoi la médiation ?')
    await screen.findByText('Médiation')
    expect(sessionStorage.getItem(STORAGE_KEY)).toContain('C’est quoi la médiation ?')

    await user.click(screen.getByRole('button', { name: 'Nouvelle conversation' }))
    expect(screen.queryByText('C’est quoi la médiation ?')).toBeNull()
    await waitFor(() => expect(sessionStorage.getItem(STORAGE_KEY)).toBeNull())
  })

  it('does not send an empty question', async () => {
    const user = await openIris()
    expect(screen.getByRole('button', { name: 'Envoyer' })).toBeDisabled()
    await user.keyboard('{Enter}')
    expect(fetchMock).not.toHaveBeenCalled()
  })
})
