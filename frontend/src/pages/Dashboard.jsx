import { useEffect, useState } from "react";
import { MainLayout } from "../components/layouts";
import { useAuth } from "../context/AuthContext";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import { Link } from "react-router-dom";
import api from "../config/api";

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    scans: 0,
    favorites: 0,
    recommendations: 0,
  });
  const [bmi, setBmi] = useState(null);
  const [recentScans, setRecentScans] = useState([]);
  const [dailyTip, setDailyTip] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const dashboardRes = await api.get("/users/dashboard");
        setStats(dashboardRes.data.stats);
        setRecentScans(dashboardRes.data.recent);

        if (user?.weight && user?.height) {
          const bmiValue = (
            user.weight / Math.pow(user.height / 100, 2)
          ).toFixed(1);
          setBmi(parseFloat(bmiValue));
        }

        const tipsRes = await api.get("/education/articles", {
          params: { category: "tips" },
        });

        const articles = tipsRes.data?.data || [];
        if (articles.length > 0) {
          const randomTip =
            articles[Math.floor(Math.random() * articles.length)];
          setDailyTip(randomTip);
        }
      } catch (error) {
        console.error("Dashboard load failed", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  const getBMIStatus = (val) => {
    if (!val)
      return {
        label: "Belum Ada Data",
        color: "text-text-secondary",
        bg: "bg-gray-100",
      };
    if (val < 18.5)
      return {
        label: "Kurang",
        color: "text-warning-text",
        bg: "bg-warning/10",
      };
    if (val < 25)
      return { label: "Ideal", color: "text-success", bg: "bg-success/10" };
    if (val < 30)
      return {
        label: "Lebih",
        color: "text-warning-text",
        bg: "bg-warning/10",
      };
    return { label: "Obesitas", color: "text-error", bg: "bg-error/10" };
  };

  const bmiStatus = getBMIStatus(bmi);

  const DashboardIcon = ({
    path,
    colorClass = "text-primary",
    bgClass = "bg-primary/10",
  }) => (
    <div
      className={`w-12 h-12 rounded-2xl flex items-center justify-center ${bgClass} ${colorClass} mb-3 transition-transform group-hover:scale-110 duration-300 shadow-sm`}
    >
      <svg
        className="w-6 h-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        {path}
      </svg>
    </div>
  );

  const StatCard = ({ label, value, iconPath, color, bg, to }) => {
    const content = (
      <div className="bg-bg-surface border border-border rounded-3xl p-6 flex flex-col items-center justify-center text-center hover:shadow-soft transition-all duration-300 group cursor-pointer h-full relative overflow-hidden">
        <div
          className={`absolute top-0 right-0 w-16 h-16 ${bg} rounded-bl-full opacity-20 -mr-4 -mt-4 transition-all group-hover:scale-150`}
        ></div>
        <DashboardIcon path={iconPath} colorClass={color} bgClass={bg} />
        {loading ? (
          <div className="h-8 w-12 bg-gray-100 animate-pulse rounded mb-1"></div>
        ) : (
          <span className="text-3xl font-extrabold text-text-primary mb-1 tracking-tight">
            {value}
          </span>
        )}
        <span className="text-[11px] font-bold text-text-secondary uppercase tracking-widest">
          {label}
        </span>
      </div>
    );

    return to ? <Link to={to}>{content}</Link> : content;
  };

  return (
    <MainLayout>
      <div className="bg-bg-base min-h-screen py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-text-primary mb-2">
                Selamat Pagi,{" "}
                <span className="text-transparent bg-clip-text bg-linear-to-r from-primary to-orange-600">
                  {user?.name?.split(" ")[0] || "Kawan"}
                </span>
              </h1>
              <p className="text-text-secondary font-medium">
                Siap memantau nutrisi hari ini?
              </p>
            </div>
            <div className="flex gap-3">
              <Link to="/scanner">
                <Button className="shadow-lg shadow-primary/20 flex items-center gap-2 px-6">
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
                      d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  Scan Produk
                </Button>
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
            <StatCard
              label="Total Scan"
              value={stats.scans}
              color="text-primary"
              bg="bg-primary/10"
              to="/history"
              iconPath={
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
                />
              }
            />

            <StatCard
              label="Favorit"
              value={stats.favorites}
              color="text-error"
              bg="bg-error/10"
              to="/favorites"
              iconPath={
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              }
            />

            <StatCard
              label="BMI"
              value={bmi ? bmi : "--"}
              color={bmiStatus.color}
              bg={bmiStatus.bg}
              to="/profile"
              iconPath={
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              }
            />

            <StatCard
              label="Analisis AI"
              value={stats.recommendations}
              color="text-warning-text"
              bg="bg-warning/10"
              to="/history"
              iconPath={
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              }
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 flex flex-col gap-8">
              <div className="bg-bg-surface rounded-3xl border border-border p-6 md:p-8 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-bold text-xl text-text-primary">
                    Aktivitas Terakhir
                  </h3>
                  <Link
                    to="/history"
                    className="text-sm font-bold text-primary hover:underline"
                  >
                    Lihat Semua
                  </Link>
                </div>

                {loading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="h-20 w-full bg-gray-100 rounded-2xl animate-pulse"
                      ></div>
                    ))}
                  </div>
                ) : recentScans.length > 0 ? (
                  <div className="space-y-4">
                    {recentScans.map((item) => (
                      <div
                        key={item.id}
                        className="group flex items-center p-4 rounded-2xl border border-border hover:border-primary/30 hover:bg-bg-base transition-all cursor-default"
                      >
                        <div
                          className={`w-12 h-12 rounded-xl flex items-center justify-center mr-4 ${
                            item.type === "ocr"
                              ? "bg-blue-50 text-blue-500"
                              : "bg-green-50 text-green-500"
                          }`}
                        >
                          {item.type === "ocr" ? (
                            <svg
                              className="w-6 h-6"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                              />
                            </svg>
                          ) : (
                            <svg
                              className="w-6 h-6"
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
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-text-primary text-sm truncate">
                            {item.title}
                          </h4>
                          <p className="text-xs text-text-secondary truncate">
                            {item.subtitle}
                          </p>
                        </div>
                        <div className="text-right pl-4">
                          {item.score && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-bold bg-primary/10 text-primary mb-1">
                              {item.score}/10
                            </span>
                          )}
                          <p className="text-[10px] text-text-secondary font-medium">
                            {new Date(item.date).toLocaleDateString("id-ID", {
                              day: "numeric",
                              month: "short",
                            })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-12 text-center bg-bg-base rounded-2xl border border-dashed border-border">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
                      <svg
                        className="w-8 h-8"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                        />
                      </svg>
                    </div>
                    <p className="text-text-secondary text-sm font-medium mb-4">
                      Belum ada riwayat scan.
                    </p>
                    <Link to="/scanner">
                      <Button variant="outline" size="sm">
                        Mulai Scan
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-8">
              <div className="bg-linear-to-br from-primary to-orange-500 rounded-3xl p-6 text-white shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-10 -mt-10 blur-xl"></div>
                <div className="relative z-10">
                  <h3 className="font-bold text-lg mb-2">Database Produk</h3>
                  <p className="text-white/90 text-sm mb-6 leading-relaxed">
                    Cari informasi nilai gizi dari ribuan produk yang sudah
                    terdaftar.
                  </p>
                  <Link to="/products">
                    <button className="w-full py-3 bg-white text-primary font-bold rounded-xl hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 text-sm">
                      <svg
                        className="w-4 h-4"
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
                      Cari Sekarang
                    </button>
                  </Link>
                </div>
              </div>

              <div className="bg-bg-surface border border-border rounded-3xl p-6 relative overflow-hidden">
                <div className="absolute top-4 right-4 text-warning-text opacity-20">
                  <svg
                    className="w-16 h-16"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1h4v1a2 2 0 11-4 0zM12 14c.015-.34.208-.646.477-.859a4 4 0 10-4.954 0c.27.213.462.519.476.859h4.002z" />
                  </svg>
                </div>
                <h4 className="font-bold text-text-primary mb-3 flex items-center gap-2">
                  Tips Sehat
                </h4>
                {dailyTip ? (
                  <>
                    <h5 className="font-bold text-sm text-primary mb-2">
                      {dailyTip.title}
                    </h5>
                    <p className="text-xs text-text-secondary leading-relaxed line-clamp-4">
                      {(dailyTip.content || "").replace(/<[^>]+>/g, "")}
                    </p>
                    <Link
                      to={`/articles/${dailyTip.slug}`}
                      className="text-xs font-bold text-text-primary hover:text-primary mt-3 block underline decoration-primary/30"
                    >
                      Baca Selengkapnya
                    </Link>
                  </>
                ) : (
                  <p className="text-xs text-text-secondary">
                    Memuat tips kesehatan untuk Anda...
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Dashboard;
