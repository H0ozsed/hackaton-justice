import type { ScenarioInput } from './schema'

// EXAMPLE to be replaced by the content team (see src/shared/README.md).
// Field names in English, content in French (shown to users).
export const scenariosData: ScenarioInput[] = [
  {
    slug: 'exemple',
    title: 'EXEMPLE — Scénario factice',
    intro: 'EXEMPLE — à remplacer. Un voisin fait du bruit tous les soirs.',
    characters: [
      { id: 'vous', name: 'Vous', role: 'Locataire', avatar: 'player' },
      { id: 'voisin', name: 'M. Martin', role: 'Votre voisin', avatar: 'neighbor' },
    ],
    startSceneId: 'debut',
    scenes: [
      {
        id: 'debut',
        setting: 'EXEMPLE — Sur le palier',
        lines: [
          { text: 'EXEMPLE — Il est 23 h, la musique résonne.' },
          { speaker: 'voisin', text: 'EXEMPLE — Bonsoir !' },
        ],
        choices: [
          {
            id: 'parler',
            label: 'EXEMPLE — Lui en parler calmement',
            next: 'fin-accord',
            quality: 'good',
            feedback: 'EXEMPLE — Le dialogue est la première étape.',
          },
          {
            id: 'courrier',
            label: 'EXEMPLE — Envoyer une [[mise-en-demeure]]',
            next: 'fin-tension',
            quality: 'bad',
            feedback: 'EXEMPLE — Trop tôt : la relation se dégrade.',
            losses: { money: 10, relationship: 2 },
          },
        ],
      },
      {
        id: 'fin-accord',
        lines: [{ speaker: 'voisin', text: 'EXEMPLE — Je ferai attention.' }],
        ending: { title: 'EXEMPLE — Un accord trouvé' },
      },
      {
        id: 'fin-tension',
        lines: [{ speaker: 'voisin', text: 'EXEMPLE — Vous auriez pu me le dire !' }],
        ending: { title: 'EXEMPLE — Des relations tendues' },
      },
    ],
  },
]
