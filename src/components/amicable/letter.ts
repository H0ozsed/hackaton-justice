import { z } from 'zod'

// Amicable letter (night work #80): the fields of the form and the text built from them. Pure
// functions, no React. Nothing is sent or stored: the letter is shown, copied or printed.

export const LETTER_TOPICS = {
  voisinage: 'Trouble de voisinage',
  consommation: 'Litige concernant ma commande ou ma prestation',
  logement: 'Litige concernant le logement loué',
  argent: 'Somme restant due',
  autre: 'Recherche d’une solution amiable',
} as const

export type LetterTopic = keyof typeof LETTER_TOPICS

const required = (label: string) => z.string().trim().min(1, `indiquez ${label}.`)

export const letterSchema = z.object({
  sender: required('votre nom'),
  recipient: required('le nom du destinataire'),
  topic: z.enum(Object.keys(LETTER_TOPICS) as [LetterTopic, ...LetterTopic[]], {
    error: 'choisissez l’objet du courrier.',
  }),
  facts: z
    .string()
    .trim()
    .min(20, 'décrivez les faits en quelques phrases (20 caractères au moins).'),
  request: z.string().trim().min(10, 'indiquez ce que vous demandez (10 caractères au moins).'),
  // Typed as text (inputmode numeric), turned into a number of days.
  delay: z
    .string()
    .trim()
    .regex(/^\d+$/, 'indiquez un délai en jours, en chiffres (exemple : 15).')
    .transform(Number)
    .pipe(
      z
        .number()
        .min(8, 'laissez au moins 8 jours pour répondre.')
        .max(60, 'indiquez un délai de 60 jours au plus.'),
    ),
  proposeConciliation: z.boolean(),
})

export type LetterInput = z.input<typeof letterSchema>
export type LetterValues = z.output<typeof letterSchema>

const dateFormat = new Intl.DateTimeFormat('fr-FR', { dateStyle: 'long' })

/** The letter, as plain text (paragraphs separated by a blank line). */
export function buildLetter(values: LetterValues, today: Date): string {
  const paragraphs = [
    `${values.sender}`,
    `Le ${dateFormat.format(today)}`,
    `À l’attention de ${values.recipient}`,
    `Objet : ${LETTER_TOPICS[values.topic]}`,
    'Madame, Monsieur,',
    `Je me permets de vous écrire au sujet d’une situation qui me pose problème. ${ensurePeriod(values.facts)}`,
    `Je souhaite que nous trouvions ensemble une solution. ${ensurePeriod(values.request)} Je vous remercie de me répondre dans un délai de ${values.delay} jours à compter de la réception de ce courrier.`,
    values.proposeConciliation
      ? 'Si nous ne parvenons pas à nous entendre directement, je vous propose de rencontrer un conciliateur de justice. Ce rendez-vous est gratuit et nous permettrait de trouver un accord avec l’aide d’une personne neutre.'
      : undefined,
    'Je reste à votre disposition pour en parler et vous prie d’agréer, Madame, Monsieur, mes salutations distinguées.',
    values.sender,
  ]
  return paragraphs.filter((p) => p !== undefined).join('\n\n')
}

function ensurePeriod(text: string) {
  const trimmed = text.trim()
  return /[.!?…]$/.test(trimmed) ? trimmed : `${trimmed}.`
}
