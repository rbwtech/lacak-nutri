import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import Button from "../ui/Button";
import Card from "../ui/Card";
import AnimatedStatus from "../ui/AnimatedStatus";
import NutritionLabel from "../ui/NutritionLabel";
import Input from "../ui/Input";
import api from "../../config/api";

const ScanResult = ({
  result,
  productName,
  isFavorited,
  chatHistory,
  setChatHistory,
  chatLoading,
  setChatLoading,
  handleAddToFavorites,
  resetScan,
  i18n,
}) => {
  const { t } = useTranslation();
  const [chatInput, setChatInput] = useState("");

  const handleChatSubmit = async (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const question = chatInput;
    setChatHistory((prev) => [...prev, { role: "user", text: question }]);
    setChatInput("");
    setChatLoading(true);

    const productContext = JSON.stringify(result.data);

    try {
      const { data } = await api.post("/scan/chat", {
        product_context: productContext,
        question,
        language: i18n.language,
      });
      setChatHistory((prev) => [...prev, { role: "ai", text: data.answer }]);
    } catch {
      setChatHistory((prev) => [
        ...prev,
        { role: "ai", text: t("scanner.errorChatFailed") },
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  return (
    <div className="p-8">
      {result.type === "bpom" ? (
        <div className="text-center animate-fade-in-up">
          <AnimatedStatus type={result.found ? "success" : "error"} />
          <h2 className="text-2xl font-extrabold text-text-primary mb-6">
            {result.found ? t("scanner.registered") : t("scanner.notFound")}
          </h2>
          {result.found ? (
            <div className="bg-bg-base p-6 rounded-3xl border border-border text-left space-y-4">
              {/* BPOM Detail Content */}
              <div>
                <p className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">
                  {t("history.productName")}
                </p>
                <p className="font-bold text-lg text-text-primary">
                  {result.data.product_name}
                </p>
                {result.data.brand && result.data.brand !== "-" && (
                  <span className="inline-block mt-1 text-xs font-bold px-2 py-0.5 bg-primary/10 text-primary rounded">
                    {result.data.brand}
                  </span>
                )}
              </div>
              <div className="w-full h-px bg-border/50"></div>
              <div className="grid grid-cols-2 gap-y-4 gap-x-2">
                <div>
                  <p className="text-[10px] font-bold text-text-secondary uppercase">
                    {t("history.regNumber")}
                  </p>
                  <p className="font-mono font-bold text-sm text-text-primary">
                    {result.data.bpom_number}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-text-secondary uppercase">
                    {t("history.status")}
                  </p>
                  <p className="font-bold text-sm text-success">
                    {result.data.status}
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="text-[10px] font-bold text-text-secondary uppercase">
                    {t("history.manufacturer")}
                  </p>
                  <p className="text-sm font-semibold text-text-primary">
                    {result.data.manufacturer}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-text-secondary uppercase">
                    {t("history.issued")}
                  </p>
                  <p className="text-xs font-medium">
                    {result.data.issued_date}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-text-secondary uppercase">
                    {t("history.expired")}
                  </p>
                  <p className="text-xs font-medium text-error">
                    {result.data.expired_date}
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="text-[10px] font-bold text-text-secondary uppercase">
                    {t("history.packaging")}
                  </p>
                  <p className="text-xs font-medium text-text-primary">
                    {result.data.packaging}
                  </p>
                </div>
              </div>

              <Button
                fullWidth
                onClick={handleAddToFavorites}
                className={`${
                  isFavorited
                    ? "bg-gray-400 hover:bg-gray-500"
                    : "bg-yellow-500 hover:bg-yellow-600"
                } text-white mt-4 flex items-center justify-center gap-2`}
              >
                <svg
                  className="w-5 h-5"
                  fill={isFavorited ? "currentColor" : "none"}
                  stroke="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                {isFavorited
                  ? t("scanner.favorited")
                  : t("scanner.addToFavorites")}
              </Button>
            </div>
          ) : (
            <div className="bg-bg-base p-6 rounded-3xl border border-dashed border-border text-text-secondary">
              <p className="mb-2">
                {t("scanner.code")} <strong>{result.code}</strong>{" "}
                {t("scanner.bpomNotFound")}
              </p>
              <p className="text-xs">{t("scanner.checkNumber")}</p>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-6 animate-fade-in-up">
          {/* OCR/AI Analysis Content */}
          <div className="text-center">
            <h2 className="text-2xl font-extrabold text-text-primary">
              {productName || t("scanner.aiAnalysisTitle")}
            </h2>
            <div className="flex items-center justify-center gap-3 mt-3">
              <div className="px-4 py-1 bg-secondary/10 text-secondary rounded-full font-bold">
                Health Score: {result.data.health_score || 0}/100
              </div>
              <div className="px-3 py-1 bg-primary/10 text-primary rounded-full font-bold text-sm">
                Grade {result.data.grade || "?"}
              </div>
            </div>

            {result.allergyWarnings?.length > 0 && (
              <div className="bg-error/10 border border-error rounded-2xl p-4 flex gap-3 text-left mt-4">
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
                    <strong>{result.allergyWarnings.join(", ")}</strong>
                  </p>
                </div>
              </div>
            )}
          </div>

          <NutritionLabel data={result.data.nutrition} />

          {result.data.summary && (
            <div className="bg-bg-base p-5 rounded-2xl border border-border text-sm text-text-secondary italic leading-relaxed">
              "{result.data.summary}"
            </div>
          )}

          {(result.data.pros?.length > 0 || result.data.cons?.length > 0) && (
            <div className="grid grid-cols-2 gap-4">
              {result.data.pros?.length > 0 && (
                <div className="bg-success/5 border border-success/20 rounded-2xl p-4">
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
                    {result.data.pros.map((pro, i) => (
                      <li key={i}>• {pro}</li>
                    ))}
                  </ul>
                </div>
              )}
              {result.data.cons?.length > 0 && (
                <div className="bg-error/5 border border-error/20 rounded-2xl p-4">
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
                    {result.data.cons.map((con, i) => (
                      <li key={i}>• {con}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {result.data.ingredients && (
            <div className="bg-bg-base border border-border rounded-2xl p-4">
              <h4 className="font-bold text-text-primary text-sm mb-2">
                {t("history.ingredients")}
              </h4>
              <p className="text-xs text-text-secondary leading-relaxed">
                {result.data.ingredients}
              </p>
            </div>
          )}

          <Button
            fullWidth
            onClick={handleAddToFavorites}
            className={`${
              isFavorited
                ? "bg-gray-400 hover:bg-gray-500"
                : "bg-yellow-500 hover:bg-yellow-600"
            } text-white flex items-center justify-center gap-2`}
          >
            <svg
              className="w-5 h-5"
              fill={isFavorited ? "currentColor" : "none"}
              stroke="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            {isFavorited ? t("scanner.favorited") : t("scanner.addToFavorites")}
          </Button>

          <div className="pt-6 border-t border-border">
            <h3 className="font-bold text-text-primary mb-4">
              {t("scanner.askAI")}
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
                    {msg.role === "user" ? t("scanner.you") : t("scanner.ai")}
                  </strong>
                  {msg.text}
                </div>
              ))}
            </div>
            <form onSubmit={handleChatSubmit} className="flex gap-2">
              <input
                type="text"
                className="flex-1 px-4 py-3 rounded-xl border border-border bg-bg-surface focus:ring-2 focus:ring-primary/20 outline-none text-sm"
                placeholder={t("scanner.askSomething")}
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                disabled={chatLoading || !result}
              />
              <Button
                size="sm"
                type="submit"
                disabled={chatLoading || !chatInput || !result}
              >
                {chatLoading ? "..." : t("scanner.send")}
              </Button>
            </form>
          </div>
        </div>
      )}
      <Button
        variant="outline"
        fullWidth
        onClick={resetScan}
        className="mt-8 h-12 font-bold"
      >
        {t("scanner.scanAnother")}
      </Button>
    </div>
  );
};

export default ScanResult;
