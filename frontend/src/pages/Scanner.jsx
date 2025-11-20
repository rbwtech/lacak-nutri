import { useState, useEffect, useRef } from "react";
import { Html5QrcodeScanner, Html5Qrcode } from "html5-qrcode";
import { MainLayout } from "../components/layouts";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
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

  const [isScannerActive, setIsScannerActive] = useState(false);
  const [ocrImage, setOcrImage] = useState(null);

  const scannerRef = useRef(null);
  const fileInputRef = useRef(null);
  const bpomFileInputRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
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

  // --- LOGIC BARCODE & BPOM ---
  const handleBarcodeSuccess = async (code) => {
    setLoading(true);
    setLoadingMessage("Mencari data BPOM...");
    try {
      const { data } = await api.post("/scan/bpom", { bpom_number: code });
      setResult({
        type: "bpom",
        found: data.found,
        data: data.data,
        code: code,
        message: data.message,
      });
    } catch (err) {
      console.error(err);
      setError("Terjadi kesalahan koneksi server.");
    } finally {
      setLoading(false);
    }
  };

  // --- LOGIC AI ---
  const processImageAnalysis = async () => {
    if (!ocrImage) return;
    setLoading(true);
    setLoadingMessage("Analisis AI mendalam...");
    setError(null);
    try {
      const { data } = await api.post("/scan/analyze", {
        image_base64: ocrImage,
      });
      if (!data.success) throw new Error(data.message);
      setResult({ type: "ocr", found: true, data: data.data });
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
      // Kirim konteks produk (JSON) + Pertanyaan
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

  // --- CAMERA UTILS (Sama seperti sebelumnya) ---
  const startBarcodeCamera = () => {
    /* ... logic sama ... */
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
  const startOCRCamera = async () => {
    /* ... logic sama ... */
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
    /* ... logic sama ... */
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0);
      setOcrImage(canvas.toDataURL("image/jpeg", 0.8));
      stopMediaStream();
      setIsScannerActive(false);
    }
  };
  const handleImageUpload = (e) => {
    /* ... logic sama ... */
    const file = e.target.files[0];
    if (file) {
      const r = new FileReader();
      r.onloadend = () => setOcrImage(r.result);
      r.readAsDataURL(file);
    }
  };
  const handleBarcodeUpload = async (e) => {
    /* ... logic sama ... */
    const file = e.target.files[0];
    if (!file) return;
    setLoading(true);
    setLoadingMessage("Scan barcode...");
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
  const handleManualSubmit = () => {
    if (bpomInput) handleBarcodeSuccess(bpomInput);
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
                : "Analisis Nutrisi Cerdas (AI)."}
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

            {/* --- INPUT AREA (SAMA SEPERTI SEBELUMNYA, COPY PASTE LOGIC KAMERA) --- */}
            {!result && (
              <div className="p-8">
                {scanMode === "barcode" ? (
                  // ... (Tampilan Input Barcode SAMA) ...
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
                            Tutup
                          </Button>
                        </div>
                      </div>
                    )}
                    <div className="space-y-4">
                      <Input
                        label="Nomor Registrasi / Barcode / Nama Produk"
                        placeholder="Contoh: MD 0411... atau Chitato"
                        value={bpomInput}
                        onChange={(e) => setBpomInput(e.target.value)}
                        helperText="Kode BPOM (MD/ML), barcode, atau nama produk."
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
                      <div className="relative rounded-xl overflow-hidden bg-black w-full h-[60vh] md:h-96 border-4 border-white">
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
                            className="w-16 h-16 bg-white rounded-full border-4 border-gray-200 shadow-lg flex items-center justify-center"
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
                  </div>
                )}
              </div>
            )}

            {/* --- RESULT VIEW (DIPERBARUI UNTUK CHAT) --- */}
            {result && (
              <div className="p-8">
                {result.type === "bpom" ? (
                  <div className="text-center">
                    {/* Tampilan BPOM (Minimalis) */}
                    <h2 className="text-2xl font-extrabold text-text-primary mb-4">
                      {result.found ? "✅ Terdaftar" : "❌ Tidak Ditemukan"}
                    </h2>
                    {result.found ? (
                      <div className="bg-bg-base p-6 rounded-2xl border border-border mb-6 text-left space-y-4 shadow-sm">
                        <div>
                          <p className="text-xs font-bold text-text-secondary uppercase">
                            Produk
                          </p>
                          <p className="font-bold text-lg text-text-primary">
                            {result.data.product_name}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs font-bold text-text-secondary uppercase">
                            BPOM
                          </p>
                          <p className="font-mono font-medium text-primary">
                            {result.data.bpom_number}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <p className="mb-4">
                        Kode <strong>{result.code}</strong> tidak valid.
                      </p>
                    )}
                  </div>
                ) : (
                  // TAMPILAN AI ANALYSIS + CHAT
                  <div className="space-y-6">
                    <div className="text-center">
                      <div className="inline-block px-4 py-2 bg-primary/10 text-primary rounded-full font-extrabold text-xl mb-4">
                        Skor: {result.data.health_score}/10
                      </div>
                      <h2 className="text-2xl font-bold text-text-primary">
                        Analisis Nutrisi
                      </h2>
                    </div>

                    <div className="bg-bg-base p-5 rounded-2xl border border-border text-sm leading-relaxed text-text-secondary">
                      {result.data.analysis}
                    </div>

                    {/* Nutrisi Utama */}
                    <div className="grid grid-cols-3 gap-3 text-center">
                      {["calories", "sugar", "sodium"].map((k) => (
                        <div
                          key={k}
                          className="p-3 bg-white rounded-xl border border-border"
                        >
                          <p className="text-[10px] uppercase text-text-secondary">
                            {k}
                          </p>
                          <p className="font-bold text-text-primary">
                            {result.data.nutrition?.[k] || "-"}
                          </p>
                        </div>
                      ))}
                    </div>

                    {/* Peringatan / Diet Tags */}
                    {result.data.diet_tags && (
                      <div className="flex flex-wrap gap-2 justify-center">
                        {result.data.diet_tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-3 py-1 bg-success/10 text-success text-xs font-bold rounded-lg"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* FITUR CHAT Q&A */}
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
                        Tanya AI tentang produk ini
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
                          placeholder="Cth: Apakah ini aman untuk diabetes?"
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

                <div className="pt-6 mt-6 border-t border-border">
                  <Button variant="outline" fullWidth onClick={resetScan}>
                    Scan Produk Lain
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

export default Scanner;
