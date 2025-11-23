import { useState, useEffect } from "react";
import { MainLayout } from "../../components/layouts";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import api from "../../config/api";
import { useTranslation } from "react-i18next";
import { useDebounce } from "../../hooks/useCommon";

const AdminHistory = () => {
  const { t, i18n } = useTranslation();
  const [activeTab, setActiveTab] = useState("bpom");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Pagination & Search State
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const debouncedSearch = useDebounce(search, 500);

  useEffect(() => {
    setPage(1);
  }, [activeTab, debouncedSearch, pageSize]);

  useEffect(() => {
    fetchHistory();
  }, [page, pageSize, activeTab, debouncedSearch]);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const { data: res } = await api.get(`/admin/history/${activeTab}`, {
        params: {
          search: debouncedSearch || undefined,
          skip: (page - 1) * pageSize,
          limit: pageSize,
        },
      });
      setData(res.data);
      setTotal(res.total);
    } catch (e) {
      console.error("Failed to load history", e);
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.ceil(total / pageSize);

  return (
    <MainLayout>
      <div className="bg-bg-base min-h-screen py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-extrabold text-text-primary">
                {t("admin.history.title")}
              </h1>
              <p className="text-text-secondary">
                {t("admin.history.total", { count: total })}
              </p>
            </div>
            <Button onClick={fetchHistory}>{t("admin.common.refresh")}</Button>
          </div>

          <Card className="p-6 mb-6">
            <div className="flex flex-col md:flex-row justify-between gap-4 mb-4">
              <div className="flex gap-4">
                <button
                  onClick={() => setActiveTab("bpom")}
                  className={`px-6 py-3 rounded-xl font-bold transition-all ${
                    activeTab === "bpom"
                      ? "bg-primary text-white"
                      : "bg-bg-base text-text-secondary hover:bg-primary/10"
                  }`}
                >
                  {t("admin.history.bpomTab")}
                </button>
                <button
                  onClick={() => setActiveTab("ocr")}
                  className={`px-6 py-3 rounded-xl font-bold transition-all ${
                    activeTab === "ocr"
                      ? "bg-primary text-white"
                      : "bg-bg-base text-text-secondary hover:bg-primary/10"
                  }`}
                >
                  {t("admin.history.ocrTab")}
                </button>
              </div>
              <div className="flex items-center gap-3 w-full md:w-auto">
                <select
                  value={pageSize}
                  onChange={(e) => setPageSize(Number(e.target.value))}
                  className="px-4 py-3 rounded-xl border border-border bg-bg-surface focus:ring-2 focus:ring-primary/20 outline-none font-semibold cursor-pointer"
                >
                  <option value="10">10</option>
                  <option value="20">20</option>
                  <option value="50">50</option>
                  <option value="100">100</option>
                </select>
              </div>
            </div>
            <Input
              placeholder={t("admin.user.searchPlaceholder")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              containerClass="w-full"
            />
          </Card>

          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-bg-base border-b border-border">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-text-secondary uppercase">
                      ID
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-text-secondary uppercase">
                      {t("admin.history.user")}
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-text-secondary uppercase">
                      {t("admin.history.product")}
                    </th>
                    {activeTab === "bpom" && (
                      <>
                        <th className="px-6 py-4 text-left text-xs font-bold text-text-secondary uppercase">
                          {t("admin.history.bpomNum")}
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-text-secondary uppercase">
                          {t("history.status")}
                        </th>
                      </>
                    )}
                    {activeTab === "ocr" && (
                      <th className="px-6 py-4 text-left text-xs font-bold text-text-secondary uppercase">
                        {t("admin.history.score")}
                      </th>
                    )}
                    <th className="px-6 py-4 text-left text-xs font-bold text-text-secondary uppercase">
                      {t("admin.history.date")}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {loading ? (
                    <tr>
                      <td
                        colSpan={activeTab === "bpom" ? "6" : "5"}
                        className="px-6 py-8 text-center"
                      >
                        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
                      </td>
                    </tr>
                  ) : data.length === 0 ? (
                    <tr>
                      <td
                        colSpan={activeTab === "bpom" ? "6" : "5"}
                        className="px-6 py-8 text-center text-text-secondary"
                      >
                        {search
                          ? t("admin.pagination.noResults")
                          : t("admin.common.noData")}
                      </td>
                    </tr>
                  ) : (
                    data.map((item) => (
                      <tr key={item.id} className="hover:bg-bg-base">
                        <td className="px-6 py-4 text-sm font-mono">
                          #{item.id}
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-bold text-text-primary text-sm">
                              {item.user_name}
                            </p>
                            <p className="text-xs text-text-secondary">
                              ID: {item.user_id}
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-4 font-medium text-text-primary">
                          {item.product_name}
                        </td>
                        {activeTab === "bpom" && (
                          <>
                            <td className="px-6 py-4 font-mono text-sm">
                              {item.bpom_number}
                            </td>
                            <td className="px-6 py-4">
                              <span className="px-3 py-1 bg-success/10 text-success text-xs font-bold rounded-full">
                                {item.status}
                              </span>
                            </td>
                          </>
                        )}
                        {activeTab === "ocr" && (
                          <td className="px-6 py-4">
                            <span className="px-3 py-1 bg-primary/10 text-primary text-sm font-bold rounded">
                              {item.health_score}/100
                            </span>
                          </td>
                        )}
                        <td className="px-6 py-4 text-sm text-text-secondary">
                          {new Date(item.created_at).toLocaleDateString(
                            i18n.language,
                            {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
                <span className="text-sm text-text-secondary">
                  {t("admin.pagination.pageInfo", {
                    current: page,
                    total: totalPages,
                    count: total,
                  })}
                </span>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    {t("admin.pagination.previous")}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                  >
                    {t("admin.pagination.next")}
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default AdminHistory;
