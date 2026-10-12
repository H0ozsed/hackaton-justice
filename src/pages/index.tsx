import { PageTitle } from '@/components/layout/page-title'

export default function HomePage() {
  return (
    <>
      <PageTitle />
      <h1 className="text-3xl font-bold">Comprendre et gérer votre conflit</h1>
      <p className="mt-4 text-muted-foreground">
        Choisissez un parcours : simuler votre situation, vous entraîner sur un cas concret ou
        apprendre les notions clés.
      </p>
    </>
  )
}
