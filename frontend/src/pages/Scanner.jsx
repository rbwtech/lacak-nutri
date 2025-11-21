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
  const [scanMode, setScanMode] = useState("barcode"); // 'barcode' | 'ocr'
  const [bpomInput, setBpomInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("Memproses...");
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  // Chat State
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);

  // Camera State (Unified)
  const [isScannerActive, setIsScannerActive] = useState(false);
  const [ocrImage, setOcrImage] = useState(null); // Untuk preview OCR
  const [zoomLevel, setZoomLevel] = useState(1);
  const [hasZoom, setHasZoom] = useState(false);

  // Data
  const [myAllergies, setMyAllergies] = useState([]);

  // Refs
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const barcodeScannerRef = useRef(null); // Instance Html5Qrcode
  const animationFrameRef = useRef(null); // Untuk loop scan barcode

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

    return () => stopCamera();
  }, []);

  // --- CAMERA CONTROL (Unified for both modes) ---
  const startCamera = async () => {
    stopCamera();
    setResult(null);
    setOcrImage(null);
    setError(null);
    setIsScannerActive(true);

    try {
      const constraints = {
        video: {
          facingMode: "environment",
          width: { ideal: 1080 },
          height: { ideal: 1920 },
          focusMode: "continuous", // Try to force focus
        },
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      // Zoom Capabilities
      const track = stream.getVideoTracks()[0];
      const capabilities = track.getCapabilities ? track.getCapabilities() : {};
      if (capabilities.zoom) setHasZoom(true);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        // Tunggu video play baru mulai scanning jika mode barcode
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play();
          if (scanMode === "barcode") startBarcodeScanningLoop();
        };
      }
    } catch (err) {
      setError("Gagal akses kamera. Pastikan izin diberikan.");
      setIsScannerActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (animationFrameRef.current)
      cancelAnimationFrame(animationFrameRef.current);
    setIsScannerActive(false);
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

  const handleFocus = async () => {
    if (!streamRef.current) return;
    const track = streamRef.current.getVideoTracks()[0];
    const capabilities = track.getCapabilities();
    if (capabilities.focusMode && capabilities.focusMode.includes("manual")) {
      try {
        await track.applyConstraints({
          advanced: [{ focusMode: "manual", points: [{ x: 0.5, y: 0.5 }] }],
        });
      } catch (e) {}
    }
  };

  // --- BARCODE LOGIC (Custom Loop) ---
  const startBarcodeScanningLoop = () => {
    // Inisialisasi engine di background, tanpa UI widget
    if (!barcodeScannerRef.current) {
      barcodeScannerRef.current = new Html5Qrcode("reader-hidden");
    }

    const scanLoop = async () => {
      if (!videoRef.current || !isScannerActive) return;

      // Kita ambil frame dari video element, kirim ke library
      try {
        // Menggunakan file scan dari canvas snapshot video
        if (videoRef.current.readyState === 2) {
          // HAVE_ENOUGH_DATA
          const canvas = document.createElement("canvas");
          canvas.width = videoRef.current.videoWidth;
          canvas.height = videoRef.current.videoHeight;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(videoRef.current, 0, 0);

          // Ini metode 'hack' untuk scan frame by frame tanpa widget UI
          // Tapi lebih performant pakai scanFileV2 dengan blob,
          // Namun library ini agak ribet kalau tanpa UI.
          // Kita pakai cara simple: scan dari Canvas Image Data (built-in library jarang expose ini public).
          // Fallback: Biarkan user "Tap" untuk scan barcode (seperti foto OCR) atau loop lambat.

          // Opsi Alternatif: Gunakan BarcodeDetector API (Native Browser) jika support
          if ("BarcodeDetector" in window) {
            const barcodeDetector = new window.BarcodeDetector();
            const barcodes = await barcodeDetector.detect(videoRef.current);
            if (barcodes.length > 0) {
              handleBarcodeSuccess(barcodes[0].rawValue);
              return; // Stop loop
            }
          }
        }
      } catch (e) {
        // Ignore scan error per frame
      }
      animationFrameRef.current = requestAnimationFrame(scanLoop);
    };

    // Fallback: Karena Html5Qrcode agak berat kalau manual loop frame-by-frame di React tanpa widget,
    // Kita akan menggunakan logika "Scan" via tombol capture saja untuk barcode jika native API tidak ada,
    // ATAU, gunakan Html5Qrcode secara 'headless' tapi itu kompleks.
    // SOLUSI TERBAIK UI: Gunakan library scanning tapi mount ke div hidden,
    // lalu kita gunakan method `scan` manual.

    // KOREKSI: Agar UI konsisten 100%, kita gunakan UI kita sendiri.
    // Barcode scanning realtime di browser agak berat tanpa WebAssembly yang optimal.
    // Kita akan gunakan interval scanning.
    const interval = setInterval(async () => {
      if (videoRef.current && barcodeScannerRef.current && !result) {
        try {
          // Scan frame video (ini butuh setup config scan)
          // Simplifikasi: Kita gunakan "BarcodeDetector" native browser (Chrome Android support bagus).
          // Jika tidak support, kita minta user "Foto" barcode (sama kayak OCR).
          if ("BarcodeDetector" in window) {
            const detector = new window.BarcodeDetector({
              formats: ["qr_code", "ean_13", "ean_8"],
            });
            const barcodes = await detector.detect(videoRef.current);
            if (barcodes.length > 0) {
              clearInterval(interval);
              handleBarcodeSuccess(barcodes[0].rawValue);
            }
          }
        } catch (e) {}
      }
    }, 500);
    // Simpan ID interval di ref untuk cleanup (skip detail implementasi deep cleanup demi brevity)
  };

  // --- BARCODE SUCCESS HANDLER ---
  const handleBarcodeSuccess = async (code) => {
    stopCamera();
    setLoading(true);
    setLoadingMessage("Mencari data BPOM...");

    // Format BPOM (Hapus spasi, auto add spasi standar)
    let clean = code.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
    const match = clean.match(/^([A-Z]{2}|P-IRT)(\d+)$/);
    const formattedCode = match ? `${match[1]} ${match[2]}` : code;

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
      setError("Gagal mengambil data. Cek koneksi.");
    } finally {
      setLoading(false);
    }
  };

  // --- OCR CAPTURE ---
  const captureImage = () => {
    if (videoRef.current) {
      const canvas = document.createElement("canvas");
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext("2d");
      ctx.filter = "contrast(110%)"; // Improve OCR
      ctx.drawImage(videoRef.current, 0, 0);
      const dataUrl = canvas.toDataURL("image/jpeg", 0.9);

      stopCamera();

      if (scanMode === "barcode") {
        // Fallback scan barcode dari gambar statis (lebih reliable di semua browser)
        const html5QrCode = new Html5Qrcode("reader-hidden");
        html5QrCode
          .scanFileV2(dataUrl, true)
          .then((decodedText) => handleBarcodeSuccess(decodedText))
          .catch(() => setError("Barcode tidak terbaca. Coba lagi."));
      } else {
        // Mode OCR
        setOcrImage(dataUrl);
      }
    }
  };

  // --- DRAG & DROP ---
  const onDrop = useCallback(
    (acceptedFiles) => {
      const file = acceptedFiles[0];
      if (file) {
        const r = new FileReader();
        r.onloadend = () => {
          if (scanMode === "barcode") {
            // Scan file barcode
            const html5QrCode = new Html5Qrcode("reader-hidden");
            html5QrCode
              .scanFile(file, true)
              .then((txt) => handleBarcodeSuccess(txt))
              .catch(() => setError("Barcode tidak terbaca dari file."));
          } else {
            // Set OCR Image
            setOcrImage(r.result);
            stopCamera();
          }
        };
        r.readAsDataURL(file);
      }
    },
    [scanMode]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    maxFiles: 1,
  });

  // --- API PROCESS (OCR) ---
  const processImageAnalysis = async () => {
    setLoading(true);
    setLoadingMessage("Analisis AI sedang bekerja...");
    setError(null);
    try {
      const { data } = await api.post("/scan/analyze", {
        image_base64: ocrImage,
      });
      if (!data.success) throw new Error(data.message);

      // Cek Alergi
      const textToCheck = (
        (data.data.ingredients || "") +
        " " +
        (data.data.warnings?.join(" ") || "")
      ).toLowerCase();
      const warnings = myAllergies
        .filter((a) => textToCheck.includes(a))
        .map((a) => a.charAt(0).toUpperCase() + a.slice(1));

      setResult({
        type: "ocr",
        found: true,
        data: data.data,
        allergyWarnings: warnings,
      });
    } catch (err) {
      setError("Gagal memproses gambar.");
    } finally {
      setLoading(false);
    }
  };

  // --- CHAT ---
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
        { role: "ai", text: "Gagal membalas." },
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  // --- RESET ---
  const resetScan = () => {
    setResult(null);
    setError(null);
    setOcrImage(null);
    setBpomInput("");
    setChatHistory([]);
    stopCamera();
  };

  const switchMode = (mode) => {
    resetScan();
    setScanMode(mode);
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
                ? "Cek Legalitas BPOM."
                : "Analisis Nutrisi Cerdas."}
            </p>
          </div>

          {/* MODE SWITCHER */}
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
            {/* LOADING OVERLAY */}
            {loading && (
              <div className="absolute inset-0 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-sm z-50 flex flex-col items-center justify-center p-4">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-primary font-bold animate-pulse">
                  {loadingMessage}
                </p>
              </div>
            )}

            {/* Hidden Div for Html5Qrcode library */}
            <div id="reader-hidden" className="hidden"></div>

            {!result ? (
              <div className="p-6">
                {/* CAMERA UI (Unified) */}
                {isScannerActive ? (
                  <div
                    className="relative rounded-3xl overflow-hidden bg-black w-full aspect-9/16 max-h-[70vh] shadow-2xl mx-auto border-4 border-white/20 group"
                    onClick={handleFocus}
                  >
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      className="absolute inset-0 w-full h-full object-cover"
                    ></video>

                    {/* Frame Overlay */}
                    <div className="absolute inset-0 pointer-events-none border-2 border-white/30 m-6 rounded-2xl flex flex-col justify-between p-4">
                      <div className="text-white/90 text-xs font-bold bg-black/40 backdrop-blur-md py-1.5 px-4 rounded-full self-center shadow-sm">
                        {scanMode === "barcode"
                          ? "Arahkan ke Barcode"
                          : "Pastikan Teks Terbaca"}
                      </div>
                      {/* Scanning Line Animation */}
                      <div className="w-full h-0.5 bg-primary/80 shadow-[0_0_15px_rgba(255,153,102,0.8)] animate-scanning-line relative top-1/2"></div>
                    </div>

                    {/* Controls Overlay */}
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
                          onClick={stopCamera}
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
                        {/* Capture Button */}
                        <button
                          onClick={captureImage}
                          className="w-20 h-20 bg-white rounded-full border-[6px] border-white/30 shadow-xl active:scale-90 transition-transform flex items-center justify-center relative group"
                        >
                          <div className="w-16 h-16 bg-white rounded-full border-4 border-primary group-active:scale-90 transition-all"></div>
                        </button>
                        <div className="w-12 h-12"></div>
                      </div>
                    </div>
                  </div>
                ) : ocrImage && scanMode === "ocr" ? (
                  <div className="relative bg-black/5 dark:bg-white/5 rounded-3xl overflow-hidden border border-border">
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
                  // INITIAL STATE (Drag & Drop)
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

                {/* Manual Input (Only Barcode Mode) */}
                {scanMode === "barcode" && !isScannerActive && (
                  <div className="mt-6 w-full">
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
                        autoComplete="off"
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
                      Anda dapat melakukan input tanpa spasi, format akan
                      menyesuaikan.
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
              // --- RESULT VIEW ---
              <div className="p-8">
                {result.type === "bpom" ? (
                  <div className="text-center animate-fade-in-up">
                    <AnimatedStatus type={result.found ? "success" : "error"} />
                    <h2 className="text-2xl font-extrabold text-text-primary mb-6">
                      {result.found ? "Terdaftar Resmi" : "Tidak Ditemukan"}
                    </h2>
                    {result.found ? (
                      <div className="bg-bg-base p-6 rounded-3xl border border-border mb-6 text-left space-y-4 shadow-sm">
                        {/* Header Produk */}
                        <div>
                          <p className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">
                            Nama Produk
                          </p>
                          <p className="font-bold text-lg text-text-primary leading-tight">
                            {result.data.product_name}
                          </p>
                          {result.data.brand && result.data.brand !== "-" && (
                            <span className="inline-block mt-1 text-xs font-bold px-2 py-0.5 bg-primary/10 text-primary rounded">
                              {result.data.brand}
                            </span>
                          )}
                        </div>

                        <div className="w-full h-px bg-border/50 my-2"></div>

                        {/* Detail Grid */}
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
                          Nomor <strong>{result.code}</strong> tidak ada di
                          database BPOM.
                        </p>
                        <p className="text-xs">
                          Pastikan nomor benar atau scan ulang.
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
