import { Link } from "react-router-dom";
import { MainLayout } from "../components/layouts";
import Button from "../components/ui/Button";

const Home = () => {
  return (
    <MainLayout>
      <section className="bg-gradient-to-b from-bg-surface to-bg-base py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-h1 font-bold text-text-primary mb-6">
              Pantau Nutrisi Makanan dengan Mudah
            </h1>
            <p className="text-h4 text-text-secondary mb-8">
              Scan barcode, analisis nutrisi, dan validasi BPOM untuk pilihan
              makanan lebih sehat
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register">
                <Button size="lg">Mulai Gratis</Button>
              </Link>
              <Link to="/scanner">
                <Button variant="outline" size="lg">
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
            <div className="bg-bg-surface rounded-xl border border-border p-6">
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

            <div className="bg-bg-surface rounded-xl border border-border p-6">
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

            <div className="bg-bg-surface rounded-xl border border-border p-6">
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

      <section className="py-16 bg-bg-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-h2 font-bold text-text-primary mb-4">
              Siap Hidup Lebih Sehat?
            </h2>
            <p className="text-base text-text-secondary mb-8">
              Bergabung dengan ribuan pengguna yang sudah memantau nutrisi
              makanan mereka
            </p>
            <Link to="/register">
              <Button size="lg">Daftar Sekarang</Button>
            </Link>
          </div>
        </div>
      </section>
    </MainLayout>
  );
};

export default Home;
