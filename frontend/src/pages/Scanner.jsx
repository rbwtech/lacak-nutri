import { useState, useEffect, useRef, useCallback } from "react";
import { Html5QrcodeScanner, Html5Qrcode } from "html5-qrcode";
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

  // Chat & AI State
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);

  // Camera & Image State
  const [isScannerActive, setIsScannerActive] = useState(false);
  const [ocrImage, setOcrImage] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [hasZoom, setHasZoom] = useState(false);

  const [myAllergies, setMyAllergies] = useState([]);

  const scannerRef = useRef(null);
  const bpomFileInputRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

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

    return () => {
      stopMediaStream();
      if (scannerRef.current) scannerRef.current.clear().catch(() => {});
    };
  }, []);

  const stopMediaStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  // --- UTILS ---
  const formatBPOM = (code) => {
    let clean = code.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
    const match = clean.match(/^([A-Z]{2}|P-IRT)(\d+)$/);
    return match ? `${match[1]} ${match[2]}` : code;
  };

  const checkAllergyWarnings = (analysisData) => {
    if (!analysisData || !myAllergies.length) return [];
    const textToCheck = (
      (analysisData.ingredients || "") +
      " " +
      (analysisData.warnings?.join(" ") || "")
    ).toLowerCase();
    return myAllergies
      .filter((a) => textToCheck.includes(a))
      .map((a) => a.charAt(0).toUpperCase() + a.slice(1));
  };

  // --- BARCODE HANDLERS ---
  const handleBarcodeSuccess = async (code) => {
    setLoading(true);
    setLoadingMessage("Mencari data BPOM...");
    const formattedCode = formatBPOM(code);
    try {
      const { data } = await api.post("/scan/bpom", {
        bpom_number: formattedCode,
      });
      setResult({
        type: "bpom",
        found: data.found,
        data: data.data,
        code: formattedCode,
        message: data.message,
      });
    } catch (err) {
      setError("Terjadi kesalahan koneksi server.");
    } finally {
      setLoading(false);
    }
  };

  const startBarcodeCamera = () => {
    setResult(null);
    setIsScannerActive(true);
    setError(null);
    setTimeout(() => {
      const scanner = new Html5QrcodeScanner(
        "reader",
        { fps: 10, qrbox: { width: 250, height: 250 }, aspectRatio: 1.0 },
        false
      );
      scanner.render(
        (txt) => {
          handleBarcodeSuccess(txt);
          scanner.clear();
          setIsScannerActive(false);
        },
        () => {}
      );
      scannerRef.current = scanner;
    }, 100);
  };

  const handleBarcodeUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setLoading(true);
    setError(null);
    try {
      const html5 = new Html5Qrcode("reader-hidden");
      const txt = await html5.scanFile(file, true);
      handleBarcodeSuccess(txt);
    } catch {
      setError("Barcode tidak terbaca.");
      setLoading(false);
    }
  };

  // --- OCR / AI HANDLERS ---
  const startOCRCamera = async () => {
    stopMediaStream();
    setResult(null);
    setOcrImage(null);
    setIsScannerActive(true);
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment",
          width: { ideal: 1080 },
          height: { ideal: 1920 },
        },
      });
      streamRef.current = stream;

      const track = stream.getVideoTracks()[0];
      const capabilities = track.getCapabilities();
      if (capabilities.zoom) setHasZoom(true);

      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (err) {
      setError("Gagal akses kamera. Pastikan izin diberikan.");
      setIsScannerActive(false);
    }
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

  const captureOCRImage = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      ctx.filter = "contrast(110%)";
      ctx.drawImage(video, 0, 0);
      setOcrImage(canvas.toDataURL("image/jpeg", 0.9));
      stopMediaStream();
      setIsScannerActive(false);
    }
  };

  // --- DRAG & DROP CONFIG ---
  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file) {
      const r = new FileReader();
      r.onloadend = () => {
        setOcrImage(r.result);
        setIsScannerActive(false);
        stopMediaStream();
      };
      r.readAsDataURL(file);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    maxFiles: 1,
  });

  const processImageAnalysis = async () => {
    if (!ocrImage) return;
    setLoading(true);
    setLoadingMessage("Analisis AI sedang bekerja...");
    setError(null);
    try {
      const { data } = await api.post("/scan/analyze", {
        image_base64: ocrImage,
      });
      if (!data.success) throw new Error(data.message);
      setResult({
        type: "ocr",
        found: true,
        data: data.data,
        allergyWarnings: checkAllergyWarnings(data.data),
      });
    } catch (err) {
      setError("Gagal memproses gambar.");
    } finally {
      setLoading(false);
    }
  };

  // --- UI ACTIONS ---
  const switchMode = (mode) => {
    stopMediaStream();
    setIsScannerActive(false);
    if (scannerRef.current) scannerRef.current.clear().catch(() => {});
    setScanMode(mode);
    setResult(null);
    setError(null);
    setOcrImage(null);
    setBpomInput("");
    setChatHistory([]);
  };

  const handleChatSubmit = async (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    const q = chatInput;
    setChatHistory([...chatHistory, { role: "user", text: q }]);
    setChatInput("");
    setChatLoading(true);
    try {
      const { data } = await api.post("/scan/chat", {
        product_context: JSON.stringify(result.data),
        question: q,
      });
      setChatHistory((prev) => [...prev, { role: "ai", text: data.answer }]);
    } catch {
      setChatHistory((prev) => [
        ...prev,
        { role: "ai", text: "Maaf, terjadi kesalahan." },
      ]);
    } finally {
      setChatLoading(false);
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
                ? "Cek legalitas BPOM."
                : "Analisis Nutrisi Cerdas."}
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
                    : "Foto Label Gizi (OCR + AI)"}
                </button>
              ))}
            </div>
          )}

          <Card className="shadow-lg relative overflow-hidden p-0">
            {loading && (
              <div className="absolute inset-0 bg-white/90 backdrop-blur-sm z-50 flex flex-col items-center justify-center p-4 text-center">
                <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-primary font-bold animate-pulse">
                  {loadingMessage}
                </p>
              </div>
            )}
            <div id="reader-hidden" className="hidden"></div>

            {!result ? (
              <div className="p-8">
                {/* --- MODE BARCODE --- */}
                {scanMode === "barcode" && (
                  <>
                    {!isScannerActive ? (
                      <div className="text-center p-10 border-2 border-dashed border-border rounded-3xl bg-bg-base mb-6 transition-all hover:border-primary/50">
                        <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-border">
                          <svg
                            className="w-10 h-10 text-primary"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={1.5}
                              d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
                            />
                          </svg>
                        </div>
                        <h3 className="font-bold text-text-primary mb-1">
                          Scan Barcode
                        </h3>
                        <div className="flex gap-3 justify-center mt-4">
                          <Button onClick={startBarcodeCamera}>
                            Buka Kamera
                          </Button>
                          <button
                            onClick={() => bpomFileInputRef.current.click()}
                            className="px-4 py-2 rounded-2xl border-2 border-primary text-primary font-bold text-sm hover:bg-primary/5"
                          >
                            Upload
                          </button>
                        </div>
                        <input
                          type="file"
                          ref={bpomFileInputRef}
                          className="hidden"
                          accept="image/*"
                          onChange={handleBarcodeUpload}
                        />
                      </div>
                    ) : (
                      <div className="bg-black text-white text-center rounded-3xl overflow-hidden mb-6 relative">
                        <div id="reader" className="w-full aspect-square"></div>
                        <Button
                          variant="danger"
                          size="sm"
                          className="absolute bottom-4 left-1/2 -translate-x-1/2"
                          onClick={() => {
                            scannerRef.current?.clear();
                            setIsScannerActive(false);
                          }}
                        >
                          Tutup
                        </Button>
                      </div>
                    )}

                    {/* Input Manual BPOM */}
                    <div className="flex flex-col md:flex-row gap-3 items-end">
                      <div className="w-full">
                        <Input
                          label="Input Manual (Kode BPOM / Nama Produk)"
                          placeholder="Cth: MD 2345..."
                          value={bpomInput}
                          onChange={(e) => setBpomInput(e.target.value)}
                          containerClass="w-full"
                          className="h-12"
                        />
                      </div>
                      <Button
                        className="h-12 w-full md:w-auto mb-px"
                        onClick={() =>
                          bpomInput && handleBarcodeSuccess(bpomInput)
                        }
                        disabled={!bpomInput}
                      >
                        Cek
                      </Button>
                    </div>
                  </>
                )}

                {/* --- MODE OCR (AI) --- */}
                {scanMode === "ocr" && (
                  <div className="space-y-6">
                    {isScannerActive ? (
                      <div className="relative rounded-3xl overflow-hidden bg-black w-full aspect-9/16 max-h-[70vh] shadow-2xl mx-auto border-4 border-white/20">
                        <video
                          ref={videoRef}
                          autoPlay
                          playsInline
                          className="absolute inset-0 w-full h-full object-cover"
                        ></video>
                        <canvas ref={canvasRef} className="hidden"></canvas>

                        {/* Frame Overlay */}
                        <div className="absolute inset-0 pointer-events-none border-2 border-white/30 m-6 rounded-2xl flex flex-col justify-between p-4">
                          <div className="text-white/80 text-xs font-bold bg-black/30 backdrop-blur-md py-1 px-3 rounded-full self-center">
                            Pastikan label terbaca
                          </div>
                          <div className="w-full h-0.5 bg-primary/50 relative overflow-hidden shadow-[0_0_10px_rgba(255,153,102,0.8)] animate-pulse"></div>
                        </div>

                        {/* Controls */}
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
                              className="text-white hover:bg-white/10 rounded-full w-12 h-12 p-0! flex items-center justify-center backdrop-blur-sm"
                              onClick={() => {
                                stopMediaStream();
                                setIsScannerActive(false);
                              }}
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
                              onClick={captureOCRImage}
                              className="w-20 h-20 bg-white rounded-full border-[6px] border-white/30 shadow-xl active:scale-90 transition-transform flex items-center justify-center relative group"
                            >
                              <div className="w-16 h-16 bg-white rounded-full border-4 border-primary group-active:bg-primary transition-colors"></div>
                            </button>
                            <div className="w-12 h-12"></div>
                          </div>
                        </div>
                      </div>
                    ) : ocrImage ? (
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
                            className="bg-white/90 backdrop-blur"
                            onClick={() => setOcrImage(null)}
                          >
                            Ulangi
                          </Button>
                          <Button
                            fullWidth
                            className="shadow-lg"
                            onClick={processImageAnalysis}
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
                              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                        </div>
                        <p className="font-bold text-lg text-text-primary mb-1">
                          Drag & Drop Foto Label
                        </p>
                        <p className="text-sm text-text-secondary mb-6">
                          atau klik untuk upload manual
                        </p>
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            startOCRCamera();
                          }}
                          className="px-8"
                        >
                          Buka Kamera
                        </Button>
                      </div>
                    )}
                    {error && (
                      <div className="p-4 bg-error/10 text-error text-sm rounded-xl text-center font-bold">
                        {error}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              // --- RESULT VIEW ---
              <div className="p-8">
                {result.type === "bpom" ? (
                  <div className="text-center animate-fade-in-up">
                    <AnimatedStatus type={result.found ? "success" : "error"} />
                    <h2 className="text-2xl font-extrabold text-text-primary mb-6">
                      {result.found ? "Terdaftar di BPOM" : "Tidak Ditemukan"}
                    </h2>
                    {result.found ? (
                      <div className="bg-bg-base p-6 rounded-3xl border border-border mb-6 text-left space-y-4 shadow-sm">
                        <div>
                          <p className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">
                            Nama Produk
                          </p>
                          <p className="font-bold text-xl text-text-primary leading-tight">
                            {result.data.product_name}
                          </p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-[10px] font-bold text-text-secondary uppercase">
                              Nomor Registrasi
                            </p>
                            <p className="font-mono font-medium text-primary">
                              {result.data.bpom_number}
                            </p>
                          </div>
                          <div>
                            <p className="text-[10px] font-bold text-text-secondary uppercase">
                              Merk
                            </p>
                            <p className="font-medium text-text-primary">
                              {result.data.brand}
                            </p>
                          </div>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-text-secondary uppercase">
                            Pendaftar
                          </p>
                          <p className="text-sm text-text-primary">
                            {result.data.manufacturer}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <p className="text-text-secondary">
                        Nomor <strong>{result.code}</strong> tidak ditemukan
                        dalam database.
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="space-y-6 animate-fade-in-up">
                    <div className="text-center">
                      <h2 className="text-2xl font-extrabold text-text-primary">
                        Analisis Nutrisi AI
                      </h2>
                      <div className="inline-block px-4 py-1 bg-secondary/10 text-secondary rounded-full font-bold mt-2 mb-4">
                        Health Score: {result.data.health_score}/10
                      </div>
                      {result.allergyWarnings?.length > 0 && (
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
                    <div className="bg-bg-base p-5 rounded-2xl border border-border text-sm text-text-secondary italic leading-relaxed">
                      "{result.data.analysis}"
                    </div>

                    <div className="pt-6 border-t border-border">
                      <h3 className="font-bold text-text-primary mb-4">
                        Tanya AI tentang produk ini
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
                          placeholder="Aman untuk diet?"
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
                  className="mt-8 h-12"
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
