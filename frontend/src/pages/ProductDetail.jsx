import { useParams, Link } from "react-router-dom";
import { MainLayout } from "../components/layouts";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import api from "../config/api";

const ProductDetail = () => {
  const { id } = useParams();

  const getNutritionColor = (value, type) => {
    if (type === "sodium" && value > 1000) return "text-error-text";
    if (type === "sugar" && value > 10) return "text-warning-text";
    return "text-text-primary";
  };

  return (
    <MainLayout>
      <div className="bg-bg-base min-h-screen py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            to="/products"
            className="inline-flex items-center gap-2 text-label text-text-secondary hover:text-primary mb-6"
          >
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
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Kembali ke Katalog
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h1 className="text-h2 font-bold text-text-primary mb-2">
                      {product.name}
                    </h1>
                    <p className="text-base text-text-secondary">
                      {product.brand}
                    </p>
                  </div>
                  <div
                    className={`w-16 h-16 rounded-xl flex items-center justify-center text-2xl font-bold ${
                      product.grade === "A"
                        ? "bg-success/20 text-success"
                        : product.grade === "B"
                        ? "bg-primary/20 text-primary"
                        : "bg-warning/20 text-warning-text"
                    }`}
                  >
                    {product.grade}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="p-4 bg-bg-base rounded-lg">
                    <div className="text-caption text-text-secondary mb-1">
                      Kategori
                    </div>
                    <div className="font-semibold text-text-primary">
                      {product.category}
                    </div>
                  </div>
                  <div className="p-4 bg-bg-base rounded-lg">
                    <div className="text-caption text-text-secondary mb-1">
                      Porsi
                    </div>
                    <div className="font-semibold text-text-primary">
                      {product.servingSize}
                    </div>
                  </div>
                </div>

                {product.verified && (
                  <div className="flex items-center gap-3 p-4 bg-success/10 border border-success/20 rounded-lg">
                    <svg
                      className="w-6 h-6 text-success"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <div>
                      <div className="font-semibold text-success">
                        Terdaftar BPOM
                      </div>
                      <div className="text-label text-text-secondary">
                        {product.bpom}
                      </div>
                    </div>
                  </div>
                )}
              </Card>

              <Card
                title="Informasi Nutrisi"
                subtitle={`Per ${product.servingSize}`}
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-3 border-b border-border">
                    <span className="font-semibold text-text-primary">
                      Energi
                    </span>
                    <span className="text-h4 font-bold text-primary">
                      {product.nutrition.calories} kkal
                    </span>
                  </div>

                  {Object.entries({
                    Protein: `${product.nutrition.protein}g`,
                    Lemak: `${product.nutrition.fat}g`,
                    Karbohidrat: `${product.nutrition.carbs}g`,
                    Gula: `${product.nutrition.sugar}g`,
                    Serat: `${product.nutrition.fiber}g`,
                    Natrium: `${product.nutrition.sodium}mg`,
                  }).map(([key, value]) => (
                    <div
                      key={key}
                      className="flex items-center justify-between"
                    >
                      <span className="text-base text-text-secondary">
                        {key}
                      </span>
                      <span
                        className={`font-semibold ${getNutritionColor(
                          parseFloat(value),
                          key.toLowerCase()
                        )}`}
                      >
                        {value}
                      </span>
                    </div>
                  ))}
                </div>
              </Card>

              <Card title="Analisis AI">
                <p className="text-base text-text-secondary leading-relaxed">
                  {product.analysis}
                </p>
              </Card>
            </div>

            <div className="space-y-6">
              <Card title="Komposisi">
                <div className="space-y-2">
                  {product.ingredients.map((ingredient, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span className="text-label text-text-secondary">
                        {ingredient}
                      </span>
                    </div>
                  ))}
                </div>
              </Card>

              <Card title="Alergen">
                <div className="flex flex-wrap gap-2">
                  {product.allergens.map((allergen, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-warning/10 text-warning-text rounded-lg text-label font-medium"
                    >
                      {allergen}
                    </span>
                  ))}
                </div>
              </Card>

              <div className="space-y-3">
                <Button
                  fullWidth
                  onClick={async () => {
                    try {
                      await api.post("/favorites/add", {
                        product_type: "nutrition",
                        product_name: product.name,
                        bpom_number: product.bpom,
                        product_data: product,
                      });
                      alert("Berhasil ditambahkan ke favorit!");
                    } catch (e) {
                      alert("Gagal menambahkan favorit");
                    }
                  }}
                  className="flex items-center justify-center gap-2"
                >
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  Tambah ke Favorit
                </Button>
                <Button variant="outline" fullWidth>
                  Bandingkan Produk
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default ProductDetail;
