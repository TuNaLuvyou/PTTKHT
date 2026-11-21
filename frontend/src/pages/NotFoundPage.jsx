import { Link, useNavigate } from 'react-router-dom';
import { Home, AlertCircle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4 font-sans">
      <div className="max-w-md w-full text-center">
        {/* Minimal Icon */}
        <div className="mb-6 flex justify-center">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 text-[#1549B8] flex items-center justify-center">
            <AlertCircle className="w-8 h-8" />
          </div>
        </div>

        {/* Text Content */}
        <h1 className="text-7xl sm:text-8xl font-black text-[#0F172A] mb-3 tracking-tighter">
          404
        </h1>
        <h2 className="text-xl sm:text-2xl font-bold text-[#0F172A] mb-3 [text-wrap:balance]">
          Trang không tồn tại
        </h2>
        <p className="text-slate-500 mb-8 text-sm leading-relaxed [text-wrap:pretty]">
          Đường dẫn bạn truy cập không đúng hoặc nội dung này đã được thay đổi.
        </p>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            variant="outline"
            className="h-11 px-6 rounded-xl font-semibold border-slate-200 hover:bg-slate-50 gap-2 transition-all cursor-pointer"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="w-4 h-4" />
            Quay lại
          </Button>
          <Button
            asChild
            className="h-11 px-6 rounded-xl font-semibold bg-[#1549B8] hover:bg-[#1240A0] text-white gap-2 transition-all cursor-pointer shadow-none"
          >
            <Link to="/">
              <Home className="w-4 h-4" />
              Về trang chủ
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
