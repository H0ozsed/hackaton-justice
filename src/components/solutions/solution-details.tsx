import { ExternalLinkIcon } from 'lucide-react'

import type { Channel } from '@/shared/simulation'

// Everything the site knows about one solution (conciliator, mediator, the judge…), built from
// the law (coaching feedback of 13 Oct 2026: « écrire en priorité ce qui est écrit dans la loi »).
// A description list: no headings, so it fits under any heading level (result of « Ma
// situation ? », accordion of /apprendre).

const linkClassName =
  'font-medium break-words text-france-blue underline underline-offset-4 hover:decoration-2'

/** External link, said in the text for screen readers and shown by the icon (RGAA 13.2). */
function ExternalLink({ href, children }: { href: string; children: string }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={linkClassName}>
      {children}
      <span className="sr-only"> (nouvelle fenêtre)</span>
      <ExternalLinkIcon aria-hidden className="ml-1 inline size-4 align-[-0.125em]" />
    </a>
  )
}

function Item({ term, children }: { term: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <dt className="font-bold">{term}</dt>
      <dd>{children}</dd>
    </div>
  )
}

function LawBlock({ channel }: { channel: Channel }) {
  if (!channel.law) return null
  return (
    <div className="space-y-2 rounded-md border-l-4 border-france-blue bg-secondary p-3">
      <dt className="font-bold">Ce que dit la loi</dt>
      <dd className="space-y-2">
        <p>{channel.law.text}</p>
        <p className="text-sm">Textes :</p>
        <ul className="list-disc space-y-1 pl-5 text-sm">
          {channel.law.references.map((reference) => (
            <li key={reference}>{reference}</li>
          ))}
        </ul>
      </dd>
    </div>
  )
}

function Links({ channel }: { channel: Channel }) {
  if (!channel.contact && channel.sources.length === 0) return null
  return (
    <Item term="Pour aller plus loin">
      <ul className="space-y-1">
        {channel.contact?.url && (
          <li>
            <ExternalLink href={channel.contact.url}>{`Contact : ${channel.name}`}</ExternalLink>
          </li>
        )}
        {channel.contact?.phone && (
          <li>
            <a href={`tel:${channel.contact.phone.replace(/\s/g, '')}`} className={linkClassName}>
              {channel.contact.phone}
            </a>
          </li>
        )}
        {channel.sources.map((source) => (
          <li key={source.href + source.label}>
            <ExternalLink href={source.href}>{`Source : ${source.label}`}</ExternalLink>
          </li>
        ))}
      </ul>
    </Item>
  )
}

const costOf = (channel: Channel) =>
  channel.cost ?? (channel.free ? 'Gratuit' : 'Peut avoir un coût')

/**
 * - `full` (/apprendre): what the law says first, then everything the site knows.
 * - `card` (result of « J'ai un conflit ? »): the practical essentials first (who, how to reach,
 *   cost, value of the agreement), then what the law says in full; no list of disputes, the
 *   result already only shows the third parties of the person's conflict.
 */
export function SolutionDetails({
  channel,
  variant = 'full',
}: {
  channel: Channel
  variant?: 'full' | 'card'
}) {
  if (variant === 'card') {
    return (
      <dl className="space-y-4">
        <Item term="Qui c’est">{channel.description}</Item>
        {channel.access && <Item term="Comment le joindre">{channel.access}</Item>}
        <Item term="Coût">{costOf(channel)}</Item>
        {channel.agreement && <Item term="Valeur de l’accord">{channel.agreement}</Item>}
        <LawBlock channel={channel} />
        <Links channel={channel} />
      </dl>
    )
  }
  return (
    <dl className="space-y-4">
      <LawBlock channel={channel} />
      <Item term="En bref">{channel.description}</Item>
      <Item term="C’est pour vous si…">{channel.forYouIf}</Item>
      {channel.disputes.length > 0 && (
        <Item term="Litiges concernés">
          <ul className="list-disc space-y-1 pl-5">
            {channel.disputes.map((dispute) => (
              <li key={dispute}>{dispute}</li>
            ))}
          </ul>
        </Item>
      )}
      {channel.excluded.length > 0 && (
        <Item term="Ne traite pas">
          <ul className="list-disc space-y-1 pl-5">
            {channel.excluded.map((excluded) => (
              <li key={excluded}>{excluded}</li>
            ))}
          </ul>
        </Item>
      )}
      {channel.access && <Item term="Comment y accéder">{channel.access}</Item>}
      <Item term="Coût">{costOf(channel)}</Item>
      {channel.agreement && <Item term="Valeur de l’accord">{channel.agreement}</Item>}
      <Links channel={channel} />
    </dl>
  )
}
