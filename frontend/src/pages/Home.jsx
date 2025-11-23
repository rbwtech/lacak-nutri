import { Link } from "react-router-dom";
import { MainLayout } from "../components/layouts";
import Button from "../components/ui/Button";
import { useAuth } from "../context/AuthContext";
import { useTranslation } from "react-i18next";

const Home = () => {
  const { t } = useTranslation();
  const { user } = useAuth();

  return (
    <MainLayout>
      <section className="bg-linear-to-b from-bg-surface to-bg-base py-20 relative overflow-hidden">
        {/* Background Decoration */}
        <div className="absolute top-0 left-0 w-full h-full opacity-30 pointer-events-none">
          <div className="absolute top-10 left-10 w-64 h-64 bg-primary/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-64 h-64 bg-secondary/20 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <span className="inline-block py-1 px-3 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider mb-4">
              {t("home.tagline")}
            </span>
            <h1 className="text-4xl md:text-6xl font-extrabold text-text-primary mb-6 leading-tight">
              {t("home.headlineStart")}{" "}
              <span className="text-transparent bg-clip-text bg-linear-to-r from-primary to-orange-600">
                {t("home.headlineEnd")}
              </span>
            </h1>
            <p className="text-lg md:text-xl text-text-secondary mb-10 leading-relaxed">
              {t("home.subHeadline")}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {user ? (
                <Link to="/dashboard">
                  <Button
                    size="lg"
                    className="shadow-lg shadow-primary/30 border-2 border-transparent"
                  >
                    {t("home.openDashboard")} &rarr;
                  </Button>
                </Link>
              ) : (
                <Link to="/register">
                  <Button
                    size="lg"
                    className="shadow-lg shadow-primary/30 border-2 border-transparent"
                  >
                    {t("home.startFree")}
                  </Button>
                </Link>
              )}

              <Link to="/scanner">
                <Button
                  variant="outline"
                  size="lg"
                  className="bg-white/20 backdrop-blur-sm border-border"
                >
                  {t("home.tryScanner")}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-bg-base">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-text-primary mb-4">
              {t("home.featuresTitle")}
            </h2>
            <p className="text-base text-text-secondary">
              {t("home.featuresSubTitle")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Kartu Fitur 1: Scanner Barcode & OCR */}
            <div className="bg-bg-surface rounded-2xl border border-border p-8 shadow-soft hover:shadow-lg transition-all duration-300 hover:-translate-y-1 text-center flex flex-col items-center">
              <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 text-primary">
                <svg
                  className="w-8 h-8"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-text-primary mb-3">
                {t("home.feature1Title")}
              </h3>
              <p className="text-sm text-text-secondary leading-relaxed">
                {t("home.feature1Desc")}
              </p>
            </div>

            {/* Kartu Fitur 2: Validasi BPOM */}
            <div className="bg-bg-surface rounded-2xl border border-border p-8 shadow-soft hover:shadow-lg transition-all duration-300 hover:-translate-y-1 text-center flex flex-col items-center">
              <div className="w-14 h-14 bg-accent/10 rounded-2xl flex items-center justify-center mb-6 text-accent">
                <svg
                  className="w-8 h-8"
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
              <h3 className="text-xl font-bold text-text-primary mb-3">
                {t("home.feature2Title")}
              </h3>
              <p className="text-sm text-text-secondary leading-relaxed">
                {t("home.feature2Desc")}
              </p>
            </div>

            {/* Kartu Fitur 3: Analisis AI */}
            <div className="bg-bg-surface rounded-2xl border border-border p-8 shadow-soft hover:shadow-lg transition-all duration-300 hover:-translate-y-1 text-center flex flex-col items-center">
              <div className="w-14 h-14 bg-secondary/10 rounded-2xl flex items-center justify-center mb-6 text-secondary">
                <svg
                  className="w-8 h-8"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-text-primary mb-3">
                {t("home.feature3Title")}
              </h3>
              <p className="text-sm text-text-secondary leading-relaxed">
                {t("home.feature3Desc")}
              </p>
            </div>
          </div>
        </div>
      </section>
    </MainLayout>
  );
};

export default Home;
