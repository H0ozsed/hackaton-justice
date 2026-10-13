import { keyFigures, type KeyFigure } from '@/shared/amicable'

/** Key figures about amicable settlement, each with its source. */
export function KeyFigures({ figures = keyFigures.all }: { figures?: readonly KeyFigure[] }) {
  const sources = [...new Map(figures.map((f) => [f.source.href, f.source])).values()]
  return (
    <div>
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {figures.map((figure) => (
          <li key={figure.slug} className="border-l-4 border-france-blue bg-france-blue-4 p-4">
            <p className="text-3xl font-bold text-france-blue">{figure.value}</p>
            <p className="mt-1">{figure.label}</p>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-sm text-muted-foreground">
        Sources : {sources.map((s) => s.label).join(' ; ')}.
      </p>
    </div>
  )
}
