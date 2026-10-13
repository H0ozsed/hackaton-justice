import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { guides, type Guide } from '@/shared/amicable'

import { SourceLink } from './source-link'

/** Step-by-step guides, one per amicable route, as an accordion (h3 triggers under an h2). */
export function GuideList({ entries = guides.all }: { entries?: readonly Guide[] }) {
  return (
    <Accordion type="multiple" className="border-y">
      {entries.map((guide) => (
        <AccordionItem key={guide.slug} value={guide.slug}>
          <AccordionTrigger level={3} className="py-4 text-lg">
            {guide.title}
          </AccordionTrigger>
          <AccordionContent className="space-y-4 text-base">
            <p className="font-medium">{guide.when}</p>
            <ol className="space-y-3">
              {guide.steps.map((step, i) => (
                <li key={step.title} className="flex gap-3">
                  <span
                    aria-hidden
                    className="flex size-8 shrink-0 items-center justify-center rounded-full bg-france-blue font-bold text-white"
                  >
                    {i + 1}
                  </span>
                  <div>
                    <p className="font-bold">{step.title}</p>
                    <p>{step.text}</p>
                  </div>
                </li>
              ))}
            </ol>
            {guide.good.length > 0 && (
              <div className="rounded-md bg-secondary p-3">
                <p className="font-bold text-secondary-foreground">Bon à savoir</p>
                <ul className="mt-1 list-disc space-y-1 pl-5">
                  {guide.good.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            )}
            <p className="text-sm">
              Source{guide.sources.length > 1 ? 's' : ''} :{' '}
              {guide.sources.map((source, i) => (
                <span key={source.href}>
                  {i > 0 && ' ; '}
                  <SourceLink source={source} />
                </span>
              ))}
            </p>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  )
}
