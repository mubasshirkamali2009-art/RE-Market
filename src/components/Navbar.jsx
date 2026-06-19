import { useState, useRef, useEffect } from "react";
import {
  Repeat,
  Search,
  LayoutGrid,
  Boxes,
  LayoutDashboard,
  ChevronDown,
  User,
  Settings,
  Package,
  Heart,
  LogOut,
  Menu,
  X,
  Home,
  Sun,
  Moon,
} from "lucide-react";

export default function ReMarketNavbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeLink, setActiveLink] = useState("Home");
  const [scrolled, setScrolled] = useState(false);
  const [dark, setDark] = useState(false);
  const profileRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    function handleScroll() {
      setScrolled(window.scrollY > 8);
    }
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { label: "Home", icon: Home },
    { label: "Products", icon: Boxes },
    { label: "Categories", icon: LayoutGrid },
    { label: "Dashboard", icon: LayoutDashboard },
  ];

  return (
    <div className={dark ? "dark" : ""}>
      <div
        className="font-sans transition-colors duration-300"
        style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
      >
        <nav
          className={`sticky top-0 z-50 w-full transition-all duration-300 ${
            scrolled
              ? "bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-[0_1px_20px_-4px_rgba(79,70,229,0.15)] dark:shadow-[0_1px_20px_-4px_rgba(0,0,0,0.4)] border-b border-indigo-900/5 dark:border-white/5"
              : "bg-[#FAF8FF] dark:bg-slate-900 border-b border-transparent"
          }`}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16 sm:h-[68px] gap-3 sm:gap-4 lg:gap-6">
              {/* Logo */}
              <a href="#" className="flex items-center gap-2 sm:gap-2.5 shrink-0 group">
                <span className="relative flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-violet-600 via-indigo-600 to-indigo-800 shadow-md shadow-indigo-900/20 transition-transform duration-300 group-hover:rotate-[-8deg] group-hover:scale-105">
                  <Repeat size={18} className="text-white sm:w-5 sm:h-5" strokeWidth={2.5} />
                  <span className="absolute inset-0 rounded-xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                </span>
                <span
                  className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white hidden xs:inline"
                  style={{ fontFamily: "'Space Grotesk', 'Inter', sans-serif" }}
                >
                  Re
                  <span className="bg-gradient-to-r from-violet-600 to-indigo-500 bg-clip-text text-transparent">
                    Market
                  </span>
                </span>
              </a>

              {/* Desktop nav links — lg and up */}
              <div className="hidden lg:flex items-center gap-1 flex-1 justify-center">
                {navLinks.map((link) => {
                  const isActive = activeLink === link.label;
                  const Icon = link.icon;
                  return (
                    <button
                      key={link.label}
                      onClick={() => setActiveLink(link.label)}
                      className={`relative flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                        isActive
                          ? "text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-500/10"
                          : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5"
                      }`}
                    >
                      <Icon size={16} strokeWidth={2} />
                      {link.label}
                      {isActive && (
                        <span className="absolute -bottom-[1px] left-1/2 -translate-x-1/2 w-6 h-[2.5px] rounded-full bg-gradient-to-r from-violet-600 to-indigo-500" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Tablet nav — md only, icon-only compact pills */}
              <div className="hidden md:flex lg:hidden items-center gap-1">
                {navLinks.map((link) => {
                  const isActive = activeLink === link.label;
                  const Icon = link.icon;
                  return (
                    <button
                      key={link.label}
                      onClick={() => setActiveLink(link.label)}
                      title={link.label}
                      className={`flex items-center justify-center w-10 h-10 rounded-full transition-all duration-200 ${
                        isActive
                          ? "text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-500/10"
                          : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5"
                      }`}
                    >
                      <Icon size={18} strokeWidth={2} />
                    </button>
                  );
                })}
              </div>

              {/* Search — lg and up */}
              <div className="hidden lg:flex items-center relative group">
                <Search
                  size={16}
                  className="absolute left-3.5 text-slate-400 dark:text-slate-500 pointer-events-none group-focus-within:text-indigo-500 transition-colors"
                />
                <input
                  type="text"
                  placeholder="Search listings..."
                  className="text-sm rounded-full pl-10 pr-4 py-2.5 w-40 xl:w-56 bg-slate-100/80 dark:bg-white/5 text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none border border-transparent focus:border-indigo-500/40 focus:bg-white dark:focus:bg-white/10 focus:ring-4 focus:ring-indigo-500/10 transition-all duration-200"
                />
              </div>

              {/* Right cluster */}
              <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                {/* Dark mode toggle */}
                <button
                  onClick={() => setDark((d) => !d)}
                  aria-label="Toggle dark mode"
                  className="flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-full text-slate-500 dark:text-slate-300 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors duration-200"
                >
                  {dark ? <Sun size={18} strokeWidth={2} /> : <Moon size={18} strokeWidth={2} />}
                </button>

                {!isLoggedIn ? (
                  <div className="hidden sm:flex items-center gap-2">
                    <button
                      onClick={() => setIsLoggedIn(true)}
                      className="text-sm font-medium px-4 py-2 rounded-full text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors duration-200"
                    >
                      Log in
                    </button>
                    <button
                      onClick={() => setIsLoggedIn(true)}
                      className="text-sm font-semibold px-4 py-2 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
                    >
                      Sign up
                    </button>
                  </div>
                ) : (
                  <div className="relative" ref={profileRef}>
                    <button
                      onClick={() => setProfileOpen((o) => !o)}
                      className={`flex items-center gap-1.5 sm:gap-2 pl-1 pr-1.5 sm:pr-2.5 py-1 rounded-full transition-colors duration-200 ${
                        profileOpen ? "bg-slate-100 dark:bg-white/10" : "hover:bg-slate-100 dark:hover:bg-white/5"
                      }`}
                    >
                      <span className="flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-full text-xs font-bold text-white bg-gradient-to-br from-violet-600 to-indigo-700 ring-2 ring-white dark:ring-slate-900">
                        AR
                      </span>
                      <ChevronDown
                        size={14}
                        className={`text-slate-400 dark:text-slate-500 hidden sm:block transition-transform duration-200 ${
                          profileOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {profileOpen && (
                      <div className="absolute right-0 mt-2.5 w-60 rounded-2xl overflow-hidden bg-white dark:bg-slate-800 shadow-xl shadow-slate-900/10 dark:shadow-black/40 border border-slate-100 dark:border-white/10 animate-[fadeIn_0.15s_ease-out]">
                        <div className="px-4 py-3.5 bg-gradient-to-br from-violet-50 to-indigo-50/50 dark:from-indigo-500/10 dark:to-violet-500/5 border-b border-slate-100 dark:border-white/10">
                          <p className="text-sm font-semibold text-slate-900 dark:text-white">Amina Rahman</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">amina@email.com</p>
                        </div>
                        <div className="py-1.5">
                          {[
                            { icon: User, label: "My Profile" },
                            { icon: Package, label: "My Listings" },
                            { icon: Heart, label: "Saved Items" },
                            { icon: Settings, label: "Settings" },
                          ].map((item) => {
                            const Icon = item.icon;
                            return (
                              <button
                                key={item.label}
                                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white transition-colors duration-150 text-left"
                              >
                                <Icon size={16} className="text-slate-400 dark:text-slate-500" />
                                {item.label}
                              </button>
                            );
                          })}
                        </div>
                        <div className="py-1.5 border-t border-slate-100 dark:border-white/10">
                          <button
                            onClick={() => {
                              setIsLoggedIn(false);
                              setProfileOpen(false);
                            }}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors duration-150 text-left"
                          >
                            <LogOut size={16} />
                            Log out
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Mobile menu toggle — below md */}
                <button
                  className="md:hidden flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-full text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors duration-200"
                  onClick={() => setMobileOpen((o) => !o)}
                >
                  {mobileOpen ? <X size={22} /> : <Menu size={22} />}
                </button>
              </div>
            </div>
          </div>

          {/* Mobile / small-tablet dropdown — below md */}
          <div
            className={`md:hidden overflow-hidden transition-[max-height,opacity] duration-300 ease-in-out ${
              mobileOpen ? "max-h-[420px] opacity-100" : "max-h-0 opacity-0"
            }`}
          >
            <div className="px-4 sm:px-6 pb-4 flex flex-col gap-1 border-t border-slate-100 dark:border-white/10 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl">
              <div className="relative mt-3 mb-1">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                <input
                  type="text"
                  placeholder="Search listings..."
                  className="text-sm rounded-full pl-10 pr-4 py-3 w-full bg-slate-100 dark:bg-white/5 text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all"
                />
              </div>

              {navLinks.map((link) => {
                const isActive = activeLink === link.label;
                const Icon = link.icon;
                return (
                  <button
                    key={link.label}
                    onClick={() => {
                      setActiveLink(link.label);
                      setMobileOpen(false);
                    }}
                    className={`flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-medium text-left transition-colors duration-150 ${
                      isActive
                        ? "text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-500/10"
                        : "text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/5"
                    }`}
                  >
                    <Icon size={18} strokeWidth={2} />
                    {link.label}
                  </button>
                );
              })}

              {!isLoggedIn && (
                <div className="flex items-center gap-2 mt-2 pt-3 border-t border-slate-100 dark:border-white/10">
                  <button
                    onClick={() => setIsLoggedIn(true)}
                    className="flex-1 text-sm font-medium px-4 py-3 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-200"
                  >
                    Log in
                  </button>
                  <button
                    onClick={() => setIsLoggedIn(true)}
                    className="flex-1 text-sm font-semibold px-4 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-sm"
                  >
                    Sign up
                  </button>
                </div>
              )}
            </div>
          </div>
        </nav>

        {/* demo content to show sticky scroll + dark mode effect */}
        <div className="bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900 px-6 py-16 text-center text-slate-400 dark:text-slate-500 text-sm transition-colors duration-300">
          Scroll to see the glass blur effect • Toggle the moon/sun icon for dark mode
          <div className="h-[1200px]" />
        </div>
      </div>
    </div>
  );
}