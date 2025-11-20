import { useParams, Link } from "react-router-dom";
import { MainLayout } from "../components/layouts";
import Card from "../components/ui/Card";

const ArticleDetail = () => {
  const { id } = useParams();

  const article = {
    id: 1,
    title: "Panduan Membaca Label Nutrisi",
    category: "Panduan",
    date: "15 Nov 2025",
    readTime: "5 min",
    author: "Tim LacakNutri",
    content: `
      <p>Label nutrisi pada kemasan makanan adalah sumber informasi penting yang sering diabaikan. 
      Memahami cara membaca label ini dapat membantu Anda membuat pilihan makanan yang lebih sehat.</p>

      <h3>Informasi Dasar</h3>
      <p>Setiap label nutrisi di Indonesia wajib mencantumkan informasi per sajian, termasuk energi, 
      protein, lemak total, karbohidrat, dan natrium. Perhatikan ukuran porsi yang tercantum.</p>

      <h3>Yang Perlu Diperhatikan</h3>
      <ul>
        <li>Kalori per porsi</li>
        <li>Kandungan gula</li>
        <li>Kadar natrium</li>
        <li>Lemak jenuh</li>
        <li>Serat makanan</li>
      </ul>

      <h3>Tips Praktis</h3>
      <p>Bandingkan produk serupa dan pilih yang memiliki kandungan gula dan natrium lebih rendah. 
      Perhatikan juga ukuran porsi yang realistis dengan konsumsi Anda.</p>
    `,
  };

  return (
    <MainLayout>
      <div className="bg-bg-base min-h-screen py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            to="/articles"
            className="inline-flex items-center gap-2 text-label text-text-secondary hover:text-primary font-medium mb-6" // font-medium ditambahkan
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
            Kembali ke Artikel
          </Link>

          <Card>
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-4">
                <span className="px-3 py-1 bg-primary/10 text-primary rounded-lg text-caption font-medium">
                  {article.category}
                </span>
                <span className="text-caption text-text-secondary">
                  {article.readTime}
                </span>
              </div>

              <h1 className="text-h1 font-bold text-text-primary mb-4">
                {article.title}
              </h1>

              <div className="flex items-center gap-4 text-label text-text-secondary">
                <span>Oleh {article.author}</span>
                <span>•</span>
                <span>{article.date}</span>
              </div>
            </div>

            <div
              className="prose prose-lg max-w-none text-text-primary"
              dangerouslySetInnerHTML={{ __html: article.content }}
            />
          </Card>

          <div className="mt-8">
            <h3 className="text-h4 font-semibold text-text-primary mb-4">
              Artikel Terkait
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2].map((i) => (
                <Card key={i} padding={false}>
                  <div className="p-6">
                    <h4 className="text-h4 font-semibold text-text-primary mb-2">
                      Artikel Terkait {i}
                    </h4>
                    <p className="text-base text-text-secondary mb-4">
                      Deskripsi singkat artikel terkait
                    </p>
                    <Link
                      to={`/articles/${i + 1}`}
                      className="text-primary hover:underline text-label font-medium"
                    >
                      Baca Selengkapnya →
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default ArticleDetail;
