import { Navbar } from "@/components/landing/navbar";
import { Hero } from "@/components/landing/hero";
import { InfoSection } from "@/components/landing/info-section";
import { BackedBy } from "@/components/landing/backed-by";
import { ChartsSection } from "@/components/landing/charts-section";
import { UseCases } from "@/components/landing/use-cases";
import { Footer } from "@/components/landing/footer";

export default function LandingPage() {
  return (
    <div className="flex flex-col bg-[#F5F5F5]">
      {/* First section (Navbar + Hero) wrapped in a h-screen flex flex-col overflow-hidden container */}
      <div className="h-screen flex flex-col overflow-hidden container mx-auto relative">
        <Navbar />
        <Hero />
      </div>

      {/* Info Section */}
      <InfoSection />

      {/* Backed By Section */}
      <BackedBy />

      {/* Charts Section */}
      <ChartsSection />

      {/* Use Cases Section */}
      <UseCases />

      {/* Footer */}
      <Footer />
    </div>
  );
}

