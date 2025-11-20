import { useState } from "react";
import { Link } from "react-router-dom";
import { MainLayout } from "../components/layouts";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";

const Articles = () => {
  const [activeCategory, setActiveCategory] = useState("all");

  const categories = [
    { id: "all", label: "Semua" },
    { id: "gizi", label: "Gizi" },
    { id: "alergen", label: "Alergen" },
    { id: "aditif", label: "Aditif" },
    { id: "panduan", label: "Panduan" },
  ];

  const articles = [
    {
      id: 1,
      title: "Panduan Membaca Label Nutrisi",
      excerpt:
        "Pelajari cara membaca dan memahami informasi nilai gizi pada kemasan makanan.",
      category: "panduan",
      date: "15 Nov 2025",
      readTime: "5 min",
    },
    {
      id: 2,
      title: "Memahami Alergen Umum dalam Makanan",
      excerpt:
        "Ketahui alergen yang paling sering ditemukan dan cara menghindarinya.",
      category: "alergen",
      date: "14 Nov 2025",
      readTime: "7 min",
    },
    {
      id: 3,
      title: "Pemanis Buatan: Aman atau Berbahaya?",
      excerpt:
        "Fakta ilmiah tentang berbagai jenis pemanis buatan yang beredar.",
      category: "aditif",
      date: "13 Nov 2025",
      readTime: "6 min",
    },
    {
      id: 4,
      title: "Protein: Berapa Banyak yang Anda Butuhkan?",
      excerpt:
        "Panduan lengkap kebutuhan protein harian berdasarkan usia dan aktivitas.",
      category: "gizi",
      date: "12 Nov 2025",
      readTime: "8 min",
    },
  ];

  const filteredArticles =
    activeCategory === "all"
      ? articles
      : articles.filter((a) => a.category === activeCategory);

  return (
    <MainLayout>
      <div className="bg-bg-base min-h-screen py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-h2 font-bold text-text-primary mb-2">
              Pusat Edukasi Gizi
            </h1>
            <p className="text-base text-text-secondary">
              Artikel dan panduan untuk hidup lebih sehat
            </p>
          </div>

          <div className="flex gap-3 mb-8 overflow-x-auto pb-2">
            {categories.map((cat) => (
              <Button
                key={cat.id}
                variant={activeCategory === cat.id ? "primary" : "outline"}
                size="sm"
                onClick={() => setActiveCategory(cat.id)}
              >
                {cat.label}
              </Button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredArticles.map((article) => (
              <Link key={article.id} to={`/articles/${article.id}`}>
                <Card hover>
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-label text-primary font-semibold capitalize">
                      {article.category}
                    </span>
                    <span className="text-caption text-text-secondary">
                      {article.readTime}
                    </span>
                  </div>
                  <h3 className="text-h4 font-bold text-text-primary mb-2">
                    {article.title}
                  </h3>
                  <p className="text-base text-text-secondary mb-4">
                    {article.excerpt}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-caption text-text-secondary">
                      {article.date}
                    </span>
                    <span className="text-primary text-base font-semibold">
                      Baca →
                    </span>
                  </div>
                </Card>
              </Link>
            ))}
          </div>

          {filteredArticles.length === 0 && (
            <div className="text-center py-12">
              <p className="text-base text-text-secondary">
                Tidak ada artikel dalam kategori ini
              </p>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default Articles;
