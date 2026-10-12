import { useId } from 'react'

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  type HeadingLevel,
} from '@/components/ui/accordion'
import { cn } from '@/lib/utils'
import { getFaqForPage, type FaqPage } from '@/shared/faq'

type FaqSectionProps = {
  /** Which page the FAQ is on: only the questions tagged for it are shown. */
  page: FaqPage
  /** Section heading (site content: French). */
  title?: string
  /** Level of the section heading; questions are one level below. Match the page outline. */
  headingLevel?: Exclude<HeadingLevel, 6>
  className?: string
}

/**
 * FAQ as an accordion (#7). Used on the home page (#11) and on /apprendre (#23).
 * Several questions can be open at once. Renders nothing when the page has no question.
 */
export function FaqSection({
  page,
  title = 'Questions fréquentes',
  headingLevel = 2,
  className,
}: FaqSectionProps) {
  const headingId = useId()
  const entries = getFaqForPage(page)
  if (entries.length === 0) return null

  const Heading = `h${headingLevel}` as const
  const questionLevel = (headingLevel + 1) as HeadingLevel

  return (
    <section aria-labelledby={headingId} className={cn('space-y-4', className)}>
      <Heading id={headingId} className="text-2xl font-bold">
        {title}
      </Heading>
      <Accordion type="multiple" className="border-y">
        {entries.map((entry) => (
          <AccordionItem key={entry.slug} value={entry.slug}>
            <AccordionTrigger level={questionLevel} className="py-4 text-base">
              {entry.question}
            </AccordionTrigger>
            <AccordionContent className="text-base">
              {/* A blank line in the content starts a new paragraph. */}
              {entry.answer.split(/\n\s*\n/).map((paragraph, i) => (
                <p key={i}>{paragraph}</p>
              ))}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  )
}
