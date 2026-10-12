import { Definition } from '@/components/glossary/definition'
import { glossary } from '@/shared/glossary'
import { parseRichText, plainText } from '@/shared/role-play'

/** Scenario text with its `[[slug]]` glossary terms rendered as <Definition>. */
export function RichText({ text }: { text: string }) {
  return parseRichText(text).map((segment, i) =>
    segment.kind === 'text' ? (
      segment.text
    ) : (
      <Definition key={i} slug={segment.slug}>
        {segment.text}
      </Definition>
    ),
  )
}

/** Scenario text without markup, glossary terms written as in the glossary. */
export function toPlainText(text: string) {
  return plainText(text, (slug) => glossary.get(slug).term)
}
