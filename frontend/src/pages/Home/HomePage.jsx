import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { JOB_CATEGORIES, jobService } from "@/services/jobService";
import {
  HeroSection,
  CategoriesSection,
  FeaturedJobsSection,
} from "./sections/MainSections";
import {
  AIPromoSection,
  HowItWorksSection,
  CTASplitSection,
} from "./sections/BottomSections";

export default function HomePage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [featuredJobs, setFeaturedJobs] = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [categories, setCategories] = useState(JOB_CATEGORIES);

  useEffect(() => {
    jobService
      .getJobs({ limit: 6 })
      .then((res) => {
        setFeaturedJobs(res.data || []);
        setLoadingJobs(false);
      })
      .catch(() => setLoadingJobs(false));

    jobService.getCategories().then((res) => {
      if (res && res.length > 0) {
        const normalize = (str) =>
          str
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/&/g, "va")
            .toLowerCase();

        const mapped = res.map((c) => {
          const catNameNorm = normalize(c.name);
          const iconMatch = JOB_CATEGORIES.find(
            (jc) =>
              normalize(jc.name) === catNameNorm ||
              jc.id.toLowerCase() === catNameNorm
          );
          return {
            ...c,
            id: c.name,
            name: iconMatch ? iconMatch.name : c.name,
            icon: iconMatch ? iconMatch.icon : "folder",
          };
        });
        setCategories(mapped);
      }
    });
  }, []);

  const handleCreateCV = () =>
    navigate(isAuthenticated ? "/cv-builder" : "/login", {
      state: { from: "/cv-builder" },
    });

  return (
    <div className="w-full overflow-hidden bg-white">
      {/* 1. Hero: Tìm kiếm & xem trước thẻ điểm ATS */}
      <HeroSection />

      {/* 2. Ngành nghề: Thẻ bo góc mềm mại, hiển thị số lượng */}
      <CategoriesSection
        categories={categories}
        onCategoryClick={(name) =>
          navigate(`/jobs?category=${encodeURIComponent(name)}`)
        }
      />

      {/* 3. Việc làm mới nhất: JobCard bo góc 2xl, không đường kẻ gạch ngang */}
      <FeaturedJobsSection jobs={featuredJobs} loading={loadingJobs} />

      {/* 4. Banner ATS AI tinh gọn, không rườm rà chữ */}
      <AIPromoSection />

      {/* 5. Quy trình 4 bước đơn giản */}
      <HowItWorksSection />

      {/* 6. Kêu gọi hành động: Ứng viên & Nhà tuyển dụng */}
      <CTASplitSection onCreateCV={handleCreateCV} />
    </div>
  );
}
