import React from "react";

const NutritionLabel = ({ data }) => {
  if (!data) return null;

  // Helper untuk baris gizi
  const Row = ({
    label,
    value,
    unit = "g",
    bold = false,
    indent = false,
    border = true,
  }) => (
    <div
      className={`flex justify-between items-center py-1 ${
        border ? "border-b border-gray-300" : ""
      } ${indent ? "pl-4" : ""}`}
    >
      <span
        className={`${bold ? "font-extrabold" : "font-medium"} text-gray-800`}
      >
        {label}
      </span>
      <span className="font-medium text-gray-800">
        {value || 0}
        {unit}
      </span>
    </div>
  );

  return (
    <div className="bg-white p-4 border-2 border-black text-sm font-sans max-w-sm mx-auto shadow-lg">
      <h2 className="text-2xl font-black border-b-8 border-black pb-1 mb-2">
        Informasi Nilai Gizi
      </h2>

      <div className="flex justify-between items-end mb-2 border-b-4 border-black pb-2">
        <div>
          <p className="font-bold">Takaran Saji</p>
          <p className="text-xs text-gray-600">Per 100g (Berat Bersih)</p>
        </div>
        <div className="text-right">
          <p className="text-xs font-bold">{data.original_code || "-"}</p>
        </div>
      </div>

      <div className="flex justify-between items-center border-b-4 border-black py-2 mb-2">
        <span className="font-black text-lg">Energi Total</span>
        <span className="font-black text-lg">
          {Math.round(data.calories)} kkal
        </span>
      </div>

      <p className="text-right text-xs font-bold mb-1">% AKG*</p>

      <div className="border-b border-black mb-1"></div>

      <Row label="Lemak Total" value={data.fat} bold={true} />
      <Row
        label="Kolesterol"
        value={data.cholesterol_mg}
        unit="mg"
        bold={true}
      />
      <Row
        label="Natrium (Garam)"
        value={data.sodium_mg}
        unit="mg"
        bold={true}
      />

      <Row label="Karbohidrat Total" value={data.carbs} bold={true} />
      <Row label="Serat Pangan" value={data.fiber} indent={true} />
      <Row label="Gula" value={data.sugar} indent={true} />

      <Row label="Protein" value={data.protein} bold={true} border={false} />

      <div className="border-t-8 border-black mt-2 pt-2">
        <div className="grid grid-cols-2 text-xs gap-y-1">
          <span>Kalsium {data.calcium_mg}mg</span>
          <span>Zat Besi {data.iron_mg}mg</span>
          <span>Kalium {data.potassium_mg}mg</span>
        </div>
      </div>

      <p className="text-[10px] mt-4 leading-tight text-gray-500">
        *Persen Angka Kecukupan Gizi (AKG) berdasarkan kebutuhan energi 2150
        kkal. Kebutuhan energi Anda mungkin lebih tinggi atau lebih rendah.
      </p>
    </div>
  );
};

export default NutritionLabel;
