import { useState, useEffect } from "react";
import axios from "axios";

export default function HistoryDetailModal({
  isOpen,
  onClose,
  scanId,
  scanType,
}) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);

  useEffect(() => {
    if (isOpen && scanId && scanType) {
      fetchDetail();
    }
  }, [isOpen, scanId, scanType]);

  const fetchDetail = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/scan/${scanType}/${scanId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setData(res.data.data);
    } catch (err) {
      console.error("Error fetching detail:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl">
        <div className="sticky top-0 bg-white border-b border-[#EBE3D5] p-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-[#333333]">Detail Scan</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[#F5F5F0] rounded-lg transition-colors"
          >
            <svg
              className="w-6 h-6"
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
          </button>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-12 h-12 border-4 border-[#FF9966] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : data && scanType === "bpom" ? (
            <div className="space-y-4">
              <div>
                <label className="text-sm text-[#8C8C8C]">Nama Produk</label>
                <p className="text-[#333333] font-medium">
                  {data.product_name || "-"}
                </p>
              </div>
              <div>
                <label className="text-sm text-[#8C8C8C]">Nomor BPOM</label>
                <p className="text-[#333333] font-mono">{data.bpom_number}</p>
              </div>
              <div>
                <label className="text-sm text-[#8C8C8C]">Brand</label>
                <p className="text-[#333333]">{data.brand || "-"}</p>
              </div>
              <div>
                <label className="text-sm text-[#8C8C8C]">Manufaktur</label>
                <p className="text-[#333333]">{data.manufacturer || "-"}</p>
              </div>
              <div>
                <label className="text-sm text-[#8C8C8C]">Status</label>
                <span
                  className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                    data.status === "Berlaku"
                      ? "bg-[#4CAF50]/10 text-[#4CAF50]"
                      : "bg-[#EF5350]/10 text-[#EF5350]"
                  }`}
                >
                  {data.status}
                </span>
              </div>
              <div>
                <label className="text-sm text-[#8C8C8C]">Waktu Scan</label>
                <p className="text-[#333333]">
                  {new Date(data.scanned_at).toLocaleString("id-ID")}
                </p>
              </div>
            </div>
          ) : data && scanType === "ocr" ? (
            <div className="space-y-4">
              <div>
                <label className="text-sm text-[#8C8C8C]">Health Score</label>
                <div className="flex items-center gap-3 mt-1">
                  <div className="flex-1 h-2 bg-[#EBE3D5] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-linear-to-r from-[#EF5350] via-[#FFC107] to-[#4CAF50] transition-all"
                      style={{ width: `${data.health_score}%` }}
                    />
                  </div>
                  <span className="text-2xl font-bold text-[#FF9966]">
                    {data.health_score}
                  </span>
                </div>
              </div>

              {data.ocr_raw_data && (
                <div>
                  <label className="text-sm text-[#8C8C8C] mb-2 block">
                    Data Nutrisi
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {Object.entries(data.ocr_raw_data).map(([key, value]) => (
                      <div key={key} className="bg-[#F5F5F0] p-3 rounded-lg">
                        <p className="text-xs text-[#8C8C8C] capitalize">
                          {key}
                        </p>
                        <p className="text-[#333333] font-semibold">{value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {data.ai_analysis && (
                <div>
                  <label className="text-sm text-[#8C8C8C] mb-2 block">
                    Analisis AI
                  </label>
                  <div className="bg-[#F5F5F0] p-4 rounded-lg">
                    <p className="text-[#333333] whitespace-pre-wrap">
                      {data.ai_analysis}
                    </p>
                  </div>
                </div>
              )}

              <div>
                <label className="text-sm text-[#8C8C8C]">Waktu Scan</label>
                <p className="text-[#333333]">
                  {new Date(data.scanned_at).toLocaleString("id-ID")}
                </p>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
