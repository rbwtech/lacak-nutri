import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Html5QrcodeScanner } from "html5-qrcode"; // Import Library Scanner
import { MainLayout } from "../components/layouts";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import api from "../config/api";

const Scanner = () => {
  const [scanMode, setScanMode] = useState("barcode"); // 'barcode' | 'ocr'
  const [bpomInput, setBpomInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null); // Hasil scan (Real Data)

  // State untuk Scanner Kamera
  const [isScannerActive, setIsScannerActive] = useState(false);
  const scannerRef = useRef(null);

  // Fungsi Start Scanner Kamera
  const startCamera = () => {
    setIsScannerActive(true);
    setError(null);

    // Tunggu DOM render
    setTimeout(() => {
      const scanner = new Html5QrcodeScanner(
        "reader",
        { fps: 10, qrbox: { width: 250, height: 250 } },
        /* verbose= */ false
      );

      scanner.render(
        (decodedText) => {
          // SUKSES SCAN
          console.log("Scan Success:", decodedText);
          handleScanSuccess(decodedText);
          scanner.clear();
          setIsScannerActive(false);
        },
        (errorMessage) => {
          // Scan error (biasa terjadi saat mencari barcode, abaikan saja)
        }
      );

      scannerRef.current = scanner;
    }, 100);
  };

  const handleScanSuccess = async (code) => {
    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const { data } = await api.post("/scan/bpom", {
        bpom_number: code,
      });

      setResult({
        found: true,
        data: data,
        code: code,
      });
    } catch (err) {
      console.error(err);
      if (err.response?.status === 404) {
        setResult({
          found: false,
          code: code,
          message: "Produk tidak ditemukan di database BPOM.",
        });
      } else {
        setError("Gagal mengambil data. Silakan coba lagi.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Cleanup scanner saat component unmount
  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current
          .clear()
          .catch((error) => console.error("Failed to clear scanner", error));
      }
    };
  }, []);

  // Handler Input Manual
  const handleManualSubmit = () => {
    if (bpomInput) handleScanSuccess(bpomInput);
  };

  const resetScan = () => {
    setResult(null);
    setBpomInput("");
    setError(null);
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
              Scan barcode BPOM untuk cek legalitas produk.
            </p>
          </div>

          <Card className="shadow-lg relative overflow-hidden p-0">
            {/* Area Kamera */}
            {isScannerActive && !result && (
              <div className="p-4 bg-black text-white text-center">
                <div
                  id="reader"
                  className="w-full rounded-xl overflow-hidden"
                ></div>
                <Button
                  variant="danger"
                  size="sm"
                  className="mt-4"
                  onClick={() => {
                    scannerRef.current?.clear();
                    setIsScannerActive(false);
                  }}
                >
                  Tutup Kamera
                </Button>
              </div>
            )}

            {/* Area Input Default (Jika Kamera Mati & Belum Ada Hasil) */}
            {!isScannerActive && !result && (
              <div className="p-8">
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
                  <Button onClick={startCamera}>Buka Kamera</Button>
                </div>

                <div className="relative flex py-2 items-center mb-6">
                  <div className="grow border-t border-border"></div>
                  <span className="shrink-0 mx-4 text-text-secondary text-xs font-bold uppercase">
                    Atau Input Manual
                  </span>
                  <div className="grow border-t border-border"></div>
                </div>

                <div className="space-y-4">
                  <Input
                    label="Nomor Registrasi / Barcode"
                    placeholder="Contoh: 899..."
                    value={bpomInput}
                    onChange={(e) => setBpomInput(e.target.value)}
                  />
                  <Button
                    fullWidth
                    onClick={handleManualSubmit}
                    disabled={!bpomInput || loading}
                  >
                    {loading ? "Memproses..." : "Cek Validitas"}
                  </Button>
                </div>
              </div>
            )}

            {/* Hasil Scan */}
            {result && (
              <div className="p-8 text-center">
                <div
                  className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-white shadow-card ${
                    result.found
                      ? "bg-success/10 text-success"
                      : "bg-error/10 text-error"
                  }`}
                >
                  {result.found ? (
                    <svg
                      className="w-12 h-12"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-12 h-12"
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
                  )}
                </div>

                <h2 className="text-2xl font-extrabold text-text-primary mb-2">
                  {result.found ? "Produk Ditemukan!" : "Tidak Ditemukan"}
                </h2>

                {result.found ? (
                  <div className="bg-bg-base p-6 rounded-2xl border border-border mb-6 text-left space-y-4 shadow-sm">
                    <div>
                      <p className="text-xs font-bold text-text-secondary uppercase tracking-wider">
                        Nama Produk
                      </p>
                      <p className="font-bold text-lg text-text-primary">
                        {result.data.product_name}
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs font-bold text-text-secondary uppercase tracking-wider">
                          Nomor BPOM
                        </p>
                        <p className="font-mono font-medium text-primary">
                          {result.data.bpom_number}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-text-secondary uppercase tracking-wider">
                          Merk
                        </p>
                        <p className="font-medium text-text-primary">
                          {result.data.brand || "-"}
                        </p>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-text-secondary uppercase tracking-wider">
                        Pabrik
                      </p>
                      <p className="text-sm text-text-primary">
                        {result.data.manufacturer}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="bg-bg-base p-4 rounded-xl border border-border mb-6">
                    <p className="text-text-secondary">
                      Nomor <strong>{result.code}</strong> tidak terdaftar di
                      database BPOM.
                    </p>
                  </div>
                )}

                <Button variant="outline" fullWidth onClick={resetScan}>
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
