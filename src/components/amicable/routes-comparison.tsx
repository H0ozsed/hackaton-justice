import { routes, type Route } from '@/shared/amicable'

const CRITERIA: {
  key: keyof Pick<Route, 'helper' | 'cost' | 'decides' | 'duration' | 'outcome'>
  label: string
}[] = [
  { key: 'helper', label: 'Qui vous aide' },
  { key: 'cost', label: 'Coût' },
  { key: 'decides', label: 'Qui décide' },
  { key: 'duration', label: 'Durée' },
  { key: 'outcome', label: 'Ce que vaut l’issue' },
]

/**
 * The ways to settle a dispute, from talking to going to court, compared on the same criteria.
 * A real table on wide screens (headers on both axes, RGAA 5); the same content as one card per
 * way on narrow screens (no horizontal scrolling).
 */
export function RoutesComparison({ entries = routes.all }: { entries?: readonly Route[] }) {
  return (
    <div>
      {/* The scale: the further right, the less you decide. Words, not only the arrow. */}
      <p className="mb-4 flex flex-wrap items-center justify-between gap-2 text-sm font-medium">
        <span>Vous gardez la main</span>
        <span
          aria-hidden
          className="h-0.5 min-w-8 flex-1 bg-gradient-to-r from-france-blue to-marianne-red"
        />
        <span>Un juge décide pour vous</span>
      </p>

      <table className="hidden w-full table-fixed border-collapse text-left text-sm md:table">
        <caption className="sr-only">
          Comparaison des façons de régler un litige, de la discussion au juge
        </caption>
        <thead>
          <tr>
            <td className="w-32" />
            {entries.map((route) => (
              <th
                key={route.slug}
                scope="col"
                className={`border-b-4 p-2 align-bottom text-base ${route.amicable ? 'border-france-blue' : 'border-marianne-red'}`}
              >
                {route.name}
                <span className="block text-xs font-normal text-muted-foreground">
                  {route.amicable ? 'Voie amiable' : 'Voie judiciaire'}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {CRITERIA.map(({ key, label }) => (
            <tr key={key} className="border-b">
              <th scope="row" className="p-2 align-top font-bold">
                {label}
              </th>
              {entries.map((route) => (
                <td key={route.slug} className="p-2 align-top">
                  {route[key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      <ul className="grid gap-4 md:hidden">
        {entries.map((route) => (
          <li
            key={route.slug}
            className={`border-l-4 p-4 ${route.amicable ? 'border-france-blue' : 'border-marianne-red'} bg-card`}
          >
            <h3 className="text-lg font-bold">{route.name}</h3>
            <p className="text-sm text-muted-foreground">
              {route.amicable ? 'Voie amiable' : 'Voie judiciaire'}
            </p>
            <dl className="mt-2 space-y-1 text-sm">
              {CRITERIA.map(({ key, label }) => (
                <div key={key}>
                  <dt className="inline font-bold">{label} : </dt>
                  <dd className="inline">{route[key]}</dd>
                </div>
              ))}
            </dl>
          </li>
        ))}
      </ul>
    </div>
  )
}
