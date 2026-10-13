import type { GetStaticPaths, GetStaticProps } from 'next'
import Link from 'next/link'

import { PageTitle } from '@/components/layout/page-title'
import { RolePlayGame } from '@/components/role-play/role-play-game'
import { LEVEL_LABELS, PERSPECTIVE_LABELS, scenarios } from '@/shared/role-play'

type Props = { slug: string }

// One role-play scenario. The content is imported directly (static data, src/shared); only
// the slug goes through the props.
export default function ScenarioPage({ slug }: Props) {
  const scenario = scenarios.get(slug)
  return (
    <>
      <PageTitle title={`${scenario.title} | Mise en situation`} />
      <p>
        <Link href="/mise-en-situation" className="text-primary underline underline-offset-4">
          Toutes les mises en situation
        </Link>
      </p>
      <h1 className="mt-4 text-3xl font-bold">Mise en situation</h1>
      <p className="mt-2 text-muted-foreground">
        {LEVEL_LABELS[scenario.level]}. {PERSPECTIVE_LABELS[scenario.perspective]}.
      </p>
      <RolePlayGame scenario={scenario} />
    </>
  )
}

export const getStaticPaths: GetStaticPaths = () => ({
  paths: scenarios.all.map(({ slug }) => ({ params: { slug } })),
  fallback: false,
})

export const getStaticProps: GetStaticProps<Props> = ({ params }) => ({
  props: { slug: String(params?.slug) },
})
