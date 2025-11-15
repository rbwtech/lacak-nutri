import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Button from "../ui/Button";

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-50 bg-bg-surface border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">LN</span>
            </div>
            <span className="text-h4 font-bold text-text-primary">
              LacakNutri
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <Link
              to="/products"
              className="text-base text-text-primary hover:text-primary transition-colors"
            >
              Produk
            </Link>
            <Link
              to="/scanner"
              className="text-base text-text-primary hover:text-primary transition-colors"
            >
              Scanner
            </Link>
            <Link
              to="/articles"
              className="text-base text-text-primary hover:text-primary transition-colors"
            >
              Artikel
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            {user ? (
              <>
                <Link to="/dashboard">
                  <Button variant="ghost" size="sm">
                    Dashboard
                  </Button>
                </Link>
                <Button variant="outline" size="sm" onClick={handleLogout}>
                  Keluar
                </Button>
              </>
            ) : (
              <>
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
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
