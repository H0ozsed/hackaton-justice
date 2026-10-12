import { Hero } from '@/components/home/hero'
import { JourneyCards } from '@/components/home/journey-cards'
import { PageTitle } from '@/components/layout/page-title'
import { PracticalInfoSection } from '@/components/practical-info/practical-info'

// Home page (docs/PARCOURS_UTILISATEURS.md). FAQ comes with #7; the chatbot is
// not decided yet.
export default function HomePage() {
  return (
    <>
      <PageTitle />
      <Hero />
      <JourneyCards />
      <PracticalInfoSection />
    </>
  )
}
