import { useState, useEffect } from "react";
import { MainLayout } from "../components/layouts";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import api from "../config/api";
import { useNavigate } from "react-router-dom";

const History = () => {
  const [history, setHistory] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchHistory();
  }, [filter]);

  const fetchHistory = async () => {
    try {
      const { data } = await api.get("/users/history", {
        params: { type: filter !== "all" ? filter : undefined },
      });
      setHistory(data.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const viewDetail = (item) => {
    navigate(`/history/${item.type}/${item.id}`);
  };

  return (
    <MainLayout>
      <div className="bg-bg-base min-h-screen py-8">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-3xl font-extrabold text-text-primary mb-6">
            Riwayat Scan
          </h1>

          <div className="flex gap-2 mb-6">
            {["all", "bpom", "ocr"].map((type) => (
              <button
                key={type}
                onClick={() => setFilter(type)}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                  filter === type
                    ? "bg-primary text-white"
                    : "bg-bg-surface text-text-secondary hover:bg-bg-base"
                }`}
              >
                {type === "all"
                  ? "Semua"
                  : type === "bpom"
                  ? "BPOM"
                  : "Nutrisi"}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-24 bg-gray-100 rounded-2xl animate-pulse"
                ></div>
              ))}
            </div>
          ) : history.length === 0 ? (
            <Card className="p-12 text-center">
              <svg
                className="w-16 h-16 mx-auto mb-4 text-gray-300"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
              <p className="text-text-secondary mb-4">Belum ada riwayat</p>
              <Button onClick={() => navigate("/scanner")}>Mulai Scan</Button>
            </Card>
          ) : (
            <div className="space-y-4">
              {history.map((item) => (
                <Card
                  key={item.id}
                  className="p-4 hover:shadow-lg transition-all cursor-pointer"
                  onClick={() => viewDetail(item)}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        item.type === "bpom"
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
                        {item.type === "bpom" ? (
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

                    <div className="flex-1">
                      <h3 className="font-bold text-text-primary">
                        {item.title}
                      </h3>
                      <p className="text-sm text-text-secondary">
                        {item.subtitle}
                      </p>
                    </div>

                    <div className="text-right">
                      {item.score && (
                        <span className="inline-block px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-bold mb-1">
                          {item.score}/100
                        </span>
                      )}
                      <p className="text-xs text-text-secondary">
                        {new Date(item.date).toLocaleDateString("id-ID")}
                      </p>
                    </div>

                    <svg
                      className="w-5 h-5 text-text-secondary"
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
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default History;
