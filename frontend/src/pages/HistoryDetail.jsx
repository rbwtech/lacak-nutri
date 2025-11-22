import { useState, useEffect } from "react";
import {
  useParams,
  useNavigate,
  Link,
  useSearchParams,
} from "react-router-dom";
import { MainLayout } from "../components/layouts";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import NutritionLabel from "../components/ui/NutritionLabel";
import AnimatedStatus from "../components/ui/AnimatedStatus";
import api from "../config/api";

const HistoryDetail = () => {
  const { id, type } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showImage, setShowImage] = useState(false);
  const [searchParams] = useSearchParams();
  const fromSource = searchParams.get("from");
  const getBackLink = () => {
    if (fromSource === "favorites")
      return { url: "/favorites", text: "Favorit" };
    if (fromSource === "dashboard")
      return { url: "/dashboard", text: "Dashboard" };
    return { url: "/history", text: "Riwayat" };
  };

  const backLink = getBackLink();

  useEffect(() => {
    fetchDetail();
  }, [id, type]);

  const fetchDetail = async () => {
    const endpoint = `/scan/${type}/${id}`;

    try {
      const { data: result } = await api.get(endpoint);

      let processedData = result.data || result;

      if (type === "bpom" && processedData.raw_response) {
        // raw_response sudah object dari backend (JSON column)
        if (typeof processedData.raw_response === "object") {
          processedData = { ...processedData, ...processedData.raw_response };
        }
      }

      if (type === "ocr") {
        // OCR mapping
        if (processedData.ocr_raw_data) {
          if (typeof processedData.ocr_raw_data === "string") {
            processedData.nutrition_data = JSON.parse(
              processedData.ocr_raw_data
            );
          } else {
            processedData.nutrition_data = processedData.ocr_raw_data;
          }
        }

        if (processedData.ai_analysis) {
          processedData.summary = processedData.ai_analysis;
        }
      }

      if (processedData.created_at && !processedData.scanned_at) {
        processedData.scanned_at = processedData.created_at;
      }

      setData(processedData);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="bg-bg-base min-h-screen py-8 flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      </MainLayout>
    );
  }

  if (!data) {
    return (
      <MainLayout>
        <div className="bg-bg-base min-h-screen py-8">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <p className="text-text-secondary mb-4">Data tidak ditemukan</p>
            <Button onClick={() => navigate("/history")}>Kembali</Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="bg-bg-base min-h-screen py-8">
        <div className="max-w-4xl mx-auto px-4">
          <Link
            to={backLink.url}
            className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-primary mb-6 font-bold"
          >
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
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Kembali ke {backLink.text}
          </Link>

          {type === "bpom" ? (
            <div className="text-center animate-fade-in-up">
              <AnimatedStatus type="success" />
              <h2 className="text-2xl font-extrabold text-text-primary mb-6">
                Terdaftar BPOM
              </h2>
              <Card className="p-6 text-left">
                <div>
                  <p className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">
                    Nama Produk
                  </p>
                  <p className="font-bold text-lg text-text-primary">
                    {data.product_name}
                  </p>
                  {data.brand && data.brand !== "-" && (
                    <span className="inline-block mt-1 text-xs font-bold px-2 py-0.5 bg-primary/10 text-primary rounded">
                      {data.brand}
                    </span>
                  )}
                </div>
                <div className="w-full h-px bg-border/50 my-4"></div>
                <div className="grid grid-cols-2 gap-y-4 gap-x-2">
                  <div>
                    <p className="text-[10px] font-bold text-text-secondary uppercase">
                      Nomor Registrasi
                    </p>
                    <p className="font-mono font-bold text-sm text-text-primary">
                      {data.bpom_number}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-text-secondary uppercase">
                      Status
                    </p>
                    <p className="font-bold text-sm text-success">
                      {data.status || "Terdaftar"}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-[10px] font-bold text-text-secondary uppercase">
                      Pendaftar / Pabrik
                    </p>
                    <p className="text-sm font-semibold text-text-primary">
                      {data.manufacturer || "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-text-secondary uppercase">
                      Terbit
                    </p>
                    <p className="text-xs font-medium">
                      {data.issued_date || "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-text-secondary uppercase">
                      Kedaluwarsa
                    </p>
                    <p className="text-xs font-medium text-error">
                      {data.expired_date || "-"}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-[10px] font-bold text-text-secondary uppercase">
                      Kemasan
                    </p>
                    <p className="text-xs font-medium text-text-primary">
                      {data.packaging || "-"}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-[10px] font-bold text-text-secondary uppercase">
                      Tanggal Scan
                    </p>
                    <p className="text-xs font-medium text-text-primary">
                      {new Date(
                        data.created_at || data.scanned_at
                      ).toLocaleString("id-ID")}
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          ) : (
            <div className="space-y-6 animate-fade-in-up">
              <div className="text-center">
                <h2 className="text-2xl font-extrabold text-text-primary mb-3">
                  {data.product_name || "Analisis Nutrisi AI"}
                </h2>
                <div className="flex items-center justify-center gap-3">
                  <div className="px-4 py-1 bg-secondary/10 text-secondary rounded-full font-bold">
                    Health Score: {data.health_score || 0}/100
                  </div>
                  <div className="px-3 py-1 bg-primary/10 text-primary rounded-full font-bold text-sm">
                    Grade {data.grade || "?"}
                  </div>
                </div>
                <p className="text-xs text-text-secondary mt-3">
                  Scan pada: {new Date(data.scanned_at).toLocaleString("id-ID")}
                </p>
              </div>

              <Card className="p-4 mb-4 text-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowImage(!showImage)}
                >
                  {showImage ? "Sembunyikan" : "Lihat"} Gambar Scan
                </Button>
                {showImage && (
                  <img
                    src={data.image_data}
                    alt="Scanned"
                    className="w-full rounded-lg mt-3"
                  />
                )}
              </Card>

              {data.warnings && data.warnings.length > 0 && (
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
                      Mengandung: <strong>{data.warnings.join(", ")}</strong>
                    </p>
                  </div>
                </div>
              )}

              <NutritionLabel data={data.nutrition_data} />

              {data.summary && (
                <Card className="p-5">
                  <h4 className="font-bold text-text-primary mb-2">
                    Ringkasan
                  </h4>
                  <p className="text-sm text-text-secondary italic leading-relaxed">
                    "{data.summary}"
                  </p>
                </Card>
              )}

              {(data.pros?.length > 0 || data.cons?.length > 0) && (
                <div className="grid grid-cols-2 gap-4">
                  {data.pros?.length > 0 && (
                    <Card className="p-4 bg-success/5 border-success/20">
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
                        {data.pros.map((pro, i) => (
                          <li key={i}>• {pro}</li>
                        ))}
                      </ul>
                    </Card>
                  )}
                  {data.cons?.length > 0 && (
                    <Card className="p-4 bg-error/5 border-error/20">
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
                        {data.cons.map((con, i) => (
                          <li key={i}>• {con}</li>
                        ))}
                      </ul>
                    </Card>
                  )}
                </div>
              )}

              {data.ingredients && (
                <Card className="p-4">
                  <h4 className="font-bold text-text-primary text-sm mb-2">
                    Komposisi
                  </h4>
                  <p className="text-xs text-text-secondary leading-relaxed">
                    {data.ingredients}
                  </p>
                </Card>
              )}
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default HistoryDetail;
