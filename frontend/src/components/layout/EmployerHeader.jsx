import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { PlusCircle, Menu, X, ChevronDown, LogOut, LayoutDashboard, Briefcase, Plus, User } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { cn } from "@/lib/utils";
import Logo from "./Logo";
import UserDropdown from "./UserDropdown";

// ─── Constants ────────────────────────────────────────────────────────────────

const NAV_LINKS = [
  { href: "/employer/dashboard", label: "Dashboard" },
  { href: "/employer/jobs", label: "Tin tuyển dụng" },
  { href: "/employer/jobs/new", label: "Đăng tin mới" },
  { href: "/employer/profile", label: "Hồ sơ công ty" },
];

const DROPDOWN_ITEMS = [
  { href: "/employer/dashboard", icon: <LayoutDashboard size={14} />, label: "Dashboard" },
  { href: "/employer/jobs", icon: <Briefcase size={14} />, label: "Quản lý tin đăng" },
  { href: "/employer/jobs/new", icon: <PlusCircle size={14} />, label: "Đăng tin mới" },
  { href: "/employer/profile", icon: <User size={14} />, label: "Hồ sơ công ty" },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function EmployerHeader() {
  const { user, logout, isAuthenticated } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [scrolled, setScrolled] = useState(() => window.scrollY > 20);
  const [mobileOpen, setMobileOpen] = useState(false);

  const isHome = location.pathname === "/employer";
  const isSolid = scrolled || !isHome;

  // Scroll listener — lazy init in useState(() => ...) already reads current scrollY on mount
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const isActive = (href) =>
    href === "/employer/jobs"
      ? location.pathname === href
      : location.pathname === href || location.pathname.startsWith(href + "/");

  const handleLogout = () => { logout(); navigate("/employer/login"); };

  // ─── Reusable class builders ────────────────────────────────────────────────

  // Nav link
  const navLinkCls = (active) =>
    cn(
      "px-3.5 py-1.5 rounded-lg text-sm whitespace-nowrap transition-all duration-150",
      active
        ? isSolid
          ? "bg-violet-600/10 text-violet-600 font-semibold"
          : "bg-white/20 text-white font-semibold"
        : isSolid
          ? "text-slate-500 hover:bg-slate-50 hover:text-slate-900 font-medium"
          : "text-white/80 hover:bg-white/10 hover:text-white font-medium"
    );

  // Outline button
  const btnOutlineCls = cn(
    "flex items-center gap-1.5 px-4 py-[7px] rounded-lg text-sm font-medium transition-all duration-200 border-[1.5px]",
    isSolid
      ? "text-slate-900 border-slate-200 hover:bg-slate-50"
      : "text-white border-white/50 hover:bg-white/10"
  );

  // Violet primary button
  const btnPrimaryCls = cn(
    "flex items-center gap-1.5 px-4 py-[7px] rounded-lg text-sm font-semibold transition-all duration-200 shadow-sm",
    isSolid
      ? "bg-violet-600 text-white shadow-violet-600/30 hover:bg-violet-700"
      : "bg-white text-violet-900 hover:bg-white/90"
  );

  // User dropdown trigger
  const userBtnCls = cn(
    "flex items-center gap-2 px-2 py-1 rounded-lg border-none bg-transparent cursor-pointer transition-colors duration-200",
    isSolid ? "text-slate-900 hover:bg-slate-50" : "text-white hover:bg-white/10"
  );

  const avatarCls = cn(
    "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0",
    isSolid ? "bg-purple-50 text-purple-700" : "bg-white/15 text-white"
  );

  const roleTagCls = cn(
    "text-[10px] font-medium",
    isSolid ? "text-violet-600" : "text-violet-400"
  );

  // ─── JSX ──────────────────────────────────────────────────────────────────

  return (
    <>
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-250",
          isSolid
            ? "bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm"
            : "bg-transparent border-b border-transparent shadow-none"
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-6">

          {/* Logo */}
          <Logo
            to={isAuthenticated ? "/employer/dashboard" : "/employer"}
            iconBg={isSolid ? "bg-violet-600" : "bg-white/15"}
            iconColor="text-white"
            textColor={isSolid ? "text-slate-900" : "text-white"}
            cvColor={isSolid ? "text-violet-600" : "text-violet-400"}
            badgeText="Nhà tuyển dụng"
            badgeClassName={
              isSolid
                ? "bg-violet-600/10 text-violet-600 border-transparent"
                : "bg-violet-600/30 text-violet-300 border-violet-600/40"
            }
          />

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-0.5 flex-1">
            {NAV_LINKS.map((l) => (
              <Link key={l.href} to={l.href} className={navLinkCls(isActive(l.href))}>
                {l.label}
              </Link>
            ))}
          </nav>

          {/* Desktop Right */}
          <div className="hidden md:flex items-center gap-2.5 ml-auto">
            {isAuthenticated ? (
              <>
                {/* User dropdown */}
                <UserDropdown
                  user={user}
                  roleLabel="Nhà tuyển dụng"
                  roleTagCls={roleTagCls}
                  userBtnCls={userBtnCls}
                  avatarCls={avatarCls}
                  items={DROPDOWN_ITEMS}
                  fallbackInitial="HR"
                  logoutRedirect="/employer/login"
                  extraItems={null}
                />
              </>
            ) : (
              <>
                <Link to="/employer/login" className={btnOutlineCls}>Đăng nhập</Link>
                <Link to="/employer/register" className={btnPrimaryCls}>Đăng ký miễn phí</Link>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className={cn("md:hidden ml-auto p-1 rounded-md bg-transparent border-none cursor-pointer transition-colors", isSolid ? "text-slate-600 hover:bg-slate-100" : "text-white hover:bg-white/10")}
            onClick={() => setMobileOpen((v) => !v)}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className={cn("md:hidden flex flex-col gap-1 p-4 pb-5 border-t", isSolid ? "bg-white border-slate-200 shadow-sm" : "bg-indigo-900 border-white/10")}>
            {NAV_LINKS.map((l) => (
              <Link
                key={l.href}
                to={l.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "block px-3 py-2.5 rounded-lg text-sm transition-colors",
                  isActive(l.href)
                    ? isSolid ? "bg-violet-600/10 text-violet-600 font-semibold" : "bg-white/20 text-white font-semibold"
                    : isSolid ? "text-slate-600 font-medium hover:bg-slate-50 hover:text-slate-900" : "text-white/80 font-medium hover:bg-white/10 hover:text-white"
                )}
              >
                {l.label}
              </Link>
            ))}

            <div className={cn("flex gap-2.5 mt-3 pt-3 border-t", isSolid ? "border-slate-200" : "border-white/10")}>
              {isAuthenticated ? (
                <>

                  <button
                    onClick={handleLogout}
                    className="flex flex-1 items-center justify-center gap-2 py-2.5 text-center rounded-lg text-sm font-medium bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                  >
                    <LogOut className="w-4 h-4" /> Đăng xuất
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/employer/login"
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "flex-1 py-2.5 text-center rounded-lg text-sm font-medium border transition-colors no-underline",
                      isSolid ? "border-slate-200 text-slate-900 hover:bg-slate-50" : "bg-transparent text-white border-white/30 hover:bg-white/10"
                    )}
                  >
                    Đăng nhập
                  </Link>
                  <Link
                    to="/employer/register"
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "flex-1 py-2.5 text-center rounded-lg text-sm font-semibold transition-colors no-underline",
                      isSolid ? "bg-violet-600 text-white hover:bg-violet-700" : "bg-white text-indigo-900 hover:bg-white/90"
                    )}
                  >
                    Đăng ký
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      {!isHome && <div className="h-16" />}
    </>
  );
}