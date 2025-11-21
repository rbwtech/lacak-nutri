import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { MainLayout } from "../components/layouts";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import api from "../config/api";
import { useDebounce } from "../hooks/useCommon";

const Articles = () => {
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 500);

  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  // Pagination State
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(9);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const categories = [
    { id: "all", label: "Semua" },
    { id: "gizi", label: "Gizi" },
    { id: "aditif", label: "Aditif" },
    { id: "penyakit", label: "Penyakit & Diet" },
    { id: "label", label: "Membaca Label" },
    { id: "tips", label: "Tips Sehat" },
  ];

  // Reset page saat filter berubah
  useEffect(() => {
    setPage(1);
  }, [activeCategory, debouncedSearch, pageSize]);

  useEffect(() => {
    const fetchArticles = async () => {
      setLoading(true);
      try {
        const response = await api.get(`/education/articles`, {
          params: {
            category: activeCategory === "all" ? undefined : activeCategory,
            q: debouncedSearch,
            page: page,
            size: pageSize,
          },
        });

        // Handle response pagination
        const result = response.data;
        if (result && Array.isArray(result.data)) {
          setArticles(result.data);
          setTotalItems(result.total || 0);
          setTotalPages(Math.ceil((result.total || 0) / pageSize));
        } else {
          // Fallback jika response aneh
          setArticles([]);
          setTotalItems(0);
        }
      } catch (error) {
        console.error("Gagal memuat artikel:", error);
        setArticles([]);
      } finally {
        setLoading(false);
      }
    };
    fetchArticles();
  }, [activeCategory, debouncedSearch, page, pageSize]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

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

          {/* Search & Filter Bar */}
          <div className="flex flex-col md:flex-row gap-4 mb-6 justify-between items-end md:items-center">
            {/* Category Buttons */}
            <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide w-full md:w-auto">
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

            {/* Search Input */}
            <div className="w-full md:w-1/3">
              <Input
                placeholder="Cari artikel..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                icon={
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
                }
              />
            </div>
          </div>

          {/* Data Count & Page Size */}
          <div className="flex justify-between items-center mb-6 text-sm text-text-secondary">
            <span className="font-bold">{totalItems} Artikel Ditemukan</span>
            <div className="flex items-center gap-2">
              <span>Tampil:</span>
              <select
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
                className="bg-bg-surface border border-border rounded-lg px-2 py-1 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="9">9</option>
                <option value="18">18</option>
                <option value="27">27</option>
              </select>
            </div>
          </div>

          {/* Content Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-80 bg-white rounded-3xl border border-border animate-pulse"
                ></div>
              ))}
            </div>
          ) : articles && articles.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {articles.map((article) => (
                  <Link key={article.id} to={`/articles/${article.slug}`}>
                    <Card
                      hover
                      className="h-full flex flex-col hover:-translate-y-1 transition-transform duration-300"
                    >
                      {article.thumbnail_url && (
                        <img
                          src={article.thumbnail_url}
                          alt={article.title}
                          className="w-full h-48 object-cover rounded-t-xl mb-4 -mt-6 -mx-6"
                        />
                      )}
                      <div className="flex items-start justify-between mb-3 mt-2">
                        <span className="text-[10px] font-bold text-primary uppercase tracking-wider bg-primary/10 px-2 py-1 rounded-lg">
                          {article.category}
                        </span>
                        <span className="text-xs text-text-secondary flex items-center gap-1">
                          <svg
                            className="w-3 h-3"
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
                          {article.read_time || "5 min"}
                        </span>
                      </div>
                      <h3 className="text-xl font-bold text-text-primary mb-2 line-clamp-2 hover:text-primary transition-colors">
                        {article.title}
                      </h3>
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
                        <span className="text-primary text-sm font-bold inline-flex items-center gap-1 group">
                          Baca
                          <svg
                            className="w-4 h-4 group-hover:translate-x-1 transition-transform"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M17 8l4 4m0 0l-4 4m4-4H3"
                            />
                          </svg>
                        </span>
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>

              {/* Pagination Controls */}
              <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mt-12">
                <Button
                  variant="outline"
                  disabled={page === 1}
                  onClick={() => handlePageChange(page - 1)}
                >
                  &larr; Sebelumnya
                </Button>

                {/* Page Indicator */}
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-text-primary">
                    Halaman
                  </span>
                  <input
                    type="number"
                    min="1"
                    max={totalPages}
                    value={page}
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      if (val >= 1 && val <= totalPages) setPage(val);
                    }}
                    className="w-12 h-8 text-center border border-border rounded-lg text-sm font-bold focus:outline-none focus:border-primary"
                  />
                  <span className="text-sm text-text-secondary">
                    dari {totalPages}
                  </span>
                </div>

                <Button
                  variant="outline"
                  disabled={page === totalPages}
                  onClick={() => handlePageChange(page + 1)}
                >
                  Selanjutnya &rarr;
                </Button>
              </div>
            </>
          ) : (
            <div className="text-center py-20 bg-bg-surface rounded-3xl border border-border">
              <div className="text-6xl mb-4 grayscale opacity-50">📚</div>
              <h3 className="text-xl font-bold text-text-primary mb-2">
                Tidak ada artikel
              </h3>
              <p className="text-text-secondary">
                Coba ubah kata kunci pencarian atau kategori lain.
              </p>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default Articles;
