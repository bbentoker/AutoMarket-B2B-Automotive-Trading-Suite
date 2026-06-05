import { AutoMarketHero } from "@/components/automarket-hero"
import { FeaturesSection } from "@/components/features-section"
import { CustomerLogosSection } from "@/components/customer-logos-section"
import { GettingStartedSection } from "@/components/getting-started-section"
import { SiteFooter } from "@/components/site-footer"

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <AutoMarketHero />
      {/* <main className="flex-1">
        <FeaturesSection />
        <CustomerLogosSection />
        
        <GettingStartedSection />
      </main>
      <SiteFooter /> */}
    </div>
  )
}
