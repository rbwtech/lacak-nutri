const NutritionLabel = ({ data }) => {
  if (!data) return null;

  // Helper untuk menangani variasi nama key (dari DB vs dari AI)
  const getVal = (...keys) => {
    for (const key of keys) {
      if (data[key] !== undefined && data[key] !== null) {
        // Bersihkan string angka (misal "10g" jadi 10)
        const num = parseFloat(String(data[key]).replace(/[^0-9.]/g, ""));
        return isNaN(num) ? 0 : num;
      }
    }
    return 0;
  };

  // Helper untuk baris gizi
  const Row = ({
    label,
    value,
    unit = "g",
    bold = false,
    indent = false,
    border = true,
    highlight = false,
  }) => (
    <div
      className={`flex justify-between items-center py-1 ${
        border ? "border-b border-gray-300 dark:border-gray-500" : ""
      } ${indent ? "pl-4" : ""} ${
        highlight && value > 15 ? "bg-red-50 dark:bg-red-900/20" : ""
      }`}
    >
      <span
        className={`${
          bold ? "font-extrabold" : "font-medium"
        } text-gray-800 dark:text-gray-200`}
      >
        {label}
      </span>
      <span
        className={`font-medium ${
          highlight && value > 15
            ? "text-red-600 dark:text-red-400 font-bold"
            : "text-gray-800 dark:text-gray-200"
        }`}
      >
        {value}
        {unit}
      </span>
    </div>
  );

  return (
    <div className="bg-white dark:bg-bg-surface p-4 border-2 border-black dark:border-white text-sm font-sans w-full max-w-sm mx-auto shadow-lg rounded-sm text-black dark:text-white transition-colors">
      <h2 className="text-3xl font-black border-b-8 border-black dark:border-white pb-1 mb-2 tracking-tighter">
        Informasi Nilai Gizi
      </h2>

      <div className="flex justify-between items-end mb-2 border-b-4 border-black dark:border-white pb-2">
        <div>
          <p className="font-bold text-base">Takaran Saji</p>
          <p className="text-sm text-gray-600 dark:text-gray-200">
            {/* Fallback weight jika tidak ada */}
            {getVal("weight_g", "serving_size") > 0
              ? `Per ${getVal("weight_g", "serving_size")}g`
              : "Per Kemasan/Sajian"}
          </p>
        </div>
        <div className="text-right">
          {/* Tampilkan Kode Produk jika ada */}
          <p className="text-xs font-bold text-gray-500 dark:text-gray-200">
            {data.original_code || data.code || ""}
          </p>
        </div>
      </div>

      <div className="flex justify-between items-center border-b-4 border-black dark:border-white py-3 mb-2">
        <div>
          <span className="font-black text-xl">Energi Total</span>
          {/* Kalori dari Lemak (Opsional, standar lama tapi kadang berguna) */}
          {getVal("calories_from_fat") > 0 && (
            <p className="text-xs text-gray-500 dark:text-gray-200">
              Energi dari Lemak {getVal("calories_from_fat")}
            </p>
          )}
        </div>
        <span className="font-black text-4xl">
          {Math.round(getVal("calories", "energi"))}{" "}
          <span className="text-lg font-bold">kkal</span>
        </span>
      </div>

      <p className="text-right text-xs font-bold mb-1">% AKG*</p>
      <div className="border-b-2 border-black dark:border-white mb-1"></div>

      {/* LEMAK SECTION */}
      <Row
        label="Lemak Total"
        value={getVal("fat", "lemak_total", "lemak")}
        bold={true}
      />

      {/* Sub-Lemak (Tampilkan jika nilainya > 0) */}
      {getVal("saturated_fat", "lemak_jenuh") > 0 && (
        <Row
          label="Lemak Jenuh"
          value={getVal("saturated_fat", "lemak_jenuh")}
          indent={true}
        />
      )}
      {getVal("trans_fat", "lemak_trans") > 0 && (
        <Row
          label="Lemak Trans"
          value={getVal("trans_fat", "lemak_trans")}
          indent={true}
        />
      )}

      <Row
        label="Kolesterol"
        value={getVal("cholesterol_mg", "kolesterol", "cholesterol")}
        unit="mg"
        bold={true}
      />

      <Row
        label="Natrium (Garam)"
        value={getVal("sodium_mg", "sodium", "natrium", "garam")}
        unit="mg"
        bold={true}
        highlight={true} // Highlight jika garam tinggi
      />

      {/* KARBOHIDRAT SECTION */}
      <div className="border-t-4 border-black dark:border-white mt-1"></div>
      <Row
        label="Karbohidrat Total"
        value={getVal("carbs", "karbohidrat_total", "karbohidrat")}
        bold={true}
        border={false}
      />
      <div className="border-b border-gray-300"></div>

      <Row
        label="Serat Pangan"
        value={getVal("fiber", "serat")}
        indent={true}
      />
      <Row
        label="Gula"
        value={getVal("sugar", "gula")}
        indent={true}
        highlight={true} // Highlight jika gula tinggi
      />
      {/* Gula Tambahan (Jika ada) */}
      {getVal("added_sugars") > 0 && (
        <Row
          label="Termasuk Gula Tambahan"
          value={getVal("added_sugars")}
          indent={true}
        />
      )}

      {/* PROTEIN SECTION */}
      <div className="border-t-4 border-black dark:border-white mt-1"></div>
      <Row
        label="Protein"
        value={getVal("protein")}
        bold={true}
        border={false}
      />

      {/* VITAMIN & MINERAL (Grid Layout) */}
      <div className="border-t-8 border-black dark:border-white mt-4 pt-3">
        <div className="grid grid-cols-2 gap-y-2 text-xs font-medium text-gray-700 dark:text-gray-300">
          {/* Render Vitamin/Mineral jika ada nilainya */}
          {getVal("vit_a") > 0 && <span>Vitamin A {getVal("vit_a")}%</span>}
          {getVal("vit_c", "vitamin_c") > 0 && (
            <span>Vitamin C {getVal("vit_c", "vitamin_c")}mg</span>
          )}
          {getVal("vit_d") > 0 && <span>Vitamin D {getVal("vit_d")}mcg</span>}

          <span>Kalsium {getVal("calcium_mg", "kalsium", "calcium")}mg</span>
          <span>Zat Besi {getVal("iron_mg", "zat_besi", "iron")}mg</span>
          <span>Kalium {getVal("potassium_mg", "kalium", "potassium")}mg</span>

          {getVal("zinc", "seng") > 0 && (
            <span>Zinc {getVal("zinc", "seng")}mg</span>
          )}
          {getVal("iodine", "yodium") > 0 && (
            <span>Yodium {getVal("iodine", "yodium")}mcg</span>
          )}
          {getVal("phosphorus", "fosfor") > 0 && (
            <span>Fosfor {getVal("phosphorus", "fosfor")}mg</span>
          )}
        </div>
      </div>

      {/* KOMPOSISI (JIKA ADA DARI OCR) */}
      {(data.ingredients || data.composition) && (
        <div className="border-t-4 border-black dark:border-white mt-3 pt-2">
          <p className="font-bold mb-1">Komposisi:</p>
          <p className="text-xs leading-relaxed text-gray-600 dark:text-gray-200 capitalize">
            {data.ingredients || data.composition}
          </p>
        </div>
      )}

      <p className="text-[10px] mt-4 leading-tight text-gray-500 dark:text-gray-200">
        *Persen Angka Kecukupan Gizi (AKG) berdasarkan kebutuhan energi 2150
        kkal. Kebutuhan energi Anda mungkin lebih tinggi atau lebih rendah.
      </p>
    </div>
  );
};

export default NutritionLabel;
