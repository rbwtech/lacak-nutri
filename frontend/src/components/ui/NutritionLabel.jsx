import { useTranslation } from "react-i18next";

const NutritionLabel = ({ data }) => {
  if (!data) return null;
  const { t } = useTranslation();

  const getVal = (...keys) => {
    for (const key of keys) {
      if (data[key] !== undefined && data[key] !== null) {
        const num = parseFloat(String(data[key]).replace(/[^0-9.]/g, ""));
        return isNaN(num) ? 0 : num;
      }
    }
    return 0;
  };

  const calcAKG = (amount, dailyValue) => {
    if (!amount || !dailyValue) return 0;
    return Math.round((amount / dailyValue) * 100);
  };

  const akgStandard = {
    calories: 2150,
    protein: 60,
    fat: 67,
    carbs: 325,
    sugar: 50,
    sodium: 1500,
    fiber: 30,
    cholesterol: 300,
    calcium: 1100,
    iron: 22,
    potassium: 4700,
  };

  const Row = ({
    label,
    value,
    unit = "g",
    bold = false,
    indent = false,
    highlight = false,
  }) => {
    const nutrientKey = label.toLowerCase().includes("lemak")
      ? "fat"
      : label.toLowerCase().includes("protein")
      ? "protein"
      : label.toLowerCase().includes("karbohidrat")
      ? "carbs"
      : label.toLowerCase().includes("gula")
      ? "sugar"
      : label.toLowerCase().includes("sodium") ||
        label.toLowerCase().includes("natrium")
      ? "sodium"
      : label.toLowerCase().includes("serat")
      ? "fiber"
      : label.toLowerCase().includes("kolesterol")
      ? "cholesterol"
      : label.toLowerCase().includes("kalsium") ||
        label.toLowerCase().includes("calcium")
      ? "calcium"
      : label.toLowerCase().includes("besi") ||
        label.toLowerCase().includes("iron")
      ? "iron"
      : label.toLowerCase().includes("kalium")
      ? "potassium"
      : null;

    const akgPercent = nutrientKey
      ? calcAKG(value, akgStandard[nutrientKey])
      : 0;

    return (
      <div
        className={`
        flex justify-between items-center py-1.5 
        border-b border-gray-300 dark:border-neutral-600
        ${indent ? "pl-4" : ""}
        ${highlight && value > 15 ? "bg-red-50 dark:bg-red-900/20" : ""}
      `}
      >
        <span
          className={`
          ${bold ? "font-extrabold" : "font-medium"}
          text-gray-800 dark:text-neutral-200
        `}
        >
          {label}
        </span>

        <div className="flex items-center gap-2">
          <span
            className={`
            font-medium
            ${
              highlight && value > 15
                ? "text-red-600 dark:text-red-400 font-bold"
                : "text-gray-800 dark:text-neutral-200"
            }
          `}
          >
            {value}
            {unit}
          </span>

          {akgPercent > 0 && (
            <span
              className="
              text-xs font-bold 
              text-gray-600 dark:text-neutral-300 
              w-10 text-right
            "
            >
              {akgPercent}%
            </span>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white dark:bg-neutral-900 p-4 border-2 border-black dark:border-neutral-500 text-sm font-sans w-full max-w-sm mx-auto shadow-lg rounded-sm text-black dark:text-neutral-200">
      <h2 className="text-3xl font-black border-b-8 border-black pb-1 mb-2 dark:border-neutral-300">
        {t("nutritionLabel.title")}
      </h2>

      <div className="flex justify-between items-end mb-2 border-b-4 border-black pb-2 dark:border-neutral-300">
        <div>
          <p className="font-bold text-base">
            {t("nutritionLabel.servingSize")}
          </p>
          <p className="text-sm text-gray-600 dark:text-neutral-400">
            {t("nutritionLabel.perPackage")}
          </p>
        </div>
      </div>

      <div className="flex justify-between items-center border-b-4 border-black py-3 mb-2 dark:border-neutral-300">
        <span className="font-black text-xl">
          {t("nutritionLabel.totalEnergy")}
        </span>
        <span className="font-black text-4xl">
          {Math.round(getVal("calories", "energi"))}{" "}
          <span className="text-lg">{t("nutritionLabel.kcalUnit")}</span>
        </span>
      </div>

      <p className="text-right text-xs font-bold mb-1">
        {t("nutritionLabel.dailyValueHeader")}
      </p>
      <div className="border-b-2 border-black mb-1 dark:border-neutral-300"></div>

      <Row
        label={t("nutritionLabel.totalFat")}
        value={getVal("fat", "lemak_total", "lemak")}
        bold={true}
      />
      <Row
        label={t("nutritionLabel.cholesterol")}
        value={getVal("cholesterol_mg", "kolesterol", "cholesterol")}
        unit="mg"
        bold={true}
      />
      <Row
        label={t("nutritionLabel.sodium")}
        value={getVal("sodium_mg", "sodium", "natrium", "garam")}
        unit="mg"
        bold={true}
        highlight={true}
      />

      <div className="border-t-4 border-black mt-1 dark:border-neutral-300"></div>
      <Row
        label={t("nutritionLabel.totalCarbs")}
        value={getVal("carbs", "karbohidrat_total", "karbohidrat")}
        bold={true}
      />
      <Row
        label={t("nutritionLabel.dietaryFiber")}
        value={getVal("fiber", "serat")}
        indent={true}
      />
      <Row
        label={t("nutritionLabel.sugar")}
        value={getVal("sugar", "gula")}
        indent={true}
        highlight={true}
      />

      <div className="border-t-4 border-black mt-1 dark:border-neutral-300"></div>
      <Row
        label={t("nutritionLabel.protein")}
        value={getVal("protein")}
        bold={true}
      />

      <div className="border-t-8 border-black mt-4 pt-3 dark:border-neutral-300">
        <div className="grid grid-cols-2 gap-y-2 text-xs font-medium text-gray-700 dark:text-neutral-300">
          <span>
            {t("nutritionLabel.calcium")}{" "}
            {getVal("calcium_mg", "kalsium", "calcium")}mg
          </span>
          <span>
            {t("nutritionLabel.iron")} {getVal("iron_mg", "zat_besi", "iron")}mg
          </span>
          <span>
            {t("nutritionLabel.potassium")}{" "}
            {getVal("potassium_mg", "kalium", "potassium")}mg
          </span>
        </div>
      </div>

      <p className="text-[10px] mt-4 leading-tight text-gray-500 dark:text-neutral-400">
        {t("nutritionLabel.footerNote", { akg: 2150 })}
      </p>
    </div>
  );
};

export default NutritionLabel;
