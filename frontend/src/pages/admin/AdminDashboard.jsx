import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { MainLayout } from "../../components/layouts";
import Card from "../../components/ui/Card";
import api from "../../config/api";
import { useTranslation } from "react-i18next";

const AdminDashboard = () => {
  const { t } = useTranslation();
  const [stats, setStats] = useState({
    users: 0,
    scans: 0,
    articles: 0,
    products: 0,
    allergens: 0,
    additives: 0,
    diseases: 0,
    localization: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await api.get("/admin/stats");
        setStats(data);
      } catch (e) {
        console.error("Failed to load stats", e);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const adminMenus = [
    {
      title: t("admin.user.title"),
      desc: t("admin.user.desc"),
      to: "/admin/users",
      icon: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
        />
      ),
      color: "text-blue-500",
      bg: "bg-blue-50",
      count: stats.users,
    },
    {
      title: t("admin.history.title"),
      desc: t("admin.history.desc"),
      to: "/admin/history",
      icon: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      ),
      color: "text-green-500",
      bg: "bg-green-50",
      count: stats.scans,
    },
    {
      title: t("admin.article.title"),
      desc: t("admin.article.desc"),
      to: "/admin/articles",
      icon: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
        />
      ),
      color: "text-purple-500",
      bg: "bg-purple-50",
      count: stats.articles,
    },
    {
      title: t("admin.product.title"),
      desc: t("admin.product.desc"),
      to: "/admin/products",
      icon: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
        />
      ),
      color: "text-orange-500",
      bg: "bg-orange-50",
      count: stats.products,
    },
    {
      title: t("admin.allergen.title"),
      desc: t("admin.allergen.desc"),
      to: "/admin/allergens",
      icon: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
        />
      ),
      color: "text-red-500",
      bg: "bg-red-50",
      count: stats.allergens,
    },
    {
      title: t("admin.additive.title"),
      desc: t("admin.additive.desc"),
      to: "/admin/additives",
      icon: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
        />
      ),
      color: "text-yellow-600",
      bg: "bg-yellow-50",
      count: stats.additives,
    },
    {
      title: t("admin.disease.title"),
      desc: t("admin.disease.desc"),
      to: "/admin/diseases",
      icon: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
      ),
      color: "text-pink-500",
      bg: "bg-pink-50",
      count: stats.diseases,
    },
    {
      title: t("admin.localization.title"),
      desc: t("admin.localization.desc"),
      to: "/admin/localization",
      icon: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      ),
      color: "text-indigo-500",
      bg: "bg-indigo-50",
      count: stats.localization,
    },
  ];

  return (
    <MainLayout>
      <div className="bg-bg-base min-h-screen py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10">
            <h1 className="text-3xl font-extrabold text-text-primary mb-2">
              {t("admin.dashboard.title")}
            </h1>
            <p className="text-text-secondary">
              {t("admin.dashboard.subtitle")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {adminMenus.map((menu, idx) => (
              <Link key={idx} to={menu.to}>
                <Card className="p-6 hover:shadow-lg transition-all group cursor-pointer border-2 hover:border-primary/30 h-full flex flex-col">
                  <div
                    className={`w-12 h-12 rounded-2xl ${menu.bg} ${menu.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
                  >
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      {menu.icon}
                    </svg>
                  </div>
                  <h3 className="font-bold text-base text-text-primary mb-1 whitespace-nowrap">
                    {menu.title}
                  </h3>

                  <div className="flex flex-col flex-1">
                    <p className="text-sm text-text-secondary mb-3 line-clamp-2">
                      {menu.desc}
                    </p>
                    {loading ? (
                      <div className="h-6 w-16 bg-gray-100 animate-pulse rounded"></div>
                    ) : (
                      <p className="text-2xl font-extrabold text-primary">
                        {menu.count}
                      </p>
                    )}
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default AdminDashboard;
