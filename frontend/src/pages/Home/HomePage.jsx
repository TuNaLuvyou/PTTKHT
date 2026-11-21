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
  ATSShowcaseSection,
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
    <div className="w-full bg-white font-sans">
      {/* 1. Hero: Tìm kiếm & xem trước chẩn đoán ATS */}
      <HeroSection />

      {/* 2. Ngành nghề: Tinh gọn, typography-first, không icon trong hộp */}
      <CategoriesSection
        categories={categories}
        onCategoryClick={(name) =>
          navigate(`/jobs?category=${encodeURIComponent(name)}`)
        }
      />

      {/* 3. Việc làm mới nhất: JobCard bo góc mềm mại, không đường kẻ */}
      <FeaturedJobsSection jobs={featuredJobs} loading={loadingJobs} />

      {/* 4. Đo lường ATS: Editorial showcase, không gradient blob */}
      <ATSShowcaseSection onCreateCV={handleCreateCV} />

      {/* 5. Kêu gọi hành động: 2 phân hệ chuyên biệt Ứng viên & Nhà tuyển dụng */}
      <CTASplitSection onCreateCV={handleCreateCV} />
    </div>
  );
}
