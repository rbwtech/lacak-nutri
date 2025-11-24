import { useState, useEffect, useCallback } from "react";
import { MainLayout } from "../components/layouts";
import { useAuth } from "../context/AuthContext";
import Card from "../components/ui/Card";
import SuccessModal from "../components/ui/SuccessModal";
import api from "../config/api";
import { useSmartCaptcha } from "../hooks/useSmartCaptcha";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useScannerCamera } from "../hooks/useScannerCamera";
import CameraView from "../components/scanner/CameraView";
import ScanResult from "../components/scanner/ScanResult";

const simulateRealisticProgress = (callback) => {
  let progress = 0;
  const interval = setInterval(() => {
    if (progress < 30) {
      progress += Math.random() * 2;
    } else if (progress < 60) {
      progress += Math.random() * 1;
    } else if (progress < 85) {
      progress += Math.random() * 0.5;
    } else if (progress < 98) {
      progress += Math.random() * 0.1;
    }

    progress = Math.min(progress, 99);

    callback(Math.round(progress * 10) / 10);
  }, 200);

  return interval;
};

const Scanner = () => {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { getToken } = useSmartCaptcha();

  // Core State
  const [scanMode, setScanMode] = useState("ocr");
  const [bpomInput, setBpomInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState(t("scanner.processing"));
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [ocrImage, setOcrImage] = useState(null);
  const [productName, setProductName] = useState("");
  const [myAllergies, setMyAllergies] = useState([]);
  const [isFavorited, setIsFavorited] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Chat State
  const [chatHistory, setChatHistory] = useState([]);
  const [chatLoading, setChatLoading] = useState(false);

  // Live Scan Toggle State
  const [liveScanMode, setLiveScanMode] = useState(false);
  const [liveOcrText, setLiveOcrText] = useState("");

  // Hook for Camera/Scanning Logic
  const {
    videoRef,
    stopCamera,
    startCamera,
    captureImage,
    handleZoom,
    toggleFlash,
    switchCamera,
    availableCameras,
    isScannerActive,
    hasZoom,
    zoomLevel,
    hasFlash,
    flashOn,
    qrBoxPositions,
    handleBarcodeSuccess: handleBarcodeSuccessFromHook,
    stopLiveScan,
    cleanBarcodeData,
    handleBarcodeTap,
  } = useScannerCamera({
    scanMode,
    setResult,
    setError,
    setOcrImage,
    setLiveOcrText,
    liveScanMode,
    t,
    getToken,
    setLoading,
    setLoadingMessage,
  });

  const checkFavoriteStatus = useCallback(
    async (type, id) => {
      if (!user || !id) return;
      try {
        const { data } = await api.get(`/favorites/status/${type}/${id}`);
        setIsFavorited(data.is_favorited);
      } catch (e) {
        console.error("Gagal memeriksa status favorit:", e);
        setIsFavorited(false);
      }
    },
    [user]
  );

  useEffect(() => {
    if (result && result.scan_id && user) {
      checkFavoriteStatus(result.type, result.scan_id);
    } else {
      setIsFavorited(false);
    }
  }, [result, user, checkFavoriteStatus]);

  useEffect(() => {
    const fetchAllergies = async () => {
      try {
        const { data } = await api.get("/users/my-allergies");
        setMyAllergies(data.map((a) => a.name.toLowerCase()));
      } catch (e) {
        console.error(t("scanner.errorLoadAllergies"), e);
      }
    };

    if (user) {
      fetchAllergies();
    }
  }, [user, t]);

  const processImageAnalysis = async () => {
    if (!productName.trim()) {
      setError(t("scanner.errorProductNameRequired"));
      return;
    }

    setLoading(true);
    setError(null);

    const base64Length = ocrImage.length;
    const sizeInMB = (base64Length * 0.75) / (1024 * 1024);

    if (sizeInMB > 5) {
      setError(t("scanner.errorImageTooLarge"));
      setLoading(false);
      return;
    }

    setLoadingMessage(t("scanner.loadingOptimizing"));

    const progressInterval = simulateRealisticProgress((prog) => {
      setLoadingProgress(prog);

      if (prog < 30) {
        setLoadingMessage(t("scanner.loadingOptimizing"));
      } else if (prog < 60) {
        setLoadingMessage(t("scanner.loadingSending"));
      } else if (prog < 90) {
        setLoadingMessage(t("scanner.loadingAI"));
      } else {
        setLoadingMessage(t("scanner.loadingProcessing"));
      }
    });

    try {
      const token = await getToken("scan_ocr");

      if (!token) throw new Error("Gagal memverifikasi keamanan (Captcha).");

      const { data } = await api.post(
        "/scan/analyze",
        {
          product_name: productName,
          image_base64: ocrImage,
          language: i18n.language,
        },
        {
          headers: {
            "X-Recaptcha-Token": token,
          },
        }
      );

      clearInterval(progressInterval);

      let finalProgress = loadingProgress;
      const finishInterval = setInterval(() => {
        finalProgress += 5;
        setLoadingProgress(finalProgress);

        if (finalProgress >= 100) {
          clearInterval(finishInterval);
          setLoadingMessage(t("scanner.loadingDone"));

          setTimeout(() => {
            if (!data.success)
              throw new Error(data.message || t("scanner.errorAnalysisFailed"));

            const textCheck = (data.data.ingredients || "").toLowerCase();
            const allergyWarnings = myAllergies
              .filter((a) => textCheck.includes(a))
              .map((a) => a.charAt(0).toUpperCase() + a.slice(1));

            setResult({
              type: "ocr",
              found: true,
              data: data.data,
              allergyWarnings: allergyWarnings,
              scan_id: data.data?.id,
            });
            setError(null);
            setLoading(false);
            setLoadingProgress(0);

            if (document.hidden) {
              new Notification("LacakNutri", {
                body: t("scanner.notificationComplete"),
                icon: "/lacaknutri.svg",
              });
            }
          }, 300);
        }
      }, 50);
    } catch (err) {
      clearInterval(progressInterval);
      console.error(t("scanner.errorAnalysis"), err);

      let errorMsg;
      const status = err.response?.status;
      const detail = err.response?.data?.detail;
      if (status) {
        if (detail) {
          errorMsg = detail;
        } else if (status === 413) {
          errorMsg = t("scanner.errorImageTooLarge");
        } else if (status === 500) {
          errorMsg = t("scanner.errorServer");
        } else if (status === 429) {
          errorMsg = t("scanner.errorTooManyRequests");
        } else {
          errorMsg = t("scanner.errorProcessingFailed");
        }
      } else {
        errorMsg = err.message || t("scanner.errorProcessingFailed");
      }

      setError(errorMsg);
      setResult(null);
      setLoading(false);
      setLoadingProgress(0);
    }
  };

  const handleAddToFavorites = async () => {
    if (!user) {
      if (window.confirm(t("scanner.confirmLoginFav"))) {
        navigate("/login");
      }
      return;
    }

    if (!result || !result.scan_id) {
      alert(t("scanner.errorNoScanID"));
      return;
    }

    try {
      const { data } = await api.post(
        `/favorites/${result.type}/${result.scan_id}/toggle`
      );
      setIsFavorited(data.is_favorited);

      setSuccessMessage(
        data.is_favorited
          ? t("history.addedToFav")
          : t("history.removedFromFav")
      );
      setShowSuccess(true);
    } catch (e) {
      console.error(e);
      setSuccessMessage(
        e.response?.data?.detail || t("scanner.errorAddingFav")
      );
      setShowSuccess(true);
    }
  };

  const resetScan = () => {
    setResult(null);
    setError(null);
    setOcrImage(null);
    setProductName("");
    setBpomInput("");
    setChatHistory([]);
    setLiveOcrText("");
    setIsFavorited(false);
    stopCamera();
    stopLiveScan();
  };

  const switchMode = (mode) => {
    resetScan();
    setScanMode(mode);
  };

  const toggleLiveScan = () => {
    if (liveScanMode) {
      stopLiveScan();
      setLiveScanMode(false);
    } else {
      setLiveScanMode(true);
      if (isScannerActive) startCamera(true);
      else startCamera(true);
    }
  };

  return (
    <MainLayout>
      <div className="bg-bg-base min-h-screen py-8">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-extrabold text-text-primary mb-2">
              {t("scanner.title")}
            </h1>
            <p className="text-text-secondary">
              {scanMode === "barcode"
                ? t("scanner.checkLegality")
                : t("scanner.smartAnalysis")}
            </p>
          </div>

          {!result && (
            <div className="bg-bg-surface p-1 rounded-2xl border border-border flex mb-6 shadow-sm">
              {["barcode", "ocr"].map((mode) => (
                <button
                  key={mode}
                  onClick={() => switchMode(mode)}
                  className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${
                    scanMode === mode
                      ? "bg-primary text-white shadow-md"
                      : "text-text-secondary hover:bg-gray-50"
                  }`}
                >
                  {mode === "barcode" ? t("scanner.barcode") : t("scanner.ocr")}
                </button>
              ))}
            </div>
          )}

          <Card className="relative">
            {loading && (
              <div className="absolute inset-0 bg-bg-surface/95 backdrop-blur-sm z-40 flex flex-col items-center justify-center p-4 rounded-3xl">
                <div className="w-full max-w-xs space-y-4">
                  <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
                  <p className="text-primary font-bold text-center animate-pulse">
                    {loadingMessage}
                  </p>
                  {loadingProgress > 0 && (
                    <>
                      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-primary h-full rounded-full transition-all duration-300 ease-out"
                          style={{ width: `${loadingProgress}%` }}
                        ></div>
                      </div>
                      <p className="text-center text-xs text-text-secondary font-medium">
                        {loadingProgress}%
                      </p>
                    </>
                  )}
                </div>
              </div>
            )}

            <div id="reader-hidden" className="hidden"></div>

            {!result ? (
              <CameraView
                scanMode={scanMode}
                isScannerActive={isScannerActive}
                ocrImage={ocrImage}
                setOcrImage={setOcrImage}
                productName={productName}
                setProductName={setProductName}
                processImageAnalysis={processImageAnalysis}
                handleBarcodeSuccess={handleBarcodeSuccessFromHook}
                cleanBarcodeData={cleanBarcodeData}
                videoRef={videoRef}
                qrBoxPositions={qrBoxPositions}
                handleBarcodeTap={handleBarcodeTap}
                liveScanMode={liveScanMode}
                liveOcrText={liveOcrText}
                hasZoom={hasZoom}
                zoomLevel={zoomLevel}
                hasFlash={hasFlash}
                flashOn={flashOn}
                availableCameras={availableCameras}
                bpomInput={bpomInput}
                setBpomInput={setBpomInput}
                startCamera={startCamera}
                stopCamera={stopCamera}
                captureImage={captureImage}
                handleZoom={handleZoom}
                toggleFlash={toggleFlash}
                switchCamera={switchCamera}
                toggleLiveScan={toggleLiveScan}
                t={t}
              />
            ) : (
              <ScanResult
                result={result}
                productName={productName}
                isFavorited={isFavorited}
                chatHistory={chatHistory}
                chatLoading={chatLoading}
                setChatLoading={setChatLoading}
                setChatHistory={setChatHistory}
                handleAddToFavorites={handleAddToFavorites}
                resetScan={resetScan}
                i18n={i18n}
              />
            )}

            {error && !result && (
              <div className="p-6">
                <div className="mt-4 p-4 bg-error/10 text-error text-sm rounded-xl text-center font-bold border border-error/20">
                  {error}
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
      <SuccessModal
        isOpen={showSuccess}
        onClose={() => setShowSuccess(false)}
        message={successMessage}
        type="favorite"
      />
    </MainLayout>
  );
};

export default Scanner;
