import { useState } from "react";
import { MainLayout } from "../components/layouts";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import { Link } from "react-router-dom";

const Scanner = () => {
  const [scanMode, setScanMode] = useState("barcode");
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState(null);

  const startScan = () => {
    setScanning(true);
    setTimeout(() => {
      setResult({
        code: "MD 224510004378",
        name: "Indomie Goreng",
        brand: "Indofood",
        id: 1,
      });
      setScanning(false);
    }, 2000);
  };

  return (
    <MainLayout>
      <div className="bg-bg-base min-h-screen py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8 text-center">
            <h1 className="text-h2 font-bold text-text-primary mb-2">
              Scanner Produk
            </h1>
            <p className="text-base text-text-secondary">
              Scan barcode atau foto kemasan untuk info nutrisi
            </p>
          </div>

          <Card className="mb-6">
            <div className="flex gap-4 mb-6">
              <button
                onClick={() => setScanMode("barcode")}
                className={`flex-1 py-3 rounded-lg font-medium transition-colors ${
                  scanMode === "barcode"
                    ? "bg-primary text-white"
                    : "bg-bg-base text-text-secondary"
                }`}
              >
                Barcode
              </button>
              <button
                onClick={() => setScanMode("ocr")}
                className={`flex-1 py-3 rounded-lg font-medium transition-colors ${
                  scanMode === "ocr"
                    ? "bg-primary text-white"
                    : "bg-bg-base text-text-secondary"
                }`}
              >
                Foto Kemasan
              </button>
            </div>

            <div className="bg-bg-base rounded-lg p-8 mb-6">
              {!scanning && !result && (
                <div className="text-center">
                  <div className="w-48 h-48 mx-auto bg-border rounded-lg flex items-center justify-center mb-4">
                    <svg
                      className="w-24 h-24 text-text-secondary"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                  </div>
                  <p className="text-text-secondary">
                    {scanMode === "barcode"
                      ? "Klik tombol untuk scan barcode"
                      : "Upload foto kemasan produk"}
                  </p>
                </div>
              )}

              {scanning && (
                <div className="text-center">
                  <div className="w-48 h-48 mx-auto bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                    <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                  </div>
                  <p className="text-text-primary font-medium">Scanning...</p>
                </div>
              )}

              {result && (
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto bg-success/20 rounded-full flex items-center justify-center mb-4">
                    <svg
                      className="w-8 h-8 text-success"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <h3 className="text-h4 font-bold text-text-primary mb-2">
                    {result.name}
                  </h3>
                  <p className="text-base text-text-secondary mb-1">
                    {result.brand}
                  </p>
                  <p className="text-label text-text-secondary mb-6">
                    BPOM: {result.code}
                  </p>
                </div>
              )}
            </div>

            {!scanning && !result && (
              <div>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload">
                  <Button fullWidth onClick={startScan}>
                    {scanMode === "barcode"
                      ? "Mulai Scan Barcode"
                      : "Upload Foto"}
                  </Button>
                </label>
              </div>
            )}

            {result && (
              <div className="space-y-3">
                <Link to={`/products/${result.id}`}>
                  <Button fullWidth>Lihat Detail Produk</Button>
                </Link>
                <Button
                  variant="outline"
                  fullWidth
                  onClick={() => setResult(null)}
                >
                  Scan Lagi
                </Button>
              </div>
            )}
          </Card>

          <Card title="Tips Scanner">
            <ul className="space-y-2 text-label text-text-secondary">
              <li className="flex gap-2">
                <span>✓</span>
                <span>Pastikan barcode dalam kondisi bersih dan jelas</span>
              </li>
              <li className="flex gap-2">
                <span>✓</span>
                <span>Gunakan pencahayaan yang cukup</span>
              </li>
              <li className="flex gap-2">
                <span>✓</span>
                <span>Foto kemasan dari jarak yang sesuai</span>
              </li>
            </ul>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default Scanner;
