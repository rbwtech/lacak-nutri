import { useState, useEffect } from "react";
import { MainLayout } from "../components/layouts";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import api from "../config/api";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

const Favorites = () => {
  const { t } = useTranslation();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    try {
      const { data } = await api.get("/favorites/list");
      setFavorites(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(t("favorites.errorLoad"), e);
      setFavorites([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredFavorites = favorites.filter((fav) =>
    fav.product_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const removeFavorite = async (id, type, e) => {
    e.stopPropagation();
    try {
      await api.post(`/favorites/${type}/${id}/toggle`);
      setFavorites((prev) =>
        prev.filter((f) => !(f.id === id && f.product_type === type))
      );
    } catch (e) {
      alert(t("favorites.errorRemove"));
    }
  };

  const viewDetail = (fav) => {
    navigate(`/history/${fav.product_type}/${fav.id}?from=favorites`);
  };

  return (
    <MainLayout>
      <div className="min-h-screen bg-bg-base py-8">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-3xl font-extrabold text-text-primary mb-6">
            {t("favorites.title")}
          </h1>

          {loading ? (
            <div className="text-center py-12">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-text-secondary">{t("common.loading")}</p>
            </div>
          ) : (
            <>
              {favorites.length > 0 && (
                <div className="mb-6">
                  <div className="relative">
                    <svg
                      className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                    <input
                      id="search-favorites"
                      name="search-favorites"
                      type="text"
                      placeholder={t("favorites.searchPlaceholder")}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 rounded-xl border border-border bg-bg-surface focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    />
                  </div>
                </div>
              )}

              {favorites.length === 0 ? (
                <Card className="p-8 text-center">
                  <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg
                      className="w-8 h-8"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                      />
                    </svg>
                  </div>
                  <p className="text-text-secondary mb-4 text-lg font-bold">
                    {t("favorites.noFavTitle")}
                  </p>
                  <p className="text-text-secondary text-sm mb-6">
                    {t("favorites.noFavSubtitle")}
                  </p>
                  <Button onClick={() => navigate("/scanner")}>
                    {t("favorites.scanNow")}
                  </Button>
                </Card>
              ) : filteredFavorites.length === 0 ? (
                <Card className="p-8 text-center">
                  <p className="text-text-secondary">
                    {t("favorites.noMatch")}
                  </p>
                </Card>
              ) : (
                <div className="space-y-4">
                  {filteredFavorites.map((fav) => (
                    <Card
                      key={`${fav.product_type}-${fav.id}`}
                      className="p-4 hover:shadow-lg transition-all cursor-pointer group"
                      onClick={() => viewDetail(fav)}
                    >
                      <div className="flex items-center gap-4 min-h-[88px]">
                        <div
                          className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                            fav.product_type === "bpom"
                              ? "bg-green-100 text-green-600"
                              : "bg-blue-100 text-blue-600"
                          }`}
                        >
                          <svg
                            className="w-6 h-6"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            {fav.product_type === "bpom" ? (
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            ) : (
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                              />
                            )}
                          </svg>
                        </div>

                        <div
                          className="flex-1 min-w-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            viewDetail(fav);
                          }}
                        >
                          <h3 className="font-bold text-text-primary text-lg mb-1 group-hover:text-primary transition-colors cursor-pointer">
                            {fav.product_name || t("favorites.noName")}
                          </h3>
                          {fav.bpom_number && (
                            <p className="text-sm text-text-secondary font-mono mb-2">
                              {fav.bpom_number}
                            </p>
                          )}
                          <div className="flex items-center gap-2">
                            <span className="text-xs px-3 py-1 bg-primary/10 text-primary rounded-full font-bold">
                              {fav.product_type === "bpom"
                                ? t("common.bpomLabel")
                                : t("common.nutritionAILabel")}
                            </span>
                            {fav.product_data?.health_score && (
                              <span className="text-xs px-3 py-1 bg-secondary/10 text-secondary rounded-full font-bold">
                                {t("favorites.scoreLabel")}:{" "}
                                {fav.product_data.health_score}/100
                              </span>
                            )}
                            {fav.product_data?.grade && (
                              <span className="text-xs px-3 py-1 bg-primary/10 text-primary rounded-full font-bold">
                                {t("favorites.gradeLabel")}{" "}
                                {fav.product_data.grade}
                              </span>
                            )}
                          </div>
                        </div>

                        <button
                          onClick={(e) =>
                            removeFavorite(fav.id, fav.product_type, e)
                          }
                          className="text-error hover:bg-error/10 p-2 rounded-lg transition-colors shrink-0"
                          title={t("favorites.removeTitle")}
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

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            viewDetail(fav);
                          }}
                          className="p-2 hover:bg-primary/10 rounded-lg transition-colors"
                        >
                          <svg
                            className="w-5 h-5 text-text-secondary hover:text-primary transition-colors"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 5l7 7-7 7"
                            />
                          </svg>
                        </button>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default Favorites;
