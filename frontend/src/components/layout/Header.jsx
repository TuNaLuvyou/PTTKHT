import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  FileCheck,
  FileEdit,
  LogOut,
  User,
  Bookmark,
  ChevronDown,
  History,
  LayoutDashboard,
  Briefcase,
  PlusCircle,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import Logo from "./Logo";
import UserDropdown from "./UserDropdown";

// ─── Constants ────────────────────────────────────────────────────────────────

const CANDIDATE_NAV = [
  { href: "/jobs", label: "Việc làm" },
  { href: "/cv-upload", label: "Phân tích CV" },
  { href: "/cv-builder", label: "Tạo CV" },
];

const DROPDOWN_ITEMS = [
  { href: "/profile", icon: <User size={14} />, label: "Hồ sơ của tôi" },
  { href: "/cv-builder", icon: <FileEdit size={14} />, label: "Tạo CV" },
  { href: "/cv-upload", icon: <FileCheck size={14} />, label: "Chấm điểm CV" },
  { href: "/profile?tab=cvs", icon: <History size={14} />, label: "CV của tôi" },
  { href: "/profile?tab=saved", icon: <Bookmark size={14} />, label: "Việc đã lưu" },
];

const EMPLOYER_DROPDOWN_ITEMS = [
  { href: "/employer/dashboard", icon: <LayoutDashboard size={14} />, label: "Dashboard" },
  { href: "/employer/jobs", icon: <Briefcase size={14} />, label: "Quản lý tin đăng" },
  { href: "/employer/jobs/new", icon: <PlusCircle size={14} />, label: "Đăng tin mới" },
  { href: "/employer/profile", icon: <User size={14} />, label: "Hồ sơ công ty" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getInitials = (name) => {
  if (!name) return "U";
  try {
    const parts = name.trim().split(/\s+/);
    return parts.slice(-2).map((w) => w[0]).join("").toUpperCase() || "U";
  } catch {
    // Defensive: tên bất thường (null, không phải chuỗi) → trả "U", không ảnh hưởng UI
    return "U";
  }
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function Header() {
  const { user, logout, isAuthenticated, isEmployer, employerUser } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const headerRef = useRef(null);

  const [scrolled, setScrolled] = useState(() => window.scrollY > 20);

  const isHome = location.pathname === "/";
  const isSolid = scrolled || !isHome;

  // Scroll listener — lazy init in useState(() => ...) already reads current scrollY on mount
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  // Sync --header-height CSS var
  useEffect(() => {
    if (!headerRef.current) return;
    const update = () =>
      document.documentElement.style.setProperty(
        "--header-height",
        `${headerRef.current.offsetHeight}px`
      );
    update();
    const ro = new ResizeObserver(update);
    ro.observe(headerRef.current);
    window.addEventListener("resize", update);
    return () => { ro.disconnect(); window.removeEventListener("resize", update); };
  }, []);

  const isActive = (href) =>
    location.pathname === href || location.pathname.startsWith(href + "/");

  const handleLogout = () => { logout(); navigate("/"); };

  // ─── Reusable class builders ────────────────────────────────────────────────

  // Nav link (desktop)
  const navLinkCls = (active) =>
    cn(
      "flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-sm whitespace-nowrap transition-all duration-150",
      active
        ? isSolid
          ? "bg-blue-600/10 text-blue-700 font-semibold"
          : "bg-white/20 text-white font-semibold"
        : isSolid
          ? "text-slate-500 hover:bg-slate-50 hover:text-slate-900 font-medium"
          : "text-white/80 hover:bg-white/10 hover:text-white font-medium"
    );

  // Outline button (Tạo CV / Đăng nhập)
  const btnOutlineCls = cn(
    "flex items-center gap-1.5 px-4 py-[7px] rounded-lg text-sm font-medium transition-all duration-200 border-[1.5px]",
    isSolid
      ? "text-slate-900 border-slate-200 hover:bg-slate-50"
      : "text-white border-white/50 hover:bg-white/10"
  );

  // Primary solid button (Đăng ký)
  const btnPrimaryCls = cn(
    "flex items-center gap-1.5 px-4 py-[7px] rounded-lg text-sm font-semibold transition-all duration-200 shadow-sm",
    isSolid
      ? "bg-[#1549B8] text-white shadow-blue-600/20 hover:bg-[#1240A0]"
      : "bg-white text-[#1549B8] hover:bg-white/90"
  );

  // Dark button (Nhà tuyển dụng)
  const btnDarkCls = cn(
    "flex items-center gap-1.5 px-4 py-[7px] rounded-lg text-sm font-semibold transition-all duration-200",
    isSolid
      ? "bg-[#0F172A] text-white hover:bg-slate-800"
      : "bg-white/15 text-white hover:bg-white/25"
  );

  // User dropdown trigger
  const userBtnCls = cn(
    "flex items-center gap-2 px-2 py-1 rounded-lg border-none bg-transparent cursor-pointer transition-colors duration-200",
    isSolid ? "text-slate-900 hover:bg-slate-50" : "text-white hover:bg-white/10"
  );

  const avatarCls = cn(
    "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0",
    isSolid ? "bg-indigo-50 text-blue-700" : "bg-white/15 text-white"
  );

  const roleTagCls = cn(
    "text-[10px] font-medium",
    isSolid ? "text-blue-600" : "text-blue-300"
  );

  // ─── JSX ──────────────────────────────────────────────────────────────────

  return (
    <>
      <header
        ref={headerRef}
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-250",
          isSolid
            ? "bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm"
            : "bg-transparent border-b border-transparent shadow-none"
        )}
      >
        <div className="container-app max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-5">

          {/* Logo */}
          <Logo
            to="/"
            iconBg="bg-[#1549B8]"
            textColor={isSolid ? "text-[#1549B8]" : "text-white"}
            cvColor="text-[#7C3AED]"
          />

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-0.5 flex-1">
            {CANDIDATE_NAV.map((link) => (
              <Link key={link.href} to={link.href} className={navLinkCls(isActive(link.href))}>
                {link.icon && <link.icon className="w-3.5 h-3.5" />}
                {link.label}
                {link.badge && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-violet-100 text-violet-700">
                    {link.badge}
                  </span>
                )}
              </Link>
            ))}
          </nav>

          {/* Desktop Right */}
          <div className="hidden md:flex items-center gap-2.5 ml-auto">
            {employerUser && (
              <Link
                to="/employer/dashboard"
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-[#7C3AED] hover:bg-[#6D28D9] text-white transition-colors no-underline shadow-xs cursor-pointer"
              >
                Kênh tuyển dụng
              </Link>
            )}
            {isAuthenticated ? (
              <UserDropdown
                user={user}
                roleLabel={isEmployer ? "Nhà tuyển dụng" : "Ứng viên"}
                roleTagCls={isEmployer ? (isSolid ? "text-violet-600 font-semibold" : "text-violet-300 font-semibold") : roleTagCls}
                userBtnCls={userBtnCls}
                avatarCls={avatarCls}
                items={isEmployer ? EMPLOYER_DROPDOWN_ITEMS : DROPDOWN_ITEMS}
                fallbackInitial={isEmployer ? "NTD" : "U"}
                logoutRedirect="/"
              />
            ) : (
              <>
                <Link to="/login" className={btnOutlineCls}>Đăng nhập</Link>
                <Link to="/register" className={btnPrimaryCls}>Đăng ký</Link>
                {!employerUser && (
                  <Link to="/employer" className={btnDarkCls}>
                    Nhà tuyển dụng
                  </Link>
                )}
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <div className="md:hidden ml-auto">
            <Sheet>
              <SheetTrigger asChild>
                <button className={cn("p-1 rounded-md bg-transparent border-none cursor-pointer", isSolid ? "text-slate-600" : "text-white")}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="3" y1="6" x2="21" y2="6" />
                    <line x1="3" y1="12" x2="21" y2="12" />
                    <line x1="3" y1="18" x2="21" y2="18" />
                  </svg>
                </button>
              </SheetTrigger>

              <SheetContent side="right" className="w-72 p-0 flex flex-col">
                {/* Sheet header */}
                <div className="p-5 border-b">
                  <Logo iconBg="bg-[#1549B8]" textColor="text-[#0F172A]" cvColor="text-violet-600" />
                  {isAuthenticated && (
                    <SheetClose asChild>
                      <Link
                        to={isEmployer ? "/employer/dashboard" : "/profile"}
                        className="flex items-center gap-2.5 mt-3 p-2.5 bg-slate-50 rounded-lg no-underline hover:bg-slate-100 transition-colors"
                      >
                        <div className="w-9 h-9 rounded-full bg-[#1549B8] flex items-center justify-center text-[13px] font-bold text-white shrink-0">
                          {getInitials(user?.name, isEmployer ? "NTD" : "U")}
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-slate-900">{user?.name}</div>
                          <div className="text-xs text-slate-400">{isEmployer ? "Nhà tuyển dụng" : "Ứng viên"}</div>
                        </div>
                      </Link>
                    </SheetClose>
                  )}
                </div>

                {/* Nav links */}
                <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                  {CANDIDATE_NAV.map((link) => (
                    <SheetClose asChild key={link.href}>
                      <Link
                        to={link.href}
                        className={cn(
                          "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                          isActive(link.href)
                            ? "bg-blue-50 text-[#1549B8]"
                            : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                        )}
                      >
                        {link.icon && <link.icon className="h-4 w-4" />}
                        {link.label}
                        {link.badge && (
                          <span className="ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-violet-100 text-violet-700">
                            {link.badge}
                          </span>
                        )}
                      </Link>
                    </SheetClose>
                  ))}
                </nav>

                {/* Sheet footer */}
                <div className="p-4 border-t space-y-2">
                  {isAuthenticated ? (
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                    >
                      <LogOut className="h-4 w-4" /> Đăng xuất
                    </button>
                  ) : (
                    <>
                      <SheetClose asChild>
                        <Link to="/login" className="block w-full py-2.5 text-center rounded-lg text-sm font-medium border border-slate-200 text-slate-900 hover:bg-slate-50 transition-colors no-underline">
                          Đăng nhập
                        </Link>
                      </SheetClose>
                      <SheetClose asChild>
                        <Link to="/register" className="block w-full py-2.5 text-center rounded-lg text-sm font-semibold bg-[#1549B8] text-white hover:bg-[#1240A0] transition-colors no-underline">
                          Đăng ký ứng viên
                        </Link>
                      </SheetClose>
                      <a href="/employer" target="_blank" rel="noopener noreferrer" className="block w-full py-2.5 text-center rounded-lg text-sm font-semibold bg-[#0F172A] text-white hover:bg-slate-800 transition-colors no-underline">
                        Nhà tuyển dụng
                      </a>
                    </>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>

        </div>
      </header>

      {!isHome && <div className="h-16" />}
    </>
  );
}