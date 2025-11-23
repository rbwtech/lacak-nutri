import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../context/AuthContext";
import Button from "../ui/Button";
import api from "../../config/api";

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();
  const { user, setUser } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const languages = [
    {
      code: "id-ID",
      label: "Bahasa Indonesia",
      flag: (
        <svg className="w-6 h-6" viewBox="0 0 24 24">
          <rect width="24" height="12" fill="#E70011" />
          <rect y="12" width="24" height="12" fill="#FFFFFF" />
        </svg>
      ),
    },
    {
      code: "en-US",
      label: "English (US)",
      flag: (
        <svg className="w-6 h-6" viewBox="0 0 24 24">
          <rect width="24" height="24" fill="#B22234" />
          <path
            d="M0 2.77h24M0 5.54h24M0 8.31h24M0 11.08h24M0 13.85h24M0 16.62h24M0 19.39h24"
            stroke="#FFF"
            strokeWidth="1.85"
          />
          <rect width="9.6" height="12.92" fill="#3C3B6E" />
        </svg>
      ),
    },
  ];

  const currentLang =
    languages.find((l) => l.code === i18n.language) || languages[0];

  const switchLanguage = async (locale) => {
    try {
      i18n.changeLanguage(locale);
      localStorage.setItem("preferredLanguage", locale);

      if (user) {
        const { data } = await api.patch("/users/update-locale", null, {
          params: { locale },
        });

        setUser(data.user);
        localStorage.setItem("user", JSON.stringify(data.user));
      }

      setIsOpen(false);
    } catch (e) {
      console.error("Failed to switch language", e);
      setIsOpen(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (isOpen && !e.target.closest(".language-switcher")) {
        setIsOpen(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [isOpen]);

  return (
    <div className="relative language-switcher">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-10 h-10 rounded-xl hover:bg-bg-base border border-transparent hover:border-border flex items-center justify-center transition-all duration-200"
        title="Ganti Bahasa"
      >
        <svg
          className="w-5 h-5 text-text-secondary hover:text-primary transition-colors"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-64 bg-bg-surface rounded-2xl shadow-2xl border-2 border-border z-50 overflow-hidden animate-scale-up">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => switchLanguage(lang.code)}
              className={`w-full px-4 py-3 flex items-center gap-3 hover:bg-primary/5 transition-all text-left ${
                currentLang.code === lang.code ? "bg-primary/10 font-bold" : ""
              }`}
            >
              <div className="w-8 h-8 rounded-lg overflow-hidden border border-border flex items-center justify-center">
                {lang.flag}
              </div>
              <span className="text-sm text-text-primary">{lang.label}</span>
              {currentLang.code === lang.code && (
                <svg
                  className="w-5 h-5 ml-auto text-primary"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const Header = () => {
  const { user, logout } = useAuth();
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [isDark, setIsDark] = useState(
    () => localStorage.getItem("theme") === "dark"
  );
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Initialize language from user or localStorage
    const preferredLang =
      user?.locale || localStorage.getItem("preferredLanguage") || "id-ID";
    if (i18n.language !== preferredLang) {
      i18n.changeLanguage(preferredLang);
    }
  }, [user, i18n]);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDark]);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isActive = (path) =>
    location.pathname.startsWith(path)
      ? "text-primary bg-primary/10 font-bold"
      : "text-text-secondary hover:text-primary hover:bg-bg-base font-medium";

  // --- Custom SVG Icons ---
  const SunIcon = (
    <svg
      className="w-5 h-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
      />
    </svg>
  );
  const MoonIcon = (
    <svg
      className="w-5 h-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
      />
    </svg>
  );
  const MenuIcon = (
    <svg
      className="w-6 h-6"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4 6h16M4 12h16M4 18h16"
      />
    </svg>
  );
  const CloseIcon = (
    <svg
      className="w-6 h-6"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M6 18L18 6M6 6l12 12"
      />
    </svg>
  );

  const LogoutIcon = (
    <svg
      className="w-5 h-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
      />
    </svg>
  );
  const CatalogIcon = (
    <svg
      className="w-5 h-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
      />
    </svg>
  );
  const ScannerIcon = (
    <svg
      className="w-5 h-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
      />
    </svg>
  );
  const EduIcon = (
    <svg
      className="w-5 h-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 14l9-5-9-5-9 5 9 5z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 14l9-5-9-5-9 5 9 5z"
      />
    </svg>
  );
  const DashboardIcon = (
    <svg
      className="w-5 h-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
      />
    </svg>
  );
  const ProfileIcon = (
    <svg
      className="w-5 h-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
      />
    </svg>
  );

  const FavoriteIcon = (
    <svg
      className="w-5 h-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
      />
    </svg>
  );

  const HistoryIcon = (
    <svg
      className="w-5 h-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );

  const getPhotoUrl = (path) => {
    if (!path) return null;
    if (path.startsWith("http")) return path;

    const baseUrl = import.meta.env.VITE_API_URL.replace("/api", "");
    return `${baseUrl}${path}`;
  };

  return (
    <header className="sticky top-0 z-50 bg-bg-surface/80 backdrop-blur-xl border-b border-border shadow-soft transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center h-16 justify-between">
          <div className="flex-1 flex justify-start items-center">
            {/* LOGO */}
            <Link to="/" className="flex items-center gap-3 group select-none">
              <div className="p-1 rounded-xl shadow-md group-hover:scale-105 transition-transform">
                <img
                  src="/lacaknutri.webp"
                  alt="LacakNutri Logo"
                  className="w-8 h-8 object-cover rounded-lg"
                />
              </div>
              <span className="text-xl font-extrabold text-text-primary tracking-tight hidden sm:block group-hover:text-primary transition-colors">
                LacakNutri
              </span>
            </Link>
          </div>

          {/* DESKTOP NAV */}
          <nav className="hidden md:flex items-center gap-1 bg-bg-base/50 p-1.5 rounded-2xl border border-border/50">
            <Link
              to="/products"
              className={`px-5 py-2 rounded-xl text-sm transition-all duration-200 ${isActive(
                "/products"
              )}`}
            >
              Katalog
            </Link>
            <Link
              to="/scanner"
              className={`px-5 py-2 rounded-xl text-sm transition-all duration-200 ${isActive(
                "/scanner"
              )}`}
            >
              Scanner
            </Link>

            <div className="relative group">
              <button
                className={`px-5 py-2 rounded-xl text-sm transition-all duration-200 flex items-center gap-1 ${
                  location.pathname.startsWith("/favorites") ||
                  location.pathname.startsWith("/history")
                    ? "text-primary bg-primary/10 font-bold"
                    : "text-text-secondary hover:text-primary hover:bg-bg-base font-medium"
                }`}
              >
                Aktivitas
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              <div className="absolute top-full left-0 mt-2 w-48 bg-white dark:bg-neutral-800 border border-border rounded-2xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 overflow-hidden z-50">
                <Link
                  to="/favorites"
                  className="flex items-center gap-3 px-4 py-3 hover:bg-bg-base transition-colors"
                >
                  <svg
                    className="w-5 h-5 text-error"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    />
                  </svg>
                  <div>
                    <p className="font-bold text-sm text-text-primary">
                      Favorit
                    </p>
                    <p className="text-xs text-text-secondary">
                      Produk tersimpan
                    </p>
                  </div>
                </Link>
                <div className="h-px bg-border mx-2"></div>
                <Link
                  to="/history"
                  className="flex items-center gap-3 px-4 py-3 hover:bg-bg-base transition-colors"
                >
                  <svg
                    className="w-5 h-5 text-accent"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <div>
                    <p className="font-bold text-sm text-text-primary">
                      Riwayat
                    </p>
                    <p className="text-xs text-text-secondary">Scan terakhir</p>
                  </div>
                </Link>
              </div>
            </div>

            <Link
              to="/articles"
              className={`px-5 py-2 rounded-xl text-sm transition-all duration-200 ${isActive(
                "/articles"
              )}`}
            >
              Edukasi
            </Link>
          </nav>

          {/* DESKTOP ACTIONS */}
          <div className="flex-1 flex justify-end items-center gap-4">
            <div className="hidden md:flex items-center gap-2">
              <LanguageSwitcher />

              <button
                onClick={() => setIsDark(!isDark)}
                className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-bg-base border border-transparent hover:border-border text-text-secondary hover:text-primary transition-all duration-200"
                title="Ganti Tema"
              >
                {isDark ? SunIcon : MoonIcon}
              </button>

              {user ? (
                <div className="flex items-center gap-3 pl-4 border-l border-border">
                  <Link to="/dashboard">
                    <Button variant="ghost" size="sm" className="font-bold">
                      Dashboard
                    </Button>
                  </Link>

                  {user?.role === "admin" && (
                    <Link to="/admin">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="font-bold text-warning-text"
                      >
                        Admin Panel
                      </Button>
                    </Link>
                  )}

                  <Link to="/profile" className="relative group">
                    <div className="w-10 h-10 rounded-full bg-linear-to-tr from-primary to-orange-400 p-0.5 shadow-md cursor-pointer hover:shadow-primary/30 transition-all">
                      <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden border-2 border-white">
                        {user.photo_url ? (
                          <img
                            src={getPhotoUrl(user.photo_url)}
                            alt={user.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = `https://ui-avatars.com/api/?name=${user.name}&background=FF9966&color=fff`;
                            }}
                          />
                        ) : (
                          <span className="text-primary font-extrabold text-sm">
                            {user.name?.charAt(0).toUpperCase() || "U"}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="text-text-secondary hover:text-error p-2 hover:bg-error/10 rounded-xl transition-colors"
                    title="Keluar"
                  >
                    {LogoutIcon}
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-3 pl-4 border-l border-border">
                  <Link to="/login">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-text-secondary hover:text-text-primary"
                    >
                      Masuk
                    </Button>
                  </Link>
                  <Link to="/register">
                    <Button size="sm" className="shadow-lg shadow-primary/20">
                      Daftar Gratis
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* MOBILE HAMBURGER BUTTON */}
          <div className="md:hidden flex items-center gap-2">
            <LanguageSwitcher />
            <button
              onClick={() => setIsDark(!isDark)}
              className="p-2 text-text-secondary"
            >
              {isDark ? SunIcon : MoonIcon}
            </button>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-text-primary hover:bg-bg-base rounded-xl transition-colors"
            >
              {isMobileMenuOpen ? CloseIcon : MenuIcon}
            </button>
          </div>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-16 left-0 w-full bg-bg-surface/95 backdrop-blur-xl border-b border-border shadow-2xl animate-slide-down p-4 z-40 flex flex-col gap-2">
          {/* Main Navigation */}
          {[
            { to: "/products", label: "Katalog Produk", icon: CatalogIcon },
            { to: "/scanner", label: "Scanner AI", icon: ScannerIcon },
            { to: "/favorites", label: "Favorit Saya", icon: FavoriteIcon },
            { to: "/history", label: "Riwayat Scan", icon: HistoryIcon },
            { to: "/articles", label: "Pusat Edukasi", icon: EduIcon },
          ].map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-bold transition-all ${isActive(
                link.to
              )}`}
            >
              <span
                className={
                  location.pathname.startsWith(link.to)
                    ? "text-primary"
                    : "text-text-secondary"
                }
              >
                {link.icon}
              </span>
              {link.label}
            </Link>
          ))}

          <div className="h-px bg-border my-2 w-full opacity-50"></div>

          {/* User Actions */}
          {user ? (
            <div className="space-y-2">
              <Link
                to="/dashboard"
                className="flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-bg-base font-bold text-text-primary transition-colors"
              >
                <span className="text-text-secondary">{DashboardIcon}</span>
                Dashboard Saya
              </Link>
              {user?.role === "admin" && (
                <Link
                  to="/admin"
                  className="flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-bg-base font-bold text-warning-text transition-colors"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  Admin Panel
                </Link>
              )}

              <Link
                to="/profile"
                className="flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-bg-base font-bold text-text-primary transition-colors"
              >
                <span className="text-text-secondary">{ProfileIcon}</span>
                Edit Profil
              </Link>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-error/10 text-error font-bold text-left transition-colors"
              >
                {LogoutIcon}
                Keluar Aplikasi
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 mt-2">
              <Link to="/login">
                <Button variant="outline" fullWidth className="h-12 font-bold">
                  Masuk
                </Button>
              </Link>
              <Link to="/register">
                <Button
                  fullWidth
                  className="h-12 shadow-lg shadow-primary/20 font-bold"
                >
                  Daftar
                </Button>
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

export default Header;
