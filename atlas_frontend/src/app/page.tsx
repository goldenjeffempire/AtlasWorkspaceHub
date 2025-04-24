import Navbar from '@/components/ui/navbar';
import Footer from '@/components/ui/footer';
import HeroSection from '@/components/landing/hero-section';
import FeaturesSection from '@/components/landing/features-section';
import PricingSection from '@/components/landing/pricing-section';
import TestimonialsSection from '@/components/landing/testimonials-section';

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar fixed={true} />
      <main className="flex-grow">
        <HeroSection />
        <FeaturesSection />
        <PricingSection />
        <TestimonialsSection />
      </main>
      <Footer />
    </div>
  );
}
