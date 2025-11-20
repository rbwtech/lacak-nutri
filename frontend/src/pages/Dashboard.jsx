import { useEffect, useState } from "react";
import { MainLayout } from "../components/layouts";
import { useAuth } from "../context/AuthContext";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import { Link } from "react-router-dom";

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    scans: 0,
    favorites: 0,
    history: 0,
    recommendations: 0,
  });
  const [recentScans, setRecentScans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulasi fetch data
    setTimeout(() => setLoading(false), 500);
  }, []);

  // Komponen Icon Premium
  const Icons = {
    scan: (
      <svg
        className="w-6 h-6 text-primary"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
        />
      </svg>
    ),
    heart: (
      <svg
        className="w-6 h-6 text-error"
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
    ),
    history: (
      <svg
        className="w-6 h-6 text-accent"
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
    ),
    bulb: (
      <svg
        className="w-6 h-6 text-warning-text"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548 5.478a1 1 0 01-.994.909H11.753a1 1 0 01-.994-.909l-.548-5.478z"
        />
      </svg>
    ),
  };

  const StatCard = ({ label, value, iconKey }) => (
    <Card className="text-center flex flex-col items-center justify-center py-6 hover:shadow-soft transition-shadow">
      <div className="p-3 bg-bg-base rounded-2xl mb-3 border border-border">
        {Icons[iconKey]}
      </div>
      {loading ? (
        <div className="h-8 w-16 bg-gray-100 animate-pulse rounded mb-1"></div>
      ) : (
        <div className="text-3xl font-extrabold text-text-primary mb-1">
          {value}
        </div>
      )}
      <div className="text-xs font-bold text-text-secondary uppercase tracking-wider">
        {label}
      </div>
    </Card>
  );

  return (
    <MainLayout>
      <div className="bg-bg-base min-h-screen py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-extrabold text-text-primary mb-2">
              Halo, {user?.name?.split(" ")[0] || "Pengguna"}!
            </h1>
            <p className="text-text-secondary font-medium">
              Ringkasan aktivitas nutrisi Anda
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <StatCard label="Produk" value={stats.scans} iconKey="scan" />
            <StatCard label="Favorit" value={stats.favorites} iconKey="heart" />
            <StatCard label="Riwayat" value={stats.history} iconKey="history" />
            <StatCard
              label="Saran AI"
              value={stats.recommendations}
              iconKey="bulb"
            />
          </div>

          {/* ... (Sisa kode Riwayat & Quick Actions tetap sama, pastikan button pakai SVG juga jika perlu) ... */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card title="Riwayat Scan Terakhir" className="h-full">
                {/* ... Logic loading & list sama ... */}
                <div className="text-center py-10 text-text-secondary">
                  <p className="mb-4">Belum ada riwayat scan.</p>
                  <Link to="/scanner">
                    <Button size="sm">Mulai Scan Sekarang</Button>
                  </Link>
                </div>
              </Card>
            </div>

            <div className="space-y-6">
              <Card title="Aksi Cepat">
                <div className="grid gap-3">
                  <Link to="/scanner">
                    <Button fullWidth className="justify-start gap-2">
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
                          d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
                        />
                      </svg>
                      Scan Barcode/OCR
                    </Button>
                  </Link>
                  <Link to="/products">
                    <Button
                      variant="outline"
                      fullWidth
                      className="justify-start gap-2"
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
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                      </svg>
                      Cari Produk
                    </Button>
                  </Link>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Dashboard;
