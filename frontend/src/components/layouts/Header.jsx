import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Button from "../ui/Button";

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Helper untuk menandai menu aktif
  const isActive = (path) =>
    location.pathname.startsWith(path)
      ? "text-primary font-bold"
      : "text-text-primary hover:text-primary font-medium";

  return (
    <header className="sticky top-0 z-50 bg-bg-surface/80 backdrop-blur-md border-b border-border shadow-soft">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors duration-300">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <span className="text-xl font-extrabold text-text-primary tracking-tight">
              LacakNutri
            </span>
          </Link>

          {/* Navigation (Selalu Muncul - Guest & User) */}
          <nav className="hidden md:flex items-center gap-8">
            <Link
              to="/products"
              className={`${isActive("/products")} transition-colors`}
            >
              Cari Produk
            </Link>
            <Link
              to="/scanner"
              className={`${isActive("/scanner")} transition-colors`}
            >
              Scanner
            </Link>
            <Link
              to="/articles"
              className={`${isActive("/articles")} transition-colors`}
            >
              Edukasi
            </Link>
          </nav>

          {/* Auth Actions */}
          <div className="flex items-center gap-3">
            {user ? (
              <>
                <Link to="/dashboard" className="hidden sm:block">
                  <Button variant="ghost" size="sm">
                    Dashboard
                  </Button>
                </Link>
                <div className="h-8 w-px bg-border hidden sm:block"></div>
                <Link to="/profile">
                  <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold border border-primary/20 cursor-pointer hover:bg-primary hover:text-white transition-all">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                </Link>
              </>
            ) : (
              <>
                <Link to="/login" className="hidden sm:block">
                  <Button variant="ghost" size="sm">
                    Masuk
                  </Button>
                </Link>
                <Link to="/register">
                  <Button
                    variant="primary"
                    size="sm"
                    className="shadow-lg shadow-primary/20"
                  >
                    Daftar
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
