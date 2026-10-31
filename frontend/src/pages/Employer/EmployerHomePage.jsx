import { HeroSection } from "./sections/HeroSection";
import { FeaturesSection } from "./sections/FeaturesSection";
import { RecentJobPostsSection } from "./sections/RecentJobPostsSection";
import { AIPromoSection } from "./sections/AIPromoSection";
import { HowItWorksSection } from "./sections/HowItWorksSection";
import { CTASection } from "./sections/CTASection";

export default function EmployerHomePage() {
  return (
    <div className="w-full overflow-hidden bg-white font-sans">
      <HeroSection />
      <FeaturesSection />
      <RecentJobPostsSection />
      <AIPromoSection />
      <HowItWorksSection />
      <CTASection />
    </div>
  );
}
