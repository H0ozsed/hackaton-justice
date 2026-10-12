import { GlossaryList } from '@/components/glossary/glossary-list'
import { PageTitle } from '@/components/layout/page-title'

export default function GlossaryPage() {
  return (
    <>
      <PageTitle title="Lexique" />
      <h1 className="text-3xl font-bold">Lexique</h1>
      <p className="mt-4 mb-8 text-muted-foreground">Les mots du droit expliqués simplement.</p>
      <GlossaryList />
    </>
  )
}
