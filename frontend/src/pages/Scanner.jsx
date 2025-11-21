import { useState, useEffect, useRef } from "react";
import { Html5QrcodeScanner, Html5Qrcode } from "html5-qrcode";
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

  // Chat State
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);

  // Camera State
  const [isScannerActive, setIsScannerActive] = useState(false);
  const [ocrImage, setOcrImage] = useState(null);

  // User Allergies
  const [myAllergies, setMyAllergies] = useState([]);

  const scannerRef = useRef(null);
  const fileInputRef = useRef(null);
  const bpomFileInputRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  // Fetch Allergies on Mount
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
    if (match) return `${match[1]} ${match[2]}`;
    return code;
  };

  const checkAllergyWarnings = (analysisData) => {
    if (!analysisData || !myAllergies.length) return [];

    // Cek di ingredients dan warnings yang dikembalikan AI
    const textToCheck = (
      (analysisData.ingredients || "") +
      " " +
      (analysisData.warnings?.join(" ") || "")
    ).toLowerCase();

    const warnings = [];
    myAllergies.forEach((allergen) => {
      // Pastikan pencocokan kata penuh atau frase, bukan sub-string pendek
      if (textToCheck.includes(allergen)) {
        warnings.push(allergen.charAt(0).toUpperCase() + allergen.slice(1));
      }
    });
    return warnings;
  };

  // --- LOGIC BARCODE ---
  const handleBarcodeSuccess = async (code) => {
    setLoading(true);
    setLoadingMessage("Mencari data BPOM...");

    const formattedCode = formatBPOM(code); // Fix: Otomatis tambah spasi

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
      console.error(err);
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
        (decodedText) => {
          handleBarcodeSuccess(decodedText);
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
    setLoadingMessage("Memindai gambar barcode...");
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

  const handleManualSubmit = () => {
    if (bpomInput) handleBarcodeSuccess(bpomInput);
  };

  // --- LOGIC OCR AI (GEMINI VISION) ---
  const startOCRCamera = async () => {
    setResult(null);
    setOcrImage(null);
    setIsScannerActive(true);
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      streamRef.current = stream;
      setTimeout(() => {
        if (videoRef.current) videoRef.current.srcObject = stream;
      }, 100);
    } catch (err) {
      setError("Gagal akses kamera.");
      setIsScannerActive(false);
    }
  };

  const captureOCRImage = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.filter = "contrast(110%)";
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imageDataUrl = canvas.toDataURL("image/jpeg", 0.9);
      setOcrImage(imageDataUrl);
      stopMediaStream();
      setIsScannerActive(false);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const r = new FileReader();
      r.onloadend = () => setOcrImage(r.result);
      r.readAsDataURL(file);
    }
  };

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

      const allergyWarnings = checkAllergyWarnings(data.data);

      setResult({
        type: "ocr",
        found: true,
        data: data.data,
        allergyWarnings: allergyWarnings,
      });
    } catch (err) {
      console.error(err);
      setError("Gagal memproses gambar.");
    } finally {
      setLoading(false);
    }
  };

  // --- LOGIC CHAT ---
  const handleChatSubmit = async (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    const question = chatInput;
    setChatHistory([...chatHistory, { role: "user", text: question }]);
    setChatInput("");
    setChatLoading(true);

    try {
      const context = JSON.stringify(result.data);
      const { data } = await api.post("/scan/chat", {
        product_context: context,
        question: question,
      });
      setChatHistory((prev) => [...prev, { role: "ai", text: data.answer }]);
    } catch (err) {
      setChatHistory((prev) => [
        ...prev,
        { role: "ai", text: "Maaf, terjadi kesalahan." },
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  // --- UI UTILS ---
  const switchMode = (mode) => {
    setScanMode(mode);
    setResult(null);
    setError(null);
    setOcrImage(null);
    setBpomInput("");
    setChatHistory([]);
    if (isScannerActive) {
      stopMediaStream();
      setIsScannerActive(false);
      if (scannerRef.current) scannerRef.current.clear().catch(() => {});
    }
  };
  const resetScan = () => {
    setResult(null);
    setOcrImage(null);
    setBpomInput("");
    setError(null);
    setChatHistory([]);
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
              <button
                onClick={() => switchMode("barcode")}
                className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${
                  scanMode === "barcode"
                    ? "bg-primary text-white shadow-md"
                    : "text-text-secondary hover:bg-gray-50"
                }`}
              >
                Barcode / BPOM
              </button>
              <button
                onClick={() => switchMode("ocr")}
                className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${
                  scanMode === "ocr"
                    ? "bg-primary text-white shadow-md"
                    : "text-text-secondary hover:bg-gray-50"
                }`}
              >
                Foto Label Gizi (OCR + AI)
              </button>
            </div>
          )}

          <Card className="shadow-lg relative overflow-hidden p-0">
            {loading && (
              <div className="absolute inset-0 bg-white/90 backdrop-blur-sm z-20 flex flex-col items-center justify-center p-4 text-center">
                <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-primary font-bold animate-pulse">
                  {loadingMessage}
                </p>
              </div>
            )}
            <div id="reader-hidden" className="hidden"></div>

            {!result && (
              <div className="p-8">
                {scanMode === "barcode" ? (
                  <>
                    {!isScannerActive ? (
                      <div className="text-center p-8 border-2 border-dashed border-border rounded-3xl bg-bg-base mb-6">
                        <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-border">
                          <svg
                            className="w-10 h-10 text-primary"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
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
                        <p className="text-sm text-text-secondary mb-4">
                          Arahkan kamera ke barcode produk
                        </p>
                        <div className="flex gap-3 justify-center">
                          <Button onClick={startBarcodeCamera}>
                            Buka Kamera
                          </Button>
                          <button
                            onClick={() => bpomFileInputRef.current.click()}
                            className="px-4 py-2 rounded-lg border-2 border-primary text-primary font-bold text-sm hover:bg-primary/5"
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
                      <div className="bg-black text-white text-center rounded-xl overflow-hidden mb-6">
                        <div
                          id="reader"
                          className="w-full aspect-square max-h-[70vh]"
                        ></div>

                        <div className="p-4">
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => {
                              scannerRef.current?.clear();
                              setIsScannerActive(false);
                            }}
                          >
                            Tutup Kamera
                          </Button>
                        </div>
                      </div>
                    )}
                    <div className="space-y-4">
                      <Input
                        label="Nomor Registrasi / Barcode / Nama Produk"
                        placeholder="Cth: MD 54321..."
                        value={bpomInput}
                        onChange={(e) => setBpomInput(e.target.value)}
                        helperText="Bisa diketik tanpa spasi, format akan menyesuaikan."
                      />
                      <Button
                        fullWidth
                        onClick={handleManualSubmit}
                        disabled={!bpomInput}
                      >
                        Cek Validitas
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="space-y-6">
                    {isScannerActive ? (
                      <div className="relative rounded-xl overflow-hidden bg-black w-full h-[60vh] md:h-96 border-4 border-white shadow-inner">
                        <video
                          ref={videoRef}
                          autoPlay
                          playsInline
                          className="absolute inset-0 w-full h-full object-cover"
                        ></video>
                        <canvas ref={canvasRef} className="hidden"></canvas>
                        <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-6 z-10">
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => {
                              stopMediaStream();
                              setIsScannerActive(false);
                            }}
                          >
                            Batal
                          </Button>
                          <button
                            onClick={captureOCRImage}
                            className="w-16 h-16 bg-white rounded-full border-4 border-gray-200 shadow-lg active:scale-95 transition-transform flex items-center justify-center"
                          >
                            <div className="w-12 h-12 bg-primary rounded-full"></div>
                          </button>
                        </div>
                      </div>
                    ) : ocrImage ? (
                      <div className="relative">
                        <img
                          src={ocrImage}
                          alt="Preview"
                          className="w-full max-h-[60vh] object-contain rounded-xl bg-black/5 mb-4"
                        />
                        <div className="flex gap-3">
                          <Button
                            variant="outline"
                            fullWidth
                            onClick={() => setOcrImage(null)}
                          >
                            Ulangi
                          </Button>
                          <Button fullWidth onClick={processImageAnalysis}>
                            Analisis Foto
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center p-8 border-2 border-dashed border-border rounded-3xl bg-bg-base group">
                        <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-border">
                          <svg
                            className="w-10 h-10 text-primary"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={1.5}
                              d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={1.5}
                              d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                          </svg>
                        </div>
                        <h3 className="font-bold text-text-primary mb-1">
                          Foto Label Gizi
                        </h3>
                        <p className="text-sm text-text-secondary mb-4">
                          Pastikan teks terbaca jelas
                        </p>
                        <div className="flex gap-3 justify-center">
                          <Button onClick={startOCRCamera}>Buka Kamera</Button>
                          <button
                            onClick={() => fileInputRef.current.click()}
                            className="px-4 py-2 rounded-lg border-2 border-primary text-primary font-bold text-sm hover:bg-primary/5"
                          >
                            Upload
                          </button>
                        </div>
                        <input
                          type="file"
                          ref={fileInputRef}
                          className="hidden"
                          accept="image/*"
                          onChange={handleImageUpload}
                        />
                      </div>
                    )}
                    {error && (
                      <div className="p-4 bg-error/10 text-error text-sm rounded-xl text-center font-medium">
                        {error}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* --- RESULT VIEW --- */}
            {result && (
              <div className="p-8">
                {result.type === "bpom" ? (
                  <div className="text-center">
                    <AnimatedStatus type={result.found ? "success" : "error"} />
                    <h2 className="text-2xl font-extrabold text-text-primary mb-4">
                      {result.found ? "Produk Ditemukan!" : "Tidak Ditemukan"}
                    </h2>
                    {result.found ? (
                      <div className="bg-bg-base p-6 rounded-2xl border border-border mb-6 text-left space-y-4 shadow-sm animate-fade-in-up">
                        <div>
                          <p className="text-xs font-bold text-text-secondary uppercase">
                            Nama Produk
                          </p>
                          <p className="font-bold text-lg text-text-primary">
                            {result.data.product_name}
                          </p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-xs font-bold text-text-secondary uppercase">
                              BPOM
                            </p>
                            <p className="font-mono font-medium text-primary">
                              {result.data.bpom_number}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs font-bold text-text-secondary uppercase">
                              Merk
                            </p>
                            <p className="font-medium text-text-primary">
                              {result.data.brand || "-"}
                            </p>
                          </div>
                        </div>
                        <div>
                          <p className="text-xs font-bold text-text-secondary uppercase">
                            Pabrik
                          </p>
                          <p className="text-sm text-text-primary">
                            {result.data.manufacturer}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <p className="text-text-secondary">
                        Kode <strong>{result.code}</strong> tidak valid.
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="text-center">
                      <h2 className="text-2xl font-extrabold text-text-primary">
                        Analisis AI
                      </h2>
                      {/* Score */}
                      <div className="inline-block px-4 py-1 bg-primary/10 text-primary rounded-full font-bold mt-2 mb-4">
                        Skor Sehat: {result.data.health_score}/10
                      </div>

                      {/* ALERGI WARNING BAR (Fitur Baru) */}
                      {result.allergyWarnings &&
                        result.allergyWarnings.length > 0 && (
                          <div className="bg-error/10 border border-error rounded-xl p-3 flex items-start gap-3 w-full animate-pulse text-left">
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
                                Peringatan Alergi Ditemukan!
                              </h4>
                              <p className="text-xs text-text-primary">
                                Mengandung:{" "}
                                <strong>
                                  {result.allergyWarnings.join(", ")}
                                </strong>
                              </p>
                            </div>
                          </div>
                        )}
                    </div>

                    {/* 3. NUTRITION LABEL (Full Display) */}
                    <NutritionLabel data={result.data.nutrition} />

                    {/* 4. ANALISIS TEXT */}
                    <div className="bg-bg-base p-4 rounded-xl border border-border text-sm text-text-secondary italic">
                      "{result.data.analysis}"
                    </div>

                    {/* 5. CHAT Q&A */}
                    <div className="pt-6 border-t border-border">
                      <h3 className="font-bold text-text-primary mb-4 flex items-center gap-2">
                        <svg
                          className="w-5 h-5 text-primary"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                          />
                        </svg>
                        Tanya AI
                      </h3>
                      <div className="space-y-4 mb-4 max-h-48 overflow-y-auto">
                        {chatHistory.map((msg, idx) => (
                          <div
                            key={idx}
                            className={`p-3 rounded-xl text-sm ${
                              msg.role === "user"
                                ? "bg-primary/10 ml-8"
                                : "bg-bg-base mr-8"
                            }`}
                          >
                            <strong>
                              {msg.role === "user" ? "Anda" : "AI"}:
                            </strong>{" "}
                            {msg.text}
                          </div>
                        ))}
                      </div>
                      <form onSubmit={handleChatSubmit} className="flex gap-2">
                        <input
                          type="text"
                          className="flex-1 px-4 py-2 rounded-xl border border-border bg-bg-surface focus:ring-2 focus:ring-primary/20 outline-none text-sm"
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
                  className="mt-6"
                >
                  Scan Lagi
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
