import { useState, useEffect } from "react";
import { MainLayout } from "../../components/layouts";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import api from "../../config/api";
import { useTranslation } from "react-i18next";

const AdminHistory = () => {
  const { t, i18n } = useTranslation();
  const [activeTab, setActiveTab] = useState("bpom");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchHistory();
  }, [activeTab]);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const { data: res } = await api.get(`/admin/history/${activeTab}`);
      setData(res.data);
      setTotal(res.total);
    } catch (e) {
      console.error("Failed to load history", e);
    } finally {
      setLoading(false);
    }
  };

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
            <Button onClick={fetchHistory}>{t("common.refresh")}</Button>
          </div>

          <Card className="p-6 mb-6">
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
                        {t("admin.common.noData")}
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
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default AdminHistory;
