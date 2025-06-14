
import LandingHeader from '@/components/landing/LandingHeader';
import HeroSection from '@/components/landing/HeroSection';
import BenefitsList from '@/components/landing/BenefitsList';
import FeaturesGrid from '@/components/landing/FeaturesGrid';
import StatsSection from '@/components/landing/StatsSection';
import PricingSection from '@/components/landing/PricingSection';
import CTASection from '@/components/landing/CTASection';

const Landing = () => {
  return (
    <div className="min-h-screen">
      <LandingHeader />
      <HeroSection />
      <BenefitsList />
      <FeaturesGrid />
      <StatsSection />
      <PricingSection />
      <CTASection />
    </div>
  );
};

export default Landing;
