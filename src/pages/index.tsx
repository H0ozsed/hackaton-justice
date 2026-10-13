import { IrisWidget } from '@/components/chatbot/iris-widget'
import { FaqSection } from '@/components/faq/faq-section'
import { AmicableTeaser } from '@/components/home/amicable-teaser'
import { Hero } from '@/components/home/hero'
import { JourneyCards } from '@/components/home/journey-cards'
import { PageTitle } from '@/components/layout/page-title'
import { PracticalInfoSection } from '@/components/practical-info/practical-info'

// Home page (docs/PARCOURS_UTILISATEURS.md), with the IRIS chatbot.
export default function HomePage() {
  return (
    <>
      <PageTitle />
      <Hero />
      <JourneyCards />
      <AmicableTeaser />
      <PracticalInfoSection />
      <FaqSection page="home" className="mt-12" />
      <IrisWidget />
    </>
  )
}
