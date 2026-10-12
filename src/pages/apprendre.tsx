import Link from 'next/link'

import { PageTitle } from '@/components/layout/page-title'

export default function LearnPage() {
  return (
    <>
      <PageTitle title="Apprendre" />
      <h1 className="text-3xl font-bold">Apprendre</h1>
      <p className="mt-4 text-muted-foreground">
        Questionnaires, lexique et réponses aux questions fréquentes.
      </p>
      {/* Temporary entry point: the hub layout comes with #23. */}
      <p className="mt-6">
        <Link href="/apprendre/lexique" className="text-primary underline underline-offset-4">
          Consulter le lexique
        </Link>
      </p>
    </>
  )
}
