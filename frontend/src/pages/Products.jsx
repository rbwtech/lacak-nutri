import { useState } from "react";
import { MainLayout } from "../components/layouts";
import Card from "../components/ui/Card";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import { Link } from "react-router-dom";

const Products = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const categories = [
    { id: "all", name: "Semua" },
    { id: "snack", name: "Snack" },
    { id: "drink", name: "Minuman" },
    { id: "instant", name: "Instant" },
    { id: "dairy", name: "Susu & Dairy" },
  ];

  const products = [
    {
      id: 1,
      name: "Indomie Goreng",
      brand: "Indofood",
      category: "instant",
      grade: "B",
      calories: 390,
      bpom: "MD 224510004378",
      verified: true,
    },
    {
      id: 2,
      name: "Teh Botol Sosro",
      brand: "Sosro",
      category: "drink",
      grade: "A",
      calories: 60,
      bpom: "MD 205510008309",
      verified: true,
    },
    {
      id: 3,
      name: "Chitato Rasa Sapi Panggang",
      brand: "Indofood",
      category: "snack",
      grade: "C",
      calories: 510,
      bpom: "MD 224510007890",
      verified: true,
    },
    {
      id: 4,
      name: "Ultra Milk Full Cream",
      brand: "Ultrajaya",
      category: "dairy",
      grade: "A",
      calories: 130,
      bpom: "MD 205510045621",
      verified: true,
    },
  ];

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.brand.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <MainLayout>
      <div className="bg-bg-base min-h-screen py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-h2 font-bold text-text-primary mb-2">
              Katalog Produk
            </h1>
            <p className="text-base text-text-secondary">
              Jelajahi database produk makanan dan minuman
            </p>
          </div>

          <div className="mb-6">
            <Input
              placeholder="Cari produk atau brand..."
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

          <div className="flex gap-3 mb-6 overflow-x-auto pb-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-lg text-label font-medium whitespace-nowrap transition-colors ${
                  selectedCategory === cat.id
                    ? "bg-primary text-white"
                    : "bg-bg-surface text-text-secondary hover:bg-border"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          <div className="mb-4 text-label text-text-secondary">
            {filteredProducts.length} produk ditemukan
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
              <Card key={product.id} padding={false}>
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold ${
                        product.grade === "A"
                          ? "bg-success/20 text-success"
                          : product.grade === "B"
                          ? "bg-primary/20 text-primary"
                          : "bg-warning/20 text-warning-text"
                      }`}
                    >
                      {product.grade}
                    </div>
                    {product.verified && (
                      <div className="flex items-center gap-1 text-caption text-success">
                        <svg
                          className="w-4 h-4"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                        BPOM
                      </div>
                    )}
                  </div>

                  <h3 className="text-h4 font-semibold text-text-primary mb-1">
                    {product.name}
                  </h3>
                  <p className="text-label text-text-secondary mb-4">
                    {product.brand}
                  </p>

                  <div className="flex items-center justify-between mb-4 text-label">
                    <span className="text-text-secondary">Kalori</span>
                    <span className="font-semibold text-text-primary">
                      {product.calories} kkal
                    </span>
                  </div>

                  <Link to={`/products/${product.id}`}>
                    <Button variant="outline" fullWidth size="sm">
                      Lihat Detail
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <div className="text-center py-12">
              <p className="text-base text-text-secondary mb-4">
                Produk tidak ditemukan
              </p>
              <Button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("all");
                }}
              >
                Reset Filter
              </Button>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default Products;
