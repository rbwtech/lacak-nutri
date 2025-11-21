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
      setFavorites(data.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const removeFavorite = async (id) => {
    try {
      await api.delete(`/favorites/remove/${id}`);
      setFavorites(favorites.filter((f) => f.id !== id));
    } catch (e) {
      alert("Gagal menghapus");
    }
  };

  return (
    <MainLayout>
      <div className="bg-bg-base min-h-screen py-8">
        <div className="max-w-2xl mx-auto px-4">
          <h1 className="text-3xl font-extrabold text-text-primary mb-6">
            Favorit Saya
          </h1>

          {loading ? (
            <p className="text-center text-text-secondary">Loading...</p>
          ) : favorites.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-text-secondary mb-4">Belum ada favorit</p>
              <Button onClick={() => navigate("/scanner")}>
                Mulai Scan Produk
              </Button>
            </Card>
          ) : (
            <div className="space-y-4">
              {favorites.map((fav) => (
                <Card key={fav.id} className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-bold text-text-primary">
                        {fav.product_name}
                      </h3>
                      {fav.bpom_number && (
                        <p className="text-sm text-text-secondary mt-1">
                          {fav.bpom_number}
                        </p>
                      )}
                      <span className="mt-2 text-xs px-2 py-1 bg-primary/10 text-primary rounded flex items-center gap-1">
                        <svg
                          className="w-3 h-3"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        {fav.product_type === "bpom" ? "BPOM" : "Nutrisi"}
                      </span>
                    </div>
                    <button
                      onClick={() => removeFavorite(fav.id)}
                      className="text-error hover:bg-error/10 p-2 rounded-lg"
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
