import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { MainLayout } from "../components/layouts";
import { useAuth } from "../context/AuthContext";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import SuccessModal from "../components/ui/SuccessModal";
import api from "../config/api";

const Toast = ({ message, type = "success", onClose }) => (
  <div className="fixed top-6 right-6 z-50 animate-slide-in-right">
    <div
      className={`px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 min-w-[320px] backdrop-blur-sm border-2 ${
        type === "success"
          ? "bg-secondary/10 border-secondary text-secondary"
          : type === "error"
          ? "bg-error/10 border-error text-error"
          : "bg-warning/10 border-warning text-warning"
      }`}
    >
      {type === "success" && (
        <svg
          className="w-6 h-6 shrink-0"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
            clipRule="evenodd"
          />
        </svg>
      )}
      {type === "error" && (
        <svg
          className="w-6 h-6 shrink-0"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
            clipRule="evenodd"
          />
        </svg>
      )}
      <p className="font-bold text-sm">{message}</p>
      <button
        onClick={onClose}
        className="ml-auto opacity-70 hover:opacity-100"
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </button>
    </div>
  </div>
);

const parseErrorMessage = (error, fallback = "Terjadi kesalahan") => {
  const errMsg = error.response?.data?.detail;
  if (typeof errMsg === "string") return errMsg;
  if (Array.isArray(errMsg)) return errMsg[0]?.msg || fallback;
  if (errMsg?.msg) return errMsg.msg;
  return fallback;
};

