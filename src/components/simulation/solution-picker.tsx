import { useId, useState } from 'react'

import { SolutionDetails } from '@/components/solutions/solution-details'

import type { SolutionGroup } from './solutions'

// The person chooses their solution (coaching feedback of 13 Oct 2026): the solutions meant for
// their conflict, grouped by family, each with its « C'est pour vous si… ». Nothing is chosen for
// them. Once a solution is picked, its details (law first) show right after the list.
export function SolutionPicker({ groups }: { groups: SolutionGroup[] }) {
  const id = useId()
  const [chosen, setChosen] = useState<string>()
  const channel = groups.flatMap((group) => group.channels).find((c) => c.slug === chosen)

  return (
    <div className="space-y-6">
      <fieldset role="radiogroup" className="space-y-4">
        <legend className="mb-2 font-medium">Quelle solution correspond à votre situation ?</legend>
        <p className="text-sm text-muted-foreground">
          Lisez « C’est pour vous si… » et choisissez : le détail s’affiche juste après la liste.
        </p>
        {groups.map((group) => {
          const groupId = `${id}-${group.family}`
          return (
            <div key={group.family} role="group" aria-labelledby={groupId} className="space-y-2">
              <p id={groupId} className="font-bold">
                {group.label}
              </p>
              {group.channels.map((option) => {
                const optionId = `${id}-${option.slug}`
                const descriptionId = `${optionId}-description`
                return (
                  <div
                    key={option.slug}
                    className="flex items-start gap-3 rounded-md border px-3 has-checked:border-primary has-checked:bg-secondary"
                  >
                    <input
                      id={optionId}
                      type="radio"
                      name={`${id}-solution`}
                      value={option.slug}
                      checked={chosen === option.slug}
                      onChange={() => setChosen(option.slug)}
                      aria-describedby={descriptionId}
                      className="mt-2.5 size-6 shrink-0 accent-primary"
                    />
                    <div className="flex-1 py-3">
                      <label htmlFor={optionId} className="block cursor-pointer font-medium">
                        {option.name}
                      </label>
                      <p id={descriptionId} className="text-sm text-muted-foreground">
                        C’est pour vous si : {option.forYouIf}{' '}
                        {option.cost ?? (option.free ? 'Gratuit.' : 'Peut avoir un coût.')}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          )
        })}
      </fieldset>

      {channel && (
        <section
          aria-labelledby={`${id}-chosen`}
          className="space-y-4 rounded-lg border-2 border-primary p-6"
        >
          <p className="text-sm font-medium text-muted-foreground">La solution choisie</p>
          <h3 id={`${id}-chosen`} className="text-xl font-bold">
            {channel.name}
          </h3>
          <p className="flex flex-wrap gap-2 text-sm">
            <span className="rounded-md border px-2 py-1">
              {channel.amicable ? 'Voie amiable' : 'Voie judiciaire'}
            </span>
          </p>
          <SolutionDetails channel={channel} showForYouIf={false} />
        </section>
      )}
    </div>
  )
}
