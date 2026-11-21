import { HeroSection } from "./sections/HeroSection";
import { RecentJobPostsSection } from "./sections/RecentJobPostsSection";
import { AIPromoSection } from "./sections/AIPromoSection";
import { CTASection } from "./sections/CTASection";

export default function EmployerHomePage() {
  return (
    <div className="w-full bg-white font-sans">
      {/* 1. Hero: Đăng tin tuyển dụng & chẩn đoán ứng viên */}
      <HeroSection />

      {/* 2. Vị trí tuyển dụng sôi động */}
      <RecentJobPostsSection />

      {/* 3. Đo lường & sàng lọc hồ sơ ATS */}
      <AIPromoSection />

      {/* 4. Kêu gọi hành động */}
      <CTASection />
    </div>
  );
}
