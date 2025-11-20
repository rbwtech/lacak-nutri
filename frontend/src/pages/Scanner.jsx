import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { MainLayout } from "../components/layouts";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";

const Scanner = () => {
  const [scanMode, setScanMode] = useState("barcode"); // 'barcode' | 'ocr'
  const [imagePreview, setImagePreview] = useState(null);
  const [bpomInput, setBpomInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null); // State untuk hasil API nanti
  const fileInputRef = useRef(null);

  // Handle File Upload untuk OCR
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        // Nanti: panggil API OCR di sini atau via tombol terpisah
      };
      reader.readAsDataURL(file);
    }
  };

  const handleScanProcess = () => {
    setLoading(true);
    // Simulasi Proses Backend
    setTimeout(() => {
      setLoading(false);
      // Set dummy result structure (sesuai SRS) untuk preview UI
      // Nanti diganti response API
      if (scanMode === "barcode") {
        setResult({
          type: "bpom",
          data: {
            product_name: "Contoh Produk",
            bpom_number: bpomInput || "MD 123456",
            status: "Terdaftar",
          },
        });
      } else {
        setResult({
          type: "ocr",
          data: {
            product_name: "Scan Hasil",
            nutrition: { calories: 200 },
            analysis: "Analisis AI...",
          },
        });
      }
    }, 2000);
  };

  const resetScan = () => {
    setResult(null);
    setImagePreview(null);
    setBpomInput("");
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
              Pilih metode untuk mengetahui informasi produk.
            </p>
          </div>

          {/* Tab Switcher */}
          {!result && (
            <div className="bg-bg-surface p-1 rounded-2xl border border-border flex mb-8 shadow-sm">
              <button
                onClick={() => setScanMode("barcode")}
                className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all duration-200 ${
                  scanMode === "barcode"
                    ? "bg-primary text-white shadow-md"
                    : "text-text-secondary hover:bg-gray-50"
                }`}
              >
                Barcode / BPOM
              </button>
              <button
                onClick={() => setScanMode("ocr")}
                className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all duration-200 ${
                  scanMode === "ocr"
                    ? "bg-primary text-white shadow-md"
                    : "text-text-secondary hover:bg-gray-50"
                }`}
              >
                Foto Label Gizi (OCR)
              </button>
            </div>
          )}

          <Card className="shadow-lg relative overflow-hidden">
            {loading && (
              <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center">
                <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-primary font-bold animate-pulse">
                  Sedang Menganalisis...
                </p>
              </div>
            )}

            {!result ? (
              // --- INPUT MODE ---
              <div className="py-4">
                {scanMode === "barcode" ? (
                  <div className="space-y-6">
                    <div className="text-center p-8 border-2 border-dashed border-border rounded-3xl bg-bg-base">
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
                      <Button size="sm" variant="outline">
                        Buka Kamera
                      </Button>
                    </div>

                    <div className="relative flex py-2 items-center">
                      <div className="grow border-t border-border"></div>
                      <span className="shrink-0 mx-4 text-text-secondary text-xs font-bold uppercase">
                        Atau Input Manual
                      </span>
                      <div className="grow border-t border-border"></div>
                    </div>

                    <div className="space-y-4">
                      <Input
                        label="Nomor Registrasi BPOM"
                        placeholder="Contoh: MD 234567890123"
                        value={bpomInput}
                        onChange={(e) => setBpomInput(e.target.value)}
                      />
                      <Button
                        fullWidth
                        onClick={handleScanProcess}
                        disabled={!bpomInput}
                      >
                        Cek Validitas
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div
                      className="text-center p-8 border-2 border-dashed border-border rounded-3xl bg-bg-base cursor-pointer hover:bg-gray-50 transition-colors relative"
                      onClick={() => fileInputRef.current.click()}
                    >
                      {imagePreview ? (
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="max-h-64 mx-auto rounded-xl object-contain shadow-sm"
                        />
                      ) : (
                        <>
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
                            Foto Label Informasi Nilai Gizi
                          </h3>
                          <p className="text-sm text-text-secondary">
                            Pastikan teks terbaca jelas dan pencahayaan cukup
                          </p>
                        </>
                      )}
                      <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept="image/*"
                        onChange={handleImageUpload}
                      />
                    </div>
                    {imagePreview && (
                      <Button fullWidth onClick={handleScanProcess}>
                        Analisis Foto
                      </Button>
                    )}
                  </div>
                )}
              </div>
            ) : (
              // --- RESULT VIEW (Placeholder) ---
              <div className="text-center py-8">
                <div className="w-20 h-20 bg-success/10 text-success rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg
                    className="w-10 h-10"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <h2 className="text-2xl font-extrabold text-text-primary mb-2">
                  Analisis Selesai!
                </h2>
                <p className="text-text-secondary mb-8">
                  Hasil analisis untuk {result.data.product_name} telah siap.
                </p>

                <div className="flex gap-3">
                  <Button variant="outline" fullWidth onClick={resetScan}>
                    Scan Lagi
                  </Button>
                  <Link to="/products/1" className="w-full">
                    <Button fullWidth>Lihat Detail</Button>
                  </Link>
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
