import { useEffect, useState } from "react";
import { MainLayout } from "../components/layouts";
import { useAuth } from "../context/AuthContext";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import { Link } from "react-router-dom";
import api from "../config/api"; // Import API config

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
    const fetchDashboardData = async () => {
      try {
        // Nanti diganti dengan endpoint API yang sebenarnya
        // const { data } = await api.get('/user/dashboard');
        // setStats(data.stats);
        // setRecentScans(data.recent);
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const StatCard = ({ label, value, icon }) => (
    <Card className="text-center flex flex-col items-center justify-center py-6">
      <div className="text-4xl mb-3 bg-bg-base p-3 rounded-full">{icon}</div>
      {loading ? (
        <div className="h-8 w-16 bg-gray-200 animate-pulse rounded mb-1"></div>
      ) : (
        <div className="text-3xl font-bold text-text-primary mb-1">{value}</div>
      )}
      <div className="text-sm text-text-secondary font-medium">{label}</div>
    </Card>
  );

  return (
    <MainLayout>
      <div className="bg-bg-base min-h-screen py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-text-primary mb-2">
              Halo, {user?.name || "Pengguna"}! 👋
            </h1>
            <p className="text-text-secondary">
              Ringkasan aktivitas nutrisi Anda
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <StatCard label="Produk Dipindai" value={stats.scans} icon="📱" />
            <StatCard label="Favorit" value={stats.favorites} icon="❤️" />
            <StatCard label="Riwayat" value={stats.history} icon="📊" />
            <StatCard
              label="Saran AI"
              value={stats.recommendations}
              icon="✨"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Riwayat Scan */}
            <div className="lg:col-span-2">
              <Card title="Riwayat Scan Terakhir" className="h-full">
                {loading ? (
                  <div className="space-y-4 animate-pulse">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="h-20 bg-gray-100 rounded-xl"
                      ></div>
                    ))}
                  </div>
                ) : recentScans.length > 0 ? (
                  <div className="space-y-4">
                    {recentScans.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-4 bg-bg-base rounded-xl border border-border"
                      >
                        <div>
                          <h4 className="font-bold text-text-primary">
                            {item.name}
                          </h4>
                          <p className="text-xs text-text-secondary">
                            {item.brand}
                          </p>
                        </div>
                        {/* Grade Indicator */}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10 text-text-secondary">
                    <p className="mb-4">Belum ada riwayat scan.</p>
                    <Link to="/scanner">
                      <Button size="sm">Mulai Scan Sekarang</Button>
                    </Link>
                  </div>
                )}
              </Card>
            </div>

            {/* Quick Actions & Tips */}
            <div className="space-y-6">
              <Card title="Aksi Cepat">
                <div className="grid gap-3">
                  <Link to="/scanner">
                    <Button fullWidth className="justify-start">
                      📱 Scan Barcode/OCR
                    </Button>
                  </Link>
                  <Link to="/products">
                    <Button
                      variant="outline"
                      fullWidth
                      className="justify-start"
                    >
                      🔍 Cari Produk
                    </Button>
                  </Link>
                </div>
              </Card>

              <Card title="Tips Hari Ini">
                <p className="text-sm text-text-secondary leading-relaxed">
                  "Kurangi konsumsi natrium harian hingga di bawah 2000mg untuk
                  menjaga tekanan darah tetap normal."
                </p>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Dashboard;
