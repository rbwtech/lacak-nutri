import { MainLayout } from "../components/layouts";
import { useAuth } from "../context/AuthContext";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import { Link } from "react-router-dom";

const Dashboard = () => {
  const { user } = useAuth();

  const stats = [
    { label: "Produk Dipindai", value: "24", icon: "📱" },
    { label: "Favorit", value: "12", icon: "❤️" },
    { label: "Riwayat", value: "156", icon: "📊" },
    { label: "Rekomendasi", value: "8", icon: "✨" },
  ];

  const recentScans = [
    {
      name: "Indomie Goreng",
      brand: "Indofood",
      date: "2 jam lalu",
      grade: "B",
    },
    { name: "Teh Botol Sosro", brand: "Sosro", date: "5 jam lalu", grade: "A" },
    {
      name: "Chitato Rasa Sapi Panggang",
      brand: "Indofood",
      date: "Kemarin",
      grade: "C",
    },
  ];

  return (
    <MainLayout>
      <div className="bg-bg-base min-h-screen py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-h2 font-bold text-text-primary mb-2">
              Halo, {user?.name || "User"}! 👋
            </h1>
            <p className="text-base text-text-secondary">
              Selamat datang kembali di LacakNutri
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => (
              <Card key={index} className="text-center">
                <div className="text-4xl mb-3">{stat.icon}</div>
                <div className="text-h3 font-bold text-text-primary mb-1">
                  {stat.value}
                </div>
                <div className="text-label text-text-secondary">
                  {stat.label}
                </div>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card title="Riwayat Scan Terakhir">
                <div className="space-y-4">
                  {recentScans.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 bg-bg-base rounded-lg"
                    >
                      <div className="flex-1">
                        <h4 className="font-semibold text-text-primary">
                          {item.name}
                        </h4>
                        <p className="text-label text-text-secondary">
                          {item.brand}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-caption text-text-secondary">
                          {item.date}
                        </span>
                        <div
                          className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold ${
                            item.grade === "A"
                              ? "bg-success/20 text-success"
                              : item.grade === "B"
                              ? "bg-primary/20 text-primary"
                              : "bg-warning/20 text-warning-text"
                          }`}
                        >
                          {item.grade}
                        </div>
                      </div>
                    </div>
                  ))}
                  <Link to="/products">
                    <Button variant="ghost" className="w-full">
                      Lihat Semua Riwayat
                    </Button>
                  </Link>
                </div>
              </Card>
            </div>

            <div>
              <Card title="Quick Actions">
                <div className="space-y-3">
                  <Link to="/scanner">
                    <Button fullWidth className="justify-start">
                      📱 Scan Produk
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
                  <Link to="/profile">
                    <Button
                      variant="outline"
                      fullWidth
                      className="justify-start"
                    >
                      👤 Edit Profil
                    </Button>
                  </Link>
                  <Link to="/articles">
                    <Button
                      variant="outline"
                      fullWidth
                      className="justify-start"
                    >
                      📰 Baca Artikel
                    </Button>
                  </Link>
                </div>
              </Card>

              <Card title="Tips Hari Ini" className="mt-6">
                <div className="text-label text-text-secondary">
                  <p className="mb-3">
                    Pastikan asupan gula harian tidak melebihi 50 gram per hari
                    untuk menjaga kesehatan.
                  </p>
                  <Link to="/articles" className="text-primary hover:underline">
                    Baca tips lainnya →
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
