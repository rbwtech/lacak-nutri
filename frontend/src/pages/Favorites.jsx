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
    // Butuh type untuk toggle
    try {
      // Gunakan endpoint toggle yang sudah ada, bukan remove
      await api.post(`/favorites/${type}/${id}/toggle`);
      setFavorites((prev) => prev.filter((f) => f.id !== id));
    } catch (e) {
      alert("Gagal menghapus");
    }
  };

  return (
    <MainLayout>
      <div className="min-h-screen bg-[#FDFDF5] py-8">
        <div className="max-w-2xl mx-auto px-4">
          <h1 className="text-3xl font-extrabold text-[#333333] mb-6">
            Favorit Saya
          </h1>

          {loading ? (
            <p className="text-center text-[#8C8C8C]">Loading...</p>
          ) : favorites && favorites.length === 0 ? ( // Safety check
            <Card className="p-8 text-center">
              <p className="text-[#8C8C8C] mb-4">Belum ada favorit</p>
              <Button onClick={() => navigate("/scanner")}>
                Mulai Scan Produk
              </Button>
            </Card>
          ) : (
            <div className="space-y-4">
              {favorites.map((fav) => (
                <Card key={`${fav.product_type}-${fav.id}`} className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-bold text-[#333333]">
                        {fav.product_name}
                      </h3>
                      {fav.bpom_number && (
                        <p className="text-sm text-[#8C8C8C] mt-1">
                          {fav.bpom_number}
                        </p>
                      )}
                      <span className="mt-2 text-xs px-2 py-1 bg-[#FF9966]/10 text-[#FF9966] rounded-md inline-flex items-center gap-1 font-bold">
                        {/* Icon SVG omitted for brevity */}
                        {fav.product_type === "bpom" ? "BPOM" : "Nutrisi AI"}
                      </span>
                    </div>
                    <button
                      onClick={() => removeFavorite(fav.id, fav.product_type)}
                      className="text-[#EF5350] hover:bg-[#EF5350]/10 p-2 rounded-lg transition-colors"
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
