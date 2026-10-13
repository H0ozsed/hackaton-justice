import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import {
  CHANNEL_FAMILY_LABELS,
  channels,
  type Channel,
  type ChannelFamily,
} from '@/shared/simulation'

import { SolutionDetails } from './solution-details'

// « Qui peut vous aider ? » on /apprendre: every kind of conciliator, mediator and other recourse
// the site knows, grouped by family, each with what the law says first. Same content as the
// solutions of « J’ai un conflit ? ».

const FAMILIES = Object.keys(CHANNEL_FAMILY_LABELS) as ChannelFamily[]

export function WhoCanHelp({
  entries = channels.all,
  headingLevel = 3,
}: {
  entries?: readonly Channel[]
  /** Level of the family headings; each third party is one level below. */
  headingLevel?: 3 | 4
}) {
  const FamilyHeading = `h${headingLevel}` as const
  return (
    <div className="space-y-8">
      {FAMILIES.map((family) => {
        const inFamily = entries.filter((channel) => channel.family === family)
        if (inFamily.length === 0) return null
        return (
          <div key={family} className="space-y-3">
            <FamilyHeading className="text-xl font-bold">
              {CHANNEL_FAMILY_LABELS[family]}
            </FamilyHeading>
            <Accordion type="multiple" className="border-y">
              {inFamily.map((channel) => (
                <AccordionItem key={channel.slug} value={channel.slug}>
                  <AccordionTrigger level={(headingLevel + 1) as 4 | 5} className="py-4 text-base">
                    {channel.name}
                  </AccordionTrigger>
                  <AccordionContent className="text-base">
                    <SolutionDetails channel={channel} />
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        )
      })}
    </div>
  )
}
