import { FaqSection } from '@/components/faq/faq-section'
import { Hero } from '@/components/home/hero'
import { JourneyCards } from '@/components/home/journey-cards'
import { PageTitle } from '@/components/layout/page-title'
import { PracticalInfoSection } from '@/components/practical-info/practical-info'

// Home page (docs/PARCOURS_UTILISATEURS.md). The chatbot is not decided yet.
export default function HomePage() {
  return (
    <>
      <PageTitle />
      <Hero />
      <JourneyCards />
      <PracticalInfoSection />
      <FaqSection page="home" className="mt-12" />
    </>
  )
}
