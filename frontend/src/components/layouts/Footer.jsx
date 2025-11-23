import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

const Footer = () => {
  const { t } = useTranslation();
  return (
    <footer className="bg-bg-surface border-t border-border mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
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
