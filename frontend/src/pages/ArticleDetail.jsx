import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { MainLayout } from "../components/layouts";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import api from "../config/api";

const ArticleDetail = () => {
  const { id } = useParams(); // Bisa slug atau ID
  const navigate = useNavigate();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArticle = async () => {
      setLoading(true);
      try {
        const { data } = await api.get(`/education/articles/${id}`);
        setArticle(data.data);

        setTimeout(() => {
          setLoading(false);
        }, 500);
      } catch (error) {
        console.error(error);
        setLoading(false);
      }
    };

    fetchArticle();
  }, [id]);

  if (loading) {
    return (
      <MainLayout>
        <div className="max-w-4xl mx-auto px-4 py-12 animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
          <div className="h-64 bg-white rounded-3xl border border-border p-8">
            <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!article && !loading) {
    // Tampilan fallback sementara sebelum ada data
    return (
      <MainLayout>
        <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center">
          <h2 className="text-2xl font-bold text-text-primary mb-2">
            Artikel Tidak Ditemukan
          </h2>
          <p className="text-text-secondary mb-6">
            Artikel yang Anda cari mungkin belum tersedia atau telah dihapus.
          </p>
          <Link to="/articles">
            <Button>Kembali ke Daftar Artikel</Button>
          </Link>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="bg-bg-base min-h-screen py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            to="/articles"
            className="inline-flex items-center gap-2 text-sm font-bold text-text-secondary hover:text-primary mb-6 transition-colors"
          >
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
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Kembali ke Artikel
          </Link>

          <Card className="overflow-hidden">
            {article.thumbnail_url && (
              <img
                src={article.thumbnail_url}
                alt={article.title}
                className="w-full h-64 object-cover mb-6 rounded-xl"
              />
            )}

            <div className="mb-8 border-b border-border pb-6">
              <div className="flex items-center gap-3 mb-4">
                <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-bold uppercase tracking-wide">
                  {article.category}
                </span>
                <span className="text-xs text-text-secondary font-medium">
                  {new Date(article.created_at).toLocaleDateString("id-ID", {
                    dateStyle: "long",
                  })}
                </span>
              </div>

              <h1 className="text-3xl md:text-4xl font-extrabold text-text-primary mb-4 leading-tight">
                {article.title}
              </h1>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold">
                  {article.author ? article.author.charAt(0) : "A"}
                </div>
                <div>
                  <p className="text-sm font-bold text-text-primary">
                    {article.author || "Tim LacakNutri"}
                  </p>
                  <p className="text-xs text-text-secondary">Penulis</p>
                </div>
              </div>
            </div>

            <div
              className="prose prose-lg prose-headings:font-bold prose-a:text-primary prose-img:rounded-xl max-w-none text-text-primary"
              dangerouslySetInnerHTML={{ __html: article.content }}
            />
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default ArticleDetail;
