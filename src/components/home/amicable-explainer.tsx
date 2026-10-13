import { RichText } from '@/components/role-play/rich-text'
import { explainer, type ExplainerCard } from '@/shared/home'

// « L'amiable en 1 minute » (#127): the essentials a first-time visitor needs before
// choosing a journey. Plain text and real headings: nothing is only in an animation.
export function AmicableExplainer({ cards = explainer.all }: { cards?: readonly ExplainerCard[] }) {
  return (
    <section
      id="amiable-en-1-minute"
      aria-labelledby="amiable-titre"
      className="mt-12 scroll-mt-24"
    >
      <h2 id="amiable-titre" className="text-2xl font-bold">
        L’amiable en 1 minute
      </h2>
      <p className="mt-2 text-muted-foreground">
        L’essentiel à savoir avant de choisir un parcours.
      </p>
      <ol className="mt-6 grid gap-6 md:grid-cols-2">
        {cards.map(({ slug, title, body }, i) => (
          <li key={slug} className="rounded-lg border-2 border-border bg-card p-6">
            <h3 className="flex items-baseline gap-3 text-xl font-bold">
              <span aria-hidden className="text-france-blue">
                {i + 1}.
              </span>
              {title}
            </h3>
            <p className="mt-2">
              <RichText text={body} />
            </p>
          </li>
        ))}
      </ol>
    </section>
  )
}
