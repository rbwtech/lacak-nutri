import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { MainLayout } from "../components/layouts";
import Card from "../components/ui/Card";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import { useDebounce } from "../hooks/useCommon";

const Products = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 500);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch data saat search berubah (Nanti diintegrasikan)
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      // Simulasi loading state
      setTimeout(() => {
        setProducts([]); // Kosongkan dulu karena belum ada API
        setLoading(false);
      }, 500);
    };
    fetchProducts();
  }, [debouncedSearch]);

  return (
    <MainLayout>
      <div className="bg-bg-base min-h-screen py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-text-primary mb-2">
              Katalog Produk
            </h1>
            <p className="text-text-secondary">
              Database informasi nilai gizi produk kemasan.
            </p>
          </div>

          <div className="mb-8">
            <Input
              placeholder="Cari nama produk atau merk..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              icon={
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
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

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Map products here */}
            </div>
          ) : (
            <div className="text-center py-16 bg-bg-surface rounded-3xl border border-border">
              <p className="text-text-secondary mb-4">Belum ada data produk.</p>
              <p className="text-sm text-text-secondary">
                Gunakan fitur Scanner untuk menambahkan data baru.
              </p>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default Products;
