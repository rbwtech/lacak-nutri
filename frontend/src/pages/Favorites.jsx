import { useState, useEffect } from "react";
import { MainLayout } from "../components/layouts";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import api from "../config/api";
import { useNavigate } from "react-router-dom";

const Favorites = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    try {
      const { data } = await api.get("/favorites/list");
      setFavorites(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("Gagal load favorit", e);
      setFavorites([]);
    } finally {
      setLoading(false);
    }
  };

  const removeFavorite = async (id, type) => {
    try {
      await api.post(`/favorites/${type}/${id}/toggle`);
      setFavorites((prev) => prev.filter((f) => f.id !== id));
    } catch (e) {
      alert("Gagal menghapus");
    }
  };

  return (
    <MainLayout>
      <div className="min-h-screen bg-bg-base py-8">
        <div className="max-w-2xl mx-auto px-4">
          <h1 className="text-3xl font-extrabold text-text-primary mb-6">
            Favorit Saya
          </h1>

          {loading ? (
            <div className="text-center py-12">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-text-secondary">Memuat favorit...</p>
            </div>
          ) : favorites.length === 0 ? (
            <Card className="p-8 text-center">
              <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
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
                    d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                  />
                </svg>
              </div>
              <p className="text-text-secondary mb-4 text-lg font-bold">
                Belum ada favorit
              </p>
              <p className="text-text-secondary text-sm mb-6">
                Mulai scan produk dan tambahkan ke favorit
              </p>
              <Button onClick={() => navigate("/scanner")}>
                Scan Produk Sekarang
              </Button>
            </Card>
          ) : (
            <div className="space-y-4">
              {favorites.map((fav) => (
                <Card
                  key={`${fav.product_type}-${fav.id}`}
                  className="p-5 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <h3 className="font-bold text-text-primary text-lg mb-1">
                        {fav.product_name}
                      </h3>
                      {fav.bpom_number && (
                        <p className="text-sm text-text-secondary font-mono mb-2">
                          {fav.bpom_number}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-md inline-flex items-center gap-1 font-bold">
                          <svg
                            className="w-3 h-3"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            {fav.product_type === "bpom" ? (
                              <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                clipRule="evenodd"
                              />
                            ) : (
                              <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                            )}
                          </svg>
                          {fav.product_type === "bpom" ? "BPOM" : "Nutrisi AI"}
                        </span>
                        {fav.product_data?.health_score && (
                          <span className="text-xs px-2 py-1 bg-secondary/10 text-secondary rounded-md font-bold">
                            Score: {fav.product_data.health_score}/100
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => removeFavorite(fav.id, fav.product_type)}
                      className="text-error hover:bg-error/10 p-2 rounded-lg transition-colors shrink-0"
                      title="Hapus dari favorit"
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
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default Favorites;
