import {
  ClipboardList,
  Bot,
  BarChart3,
  Users,
} from "lucide-react";

const FEATURES = [
  {
    icon: ClipboardList,
    title: "Đăng tin tuyển dụng nhanh",
    desc: "Tạo tin chuẩn SEO theo mẫu JD chuyên nghiệp.",
  },
  {
    icon: Bot,
    title: "AI chấm điểm & xếp hạng",
    desc: "Tự động phân tích độ tương thích CV với JD.",
  },
  {
    icon: Users,
    title: "Quản lý ứng viên tập trung",
    desc: "Theo dõi trạng thái từ ứng tuyển đến nhận việc.",
  },
  {
    icon: BarChart3,
    title: "Báo cáo thống kê hiệu quả",
    desc: "Nắm bắt số lượt xem và tỷ lệ nộp hồ sơ.",
  },
];

export function FeaturesSection() {
  return (
    <section className="section bg-white">
      <div className="container-app">
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-black text-[#0F172A] mb-1">
            Giải pháp tuyển dụng thông minh
          </h2>
          <p className="text-slate-500 text-sm">
            Tối ưu quy trình từ đăng tin đến chọn lọc nhân tài
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {FEATURES.map((feat) => {
            const IconComp = feat.icon;
            return (
              <div
                key={feat.title}
                className="bg-[#F8FAFC] rounded-2xl p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="w-11 h-11 rounded-xl bg-purple-50 text-[#7C3AED] flex items-center justify-center mb-3">
                    <IconComp size={22} />
                  </div>
                  <h3 className="font-bold text-base text-[#0F172A] mb-1">{feat.title}</h3>
                  <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">{feat.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
