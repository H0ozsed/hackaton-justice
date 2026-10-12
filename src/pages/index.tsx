import { Hero } from '@/components/home/hero'
import { JourneyCards } from '@/components/home/journey-cards'
import { PageTitle } from '@/components/layout/page-title'

export default function HomePage() {
  return (
    <>
      <PageTitle />
      <Hero />
      <JourneyCards />
    </>
  )
}
