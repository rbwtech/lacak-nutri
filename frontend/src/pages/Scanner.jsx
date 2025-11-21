import { useState, useEffect, useRef, useCallback } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { useDropzone } from "react-dropzone";
import { MainLayout } from "../components/layouts";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import AnimatedStatus from "../components/ui/AnimatedStatus";
import NutritionLabel from "../components/ui/NutritionLabel";
import api from "../config/api";

const Scanner = () => {
  const [scanMode, setScanMode] = useState("barcode");
  const [bpomInput, setBpomInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("Memproses...");
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
  const canvasOverlayRef = useRef(null);

  useEffect(() => {
    const fetchAllergies = async () => {
      try {
        const { data } = await api.get("/users/my-allergies");
        setMyAllergies(data.map((a) => a.name.toLowerCase()));
      } catch (e) {
        console.error("Gagal load alergi", e);
      }
    };
    fetchAllergies();

    enumerateCameras();

    return () => {
      stopCamera();
      stopLiveScan();
    };
  }, []);

  const enumerateCameras = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const cameras = devices.filter((d) => d.kind === "videoinput");
      setAvailableCameras(cameras);
    } catch (e) {
      console.error("Camera enumeration failed", e);
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
      setError("Gagal akses kamera. Periksa izin browser.");
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
      console.error("Flash toggle failed", e);
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

  const captureImage = () => {
    if (videoRef.current) {
      const canvas = document.createElement("canvas");
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext("2d");
      ctx.filter = "contrast(1.1) brightness(1.05)";
      ctx.drawImage(videoRef.current, 0, 0);

      let finalCanvas = canvas;
      if (scanMode === "ocr") {
        finalCanvas = autoCropNutritionLabel(canvas);
      }

      const dataUrl = finalCanvas.toDataURL("image/jpeg", 0.92);

      stopCamera();

      if (scanMode === "barcode") {
        const scanner = new Html5Qrcode("reader-hidden");
        scanner
          .scanFileV2(dataUrl, true)
          .then((raw) => {
            const cleaned = cleanBarcodeData(raw);
            handleBarcodeSuccess(cleaned);
          })
          .catch(() => setError("Barcode tidak terbaca"));
      } else {
        setOcrImage(dataUrl);
      }
    }
  };

  const handleBarcodeSuccess = async (code) => {
    stopCamera();
    setLoading(true);
    setLoadingMessage("Mencari data BPOM...");

    try {
      const { data } = await api.post("/scan/bpom", { bpom_number: code });
      setResult({
        type: "bpom",
        found: data.found,
        data: data.data,
        code: data.searched_code || code,
      });
    } catch (err) {
      setError("Gagal mengambil data. Cek koneksi.");
    } finally {
      setLoading(false);
    }
  };

  const onDrop = useCallback(
    (acceptedFiles) => {
      const file = acceptedFiles[0];
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          if (scanMode === "barcode") {
            const scanner = new Html5Qrcode("reader-hidden");
            scanner
              .scanFile(file, true)
              .then((raw) => {
                const cleaned = cleanBarcodeData(raw);
                handleBarcodeSuccess(cleaned);
              })
              .catch(() => setError("Barcode tidak terbaca dari file"));
          } else {
            setOcrImage(reader.result);
            stopCamera();
          }
        };
        reader.readAsDataURL(file);
      }
    },
    [scanMode]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    maxFiles: 1,
  });

  const processImageAnalysis = async () => {
    setLoading(true);
    setLoadingMessage("Analisis AI sedang bekerja...");
    setError(null);

    try {
      const { data } = await api.post("/scan/analyze", {
        image_base64: ocrImage,
      });

      if (!data.success) throw new Error(data.message);

      const textCheck = (
        (data.data.ingredients || "") +
        " " +
        (data.data.warnings?.join(" ") || "")
      ).toLowerCase();

      const warnings = myAllergies
        .filter((a) => textCheck.includes(a))
        .map((a) => a.charAt(0).toUpperCase() + a.slice(1));

      setResult({
        type: "ocr",
        found: true,
        data: data.data,
        allergyWarnings: warnings,
      });
    } catch (err) {
      setError(err.response?.data?.message || "Gagal memproses gambar");
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

    try {
      const { data } = await api.post("/scan/chat", {
        product_context: JSON.stringify(result.data),
        question,
      });
      setChatHistory((prev) => [...prev, { role: "ai", text: data.answer }]);
    } catch {
      setChatHistory((prev) => [
        ...prev,
        { role: "ai", text: "Gagal membalas" },
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  const resetScan = () => {
    setResult(null);
    setError(null);
    setOcrImage(null);
    setBpomInput("");
    setChatHistory([]);
    setLiveOcrText("");
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
              Pindai Produk
            </h1>
            <p className="text-text-secondary">
              {scanMode === "barcode"
                ? "Cek Legalitas BPOM"
                : "Analisis Nutrisi Cerdas"}
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
                  {mode === "barcode"
                    ? "Barcode / BPOM"
                    : "Label Gizi (OCR + AI)"}
                </button>
              ))}
            </div>
          )}

          <Card className="shadow-lg relative overflow-hidden p-0">
            {loading && (
              <div className="absolute inset-0 bg-white/95 backdrop-blur-sm z-50 flex flex-col items-center justify-center p-4">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-primary font-bold animate-pulse">
                  {loadingMessage}
                </p>
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
                          ? "Arahkan ke Barcode"
                          : liveScanMode
                          ? "Live Scan Aktif"
                          : "Pastikan Teks Terbaca"}
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
                    <div className="absolute bottom-4 left-4 right-4 flex gap-3">
                      <Button
                        variant="outline"
                        fullWidth
                        onClick={() => setOcrImage(null)}
                        className="bg-white/90"
                      >
                        Ulangi
                      </Button>
                      <Button
                        fullWidth
                        onClick={processImageAnalysis}
                        className="shadow-lg"
                      >
                        Analisis AI
                      </Button>
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
                      Tap Kamera atau Upload
                    </p>
                    <p className="text-sm text-text-secondary mb-6">
                      Drag & drop gambar{" "}
                      {scanMode === "barcode" ? "QR" : "label"} di sini
                    </p>
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        startCamera();
                      }}
                      className="px-8 shadow-lg shadow-primary/30"
                    >
                      Buka Kamera
                    </Button>
                  </div>
                )}

                {scanMode === "barcode" && !isScannerActive && !ocrImage && (
                  <div className="mt-6">
                    <label className="text-sm font-semibold text-text-primary mb-1 block">
                      Kode BPOM / Nama Produk
                    </label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Contoh: MD 12345..."
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
                        Cek
                      </Button>
                    </div>
                    <p className="text-xs text-text-secondary mt-1">
                      Input tanpa spasi, format otomatis menyesuaikan
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
                      {result.found ? "Terdaftar Resmi" : "Tidak Ditemukan"}
                    </h2>
                    {result.found ? (
                      <div className="bg-bg-base p-6 rounded-3xl border border-border text-left space-y-4">
                        <div>
                          <p className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">
                            Nama Produk
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
                              Nomor Registrasi
                            </p>
                            <p className="font-mono font-bold text-sm text-text-primary">
                              {result.data.bpom_number}
                            </p>
                          </div>
                          <div>
                            <p className="text-[10px] font-bold text-text-secondary uppercase">
                              Status
                            </p>
                            <p className="font-bold text-sm text-success">
                              {result.data.status}
                            </p>
                          </div>
                          <div className="col-span-2">
                            <p className="text-[10px] font-bold text-text-secondary uppercase">
                              Pendaftar / Pabrik
                            </p>
                            <p className="text-sm font-semibold text-text-primary">
                              {result.data.manufacturer}
                            </p>
                            {result.data.address &&
                              result.data.address !== "-" && (
                                <p className="text-xs text-text-secondary mt-0.5 capitalize">
                                  {result.data.address.toLowerCase()}
                                </p>
                              )}
                          </div>
                          <div>
                            <p className="text-[10px] font-bold text-text-secondary uppercase">
                              Terbit
                            </p>
                            <p className="text-xs font-medium">
                              {result.data.issued_date}
                            </p>
                          </div>
                          <div>
                            <p className="text-[10px] font-bold text-text-secondary uppercase">
                              Kedaluwarsa
                            </p>
                            <p className="text-xs font-medium text-error">
                              {result.data.expired_date}
                            </p>
                          </div>
                          <div className="col-span-2">
                            <p className="text-[10px] font-bold text-text-secondary uppercase">
                              Kemasan
                            </p>
                            <p className="text-xs font-medium text-text-primary">
                              {result.data.packaging}
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-bg-base p-6 rounded-3xl border border-dashed border-border text-text-secondary">
                        <p className="mb-2">
                          Nomor <strong>{result.code}</strong> tidak ditemukan
                          di database BPOM
                        </p>
                        <p className="text-xs">
                          Pastikan nomor benar atau scan ulang
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-6 animate-fade-in-up">
                    <div className="text-center">
                      <h2 className="text-2xl font-extrabold text-text-primary">
                        Analisis Nutrisi AI
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
                              Peringatan Alergi!
                            </h4>
                            <p className="text-xs text-text-primary mt-1">
                              Mengandung:{" "}
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
                              Keunggulan
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
                              Perhatian
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
                          Komposisi
                        </h4>
                        <p className="text-xs text-text-secondary leading-relaxed">
                          {result.data.ingredients}
                        </p>
                      </div>
                    )}

                    <div className="pt-6 border-t border-border">
                      <h3 className="font-bold text-text-primary mb-4">
                        Tanya AI
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
                              {msg.role === "user" ? "Anda" : "AI"}
                            </strong>
                            {msg.text}
                          </div>
                        ))}
                      </div>
                      <form onSubmit={handleChatSubmit} className="flex gap-2">
                        <input
                          type="text"
                          className="flex-1 px-4 py-3 rounded-xl border border-border bg-bg-surface focus:ring-2 focus:ring-primary/20 outline-none text-sm"
                          placeholder="Tanya sesuatu..."
                          value={chatInput}
                          onChange={(e) => setChatInput(e.target.value)}
                          disabled={chatLoading}
                        />
                        <Button
                          size="sm"
                          type="submit"
                          disabled={chatLoading || !chatInput}
                        >
                          {chatLoading ? "..." : "Kirim"}
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
                  Scan Produk Lain
                </Button>
              </div>
            )}
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default Scanner;
