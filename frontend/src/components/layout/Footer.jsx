import { Link } from 'react-router-dom';

const FOOTER_LINKS = {
  candidate: [
    { to: '/jobs', label: 'Tìm việc làm' },
    { to: '/cv-upload', label: 'Chẩn đoán CV chuẩn ATS' },
    { to: '/cv-builder', label: 'Tạo CV' },
    { to: '/register', label: 'Đăng ký ứng viên' },
  ],
  employer: [
    { to: '/employer/register', label: 'Đăng ký nhà tuyển dụng' },
    { to: '/employer/jobs/new', label: 'Đăng tin tuyển dụng' },
    { to: '/employer/dashboard', label: 'Bảng quản trị' },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-[#0F172A] text-slate-400 py-16 sm:py-20">
      <div className="container-app">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10 mb-14">
          {/* Brand */}
          <div className="sm:col-span-2 md:col-span-1">
            <Link to="/" className="inline-flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-[#1549B8] rounded-xl flex items-center justify-center">
                <span className="text-white font-black text-sm">N</span>
              </div>
              <span className="font-extrabold text-lg text-white tracking-tight">
                Nex<span className="text-violet-400">CV</span>
              </span>
            </Link>
            <p className="text-sm leading-relaxed text-slate-400 max-w-xs">
              Nền tảng kết nối việc làm và tối ưu hóa hồ sơ theo tiêu chuẩn tuyển dụng tự động ATS.
            </p>
          </div>

          {/* Candidate links */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Ứng viên</h4>
            <ul className="space-y-3">
              {FOOTER_LINKS.candidate.map((l) => (
                <li key={l.to}>
                  <Link to={l.to} className="text-sm text-slate-400 hover:text-white transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Employer links */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Nhà tuyển dụng</h4>
            <ul className="space-y-3">
              {FOOTER_LINKS.employer.map((l) => (
                <li key={l.to}>
                  <Link to={l.to} className="text-sm text-slate-400 hover:text-white transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Liên hệ</h4>
            <ul className="space-y-3 text-sm text-slate-400">
              <li>TP. Hồ Chí Minh, Việt Nam</li>
              <li>
                <a href="mailto:contact@nexcv.vn" className="hover:text-white transition-colors">
                  contact@nexcv.vn
                </a>
              </li>
              <li>Thứ Hai – Thứ Sáu, 09:00 – 17:00</li>
            </ul>
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-500">
          <p>© 2026 NexCV. Tiêu chuẩn tuyển dụng hiện đại.</p>
          <div className="flex gap-6">
            <Link to="/jobs" className="hover:text-slate-400 transition-colors">Việc làm</Link>
            <Link to="/cv-upload" className="hover:text-slate-400 transition-colors">Chấm điểm ATS</Link>
            <Link to="/employer" className="hover:text-slate-400 transition-colors">Kênh tuyển dụng</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
