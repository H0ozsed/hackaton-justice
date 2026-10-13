import { act, render, screen, within } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

import { scenarioSchema } from '@/shared/role-play'

import { saveScore } from './progress'
import { ScenarioList } from './scenario-list'

const make = (slug: string, level: number, perspective: string, title: string) =>
  scenarioSchema.parse({
    slug,
    title,
    summary: `Résumé ${title}.`,
    level,
    perspective,
    intro: 'Intro.',
    characters: [{ id: 'moi', name: 'Moi', role: 'Vous', avatar: 'player' }],
    startSceneId: 'fin',
    scenes: [{ id: 'fin', lines: [{ text: 'Fin.' }], ending: { title: 'Fin' } }],
  })

const scenarios = [
  make('un', 1, 'complainant', 'Premier'),
  make('trois', 3, 'mediator', 'Troisième'),
  make('deux', 1, 'respondent', 'Deuxième'),
]

afterEach(() => window.localStorage.clear())

describe('ScenarioList', () => {
  it('groups the scenarios by level, in order', () => {
    render(<ScenarioList scenarios={scenarios} />)
    expect(screen.getAllByRole('heading', { level: 2 }).map((h) => h.textContent)).toEqual([
      'Niveau 1 : découvrir',
      'Niveau 3 : maîtriser',
    ])
    const level1 = screen.getByRole('region', { name: 'Niveau 1 : découvrir' })
    expect(
      within(level1)
        .getAllByRole('heading', { level: 3 })
        .map((h) => h.textContent),
    ).toEqual(['Premier', 'Deuxième'])
  })

  it('gives the perspective in words and an explicit link per scenario', () => {
    render(<ScenarioList scenarios={scenarios} />)
    expect(screen.getByText('On vous reproche le trouble')).toBeInTheDocument()
    expect(screen.getByText('Vous êtes le médiateur')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Jouer : Troisième' })).toHaveAttribute(
      'href',
      '/mise-en-situation/trois',
    )
  })

  it('shows the best score kept on this device', () => {
    render(<ScenarioList scenarios={scenarios} />)
    act(() => {
      saveScore('un', 50)
      saveScore('un', 80)
      saveScore('un', 60)
    })
    expect(screen.getByText('Terminé, meilleur score : 80 %')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Rejouer : Premier' })).toBeInTheDocument()
  })

  it('still works when the stored progress is unreadable', () => {
    window.localStorage.setItem('role-play-progress', '{oops')
    render(<ScenarioList scenarios={scenarios} />)
    expect(screen.getAllByRole('link', { name: /^Jouer : / })).toHaveLength(3)
  })
})
