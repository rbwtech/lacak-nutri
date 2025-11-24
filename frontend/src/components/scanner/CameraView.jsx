import React, { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Html5Qrcode } from "html5-qrcode";
import { useTranslation } from "react-i18next";
import Button from "../ui/Button";
import Input from "../ui/Input";

const CameraView = ({
  scanMode,
  isScannerActive,
  ocrImage,
  setOcrImage,
  productName,
  setProductName,
  processImageAnalysis,
  handleBarcodeSuccess,
  cleanBarcodeData,
  videoRef,
  qrBoxPositions,
  handleBarcodeTap,
  liveScanMode,
  liveOcrText,
  hasZoom,
  zoomLevel,
  hasFlash,
  flashOn,
  availableCameras,
  bpomInput,
  setBpomInput,
  startCamera,
  stopCamera,
  captureImage,
  handleZoom,
  toggleFlash,
  switchCamera,
  toggleLiveScan,
  t,
}) => {
  const onDrop = useCallback(
    (acceptedFiles) => {
      const file = acceptedFiles[0];
      if (!file) return;

      if (scanMode === "barcode") {
        const scanner = new Html5Qrcode("reader-hidden");
        scanner
          .scanFile(file, true)
          .then((raw) => handleBarcodeSuccess(cleanBarcodeData(raw)))
          .catch(() => {});
      } else {
        const reader = new FileReader();
        reader.onload = (e) => {
          setOcrImage(e.target.result);
          stopCamera();
        };
        reader.readAsDataURL(file);
      }
    },
    [scanMode, handleBarcodeSuccess, cleanBarcodeData, setOcrImage, stopCamera]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    maxFiles: 1,
  });

  if (ocrImage && scanMode === "ocr") {
    return (
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
    );
  }

  if (isScannerActive) {
    return (
      <div className="relative rounded-3xl overflow-hidden bg-black w-full aspect-9/16 max-h-[70vh] shadow-2xl mx-auto border-4 border-white/20">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        />

        {scanMode === "barcode" &&
          qrBoxPositions.map((box, idx) => (
            <div
              key={idx}
              onClick={(e) => {
                e.stopPropagation();
                handleBarcodeTap(box.rawValue);
              }}
              className={`absolute border-4 transition-all duration-150 cursor-pointer z-30 ${
                qrBoxPositions.length > 1
                  ? "border-yellow-400 bg-yellow-400/20 hover:bg-yellow-400/40"
                  : "border-green-400"
              }`}
              style={{
                left: box.x,
                top: box.y,
                width: box.width,
                height: box.height,
              }}
            >
              <div className="absolute -top-1 -left-1 w-3 h-3 border-t-4 border-l-4 border-inherit"></div>
              <div className="absolute -top-1 -right-1 w-3 h-3 border-t-4 border-r-4 border-inherit"></div>
              <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b-4 border-l-4 border-inherit"></div>
              <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b-4 border-r-4 border-inherit"></div>

              {qrBoxPositions.length > 1 && (
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-yellow-400 text-black text-[10px] font-bold px-2 py-0.5 rounded shadow-sm whitespace-nowrap">
                  {t("scanner.tapToSelect")}
                </div>
              )}
            </div>
          ))}

        <div className="absolute inset-0 pointer-events-none z-10 flex flex-col justify-between p-4">
          <div className="text-white/90 text-xs font-bold bg-black/40 backdrop-blur-md py-1.5 px-4 rounded-full self-center border border-white/10">
            {scanMode === "barcode"
              ? qrBoxPositions.length > 1
                ? "Pilih salah satu QR"
                : t("scanner.aimBarcode")
              : liveScanMode
              ? "AI Live Scanning..."
              : "Pastikan teks jelas & rata"}
          </div>
        </div>

        <div className="absolute top-4 right-4 flex flex-col gap-2 z-40">
          {hasFlash && (
            <button
              onClick={toggleFlash}
              className={`w-10 h-10 rounded-full backdrop-blur-md flex items-center justify-center transition-all ${
                flashOn ? "bg-yellow-400 text-black" : "bg-black/40 text-white"
              }`}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1h4v1a2 2 0 11-4 0zM12 14c.015-.34.208-.646.477-.859a4 4 0 10-4.954 0c.27.213.462.519.476.859h4.002z" />
              </svg>
            </button>
          )}
          {availableCameras.length > 1 && (
            <button
              onClick={switchCamera}
              className="w-10 h-10 bg-black/40 text-white rounded-full flex items-center justify-center"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            </button>
          )}
          {/* Masih dalam tahan pengembangan 
          {scanMode === "ocr" && (
            <button
              onClick={toggleLiveScan}
              className={`w-10 h-10 rounded-full flex items-center justify-center ${
                liveScanMode
                  ? "bg-red-500 text-white"
                  : "bg-black/40 text-white"
              }`}
            >
              {liveScanMode ? "Stop" : "Live"}
            </button>
          )} */}
        </div>
        <div className="absolute bottom-8 left-0 right-0 flex flex-col items-center gap-6 z-40 px-6">
          {hasZoom && (
            <input
              type="range"
              min="1"
              max="3"
              step="0.1"
              value={zoomLevel}
              onChange={handleZoom}
              className="w-40 h-1 bg-white/30 rounded-lg accent-primary"
            />
          )}

          <div className="flex items-center gap-8">
            <Button
              variant="ghost"
              onClick={stopCamera}
              className={`text-white hover:bg-white/10 rounded-full w-12 h-12
        ${scanMode !== "ocr" ? "mx-auto" : ""}
      `}
            >
              ✕
            </Button>
            {scanMode === "ocr" && (
              <button
                onClick={captureImage}
                className="w-20 h-20 bg-white rounded-full border-[6px] border-white/30 shadow-xl active:scale-90 transition-transform flex items-center justify-center"
              >
                <div className="w-16 h-16 bg-white rounded-full border-4 border-primary"></div>
              </button>
            )}
            {scanMode === "ocr" ? <div className="w-12 h-12"></div> : null}
          </div>
        </div>
        {liveScanMode && liveOcrText && (
          <div className="absolute bottom-32 left-4 right-4 bg-black/80 backdrop-blur-md text-white p-3 rounded-xl max-h-32 overflow-y-auto text-xs z-30 font-mono">
            {liveOcrText}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="p-6">
      <div
        {...getRootProps()}
        className="text-center p-10 border-2 border-dashed border-border hover:border-primary rounded-3xl cursor-pointer bg-bg-base"
      >
        <input {...getInputProps()} />
        <p className="font-bold text-lg mb-1">{t("scanner.tapCameraUpload")}</p>
        <p className="text-sm text-text-secondary mb-6">
          {t("scanner.dragDrop")}
        </p>
        <Button
          onClick={(e) => {
            e.stopPropagation();
            startCamera(liveScanMode);
          }}
          className="px-8 shadow-lg"
        >
          {t("scanner.openCamera")}
        </Button>
      </div>
      {scanMode === "barcode" && (
        <div className="mt-6">
          <div className="flex gap-2">
            <Input
              placeholder="Input BPOM Manual"
              value={bpomInput}
              onChange={(e) => setBpomInput(e.target.value)}
              containerClass="flex-1"
            />
            <Button
              onClick={() => handleBarcodeSuccess(bpomInput)}
              disabled={!bpomInput}
            >
              Check
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CameraView;
