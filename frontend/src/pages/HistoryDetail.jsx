import { useState, useEffect } from "react";
import {
  useParams,
  useNavigate,
  Link,
  useSearchParams,
} from "react-router-dom";
import { MainLayout } from "../components/layouts";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import NutritionLabel from "../components/ui/NutritionLabel";
import AnimatedStatus from "../components/ui/AnimatedStatus";
import api from "../config/api";
import { useTranslation } from "react-i18next";

const HistoryDetail = () => {
  const { t, i18n } = useTranslation();
  const { id, type } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showImage, setShowImage] = useState(false);
  const [searchParams] = useSearchParams();
  const fromSource = searchParams.get("from");

  // Chat State
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);

  const getBackLink = () => {
    const defaultNav = { url: "/history", text: t("nav.history") };
    if (fromSource === "favorites")
      return { url: "/favorites", text: t("nav.favorites") };
    if (fromSource === "dashboard")
      return { url: "/dashboard", text: t("nav.dashboard") };
    return defaultNav;
  };

  const backLink = getBackLink();

  useEffect(() => {
    fetchDetail();
  }, [id, type]);

  const fetchDetail = async () => {
    const endpoint = `/scan/${type}/${id}`;

    try {
      const { data: result } = await api.get(endpoint);

      let processedData = result.data || result;

      if (type === "bpom" && processedData.raw_response) {
        if (typeof processedData.raw_response === "object") {
          processedData = { ...processedData, ...processedData.raw_response };
        }
      }

      if (type === "ocr") {
        if (processedData.ocr_raw_data) {
          if (typeof processedData.ocr_raw_data === "string") {
            processedData.nutrition_data = JSON.parse(
              processedData.ocr_raw_data
            );
          } else {
            processedData.nutrition_data = processedData.ocr_raw_data;
          }
        }

        if (processedData.ai_analysis) {
          processedData.summary = processedData.ai_analysis;
        }
      }

      if (processedData.created_at && !processedData.scanned_at) {
        processedData.scanned_at = processedData.created_at;
      }

      setData(processedData);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleChatSubmit = async (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const question = chatInput;
    setChatHistory([...chatHistory, { role: "user", text: question }]);
    setChatInput("");
    setChatLoading(true);

    const productContext = {
      product_name: data.product_name,
      nutrition: data.nutrition_data,
      ingredients: data.ingredients,
      summary: data.summary,
      grade: data.grade,
      health_score: data.health_score,
      warnings: data.warnings,
    };

    try {
      const { data: response } = await api.post("/scan/chat", {
        product_context: JSON.stringify(productContext),
        question,
        language: i18n.language,
      });
      setChatHistory((prev) => [
        ...prev,
        { role: "ai", text: response.answer },
      ]);
    } catch {
      setChatHistory((prev) => [
        ...prev,
        {
          role: "ai",
          text: t("scanner.errorChatFailed") || "Maaf, terjadi kesalahan.",
        },
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="bg-bg-base min-h-screen py-8 flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      </MainLayout>
    );
  }

  if (!data) {
    return (
      <MainLayout>
        <div className="bg-bg-base min-h-screen py-8">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <p className="text-text-secondary mb-4">{t("history.notFound")}</p>
            <Button onClick={() => navigate("/history")}>
              {t("common.back")}
            </Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="bg-bg-base min-h-screen py-8">
        <div className="max-w-4xl mx-auto px-4">
          <Link
            to={backLink.url}
            className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-primary mb-6 font-bold"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            {t("history.backTo")} {backLink.text}
          </Link>

          {type === "bpom" ? (
            <div className="text-center animate-fade-in-up">
              <AnimatedStatus type="success" />
              <h2 className="text-2xl font-extrabold text-text-primary mb-6">
                {t("history.bpomRegistered")}
              </h2>
              <Card className="p-6 text-left">
                <div>
                  <p className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">
                    {t("history.productName")}
                  </p>
                  <p className="font-bold text-lg text-text-primary">
                    {data.product_name}
                  </p>
                  {data.brand && data.brand !== "-" && (
                    <span className="inline-block mt-1 text-xs font-bold px-2 py-0.5 bg-primary/10 text-primary rounded">
                      {data.brand}
                    </span>
                  )}
                </div>
                <div className="w-full h-px bg-border/50 my-4"></div>
                <div className="grid grid-cols-2 gap-y-4 gap-x-2">
                  <div>
                    <p className="text-[10px] font-bold text-text-secondary uppercase">
                      {t("history.regNumber")}
                    </p>
                    <p className="font-mono font-bold text-sm text-text-primary">
                      {data.bpom_number}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-text-secondary uppercase">
                      {t("history.status")}
                    </p>
                    <p className="font-bold text-sm text-success">
                      {data.status || t("history.statusRegistered")}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-[10px] font-bold text-text-secondary uppercase">
                      {t("history.manufacturer")}
                    </p>
                    <p className="text-sm font-semibold text-text-primary">
                      {data.manufacturer || "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-text-secondary uppercase">
                      {t("history.issued")}
                    </p>
                    <p className="text-xs font-medium">
                      {data.issued_date || "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-text-secondary uppercase">
                      {t("history.expired")}
                    </p>
                    <p className="text-xs font-medium text-error">
                      {data.expired_date || "-"}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-[10px] font-bold text-text-secondary uppercase">
                      {t("history.packaging")}
                    </p>
                    <p className="text-xs font-medium text-text-primary">
                      {data.packaging || "-"}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-[10px] font-bold text-text-secondary uppercase">
                      {t("history.scanDate")}
                    </p>
                    <p className="text-xs font-medium text-text-primary">
                      {new Date(
                        data.created_at || data.scanned_at
                      ).toLocaleString(i18n.language)}
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          ) : (
            <div className="space-y-6 animate-fade-in-up">
              <div className="text-center">
                <h2 className="text-2xl font-extrabold text-text-primary mb-3">
                  {data.product_name || t("common.nutritionAILabel")}
                </h2>
                <div className="flex items-center justify-center gap-3">
                  <div className="px-4 py-1 bg-secondary/10 text-secondary rounded-full font-bold">
                    Health Score: {Math.round(data.health_score || 0)}/100
                  </div>
                  <div className="px-3 py-1 bg-primary/10 text-primary rounded-full font-bold text-sm">
                    Grade {data.grade || "?"}
                  </div>
                </div>
                <p className="text-xs text-text-secondary mt-3">
                  {t("history.scannedAt")}{" "}
                  {new Date(data.scanned_at).toLocaleString(i18n.language)}
                </p>
              </div>

              <Card className="p-4 mb-4 text-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowImage(!showImage)}
                >
                  {t(showImage ? "history.hideImage" : "history.viewImage")}{" "}
                  {t("history.imageLabel")}
                </Button>
                {showImage && (
                  <img
                    src={data.image_data}
                    alt="Scanned"
                    className="w-full rounded-lg mt-3"
                  />
                )}
              </Card>

              {data.warnings && data.warnings.length > 0 && (
                <div className="bg-error/10 border border-error rounded-2xl p-4 flex gap-3 text-left">
                  <svg
                    className="w-6 h-6 text-error shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                  <div>
                    <h4 className="font-bold text-error text-sm">
                      {t("history.allergyWarningTitle")}
                    </h4>
                    <p className="text-xs text-text-primary mt-1">
                      {t("history.allergyWarningContent")}{" "}
                      <strong>{data.warnings.join(", ")}</strong>
                    </p>
                  </div>
                </div>
              )}

              <NutritionLabel data={data.nutrition_data} />

              {data.summary && (
                <Card className="p-5">
                  <h4 className="font-bold text-text-primary mb-2">
                    {t("history.summary")}
                  </h4>
                  <p className="text-sm text-text-secondary italic leading-relaxed">
                    "{data.summary}"
                  </p>
                </Card>
              )}

              {(data.pros?.length > 0 || data.cons?.length > 0) && (
                <div className="grid grid-cols-2 gap-4">
                  {data.pros?.length > 0 && (
                    <Card className="p-4 bg-success/5 border-success/20">
                      <h4 className="font-bold text-success text-xs mb-2 flex items-center gap-1">
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        {t("history.pros")}
                      </h4>
                      <ul className="space-y-1 text-xs text-text-primary">
                        {data.pros.map((pro, i) => (
                          <li key={i}>• {pro}</li>
                        ))}
                      </ul>
                    </Card>
                  )}
                  {data.cons?.length > 0 && (
                    <Card className="p-4 bg-error/5 border-error/20">
                      <h4 className="font-bold text-error text-xs mb-2 flex items-center gap-1">
                        <svg
                          className="w-4 h-4"
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
                        {t("history.cons")}
                      </h4>
                      <ul className="space-y-1 text-xs text-text-primary">
                        {data.cons.map((con, i) => (
                          <li key={i}>• {con}</li>
                        ))}
                      </ul>
                    </Card>
                  )}
                </div>
              )}

              {data.ingredients && (
                <Card className="p-4">
                  <h4 className="font-bold text-text-primary text-sm mb-2">
                    {t("history.ingredients")}
                  </h4>
                  <p className="text-xs text-text-secondary leading-relaxed">
                    {data.ingredients}
                  </p>
                </Card>
              )}

              <div className="pt-6 border-t border-border">
                <h3 className="font-bold text-text-primary mb-4">
                  {t("scanner.askAI") || "Tanya AI tentang Produk Ini"}
                </h3>
                <div className="space-y-3 mb-4 max-h-48 overflow-y-auto px-1">
                  {chatHistory.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`p-3 rounded-2xl text-sm ${
                        msg.role === "user"
                          ? "bg-primary/10 ml-8 text-right"
                          : "bg-bg-base mr-8 text-left"
                      }`}
                    >
                      <strong className="block text-xs text-text-secondary mb-1">
                        {msg.role === "user"
                          ? t("scanner.you") || "Anda"
                          : t("scanner.ai") || "AI"}
                      </strong>
                      {msg.text}
                    </div>
                  ))}
                </div>
                <form onSubmit={handleChatSubmit} className="flex gap-2">
                  <input
                    type="text"
                    className="flex-1 px-4 py-3 rounded-xl border border-border bg-bg-surface focus:ring-2 focus:ring-primary/20 outline-none text-sm"
                    placeholder={
                      t("scanner.askSomething") || "Tanya sesuatu..."
                    }
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    disabled={chatLoading}
                  />
                  <Button
                    size="sm"
                    type="submit"
                    disabled={chatLoading || !chatInput}
                  >
                    {chatLoading ? "..." : t("scanner.send") || "Kirim"}
                  </Button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default HistoryDetail;
