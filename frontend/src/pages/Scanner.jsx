import { useState, useEffect, useRef, useCallback } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { useDropzone } from "react-dropzone";
import { MainLayout } from "../components/layouts";
import { useAuth } from "../context/AuthContext";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import AnimatedStatus from "../components/ui/AnimatedStatus";
import NutritionLabel from "../components/ui/NutritionLabel";
import SuccessModal from "../components/ui/SuccessModal";
import api from "../config/api";
import { useSmartCaptcha } from "../hooks/useSmartCaptcha";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

const Scanner = () => {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [scanMode, setScanMode] = useState("ocr");
  const [bpomInput, setBpomInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState(t("scanner.processing"));
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const [isScannerActive, setIsScannerActive] = useState(false);
  const [ocrImage, setOcrImage] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [hasZoom, setHasZoom] = useState(false);
  const [myAllergies, setMyAllergies] = useState([]);
  const [isFavorited, setIsFavorited] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const [flashOn, setFlashOn] = useState(false);
  const [hasFlash, setHasFlash] = useState(false);
  const [facingMode, setFacingMode] = useState("environment");
  const [availableCameras, setAvailableCameras] = useState([]);
  const [qrBoxPosition, setQrBoxPosition] = useState(null);
  const [liveScanMode, setLiveScanMode] = useState(false);
  const [liveOcrText, setLiveOcrText] = useState("");

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const scanIntervalRef = useRef(null);
  const liveScanIntervalRef = useRef(null);
  const { getToken } = useSmartCaptcha();

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

    enumerateCameras();

    return () => {
      stopCamera();
      stopLiveScan();
    };
  }, [user, t]);

  const enumerateCameras = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const cameras = devices.filter((d) => d.kind === "videoinput");
      setAvailableCameras(cameras);
    } catch (e) {
      console.error(t("scanner.errorCameraEnum"), e);
    }
  };

  const cleanBarcodeData = (raw) => {
    let cleaned = raw.trim();
    cleaned = cleaned.replace(/^\(\d{2,3}\)/, "");
    cleaned = cleaned.split(/\(\d{2,3}\)/)[0];
    cleaned = cleaned.replace(/[^a-zA-Z0-9\s-]/g, "");
    return cleaned.trim();
  };

  const startCamera = async () => {
    stopCamera();
    setResult(null);
    setOcrImage(null);
    setError(null);
    setIsScannerActive(true);

    try {
      const constraints = {
        video: {
          facingMode: facingMode,
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      const track = stream.getVideoTracks()[0];
      const capabilities = track.getCapabilities ? track.getCapabilities() : {};

      if (capabilities.zoom) setHasZoom(true);
      if (capabilities.torch) setHasFlash(true);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play();
          if (scanMode === "barcode") startBarcodeScanLoop();
          if (liveScanMode) startLiveScan();
        };
      }
    } catch (err) {
      setError(t("scanner.errorCameraAccess"));
      setIsScannerActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
    setIsScannerActive(false);
    setQrBoxPosition(null);
  };

  const toggleFlash = async () => {
    if (!streamRef.current) return;
    const track = streamRef.current.getVideoTracks()[0];

    try {
      await track.applyConstraints({
        advanced: [{ torch: !flashOn }],
      });
      setFlashOn(!flashOn);
    } catch (e) {
      console.error(t("scanner.errorFlash"), e);
    }
  };

  const switchCamera = async () => {
    const newMode = facingMode === "environment" ? "user" : "environment";
    setFacingMode(newMode);
    if (isScannerActive) {
      stopCamera();
      setTimeout(() => startCamera(), 100);
    }
  };

  const startBarcodeScanLoop = () => {
    if ("BarcodeDetector" in window) {
      const detector = new window.BarcodeDetector({
        formats: ["qr_code", "ean_13", "ean_8", "code_128"],
      });

      scanIntervalRef.current = setInterval(async () => {
        if (videoRef.current && videoRef.current.readyState === 4) {
          try {
            const barcodes = await detector.detect(videoRef.current);
            if (barcodes.length > 0) {
              const barcode = barcodes[0];

              const box = barcode.boundingBox;
              const videoRect = videoRef.current.getBoundingClientRect();
              const scaleX = videoRect.width / videoRef.current.videoWidth;
              const scaleY = videoRect.height / videoRef.current.videoHeight;

              setQrBoxPosition({
                x: box.x * scaleX,
                y: box.y * scaleY,
                width: box.width * scaleX,
                height: box.height * scaleY,
              });

              clearInterval(scanIntervalRef.current);
              setTimeout(() => {
                const cleaned = cleanBarcodeData(barcode.rawValue);
                handleBarcodeSuccess(cleaned);
              }, 300);
            } else {
              setQrBoxPosition(null);
            }
          } catch (e) {}
        }
      }, 300);
    }
  };

  const startLiveScan = () => {
    liveScanIntervalRef.current = setInterval(async () => {
      if (videoRef.current && videoRef.current.readyState === 4) {
        const canvas = document.createElement("canvas");
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(videoRef.current, 0, 0);

        const croppedCanvas = autoCropNutritionLabel(canvas);
        const dataUrl = croppedCanvas.toDataURL("image/jpeg", 0.85);

        try {
          const { data } = await api.post("/scan/ocr-text", {
            image_base64: dataUrl,
          });

          if (data.text) {
            setLiveOcrText((prev) => prev + "\n" + data.text);
          }
        } catch (e) {}
      }
    }, 2000);
  };

  const stopLiveScan = () => {
    if (liveScanIntervalRef.current) {
      clearInterval(liveScanIntervalRef.current);
      liveScanIntervalRef.current = null;
    }
  };

  const autoCropNutritionLabel = (canvas) => {
    const ctx = canvas.getContext("2d");
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    let minX = canvas.width,
      minY = canvas.height,
      maxX = 0,
      maxY = 0;

    for (let y = 0; y < canvas.height; y++) {
      for (let x = 0; x < canvas.width; x++) {
        const i = (y * canvas.width + x) * 4;
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const brightness = (r + g + b) / 3;

        if (brightness < 200) {
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }
    }

    const padding = 20;
    minX = Math.max(0, minX - padding);
    minY = Math.max(0, minY - padding);
    maxX = Math.min(canvas.width, maxX + padding);
    maxY = Math.min(canvas.height, maxY + padding);

    const cropWidth = maxX - minX;
    const cropHeight = maxY - minY;

    const croppedCanvas = document.createElement("canvas");
    croppedCanvas.width = cropWidth;
    croppedCanvas.height = cropHeight;
    const croppedCtx = croppedCanvas.getContext("2d");
    croppedCtx.drawImage(
      canvas,
      minX,
      minY,
      cropWidth,
      cropHeight,
      0,
      0,
      cropWidth,
      cropHeight
    );

    return croppedCanvas;
  };

  const handleZoom = (e) => {
    const level = parseFloat(e.target.value);
    setZoomLevel(level);
    if (streamRef.current) {
      const track = streamRef.current.getVideoTracks()[0];
      if (track && track.getCapabilities().zoom) {
        track.applyConstraints({ advanced: [{ zoom: level }] });
      }
    }
  };

  const captureImage = async () => {
    if (videoRef.current) {
      const canvas = document.createElement("canvas");
      const maxWidth = 1024;
      const videoWidth = videoRef.current.videoWidth;
      const videoHeight = videoRef.current.videoHeight;
      const scaleFactor = videoWidth > maxWidth ? maxWidth / videoWidth : 1;

      canvas.width = videoWidth * scaleFactor;
      canvas.height = videoHeight * scaleFactor;

      const ctx = canvas.getContext("2d");
      ctx.filter = "contrast(1.1) brightness(1.05)";
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

      let finalCanvas = canvas;
      if (scanMode === "ocr") {
        finalCanvas = autoCropNutritionLabel(canvas);
      }

      const blob = await new Promise((resolve) =>
        finalCanvas.toBlob(resolve, "image/webp", 0.8)
      );

      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result;

        stopCamera();

        if (scanMode === "barcode") {
          const scanner = new Html5Qrcode("reader-hidden");
          scanner
            .scanFileV2(dataUrl, true)
            .then((raw) => {
              const cleaned = cleanBarcodeData(raw);
              handleBarcodeSuccess(cleaned);
            })
            .catch(() => setError(t("scanner.errorBarcodeScan")));
        } else {
          setOcrImage(dataUrl);
        }
      };
      reader.readAsDataURL(blob);
    }
  };

  const handleBarcodeSuccess = async (code) => {
    stopCamera();
    setLoading(true);
    setLoadingMessage(t("scanner.loadingBPOM"));

    try {
      const token = await getToken("scan_ocr");

      if (!token) throw new Error("Gagal memverifikasi keamanan (Captcha).");
      const { data } = await api.post(
        "/scan/bpom",
        { bpom_number: code },
        {
          headers: {
            "X-Recaptcha-Token": token,
          },
        }
      );
      setResult({
        type: "bpom",
        found: data.found,
        data: data.data,
        code: data.searched_code || code,
        scan_id: data.data?.id,
      });
      setIsFavorited(false);
    } catch (err) {
      setError(t("scanner.errorBPOMFetch"));
    } finally {
      setLoading(false);
    }
  };

  const onDrop = useCallback(
    (acceptedFiles) => {
      const file = acceptedFiles[0];
      if (file) {
        if (scanMode === "barcode") {
          const scanner = new Html5Qrcode("reader-hidden");
          scanner
            .scanFile(file, true)
            .then((raw) => {
              const cleaned = cleanBarcodeData(raw);
              handleBarcodeSuccess(cleaned);
            })
            .catch(() => setError(t("scanner.errorBarcodeFile")));
        } else {
          const reader = new FileReader();
          reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
              const canvas = document.createElement("canvas");
              const maxWidth = 1024;
              const scaleFactor =
                img.width > maxWidth ? maxWidth / img.width : 1;

              canvas.width = img.width * scaleFactor;
              canvas.height = img.height * scaleFactor;

              const ctx = canvas.getContext("2d");
              ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

              canvas.toBlob(
                (blob) => {
                  const reader2 = new FileReader();
                  reader2.onloadend = () => {
                    setOcrImage(reader2.result);
                    stopCamera();
                  };
                  reader2.readAsDataURL(blob);
                },
                "image/webp",
                0.8
              );
            };
            img.src = e.target.result;
          };
          reader.readAsDataURL(file);
        }
      }
    },
    [scanMode, t]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    maxFiles: 1,
  });

  const [productName, setProductName] = useState("");

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
            setIsFavorited(false);
            setError(null);
            setLoading(false);
            setLoadingProgress(0);

            if (document.hidden) {
              new Notification("LacakNutri", {
                body: t("scanner.notificationComplete"),
                icon: "/icon-192x192.png",
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
        // Network error atau error client-side
        errorMsg = err.message || t("scanner.errorProcessingFailed");
      }

      setError(errorMsg);
      setResult(null);
      setLoading(false);
      setLoadingProgress(0);
    }
  };

  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  const handleChatSubmit = async (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const question = chatInput;
    setChatHistory([...chatHistory, { role: "user", text: question }]);
    setChatInput("");
    setChatLoading(true);

    try {
      const { data } = await api.post("/scan/chat", {
        product_context: JSON.stringify(result.data),
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
        data.is_favorited ? t("scanner.favAdded") : t("scanner.favRemoved")
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
      if (isScannerActive) startLiveScan();
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
              <div className="p-6">
                {isScannerActive ? (
                  <div className="relative rounded-3xl overflow-hidden bg-black w-full aspect-9/16 max-h-[70vh] shadow-2xl mx-auto border-4 border-white/20">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      className="absolute inset-0 w-full h-full object-cover"
                    ></video>

                    {qrBoxPosition && (
                      <div
                        className="absolute border-4 border-green-400 shadow-[0_0_20px_rgba(74,222,128,0.8)] transition-all duration-200"
                        style={{
                          left: `${qrBoxPosition.x}px`,
                          top: `${qrBoxPosition.y}px`,
                          width: `${qrBoxPosition.width}px`,
                          height: `${qrBoxPosition.height}px`,
                        }}
                      >
                        <div className="absolute -top-1 -left-1 w-4 h-4 border-t-4 border-l-4 border-green-400"></div>
                        <div className="absolute -top-1 -right-1 w-4 h-4 border-t-4 border-r-4 border-green-400"></div>
                        <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-4 border-l-4 border-green-400"></div>
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-4 border-r-4 border-green-400"></div>
                      </div>
                    )}

                    <div className="absolute inset-0 pointer-events-none border-2 border-white/30 m-6 rounded-2xl flex flex-col justify-between p-4">
                      <div className="text-white/90 text-xs font-bold bg-black/40 backdrop-blur-md py-1.5 px-4 rounded-full self-center">
                        {scanMode === "barcode"
                          ? t("scanner.aimBarcode")
                          : liveScanMode
                          ? t("scanner.liveScanActive")
                          : t("scanner.ensureTextRead")}
                      </div>
                      {!liveScanMode && (
                        <div className="w-full h-0.5 bg-primary/80 shadow-[0_0_15px_rgba(255,153,102,0.8)] animate-scanning-line"></div>
                      )}
                    </div>

                    <div className="absolute top-4 right-4 flex flex-col gap-2 z-20">
                      {hasFlash && (
                        <button
                          onClick={toggleFlash}
                          className={`w-10 h-10 rounded-full backdrop-blur-md flex items-center justify-center transition-all ${
                            flashOn
                              ? "bg-yellow-400 text-black"
                              : "bg-black/40 text-white"
                          }`}
                        >
                          <svg
                            className="w-5 h-5"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1h4v1a2 2 0 11-4 0zM12 14c.015-.34.208-.646.477-.859a4 4 0 10-4.954 0c.27.213.462.519.476.859h4.002z" />
                          </svg>
                        </button>
                      )}
                      {availableCameras.length > 1 && (
                        <button
                          onClick={switchCamera}
                          className="w-10 h-10 bg-black/40 backdrop-blur-md text-white rounded-full flex items-center justify-center"
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
                              d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                            />
                          </svg>
                        </button>
                      )}
                      {scanMode === "ocr" && (
                        <button
                          onClick={toggleLiveScan}
                          className={`w-10 h-10 rounded-full backdrop-blur-md flex items-center justify-center transition-all ${
                            liveScanMode
                              ? "bg-red-500 text-white"
                              : "bg-black/40 text-white"
                          }`}
                        >
                          {liveScanMode ? (
                            <svg
                              className="w-5 h-5"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z"
                                clipRule="evenodd"
                              />
                            </svg>
                          ) : (
                            <svg
                              className="w-5 h-5"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                                clipRule="evenodd"
                              />
                            </svg>
                          )}
                        </button>
                      )}
                    </div>

                    <div className="absolute bottom-8 left-0 right-0 flex flex-col items-center gap-6 z-20 px-6">
                      {hasZoom && (
                        <div className="w-full max-w-[200px] flex items-center gap-2 bg-black/40 backdrop-blur-md px-3 py-2 rounded-full">
                          <span className="text-white text-xs font-bold">
                            1x
                          </span>
                          <input
                            type="range"
                            min="1"
                            max="3"
                            step="0.1"
                            value={zoomLevel}
                            onChange={handleZoom}
                            className="w-full h-1 bg-white/30 rounded-lg appearance-none cursor-pointer accent-primary"
                          />
                          <span className="text-white text-xs font-bold">
                            3x
                          </span>
                        </div>
                      )}
                      <div className="flex items-center gap-8">
                        <Button
                          variant="ghost"
                          onClick={stopCamera}
                          className="text-white hover:bg-white/10 rounded-full w-12 h-12 flex items-center justify-center"
                        >
                          <svg
                            className="w-6 h-6"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </Button>
                        <button
                          onClick={captureImage}
                          className="w-20 h-20 bg-white rounded-full border-[6px] border-white/30 shadow-xl active:scale-90 transition-transform flex items-center justify-center"
                        >
                          <div className="w-16 h-16 bg-white rounded-full border-4 border-primary"></div>
                        </button>
                        <div className="w-12 h-12"></div>
                      </div>
                    </div>

                    {liveScanMode && liveOcrText && (
                      <div className="absolute bottom-32 left-4 right-4 bg-black/80 backdrop-blur-md text-white p-3 rounded-xl max-h-32 overflow-y-auto text-xs">
                        {liveOcrText}
                      </div>
                    )}
                  </div>
                ) : ocrImage && scanMode === "ocr" ? (
                  <div className="relative bg-black/5 rounded-3xl overflow-hidden border border-border">
                    <img
                      src={ocrImage}
                      className="w-full max-h-[60vh] object-contain mx-auto"
                      alt="Captured"
                    />

                    <div className="p-4 space-y-3 bg-bg-surface">
                      <Input
                        placeholder={t("scanner.productNameRequired")}
                        value={productName}
                        onChange={(e) => setProductName(e.target.value)}
                        className="border-2 border-primary/50 focus:border-primary"
                        required
                      />
                      <div className="flex gap-3">
                        <Button
                          variant="outline"
                          fullWidth
                          onClick={() => setOcrImage(null)}
                        >
                          {t("scanner.retry")}
                        </Button>
                        <Button fullWidth onClick={processImageAnalysis}>
                          {t("scanner.analyze")}
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div
                    {...getRootProps()}
                    className={`text-center p-10 border-2 border-dashed rounded-3xl transition-all cursor-pointer ${
                      isDragActive
                        ? "border-primary bg-primary/5 scale-[1.01]"
                        : "border-border bg-bg-base hover:border-primary/30"
                    }`}
                  >
                    <input {...getInputProps()} />
                    <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <svg
                        className="w-8 h-8"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                        />
                      </svg>
                    </div>
                    <p className="font-bold text-lg text-text-primary mb-1">
                      {t("scanner.tapCameraUpload")}
                    </p>
                    <p className="text-sm text-text-secondary mb-6">
                      {t("scanner.dragDrop")}{" "}
                      {scanMode === "barcode"
                        ? t("scanner.qrLabel")
                        : t("scanner.labelLabel")}{" "}
                      {t("scanner.hereLabel")}
                    </p>
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        startCamera();
                      }}
                      className="px-8 shadow-lg shadow-primary/30"
                    >
                      {t("scanner.openCamera")}
                    </Button>
                  </div>
                )}

                {scanMode === "barcode" && !isScannerActive && !ocrImage && (
                  <div className="mt-6">
                    <div className="flex items-center gap-3 justify-center mt-6 mb-4">
                      <span className="h-px flex-1 bg-border" />
                      <span className="text-xs font-semibold text-text-secondary tracking-wider">
                        {t("scanner.manualInput")}
                      </span>
                      <span className="h-px flex-1 bg-border" />
                    </div>
                    <label className="text-sm font-semibold text-text-primary mb-1 block">
                      {t("scanner.bpomCode")}
                    </label>
                    <div className="flex gap-2">
                      <Input
                        placeholder={t("scanner.example")}
                        value={bpomInput}
                        onChange={(e) => setBpomInput(e.target.value)}
                        containerClass="flex-1"
                        className="h-12"
                      />
                      <Button
                        className="h-12 px-6"
                        onClick={() => handleBarcodeSuccess(bpomInput)}
                        disabled={!bpomInput}
                      >
                        {t("scanner.check")}
                      </Button>
                    </div>
                    <p className="text-xs text-text-secondary mt-1">
                      {t("scanner.inputHint")}
                    </p>
                  </div>
                )}

                {error && (
                  <div className="mt-4 p-4 bg-error/10 text-error text-sm rounded-xl text-center font-bold border border-error/20">
                    {error}
                  </div>
                )}
              </div>
            ) : (
              <div className="p-8">
                {result.type === "bpom" ? (
                  <div className="text-center animate-fade-in-up">
                    <AnimatedStatus type={result.found ? "success" : "error"} />
                    <h2 className="text-2xl font-extrabold text-text-primary mb-6">
                      {result.found
                        ? t("scanner.registered")
                        : t("scanner.notFound")}
                    </h2>
                    {result.found ? (
                      <div className="bg-bg-base p-6 rounded-3xl border border-border text-left space-y-4">
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
                              <strong>
                                {result.allergyWarnings.join(", ")}
                              </strong>
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

                    {(result.data.pros?.length > 0 ||
                      result.data.cons?.length > 0) && (
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
                      {isFavorited
                        ? t("scanner.favorited")
                        : t("scanner.addToFavorites")}
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
                              {msg.role === "user"
                                ? t("scanner.you")
                                : t("scanner.ai")}
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
                          disabled={chatLoading}
                        />
                        <Button
                          size="sm"
                          type="submit"
                          disabled={chatLoading || !chatInput}
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
            )}
          </Card>
        </div>
      </div>
      <SuccessModal
        isOpen={showSuccess}
        onClose={() => setShowSuccess(false)}
        message={successMessage}
      />
    </MainLayout>
  );
};

export default Scanner;
