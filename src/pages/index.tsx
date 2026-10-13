import { IrisWidget } from '@/components/chatbot/iris-widget'
import { FaqSection } from '@/components/faq/faq-section'
import { AboutSection } from '@/components/home/about-section'
import { AmicableExplainer } from '@/components/home/amicable-explainer'
import { Hero } from '@/components/home/hero'
import { Orientation } from '@/components/home/orientation'
import { PageTitle } from '@/components/layout/page-title'
import { PracticalInfoSection } from '@/components/practical-info/practical-info'
import { about } from '@/shared/home'

// Home page (docs/PARCOURS_UTILISATEURS.md): explain first, then orient (#127), with the
// IRIS chatbot. « Par où commencer ? » is the entry to the 3 journeys.
export default function HomePage() {
  return (
    <>
      <PageTitle description={about.purpose} />
      <Hero />
      <AmicableExplainer />
      <Orientation />
      <AboutSection />
      <PracticalInfoSection />
      <FaqSection page="home" className="mt-12" />
      <IrisWidget />
    </>
  )
}
