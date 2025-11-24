import { useState, useEffect, useRef } from "react";
import { MainLayout } from "../components/layouts";
import Card from "../components/ui/Card";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import api from "../config/api";
import { useDebounce } from "../hooks/useCommon";
import NutritionLabel from "../components/ui/NutritionLabel";
import { useTranslation } from "react-i18next";

const Products = () => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 500);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [pageSize, setPageSize] = useState(12);
  const scrollRef = useRef(0);

  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, pageSize]);

  useEffect(() => {
    fetchProducts();
  }, [debouncedSearch, page, pageSize]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/food/search", {
        params: {
          q: debouncedSearch,
          page: page,
          size: pageSize,
        },
      });
      setProducts(data.data);
      setTotalItems(data.total);
      setTotalPages(Math.ceil(data.total / pageSize));
      setHasSearched(true);
    } catch (error) {
      console.error("Search failed", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      scrollRef.current = window.scrollY;
      setPage(newPage);
    }
  };

  useEffect(() => {
    if (scrollRef.current) {
      window.scrollTo(0, scrollRef.current);
    }
  }, [products]);

  return (
    <MainLayout>
      <div className="bg-bg-base min-h-screen py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-extrabold text-text-primary mb-2">
              {t("products.mainTitle")}
            </h1>
            <p className="text-text-secondary">{t("products.subtitle")}</p>
          </div>

          {/* Search Bar & Controls */}
          <div className="max-w-4xl mx-auto mb-8 flex flex-col md:flex-row gap-4 items-center">
            <div className="flex-1 w-full">
              <Input
                placeholder={t("products.searchPlaceholder")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="shadow-lg border-primary/20 focus:border-primary text-lg w-full"
                icon={
                  <svg
                    className="w-6 h-6 text-primary"
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
                }
              />
            </div>

            {/* Page Size Selector */}
            <div className="flex items-center gap-2 bg-white dark:bg-neutral-800 px-4 py-3.5 rounded-2xl border border-border shadow-lg w-full md:w-auto h-[54px]">
              <span className="text-xs font-bold text-text-secondary whitespace-nowrap">
                {t("products.showLabel")}:
              </span>
              <select
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
                className="bg-transparent font-bold text-primary text-sm focus:outline-none cursor-pointer dark:bg-neutral-800 dark:text-white w-full"
              >
                <option value="12">12</option>
                <option value="24">24</option>
                <option value="48">48</option>
                <option value="60">60</option>
              </select>
            </div>
          </div>

          {/* Total Data Info */}
          <div className="mb-6 flex justify-between items-center border-b border-border pb-2">
            <span className="text-sm font-bold text-text-secondary">
              {t("products.totalData")}: {totalItems}
            </span>
            <span className="text-xs text-text-secondary">
              {t("products.pageLabel")} {page} {t("products.ofLabel")}{" "}
              {totalPages}
            </span>
          </div>

          {/* Content */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div
                  key={i}
                  className="h-48 bg-white rounded-2xl border border-border animate-pulse p-4"
                ></div>
              ))}
            </div>
          ) : products.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
                {products.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => setSelectedProduct(item)}
                    className="cursor-pointer h-full"
                  >
                    <Card
                      hover
                      className="border border-border/50 hover:border-primary/50 transition-all h-full flex flex-col"
                    >
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2 min-h-14">
                          {" "}
                          <h3 className="font-bold text-text-primary line-clamp-2 text-lg leading-tight">
                            {item.name}
                          </h3>
                        </div>
                        <div className="flex items-center gap-2 mb-4">
                          {item.original_code && (
                            <span className="text-[10px] font-bold bg-primary/10 text-primary px-2 py-1 rounded uppercase">
                              {item.original_code}
                            </span>
                          )}
                          <p className="text-xs text-text-secondary">
                            Per {item.weight_g}g
                          </p>
                        </div>

                        <div className="grid grid-cols-3 gap-2 text-center mb-4">
                          <div className="p-2 bg-bg-base rounded-lg border border-border">
                            <p className="text-[9px] font-bold text-text-secondary uppercase">
                              {t("products.cal")}
                            </p>
                            <p className="font-extrabold text-primary text-sm">
                              {Math.round(item.calories)}
                            </p>
                          </div>
                          <div className="p-2 bg-bg-base rounded-lg border border-border">
                            <p className="text-[9px] font-bold text-text-secondary uppercase">
                              {t("products.prot")}
                            </p>
                            <p className="font-extrabold text-secondary text-sm">
                              {Math.round(item.protein)}g
                            </p>
                          </div>
                          <div className="p-2 bg-bg-base rounded-lg border border-border">
                            <p className="text-[9px] font-bold text-text-secondary uppercase">
                              {t("products.fat")}
                            </p>
                            <p className="font-extrabold text-accent text-sm">
                              {Math.round(item.fat)}g
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="pt-3 border-t border-border/50 text-center mt-auto">
                        {" "}
                        <span className="text-xs font-bold text-primary">
                          {t("products.viewDetail")} →
                        </span>
                      </div>
                    </Card>
                  </div>
                ))}
              </div>

              {/* Pagination Controls */}
              <div className="flex justify-center items-center gap-2 mt-12 flex-nowrap">
                {/* Tombol kiri */}
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={page === 1}
                    onClick={() => handlePageChange(1)}
                  >
                    &laquo;
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page === 1}
                    onClick={() => handlePageChange(page - 1)}
                  >
                    &larr;
                  </Button>
                </div>

                {/* Nomor halaman */}
                <div className="flex items-center gap-3 bg-bg-surface px-4 py-2 rounded-xl border border-border shadow-sm">
                  <span className="text-xs text-text-secondary font-bold">
                    {t("products.pageLabel")}
                  </span>
                  <input
                    type="number"
                    min="1"
                    max={totalPages}
                    value={page}
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      if (val >= 1 && val <= totalPages) setPage(val);
                    }}
                    onKeyDown={(e) =>
                      e.key === "Enter" && handlePageChange(page)
                    }
                    className="w-12 p-1 text-center border-b-2 border-primary/20 focus:border-primary bg-transparent text-sm font-bold outline-none transition-colors"
                  />
                  <span className="text-xs text-text-secondary">
                    {t("products.ofLabel")} {totalPages}
                  </span>
                </div>

                {/* Tombol kanan */}
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page === totalPages}
                    onClick={() => handlePageChange(page + 1)}
                  >
                    &rarr;
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={page === totalPages}
                    onClick={() => handlePageChange(totalPages)}
                  >
                    &raquo;
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-20 bg-bg-surface rounded-3xl border border-dashed border-border">
              <div className="text-5xl mb-4 opacity-50">🥕</div>
              <h3 className="text-xl font-bold text-text-primary">
                {t("products.notFoundTitle")}
              </h3>
              <p className="text-text-secondary">
                {t("products.notFoundHint")}
              </p>
            </div>
          )}
        </div>

        {/* MODAL */}
        {selectedProduct && (
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedProduct(null)}
          >
            <div
              className="bg-dark w-full max-w-md rounded-none md:rounded-xl overflow-hidden shadow-2xl animate-scale-up relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setSelectedProduct(null)}
                className="absolute top-2 right-2 p-2 bg-gray-100 dark:bg-neutral-800 hover:bg-gray-200 dark:hover:bg-neutral-700 rounded-full transition-colors z-10"
              >
                <svg
                  className="w-5 h-5 text-gray-600 dark:text-gray-200"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
              <div className="p-6 bg-gray-100 dark:bg-neutral-800">
                <h3 className="text-center font-bold text-xl mb-1 text-black dark:text-white font-sans">
                  {selectedProduct.name}
                </h3>
                <p className="text-center text-xs text-gray-500 dark:text-gray-400 mb-6">
                  {t("products.sourceLabel")}
                </p>

                <NutritionLabel
                  data={{
                    calories: selectedProduct.calories,
                    protein: selectedProduct.protein,
                    fat: selectedProduct.fat,
                    carbs: selectedProduct.carbs,
                    sugar: selectedProduct.sugar,
                    fiber: selectedProduct.fiber,
                    sodium_mg: selectedProduct.sodium_mg,
                    potassium_mg: selectedProduct.potassium_mg,
                    calcium_mg: selectedProduct.calcium_mg,
                    iron_mg: selectedProduct.iron_mg,
                    cholesterol_mg: selectedProduct.cholesterol_mg,
                    servingSize: selectedProduct.weight_g,
                  }}
                />

                <div className="mt-6">
                  <Button fullWidth onClick={() => setSelectedProduct(null)}>
                    {t("products.closeButton")}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default Products;
