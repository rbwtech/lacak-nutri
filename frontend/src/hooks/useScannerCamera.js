import { useState, useEffect, useRef, useCallback } from "react";
import { Html5Qrcode } from "html5-qrcode";
import api from "../config/api";

const cleanBarcodeData = (raw) => {
  let cleaned = raw.trim();
  cleaned = cleaned.replace(/^\(\d{2,3}\)/, "");
  cleaned = cleaned.split(/\(\d{2,3}\)/)[0];
  cleaned = cleaned.replace(/[^a-zA-Z0-9\s-]/g, "");
  return cleaned.trim();
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

export const useScannerCamera = ({
  scanMode,
  setResult,
  setError,
  setOcrImage,
  setLiveOcrText,
  liveScanMode,
  t,
  getToken,
  setLoading,
  setLoadingMessage,
}) => {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const scanIntervalRef = useRef(null);
  const liveScanIntervalRef = useRef(null);

  const [isScannerActive, setIsScannerActive] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [hasZoom, setHasZoom] = useState(false);
  const [flashOn, setFlashOn] = useState(false);
  const [hasFlash, setHasFlash] = useState(false);
  const [facingMode, setFacingMode] = useState("environment");
  const [availableCameras, setAvailableCameras] = useState([]);
  const [qrBoxPositions, setQrBoxPositions] = useState([]);

  const enumerateCameras = useCallback(async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const cameras = devices.filter((d) => d.kind === "videoinput");
      setAvailableCameras(cameras);
    } catch (e) {
      console.error("Error enumerating cameras:", e);
    }
  }, []);
  useEffect(() => {
    enumerateCameras();
    return () => stopCamera();
  }, [enumerateCameras]);

  const stopLiveScan = useCallback(() => {
    if (liveScanIntervalRef.current) {
      clearInterval(liveScanIntervalRef.current);
      liveScanIntervalRef.current = null;
    }
    setLiveOcrText("");
  }, [setLiveOcrText]);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsScannerActive(false);
    setQrBoxPositions([]);
    setFlashOn(false);
    stopLiveScan();
  }, [stopLiveScan]);

  const handleBarcodeSuccess = useCallback(
    async (code) => {
      stopCamera();
      setLoading(true);
      setLoadingMessage(t("scanner.loadingBPOM"));

      try {
        const token = await getToken("scan_ocr");
        if (!token) throw new Error("Captcha failed");

        const { data } = await api.post(
          "/scan/bpom",
          { bpom_number: code },
          { headers: { "X-Recaptcha-Token": token } }
        );
        setResult({
          type: "bpom",
          found: data.found,
          data: data.data,
          code: data.searched_code || code,
          scan_id: data.data?.id,
        });
      } catch (err) {
        setError(t("scanner.errorBPOMFetch"));
      } finally {
        setLoading(false);
      }
    },
    [
      stopCamera,
      setLoading,
      t,
      getToken,
      setResult,
      setError,
      setLoadingMessage,
    ]
  );

  const handleBarcodeTap = useCallback(
    (rawValue) => {
      const cleaned = cleanBarcodeData(rawValue);
      handleBarcodeSuccess(cleaned);
    },
    [handleBarcodeSuccess]
  );

  const startBarcodeScanLoop = useCallback(() => {
    if (!("BarcodeDetector" in window)) {
      console.warn("BarcodeDetector not supported");
      return;
    }

    const detector = new window.BarcodeDetector({
      formats: ["qr_code", "ean_13", "ean_8", "code_128"],
    });

    scanIntervalRef.current = setInterval(async () => {
      if (videoRef.current && videoRef.current.readyState === 4) {
        try {
          const barcodes = await detector.detect(videoRef.current);

          if (barcodes.length === 0) {
            setQrBoxPositions([]);
            return;
          }

          const videoEl = videoRef.current;
          const videoRect = videoEl.getBoundingClientRect();
          const scaleX = videoRect.width / videoEl.videoWidth;
          const scaleY = videoRect.height / videoEl.videoHeight;

          const boxes = barcodes.map((bc) => ({
            rawValue: bc.rawValue,
            format: bc.format,
            x: bc.boundingBox.x * scaleX,
            y: bc.boundingBox.y * scaleY,
            width: bc.boundingBox.width * scaleX,
            height: bc.boundingBox.height * scaleY,
          }));

          setQrBoxPositions(boxes);

          if (barcodes.length === 1) {
            if (!scanIntervalRef.current) return;
            clearInterval(scanIntervalRef.current);
            scanIntervalRef.current = null;

            setTimeout(() => {
              const cleaned = cleanBarcodeData(barcodes[0].rawValue);
              handleBarcodeSuccess(cleaned);
            }, 500);
          }
        } catch (e) {}
      }
    }, 200);
  }, [handleBarcodeSuccess]);

  const startLiveScan = useCallback(() => {
    liveScanIntervalRef.current = setInterval(async () => {
      if (videoRef.current && videoRef.current.readyState === 4) {
        const canvas = document.createElement("canvas");
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(videoRef.current, 0, 0);

        const dataUrl = canvas.toDataURL("image/jpeg", 0.7);

        try {
          const { data } = await api.post("/scan/ocr-text", {
            image_base64: dataUrl,
          });

          if (data.text) {
            setLiveOcrText((prev) =>
              prev ? prev + "\n" + data.text : data.text
            );
          }
        } catch (e) {}
      }
    }, 2000);
  }, [setLiveOcrText]);

  const startCamera = useCallback(
    async (isLiveScan = false) => {
      stopCamera();

      await new Promise((r) => setTimeout(r, 100));

      setIsScannerActive(true);
      setError(null);

      try {
        const constraints = {
          video: {
            facingMode: { ideal: facingMode },
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
        };

        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        streamRef.current = stream;

        const track = stream.getVideoTracks()[0];
        const capabilities = track.getCapabilities
          ? track.getCapabilities()
          : {};

        setHasZoom(!!capabilities.zoom);
        setHasFlash(!!capabilities.torch);

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            videoRef.current
              .play()
              .catch((e) => console.error("Play error", e));
            if (scanMode === "barcode") startBarcodeScanLoop();
            if (isLiveScan) startLiveScan();
          };
        }
      } catch (err) {
        console.error(err);
        setError(t("scanner.errorCameraAccess"));
        setIsScannerActive(false);
      }
    },
    [
      stopCamera,
      facingMode,
      scanMode,
      startBarcodeScanLoop,
      startLiveScan,
      t,
      setError,
    ]
  );

  const toggleFlash = useCallback(async () => {
    if (!streamRef.current) return;
    const track = streamRef.current.getVideoTracks()[0];
    try {
      await track.applyConstraints({ advanced: [{ torch: !flashOn }] });
      setFlashOn(!flashOn);
    } catch (e) {
      console.error(e);
    }
  }, [flashOn]);

  const switchCamera = useCallback(() => {
    setFacingMode((prev) => (prev === "environment" ? "user" : "environment"));
    stopCamera();
    setTimeout(() => startCamera(liveScanMode), 100);
  }, [startCamera, stopCamera, liveScanMode]);

  const handleZoom = useCallback((e) => {
    const level = parseFloat(e.target.value);
    setZoomLevel(level);
    if (streamRef.current) {
      const track = streamRef.current.getVideoTracks()[0];
      if (track && track.getCapabilities().zoom) {
        track.applyConstraints({ advanced: [{ zoom: level }] });
      }
    }
  }, []);

  const captureImage = useCallback(async () => {
    if (!videoRef.current) return;

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
      setOcrImage(reader.result);
      stopCamera();
    };
    reader.readAsDataURL(blob);
  }, [scanMode, stopCamera, setOcrImage]);

  return {
    videoRef,
    stopCamera,
    startCamera,
    captureImage,
    handleZoom,
    toggleFlash,
    switchCamera,
    availableCameras,
    isScannerActive,
    hasZoom,
    zoomLevel,
    hasFlash,
    flashOn,
    qrBoxPositions,
    handleBarcodeTap,
    stopLiveScan,
    cleanBarcodeData,
  };
};
