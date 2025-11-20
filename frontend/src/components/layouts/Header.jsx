import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Button from "../ui/Button";

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [isDark, setIsDark] = useState(() => {
    return localStorage.getItem("theme") === "dark";
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDark]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isActive = (path) =>
    location.pathname.startsWith(path)
      ? "text-primary font-bold"
      : "text-text-primary hover:text-primary font-medium";

  return (
    <header className="sticky top-0 z-50 bg-bg-surface/90 backdrop-blur-md border-b border-border shadow-soft transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center h-16">
          <div className="flex-1 flex justify-start">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
                <span className="font-extrabold text-lg">LN</span>
              </div>
              <span className="text-xl font-extrabold text-text-primary tracking-tight hidden sm:block">
                LacakNutri
              </span>
            </Link>
          </div>

          <nav className="hidden md:flex items-center gap-8">
            <Link
              to="/products"
              className={`${isActive("/products")} transition-colors text-sm`}
            >
              Katalog
            </Link>
            <Link
              to="/scanner"
              className={`${isActive("/scanner")} transition-colors text-sm`}
            >
              Scanner
            </Link>
            <Link
              to="/articles"
              className={`${isActive("/articles")} transition-colors text-sm`}
            >
              Edukasi
            </Link>
          </nav>

          <div className="flex-1 flex justify-end items-center gap-3">
            <button
              onClick={() => setIsDark(!isDark)}
              className="p-2 rounded-full hover:bg-border text-text-secondary transition-colors"
            >
              {isDark ? (
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
              ) : (
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
              )}
            </button>

            {user ? (
              <div className="flex items-center gap-3">
                <Link to="/dashboard" className="hidden sm:block">
                  <Button variant="ghost" size="sm">
                    Dashboard
                  </Button>
                </Link>
                <div className="relative group">
                  <Link to="/profile">
                    <div className="w-9 h-9 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm border-2 border-white shadow-md cursor-pointer hover:bg-primary-hover transition-colors">
                      {user.name?.charAt(0).toUpperCase() || "U"}
                    </div>
                  </Link>
                </div>
                <button
                  onClick={handleLogout}
                  className="text-text-secondary hover:text-error transition-colors p-2"
                  title="Keluar"
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
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    />
                  </svg>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login">
                  <Button variant="ghost" size="sm">
                    Masuk
                  </Button>
                </Link>
                <Link to="/register">
                  <Button variant="primary" size="sm">
                    Daftar
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
