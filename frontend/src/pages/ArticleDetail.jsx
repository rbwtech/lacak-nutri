import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { MainLayout } from "../components/layouts";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import api from "../config/api";
import { useTranslation } from "react-i18next";

const ArticleDetail = () => {
  const { t, i18n } = useTranslation();
  const { id } = useParams();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArticle = async () => {
      setLoading(true);
      try {
        const { data } = await api.get(`/education/articles/${id}`);
        setArticle(data);
      } catch (error) {
        console.error("Gagal load detail artikel", error);
      } finally {
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
          <div className="h-64 bg-white rounded-3xl border border-border p-8"></div>
        </div>
      </MainLayout>
    );
  }

  if (!article) {
    return (
      <MainLayout>
        <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center">
          <h2 className="text-2xl font-bold text-text-primary mb-2">
            {t("articles.notFoundTitle")}
          </h2>
          <Link to="/articles">
            <Button>{t("articles.backToAll")}</Button>
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
            {t("articles.backToList")}
          </Link>

          <Card className="overflow-hidden">
            <div className="mb-8 border-b border-border pb-6">
              <div className="flex items-center gap-3 mb-4">
                <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-bold uppercase tracking-wide">
                  {t(
                    `articles.cat${
                      article.category.charAt(0).toUpperCase() +
                      article.category.slice(1)
                    }`
                  )}
                </span>
                <span className="text-xs text-text-secondary font-medium">
                  {new Date(article.created_at).toLocaleDateString(
                    i18n.language,
                    {
                      dateStyle: "long",
                    }
                  )}
                </span>
              </div>

              <h1 className="text-3xl md:text-4xl font-extrabold text-text-primary mb-4 leading-tight">
                {article.title}
              </h1>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-secondary/20 text-secondary flex items-center justify-center font-bold">
                  {article.author ? article.author.charAt(0) : "L"}
                </div>
                <div>
                  <p className="text-sm font-bold text-text-primary">
                    {article.author || t("articles.defaultAuthor")}
                  </p>
                  <p className="text-xs text-text-secondary">
                    {t("articles.authorLabel")}
                  </p>
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
