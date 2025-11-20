import { MainLayout } from "../components/layouts";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import { Link } from "react-router-dom";

const Articles = () => {
  const articles = [
    {
      id: 1,
      title: "Panduan Membaca Label Nutrisi",
      excerpt:
        "Pelajari cara membaca dan memahami informasi nutrisi pada kemasan makanan",
      category: "Panduan",
      date: "15 Nov 2025",
      readTime: "5 min",
    },
    {
      id: 2,
      title: "Bahaya Konsumsi Gula Berlebihan",
      excerpt:
        "Dampak kesehatan dari mengonsumsi gula melebihi batas yang dianjurkan",
      category: "Kesehatan",
      date: "14 Nov 2025",
      readTime: "7 min",
    },
    {
      id: 3,
      title: "Mengenal Indeks Glikemik Makanan",
      excerpt: "Apa itu indeks glikemik dan mengapa penting untuk kesehatan",
      category: "Edukasi",
      date: "13 Nov 2025",
      readTime: "6 min",
    },
    {
      id: 4,
      title: "Tips Memilih Camilan Sehat",
      excerpt:
        "Panduan memilih camilan yang baik untuk kesehatan dan nutrisi seimbang",
      category: "Tips",
      date: "12 Nov 2025",
      readTime: "4 min",
    },
  ];

  const categories = ["Semua", "Panduan", "Kesehatan", "Edukasi", "Tips"];

  return (
    <MainLayout>
      <div className="bg-bg-base min-h-screen py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-h2 font-bold text-text-primary mb-2">
              Artikel & Tips
            </h1>
            <p className="text-base text-text-secondary">
              Baca artikel seputar nutrisi dan kesehatan
            </p>
          </div>

          <div className="flex gap-3 mb-8 overflow-x-auto pb-2">
            {categories.map((cat) => (
              <button
                key={cat}
                className="px-4 py-2 rounded-lg text-label font-medium whitespace-nowrap bg-bg-surface text-text-secondary hover:bg-border transition-colors"
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article) => (
              <Card key={article.id} padding={false}>
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="px-3 py-1 bg-primary/10 text-primary rounded-lg text-caption font-medium">
                      {article.category}
                    </span>
                    <span className="text-caption text-text-secondary">
                      {article.readTime}
                    </span>
                  </div>

                  <h3 className="text-h4 font-semibold text-text-primary mb-2">
                    {article.title}
                  </h3>
                  <p className="text-base text-text-secondary mb-4 line-clamp-2">
                    {article.excerpt}
                  </p>

                  <div className="flex items-center justify-between">
                    <span className="text-caption text-text-secondary">
                      {article.date}
                    </span>
                    <Link to={`/articles/${article.id}`}>
                      <Button variant="ghost" size="sm">
                        Baca Selengkapnya
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Articles;
