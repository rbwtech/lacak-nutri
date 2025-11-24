import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../context/AuthContext";

const Footer = () => {
  const { t } = useTranslation();
  const { user } = useAuth();

  return (
    <footer className="bg-bg-surface border-t border-border mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div
          className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-${
            user ? "5" : "4"
          } gap-8`}
        >
          {/* Brand Section */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="p-1 rounded-lg shadow-md">
                <img
                  src="/lacaknutri.svg"
                  alt="LacakNutri Logo"
                  className="w-7.5 h-7.5 object-contain rounded-md"
                />
              </div>
              <span className="text-h4 font-bold text-text-primary">
                LacakNutri
              </span>
            </div>
            <p className="text-label text-text-secondary">
              {t("footer.platformDesc")}
            </p>
          </div>

          {/* Features Section */}
          <div>
            <h4 className="font-semibold text-text-primary mb-3">
              {t("footer.featuresTitle")}
            </h4>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/products"
                  className="text-label text-text-secondary hover:text-primary"
                >
                  {t("footer.searchProducts")}
                </Link>
              </li>
              <li>
                <Link
                  to="/scanner"
                  className="text-label text-text-secondary hover:text-primary"
                >
                  {t("footer.scanner")}
                </Link>
              </li>
              <li>
                <Link
                  to="/articles"
                  className="text-label text-text-secondary hover:text-primary"
                >
                  {t("footer.articles")}
                </Link>
              </li>
            </ul>
          </div>

          {user && (
            <div>
              <h4 className="font-semibold text-text-primary mb-3">
                {t("header.activity")}
              </h4>
              <ul className="space-y-2">
                <li>
                  <Link
                    to="/favorites"
                    className="text-label text-text-secondary hover:text-primary"
                  >
                    {t("header.favoritesMenuTitle")}
                  </Link>
                </li>
                <li>
                  <Link
                    to="/history"
                    className="text-label text-text-secondary hover:text-primary"
                  >
                    {t("header.historyMenuTitle")}
                  </Link>
                </li>
              </ul>
            </div>
          )}

          {/* Info Section */}
          <div>
            <h4 className="font-semibold text-text-primary mb-3">
              {t("footer.infoTitle")}
            </h4>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/about"
                  className="text-label text-text-secondary hover:text-primary"
                >
                  {t("footer.about")}
                </Link>
              </li>
              <li>
                <Link
                  to="/faq"
                  className="text-label text-text-secondary hover:text-primary"
                >
                  {t("footer.faq")}
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="text-label text-text-secondary hover:text-primary"
                >
                  {t("footer.contact")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal Section */}
          <div>
            <h4 className="font-semibold text-text-primary mb-3">
              {t("footer.legalTitle")}
            </h4>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/privacy"
                  className="text-label text-text-secondary hover:text-primary"
                >
                  {t("footer.privacy")}
                </Link>
              </li>
              <li>
                <Link
                  to="/terms"
                  className="text-label text-text-secondary hover:text-primary"
                >
                  {t("footer.terms")}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-6 text-center">
          <p className="text-label text-text-secondary">
            {t("footer.copyright")}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
