import { Button } from '@/components/ui/button'

// Introduction of « Ma situation ? » (#101): what the form does, how long it takes, and that
// nothing leaves the device, before the first question. The steps are a real sequence: an
// ordered list.
const STEPS = [
  'Le type de conflit que vous vivez, et quelques précisions.',
  'Ce qu’il vous coûte : argent, temps, bien-être, relations.',
  'Si vous êtes prêt(e) à en discuter, et l’autre partie aussi.',
  'Le bon interlocuteur pour vous, avec son coût et ce que vaut l’accord.',
] as const

export function SimulationIntro({ onStart }: { onStart: () => void }) {
  return (
    <section aria-labelledby="intro-titre" className="max-w-2xl space-y-6">
      <h2 id="intro-titre" className="text-2xl font-bold">
        Comment ça marche ?
      </h2>
      <ol className="list-decimal space-y-2 pl-6">
        {STEPS.map((step) => (
          <li key={step}>{step}</li>
        ))}
      </ol>
      <ul className="space-y-2 rounded-lg bg-secondary p-4 text-secondary-foreground">
        <li>Environ 3 minutes, 4 étapes au plus.</li>
        <li>Une estimation suffit : il n’y a pas de mauvaise réponse.</li>
        <li>Vos réponses restent sur votre appareil : rien n’est envoyé ni enregistré.</li>
        <li>
          Le résultat est une orientation indicative, qui ne remplace pas l’avis d’un professionnel
          du droit.
        </li>
      </ul>
      <Button type="button" size="lg" onClick={onStart}>
        Commencer
      </Button>
    </section>
  )
}
