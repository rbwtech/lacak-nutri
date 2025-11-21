import { Link } from "react-router-dom";
import { MainLayout } from "../components/layouts";
import Button from "../components/ui/Button";
import { useAuth } from "../context/AuthContext";

const Home = () => {
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
              #1 Health Companion
            </span>
            <h1 className="text-4xl md:text-6xl font-extrabold text-text-primary mb-6 leading-tight">
              Pantau Nutrisi Makanan dengan{" "}
              <span className="text-transparent bg-clip-text bg-linear-to-r from-primary to-red-500">
                Cerdas
              </span>
            </h1>
            <p className="text-lg md:text-xl text-text-secondary mb-10 leading-relaxed">
              Scan barcode, analisis nutrisi instan, dan validasi BPOM dalam
              satu aplikasi. Pilihan cerdas untuk hidup lebih sehat.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {user ? (
                <Link to="/dashboard">
                  <Button size="lg" className="shadow-lg shadow-primary/30">
                    Buka Dashboard &rarr;
                  </Button>
                </Link>
              ) : (
                <Link to="/register">
                  <Button size="lg" className="shadow-lg shadow-primary/30">
                    Mulai Gratis Sekarang
                  </Button>
                </Link>
              )}

              <Link to="/scanner">
                <Button
                  variant="outline"
                  size="lg"
                  className="bg-white/50 backdrop-blur-sm"
                >
                  Coba Scanner
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-bg-base">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-h2 font-bold text-text-primary mb-4">
              Fitur Unggulan
            </h2>
            <p className="text-base text-text-secondary">
              Semua yang Anda butuhkan untuk hidup sehat
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Kartu Fitur 1: Scanner Barcode & OCR */}
            <div className="bg-bg-surface rounded-xl border border-border p-6 shadow-soft hover:shadow-lg transition-shadow duration-300 transform hover:-translate-y-1">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <svg
                  className="w-6 h-6 text-primary"
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
              <h3 className="text-h4 font-semibold text-text-primary mb-2">
                Scanner Barcode & OCR
              </h3>
              <p className="text-base text-text-secondary">
                Scan barcode atau foto kemasan untuk info nutrisi lengkap
              </p>
            </div>

            {/* Kartu Fitur 2: Validasi BPOM */}
            <div className="bg-bg-surface rounded-xl border border-border p-6 shadow-soft hover:shadow-lg transition-shadow duration-300 transform hover:-translate-y-1">
              <div className="w-12 h-12 bg-accent/20 rounded-lg flex items-center justify-center mb-4">
                <svg
                  className="w-6 h-6 text-accent"
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
              <h3 className="text-h4 font-semibold text-text-primary mb-2">
                Validasi BPOM
              </h3>
              <p className="text-base text-text-secondary">
                Cek status registrasi BPOM produk makanan dan minuman
              </p>
            </div>

            {/* Kartu Fitur 3: Analisis AI */}
            <div className="bg-bg-surface rounded-xl border border-border p-6 shadow-soft hover:shadow-lg transition-shadow duration-300 transform hover:-translate-y-1">
              <div className="w-12 h-12 bg-secondary/20 rounded-lg flex items-center justify-center mb-4">
                <svg
                  className="w-6 h-6 text-secondary"
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
              <h3 className="text-h4 font-semibold text-text-primary mb-2">
                Analisis AI
              </h3>
              <p className="text-base text-text-secondary">
                Rekomendasi nutrisi personal dengan teknologi Gemini AI
              </p>
            </div>
          </div>
        </div>
      </section>
    </MainLayout>
  );
};

export default Home;
