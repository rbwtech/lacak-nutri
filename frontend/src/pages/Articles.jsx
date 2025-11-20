import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { MainLayout } from "../components/layouts";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import api from "../config/api";

const Articles = () => {
  const [activeCategory, setActiveCategory] = useState("all");
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  const categories = [
    { id: "all", label: "Semua" },
    { id: "gizi", label: "Gizi" },
    { id: "aditif", label: "Aditif" },
    { id: "penyakit", label: "Penyakit & Diet" },
    { id: "label", label: "Membaca Label" },
    { id: "tips", label: "Tips Sehat" },
  ];

  useEffect(() => {
    const fetchArticles = async () => {
      setLoading(true);
      try {
        const response = await api.get(`/education/articles`, {
          params: {
            category: activeCategory === "all" ? undefined : activeCategory,
          },
        });

        setArticles(response.data || []);
      } catch (error) {
        console.error("Gagal memuat artikel:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, [activeCategory]);

  return (
    <MainLayout>
      <div className="bg-bg-base min-h-screen py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8 text-center md:text-left">
            <h1 className="text-3xl font-bold text-text-primary mb-2">
              Pusat Edukasi Gizi
            </h1>
            <p className="text-text-secondary">
              Artikel dan panduan terpercaya untuk hidup lebih sehat.
            </p>
          </div>

          {/* Category Filter */}
          <div className="flex gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide">
            {categories.map((cat) => (
              <Button
                key={cat.id}
                variant={activeCategory === cat.id ? "primary" : "outline"}
                size="sm"
                className="whitespace-nowrap rounded-full"
                onClick={() => setActiveCategory(cat.id)}
              >
                {cat.label}
              </Button>
            ))}
          </div>

          {/* Content Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-64 bg-white rounded-3xl border border-border animate-pulse p-6"
                >
                  <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                </div>
              ))}
            </div>
          ) : articles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {articles.map((article) => (
                <Link key={article.id} to={`/articles/${article.slug}`}>
                  <Card hover className="h-full flex flex-col">
                    {article.thumbnail_url && (
                      <img
                        src={article.thumbnail_url}
                        alt={article.title}
                        className="w-full h-40 object-cover rounded-t-xl mb-4 -mt-6 -mx-6"
                      />
                    )}
                    <div className="flex items-start justify-between mb-3 mt-2">
                      <span className="text-xs font-bold text-primary uppercase tracking-wider bg-primary/10 px-2 py-1 rounded-lg">
                        {article.category}
                      </span>
                      <span className="text-xs text-text-secondary">
                        {article.read_time || "5 min"}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-text-primary mb-2 line-clamp-2">
                      {article.title}
                    </h3>
                    {/* Render HTML content strip tags untuk preview */}
                    <p className="text-sm text-text-secondary mb-4 line-clamp-3 flex-1">
                      {(article.content || "")
                        .replace(/<[^>]+>/g, "")
                        .substring(0, 100)}
                      ...
                    </p>
                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-border/50">
                      <span className="text-xs text-text-secondary">
                        {new Date(article.created_at).toLocaleDateString(
                          "id-ID",
                          { dateStyle: "medium" }
                        )}
                      </span>
                      <span className="text-primary text-sm font-bold group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                        Baca{" "}
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </span>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-bg-surface rounded-3xl border border-border">
              <div className="text-6xl mb-4">📚</div>
              <h3 className="text-xl font-bold text-text-primary mb-2">
                Belum ada artikel
              </h3>
              <p className="text-text-secondary">
                Coba kategori lain atau nantikan konten terbaru.
              </p>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default Articles;
