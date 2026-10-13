import type { ReactNode } from 'react'

// Shared by the regulatory pages linked from the footer (legal notice, personal data, cookies,
// accessibility statement): long text with headings, lists, tables and links.

export function LegalArticle({ children }: { children: ReactNode }) {
  return (
    <article className="max-w-3xl space-y-8 [&_a]:text-primary [&_a]:underline [&_a]:underline-offset-4 [&_h2]:text-2xl [&_h2]:font-bold [&_h3]:text-lg [&_h3]:font-semibold [&_section]:space-y-3 [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-6">
      {children}
    </article>
  )
}

/** Name / value list (publisher, host...): a <dl>, read in order by screen readers. */
export function InfoList({ items }: { items: [term: string, value: ReactNode][] }) {
  return (
    <dl className="grid gap-x-6 gap-y-1 sm:grid-cols-[max-content_1fr]">
      {items.map(([term, value]) => (
        <div key={term} className="contents">
          <dt className="font-semibold">{term}</dt>
          <dd className="mb-2 sm:mb-0">{value}</dd>
        </div>
      ))}
    </dl>
  )
}