const Profile = () => {
  const { t, i18n } = useTranslation();
  const { user, setUser, changePassword } = useAuth();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [masterAllergens, setMasterAllergens] = useState([]);
  const [userAllergies, setUserAllergies] = useState([]);
  const [customAllergy, setCustomAllergy] = useState("");
  const [allergyView, setAllergyView] = useState("active");
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [localizationSettings, setLocalizationSettings] = useState({});

  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    age: user?.age || "",
    weight: user?.weight || "",
    height: user?.height || "",
    gender: user?.gender || "male",
    timezone: user?.timezone || "Asia/Jakarta",
    locale: user?.locale || "id-ID",
  });

  const [passData, setPassData] = useState({
    current: "",
    new: "",
    confirm: "",
  });

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  useEffect(() => {
    fetchLocalizationSettings();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [allRes, myRes] = await Promise.all([
          api.get("/users/allergens"),
          api.get("/users/my-allergies"),
        ]);
        setMasterAllergens(allRes.data);
        setUserAllergies(myRes.data.map((a) => a.id));
      } catch (e) {
        showToast(parseErrorMessage(e, "Gagal memuat data alergi"), "error");
      }
    };
    fetchData();
    setPhotoPreview(user?.photo_url || null);
  }, [user]);

  const fetchLocalizationSettings = async () => {
    try {
      const { data } = await api.get("/users/localization-settings");
      setLocalizationSettings(data.data);
    } catch (e) {
      console.error("Failed to load localization", e);
    }
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        showToast("Ukuran file maksimal 2MB", "error");
        return;
      }
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const form = new FormData();
      form.append("name", formData.name);
      if (formData.age) form.append("age", formData.age);
      if (formData.weight) form.append("weight", formData.weight);
      if (formData.height) form.append("height", formData.height);
      if (formData.gender) form.append("gender", formData.gender);
      if (formData.timezone) form.append("timezone", formData.timezone);
      if (formData.locale) form.append("locale", formData.locale);
      if (photoFile) form.append("photo", photoFile);

      const { data } = await api.put("/users/profile", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setUser(data.user);
      localStorage.setItem("user", JSON.stringify(data.user));

      if (formData.locale !== user?.locale) {
        i18n.changeLanguage(formData.locale);
      }

      setEditing(false);
      setSuccessMessage(t("profile.successUpdate"));
      setShowSuccess(true);
    } catch (error) {
      showToast(parseErrorMessage(error, t("profile.errorSave")), "error");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passData.new !== passData.confirm) {
      showToast(t("profile.passwordMismatch"), "error");
      return;
    }
    setLoading(true);
    try {
      await changePassword({
        current_password: passData.current,
        new_password: passData.new,
      });
      setShowPasswordModal(false);
      setPassData({ current: "", new: "", confirm: "" });
      setSuccessMessage(t("profile.passwordChanged"));
      setShowSuccess(true);
      setTimeout(() => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/login";
      }, 2000);
    } catch (e) {
      showToast(parseErrorMessage(e, t("profile.wrongPassword")), "error");
    } finally {
      setLoading(false);
    }
  };

  const toggleAllergy = async (id) => {
    const isSelected = userAllergies.includes(id);
    const newSelection = isSelected
      ? userAllergies.filter((a) => a !== id)
      : [...userAllergies, id];

    setUserAllergies(newSelection);

    try {
      await api.put("/users/allergies", { allergen_ids: newSelection });
      showToast(
        isSelected ? t("profile.allergyRemoved") : t("profile.allergyAdded"),
        "success"
      );
    } catch (e) {
      showToast(parseErrorMessage(e, t("profile.allergyError")), "error");
      setUserAllergies(userAllergies);
    }
  };

  const handleAddCustomAllergy = async (e) => {
    e.preventDefault();
    if (!customAllergy.trim()) return;

    try {
      const { data } = await api.post("/users/allergies/custom", {
        name: customAllergy,
      });

      const newAllergen = data.allergen;
      setMasterAllergens((prev) => [...prev, newAllergen]);
      setUserAllergies((prev) => [...prev, newAllergen.id]);
      setCustomAllergy("");
      setAllergyView("active");
      showToast(
        `${t("profile.allergyAdded")}: "${newAllergen.name}"`,
        "success"
      );
    } catch (error) {
      showToast(
        parseErrorMessage(error, t("profile.allergyAddError")),
        "error"
      );
    }
  };

  const handleDeleteCustomAllergy = async (allergenId, allergenName, e) => {
    e.stopPropagation();
    try {
      await api.delete(`/users/allergens/${allergenId}`);
      setMasterAllergens((prev) => prev.filter((a) => a.id !== allergenId));
      setUserAllergies((prev) => prev.filter((id) => id !== allergenId));
      showToast(
        `"${allergenName}" ${t("profile.deletedPermanent")}`,
        "success"
      );
    } catch (error) {
      showToast(parseErrorMessage(error, t("profile.deleteError")), "error");
    }
  };

  const bmiValue =
    formData.weight && formData.height
      ? (formData.weight / Math.pow(formData.height / 100, 2)).toFixed(1)
      : null;

  const getBMIStatus = (val) => {
    if (!val)
      return {
        label: t("profile.noData"),
        color: "text-text-secondary",
        bg: "bg-border/30",
      };
    const n = parseFloat(val);
    if (n < 18.5)
      return {
        label: t("profile.underweight"),
        color: "text-warning",
        bg: "bg-warning/10",
      };
    if (n < 25)
      return {
        label: t("profile.ideal"),
        color: "text-secondary",
        bg: "bg-secondary/10",
      };
    if (n < 30)
      return {
        label: t("profile.overweight"),
        color: "text-warning",
        bg: "bg-warning/10",
      };
    return {
      label: t("profile.obese"),
      color: "text-error",
      bg: "bg-error/10",
    };
  };
  const bmi = getBMIStatus(bmiValue);

  const inputClass = `w-full px-4 py-3.5 rounded-2xl border transition-all text-sm font-medium outline-none`;
  const readOnlyClass = `bg-bg-surface/50 border-border text-text-secondary cursor-not-allowed`;
  const editClass = `bg-bg-surface border-border hover:border-primary/50 focus:ring-2 focus:ring-primary/20 focus:border-primary text-text-primary`;

  const activeAllergies = masterAllergens.filter((a) =>
    userAllergies.includes(a.id)
  );
  const availableAllergies = masterAllergens.filter(
    (a) => !userAllergies.includes(a.id)
  );

  return (
    <MainLayout>
      <div className="bg-linear-to-br from-bg-base via-bg-base to-primary/5 min-h-screen py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {toast && <Toast {...toast} onClose={() => setToast(null)} />}

          {/* Header Section */}
          <div className="relative mb-12">
            <div className="absolute inset-0 bg-linear-to-r from-primary/10 to-secondary/10 rounded-3xl blur-3xl"></div>
            <Card className="relative overflow-hidden border-2">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32"></div>
              <div className="relative p-8 flex flex-col md:flex-row items-center gap-8">
                <div className="relative group">
                  <div className="w-32 h-32 rounded-3xl overflow-hidden border-4 border-white shadow-2xl ring-4 ring-primary/10">
                    {photoPreview ? (
                      <img
                        src={photoPreview}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-linear-to-br from-primary to-secondary flex items-center justify-center text-5xl font-black text-white">
                        {user?.name?.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  {editing && (
                    <label className="absolute -bottom-2 -right-2 w-12 h-12 bg-linear-to-br from-primary to-primary/80 text-white rounded-2xl flex items-center justify-center cursor-pointer hover:scale-110 transition-transform shadow-xl">
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
                          d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      <input
                        type="file"
                        className="hidden"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={handlePhotoChange}
                      />
                    </label>
                  )}
                </div>
                <div className="flex-1 text-center md:text-left">
                  <h1 className="text-4xl md:text-5xl font-black text-text-primary mb-2 bg-linear-to-r from-primary to-secondary bg-clip-text">
                    {user?.name}
                  </h1>
                  <p className="text-text-secondary text-lg">{user?.email}</p>
                  <div className="flex flex-wrap gap-2 mt-4 justify-center md:justify-start">
                    <span className="px-4 py-2 bg-primary/10 text-primary rounded-xl text-sm font-bold flex items-center gap-2">
                      <svg
                        className="w-4 h-4"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {user?.role === "admin" ? "Admin" : "User"}
                    </span>
                    {bmiValue && (
                      <span
                        className={`px-4 py-2 ${bmi.bg} ${bmi.color} rounded-xl text-sm font-bold`}
                      >
                        BMI: {bmiValue}
                      </span>
                    )}
                  </div>
                </div>
                {!editing && (
                  <Button
                    onClick={() => setEditing(true)}
                    className="px-8 py-4 text-lg shadow-xl"
                  >
                    <svg
                      className="w-5 h-5 mr-2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                    {t("profile.edit")}
                  </Button>
                )}
              </div>
            </Card>
          </div>

          {/* Main Content Grid */}
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column - Forms */}
            <div className="lg:col-span-2 space-y-8">
              {/* Personal Info Card */}
              <Card className="border-2">
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-bg-surface/10 flex items-center justify-center">
                      <svg
                        className="w-5 h-5 text-primary"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-text-primary">
                      {t("profile.personalInfo")}
                    </h2>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid md:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-sm font-bold text-text-primary mb-2">
                          {t("profile.fullName")}
                        </label>
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) =>
                            setFormData({ ...formData, name: e.target.value })
                          }
                          disabled={!editing}
                          className={`${inputClass} ${
                            editing ? editClass : readOnlyClass
                          }`}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-text-primary mb-2">
                          {t("profile.email")}
                        </label>
                        <input
                          type="email"
                          value={formData.email}
                          disabled
                          className={`${inputClass} ${readOnlyClass}`}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-sm font-bold text-text-primary mb-2">
                          {t("profile.gender")}
                        </label>
                        <select
                          value={formData.gender}
                          onChange={(e) =>
                            setFormData({ ...formData, gender: e.target.value })
                          }
                          disabled={!editing}
                          className={`${inputClass} ${
                            editing ? editClass : readOnlyClass
                          }`}
                        >
                          <option value="male">{t("profile.male")}</option>
                          <option value="female">{t("profile.female")}</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-text-primary mb-2">
                          {t("profile.age")}
                        </label>
                        <input
                          type="number"
                          value={formData.age}
                          onChange={(e) =>
                            setFormData({ ...formData, age: e.target.value })
                          }
                          disabled={!editing}
                          className={`${inputClass} ${
                            editing ? editClass : readOnlyClass
                          }`}
                          placeholder="-"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-text-primary mb-2">
                          {t("profile.weight")}
                        </label>
                        <input
                          type="number"
                          value={formData.weight}
                          onChange={(e) =>
                            setFormData({ ...formData, weight: e.target.value })
                          }
                          disabled={!editing}
                          className={`${inputClass} ${
                            editing ? editClass : readOnlyClass
                          }`}
                          placeholder="-"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-text-primary mb-2">
                          {t("profile.height")}
                        </label>
                        <input
                          type="number"
                          value={formData.height}
                          onChange={(e) =>
                            setFormData({ ...formData, height: e.target.value })
                          }
                          disabled={!editing}
                          className={`${inputClass} ${
                            editing ? editClass : readOnlyClass
                          }`}
                          placeholder="-"
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-sm font-bold text-text-primary mb-2">
                          {t("profile.timezone")}
                        </label>
                        <select
                          value={formData.timezone}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              timezone: e.target.value,
                            })
                          }
                          disabled={!editing}
                          className={`${inputClass} ${
                            editing ? editClass : readOnlyClass
                          }`}
                        >
                          {Object.entries(localizationSettings).map(
                            ([region, settings]) => (
                              <optgroup key={region} label={region}>
                                {settings.map((setting) => (
                                  <option
                                    key={setting.id}
                                    value={setting.timezone}
                                  >
                                    {setting.timezone_label} (
                                    {setting.timezone_offset})
                                  </option>
                                ))}
                              </optgroup>
                            )
                          )}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-text-primary mb-2">
                          {t("profile.locale")}
                        </label>
                        <select
                          value={formData.locale}
                          onChange={(e) =>
                            setFormData({ ...formData, locale: e.target.value })
                          }
                          disabled={!editing}
                          className={`${inputClass} ${
                            editing ? editClass : readOnlyClass
                          }`}
                        >
                          {Object.values(localizationSettings)
                            .flat()
                            .filter(
                              (setting, index, self) =>
                                index ===
                                self.findIndex(
                                  (s) => s.locale === setting.locale
                                )
                            )
                            .map((setting) => (
                              <option
                                key={setting.locale}
                                value={setting.locale}
                              >
                                {setting.locale_label}
                              </option>
                            ))}
                        </select>
                      </div>
                    </div>

                    {editing && (
                      <div className="flex gap-3 pt-6 border-t border-border">
                        <Button
                          type="submit"
                          loading={loading}
                          className="flex-1"
                        >
                          <svg
                            className="w-5 h-5 mr-2"
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
                          {t("profile.save")}
                        </Button>
                        <button
                          type="button"
                          onClick={() => {
                            setEditing(false);
                            setPhotoPreview(user?.photo_url || null);
                            setPhotoFile(null);
                          }}
                          className="flex-1 px-6 py-3.5 text-sm font-bold text-text-secondary hover:bg-bg-surface rounded-2xl transition-all border-2 border-border hover:border-text-secondary"
                        >
                          {t("profile.cancel")}
                        </button>
                      </div>
                    )}
                  </form>
                </div>
              </Card>

              {/* Allergies Card */}
              <Card className="border-2">
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-error/10 flex items-center justify-center">
                      <svg
                        className="w-5 h-5 text-error"
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
                    </div>
                    <h2 className="text-2xl font-bold text-text-primary">
                      {t("profile.allergies")}
                    </h2>
                  </div>

                  <div className="flex gap-2 p-1.5 bg-bg-base rounded-2xl mb-6 border-2 border-border">
                    <button
                      onClick={() => setAllergyView("active")}
                      className={`flex-1 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                        allergyView === "active"
                          ? "bg-primary text-white shadow-lg"
                          : "text-text-secondary hover:text-text-primary"
                      }`}
                    >
                      {t("profile.myAllergies")} ({activeAllergies.length})
                    </button>
                    <button
                      onClick={() => setAllergyView("available")}
                      className={`flex-1 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                        allergyView === "available"
                          ? "bg-primary text-white shadow-lg"
                          : "text-text-secondary hover:text-text-primary"
                      }`}
                    >
                      {t("profile.allOptions")} ({availableAllergies.length})
                    </button>
                  </div>

                  {allergyView === "active" && (
                    <div className="space-y-3 mb-6">
                      {activeAllergies.length === 0 ? (
                        <div className="text-center py-16 bg-bg-base rounded-2xl border-2 border-dashed border-border">
                          <div className="w-20 h-20 bg-border/50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <svg
                              className="w-10 h-10 text-text-secondary"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                              />
                            </svg>
                          </div>
                          <p className="text-text-primary font-bold mb-2">
                            {t("profile.noAllergies")}
                          </p>
                          <p className="text-sm text-text-secondary">
                            {t("profile.addAllergyHint")}
                          </p>
                        </div>
                      ) : (
                        activeAllergies.map((allergen) => {
                          const isCustom =
                            allergen.description === "Custom user input";
                          return (
                            <div
                              key={allergen.id}
                              className="group flex items-center justify-between p-4 bg-error/5 border-2 border-error/20 rounded-2xl hover:bg-error/10 hover:border-error transition-all"
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-3 h-3 bg-error rounded-full"></div>
                                <span className="font-bold text-text-primary">
                                  {allergen.name}
                                </span>
                                {isCustom && (
                                  <span className="px-3 py-1 bg-accent/20 text-accent text-xs font-bold rounded-lg">
                                    Custom
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => toggleAllergy(allergen.id)}
                                  className="px-4 py-2 bg-error/10 text-error text-xs font-bold rounded-lg hover:bg-error hover:text-white transition-all"
                                >
                                  {t("profile.remove")}
                                </button>
                                {isCustom && (
                                  <button
                                    onClick={(e) =>
                                      handleDeleteCustomAllergy(
                                        allergen.id,
                                        allergen.name,
                                        e
                                      )
                                    }
                                    className="p-2 text-text-secondary hover:text-error transition-colors"
                                    title={t("profile.deletePermanent")}
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
                                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                      />
                                    </svg>
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  )}

                  {allergyView === "available" && (
                    <div className="flex flex-wrap gap-3 mb-6">
                      {availableAllergies.map((allergen) => {
                        const isCustom =
                          allergen.description === "Custom user input";
                        return (
                          <button
                            key={allergen.id}
                            onClick={() => toggleAllergy(allergen.id)}
                            className="px-5 py-3 rounded-2xl text-sm font-bold border-2 border-border bg-bg-surface hover:border-primary hover:bg-primary/5 hover:text-primary transition-all flex items-center gap-2"
                          >
                            <span className="text-text-primary">
                              {allergen.name}
                            </span>
                            {isCustom && (
                              <span className="w-2 h-2 bg-accent rounded-full"></span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}

                  <form
                    onSubmit={handleAddCustomAllergy}
                    className="flex gap-3 pt-6 border-t-2 border-border"
                  >
                    <Input
                      placeholder={t("profile.addCustom")}
                      value={customAllergy}
                      onChange={(e) => setCustomAllergy(e.target.value)}
                      className="h-12 text-sm"
                      containerClass="flex-1"
                    />
                    <Button
                      type="submit"
                      size="sm"
                      variant="outline"
                      disabled={!customAllergy}
                      className="h-12 px-6"
                    >
                      <svg
                        className="w-5 h-5 mr-2"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 4v16m8-8H4"
                        />
                      </svg>
                      {t("profile.add")}
                    </Button>
                  </form>
                </div>
              </Card>
            </div>

            {/* Right Column - Stats & Security */}
            <div className="space-y-8">
              {/* BMI Card */}
              <div className="relative overflow-hidden rounded-3xl border-2 border-primary/20">
                <div className="absolute inset-0 bg-linear-to-br from-primary via-primary to-secondary"></div>
                <div className="absolute top-0 right-0 w-48 h-48 bg-bg-surface/10 rounded-full -mr-24 -mt-24"></div>
                <div className="absolute bottom-0 left-0 w-40 h-40 bg-bg-surface/5 rounded-full -ml-20 -mb-20"></div>
                <div className="relative z-10 p-8 text-white">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-bg-surface/20 backdrop-blur-sm flex items-center justify-center">
                      <svg
                        className="w-5 h-5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                      </svg>
                    </div>
                    <h3 className="font-bold text-xl">{t("profile.bmi")}</h3>
                  </div>
                  <p className="text-white/90 text-sm mb-8">
                    {t("profile.bmiDesc")}
                  </p>
                  <div className="flex items-end gap-3 mb-6">
                    <span className="text-7xl font-black">
                      {bmiValue || "--"}
                    </span>
                    <span className="text-2xl font-medium opacity-80 mb-3">
                      kg/m²
                    </span>
                  </div>
                  <div className="inline-block px-5 py-2.5 bg-bg-surface/20 rounded-2xl text-sm font-bold backdrop-blur-sm">
                    {bmi.label}
                  </div>
                </div>
              </div>

              {/* Security Card */}
              <Card className="border-2">
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <svg
                        className="w-5 h-5 text-primary"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                        />
                      </svg>
                    </div>
                    <h2 className="text-xl font-bold text-text-primary">
                      {t("profile.security")}
                    </h2>
                  </div>
                  <button
                    onClick={() => setShowPasswordModal(true)}
                    className="w-full flex items-center justify-between p-5 rounded-2xl bg-bg-base hover:bg-primary/5 transition-all group border-2 border-border hover:border-primary/30"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-all">
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
                            d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                          />
                        </svg>
                      </div>
                      <div className="text-left">
                        <h4 className="font-bold text-text-primary">
                          {t("profile.password")}
                        </h4>
                        <p className="text-sm text-text-secondary">
                          {t("profile.changePassword")}
                        </p>
                      </div>
                    </div>
                    <svg
                      className="w-6 h-6 text-text-secondary group-hover:text-primary group-hover:translate-x-1 transition-all"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </button>
                </div>
              </Card>
            </div>
          </div>

          {/* Password Modal */}
          {showPasswordModal && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
              <div className="bg-bg-surface w-full max-w-md rounded-3xl p-8 shadow-2xl animate-scale-up border-2 border-border">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                    <svg
                      className="w-6 h-6 text-primary"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-text-primary">
                    {t("profile.changePasswordTitle")}
                  </h3>
                </div>
                <form onSubmit={handlePasswordSubmit} className="space-y-5">
                  <Input
                    label={t("profile.currentPassword")}
                    type="password"
                    value={passData.current}
                    onChange={(e) =>
                      setPassData({ ...passData, current: e.target.value })
                    }
                  />
                  <Input
                    label={t("profile.newPassword")}
                    type="password"
                    value={passData.new}
                    onChange={(e) =>
                      setPassData({ ...passData, new: e.target.value })
                    }
                  />
                  <Input
                    label={t("profile.confirmPassword")}
                    type="password"
                    value={passData.confirm}
                    onChange={(e) =>
                      setPassData({ ...passData, confirm: e.target.value })
                    }
                  />
                  <div className="flex gap-3 pt-4">
                    <Button type="submit" fullWidth loading={loading}>
                      {t("profile.save")}
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      fullWidth
                      onClick={() => setShowPasswordModal(false)}
                    >
                      {t("profile.cancel")}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          )}

          <SuccessModal
            isOpen={showSuccess}
            onClose={() => setShowSuccess(false)}
            message={successMessage}
          />
        </div>
      </div>
    </MainLayout>
  );
};

export default Profile;
